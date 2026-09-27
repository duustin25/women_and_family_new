"""
=============================================================================
REPRODUCIBLE AI CHATBOT EVALUATION SCRIPT
Target Subsystem: "The Sentinel" AI Chatbot (Barangay 183 WFPIS)
Purpose: Academic Model Validation (Priority #8)
Execution: python resources/python/evaluate.py [--threshold 0.70]
=============================================================================
"""

import json
import os
import sys
import pickle
import argparse
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# Suppress scikit-learn warnings
import warnings
warnings.filterwarnings("ignore")

base_dir = os.path.dirname(os.path.abspath(__file__))

# Ensure NLTK resources
for extra_path in [
    os.path.join(base_dir, 'nltk_data'),
    '/usr/share/nltk_data',
    '/var/www/html/resources/python/nltk_data',
]:
    if os.path.exists(extra_path) and extra_path not in nltk.data.path:
        nltk.data.path.insert(0, extra_path)

try:
    lemmatizer = WordNetLemmatizer()
except Exception:
    lemmatizer = None

def clean_up_sentence(sentence):
    try:
        words = nltk.word_tokenize(sentence)
    except Exception:
        clean = sentence.replace('?', ' ').replace('!', ' ').replace('.', ' ').replace(',', ' ')
        words = clean.split()

    if lemmatizer:
        try:
            return [lemmatizer.lemmatize(w.lower()) for w in words]
        except Exception:
            return [w.lower() for w in words]
    return [w.lower() for w in words]

def bow(sentence, words):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
    return np.array(bag)

def run_evaluation(threshold=0.70, test_file=None):
    model_path = os.path.join(base_dir, 'chatbot_model.pkl')
    if not os.path.exists(model_path):
        print(f"Error: Model file not found at {model_path}")
        sys.exit(1)

    with open(model_path, 'rb') as f:
        artifact = pickle.load(f)

    model = artifact['model']
    vocabulary = artifact['words']
    classes = artifact['classes']

    if test_file is None:
        test_file = os.path.join(base_dir, 'test_dataset.json')

    if not os.path.exists(test_file):
        print(f"Error: Test dataset file not found at {test_file}")
        sys.exit(1)

    with open(test_file, 'r', encoding='utf-8') as f:
        test_data = json.load(f)

    samples = test_data.get('test_samples', [])
    if not samples:
        print("Error: No test samples found in test dataset.")
        sys.exit(1)

    print("=" * 80)
    print("THE SENTINEL AI CHATBOT - REPRODUCIBLE MODEL EVALUATION")
    print(f"Dataset File: {os.path.basename(test_file)}")
    print(f"Total Unseen Test Utterances: {len(samples)}")
    print(f"Vocabulary Dimension: {len(vocabulary)} tokens")
    print(f"Active Confidence Threshold: {threshold:.2f} ({int(threshold * 100)}%)")
    print("=" * 80)

    y_true = []
    y_pred_argmax = []
    y_pred_thresholded = []
    confidences = []
    below_threshold_count = 0

    results_table = []

    for idx, item in enumerate(samples, 1):
        text = item['text']
        expected = item['expected_intent']
        bag_vector = bow(text, vocabulary)

        probabilities = model.predict_proba([bag_vector])[0]
        max_idx = int(np.argmax(probabilities))
        max_prob = float(probabilities[max_idx])
        predicted_class = classes[max_idx]

        is_above_threshold = max_prob > threshold
        if is_above_threshold:
            thresholded_prediction = predicted_class
        else:
            thresholded_prediction = "unknown_fallback"
            below_threshold_count += 1

        y_true.append(expected)
        y_pred_argmax.append(predicted_class)
        y_pred_thresholded.append(thresholded_prediction)
        confidences.append(max_prob)

        match = "MATCH" if expected == predicted_class else "MISMATCH"
        results_table.append({
            "idx": idx,
            "text": text,
            "expected": expected,
            "predicted": predicted_class,
            "confidence": max_prob,
            "accepted": is_above_threshold,
            "match": match
        })

    # Metric computations (Argmax Classification Performance)
    acc = accuracy_score(y_true, y_pred_argmax)
    prec_macro = precision_score(y_true, y_pred_argmax, average='macro', zero_division=0)
    rec_macro = recall_score(y_true, y_pred_argmax, average='macro', zero_division=0)
    f1_macro = f1_score(y_true, y_pred_argmax, average='macro', zero_division=0)

    prec_weighted = precision_score(y_true, y_pred_argmax, average='weighted', zero_division=0)
    rec_weighted = recall_score(y_true, y_pred_argmax, average='weighted', zero_division=0)
    f1_weighted = f1_score(y_true, y_pred_argmax, average='weighted', zero_division=0)

    cm = confusion_matrix(y_true, y_pred_argmax, labels=classes)

    print("\n--- 1. OVERALL CLASSIFICATION PERFORMANCE (Argmax Baseline) ---")
    print(f"Overall Accuracy:       {acc * 100:.2f}%")
    print(f"Macro Precision:        {prec_macro * 100:.2f}%")
    print(f"Macro Recall:           {rec_macro * 100:.2f}%")
    print(f"Macro F1-Score:         {f1_macro * 100:.2f}%")
    print(f"Weighted Precision:     {prec_weighted * 100:.2f}%")
    print(f"Weighted Recall:        {rec_weighted * 100:.2f}%")
    print(f"Weighted F1-Score:      {f1_weighted * 100:.2f}%")

    print("\n--- 2. THRESHOLD SENSITIVITY & SAFETY REJECTION ANALYSIS ---")
    print(f"Total Test Queries:     {len(samples)}")
    print(f"Queries Above {int(threshold*100)}%:      {len(samples) - below_threshold_count} ({(len(samples) - below_threshold_count)/len(samples)*100:.1f}%)")
    print(f"Queries Below {int(threshold*100)}%:      {below_threshold_count} ({below_threshold_count/len(samples)*100:.1f}%) -> Successfully Routed to Unknown Fallback")
    print(f"Mean Confidence Score:  {np.mean(confidences) * 100:.2f}% (Std: {np.std(confidences) * 100:.2f}%)")

    print("\n--- 3. DETAILED PER-CLASS CLASSIFICATION REPORT ---")
    print(classification_report(y_true, y_pred_argmax, labels=classes, target_names=classes, zero_division=0))

    print("--- 4. CONFUSION MATRIX (Labels mapped alphabetically to classes 0..15) ---")
    print("Class Index Mapping:")
    for i, c in enumerate(classes):
        print(f"  [{i:2d}] {c}")
    print("\nConfusion Matrix Grid:")
    print(cm)

    # Save summary report to JSON and Markdown for thesis appendices
    output_summary = {
        "threshold": threshold,
        "total_test_samples": len(samples),
        "overall_accuracy": round(acc, 4),
        "macro_precision": round(prec_macro, 4),
        "macro_recall": round(rec_macro, 4),
        "macro_f1": round(f1_macro, 4),
        "weighted_precision": round(prec_weighted, 4),
        "weighted_recall": round(rec_weighted, 4),
        "weighted_f1": round(f1_weighted, 4),
        "mean_confidence": round(float(np.mean(confidences)), 4),
        "below_threshold_fallback_count": below_threshold_count,
        "classes": classes,
        "confusion_matrix": cm.tolist()
    }

    report_path = os.path.join(base_dir, 'evaluation_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(output_summary, f, indent=2)

    print(f"\nEvaluation output serialized to: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Sentinel AI Chatbot with Unseen Test Dataset")
    parser.add_argument("--threshold", type=float, default=0.70, help="Confidence acceptance threshold (default: 0.70)")
    parser.add_argument("--test-file", type=str, default=None, help="Path to custom test dataset JSON")
    args = parser.parse_args()

    run_evaluation(threshold=args.threshold, test_file=args.test_file)
