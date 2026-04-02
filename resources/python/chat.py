import json
import pickle
import numpy as np
import sys
import nltk
from nltk.stem import WordNetLemmatizer
import os

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

# Initialize Lemmatizer
lemmatizer = WordNetLemmatizer()

# Load trained model
try:
    base_path = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_path, 'chatbot_model.pkl')
    intents_path = os.path.join(base_path, 'intents.json')
    
    with open(model_path, 'rb') as f:
        data = pickle.load(f)
        
    model = data['model']
    words = data['words']
    classes = data['classes']
    
    intents = json.loads(open(intents_path).read())
    
except Exception as e:
    print(json.dumps({"error": str(e), "response": "System Error: Model not loaded."}))
    sys.exit(1)

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_details=False):
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    print(f"found in bag: {w}")
    return np.array(bag)

def predict_class(sentence, model):
    # 1. PREPROCESS
    # Convert input sentence to Bag of Words array (0s and 1s)
    p = bow(sentence, words)
    
    # 2. PREDICT (Inference)
    # The neural network calculates the probability for each intent.
    # e.g., vawc_filing: 0.95, greeting: 0.02, etc.
    res = model.predict_proba([p])[0]
    
    # 3. FILTER
    # Only accept predictions with > 25% confidence to avoid random guessing.
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    
    # Sort by probability strength
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    
    return return_list

def get_response(ints, intents_json):
    if not ints:
        return "I'm sorry, I don't understand that yet. Can you rephrase?"
        
    tag = ints[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if i['tag'] == tag:
            import random
            result = random.choice(i['responses'])
            return result
            
    return "I'm not sure how to help with that."

# Main Execution
if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        
        try:
            ints = predict_class(query, model)
            res = get_response(ints, intents)
            
            # Output JSON for Laravel
            print(json.dumps({"response": res, "intent": ints[0]['intent'] if ints else "unknown"}))
            
        except Exception as e:
             print(json.dumps({"response": "I encountered an error processing your request.", "error": str(e)}))
    else:
        print(json.dumps({"response": "No query provided."}))
