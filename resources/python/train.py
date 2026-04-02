# ------------------------------------------------------------------
# AI TRAINING SCRIPT (The Brain)
# ------------------------------------------------------------------
# This script is responsible for "teaching" the AI how to understand 
# user messages. It uses Natural Language Processing (NLP) to break 
# down text and a Neural Network to classify the intent.

import json
import pickle
import numpy as np
import nltk
from nltk.stem import WordNetLemmatizer
from sklearn.neural_network import MLPClassifier
from sklearn.feature_extraction.text import CountVectorizer

# Download necessary NLTK data (Tokenizer and WordNet Lemmatizer)
# Tokenizer: Breaks sentences into words.
# WordNet: Used for finding the root of words (e.g., "running" -> "run").
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('punkt_tab')

lemmatizer = WordNetLemmatizer()

# Load Training Data (Intents)
data_file = open('resources/python/intents.json').read()
intents = json.loads(data_file)

words = []
classes = []
documents = []
ignore_words = ['?', '!', '.', ',']

print("Processing data...")

# 1. NLP PREPROCESSING
# Loop through all sentences in intents.json
for intent in intents['intents']:
    for pattern in intent['patterns']:
        # A. Tokenization: "How to file VAWC?" -> ["How", "to", "file", "VAWC", "?"]
        w = nltk.word_tokenize(pattern)
        words.extend(w)
        # B. Corpus Building: Store the word list and the associated tag
        documents.append((w, intent['tag']))
        # C. Class Collection: List of all possible outcomes (e.g., "vawc_filing", "greeting")
        if intent['tag'] not in classes:
            classes.append(intent['tag'])

# D. Lemmatization: Convert words to base form to reduce complexity.
# "Filing", "Files", "Filed" -> All become "file".
# This allows the AI to understand variations of words.
words = [lemmatizer.lemmatize(w.lower()) for w in words if w not in ignore_words]
words = sorted(list(set(words)))

classes = sorted(list(set(classes)))

print(f"{len(documents)} documents")
print(f"{len(classes)} classes")
print(f"{len(words)} unique lemmatized words")

# 2. FEATURE EXTRACTION (Bag of Words)
# Neural Networks cannot understand text, only numbers.
# We convert sentences into a "Bag of Words" (Array of 0s and 1s).
training = []
output_empty = [0] * len(classes)

for doc in documents:
    bag = []
    pattern_words = doc[0]
    pattern_words = [lemmatizer.lemmatize(word.lower()) for word in pattern_words]
    
    # If a word from our "vocabulary" exists in the sentence, mark it as 1.
    for w in words:
        bag.append(1) if w in pattern_words else bag.append(0)
    
    output_row = list(output_empty)
    output_row[classes.index(doc[1])] = 1
    
    training.append([bag, output_row])

# Shuffle to prevent bias
import random
random.shuffle(training)
training = np.array(training, dtype=object)

train_x = list(training[:, 0]) # Input (The sentence pattern)
train_y = list(training[:, 1]) # Output (The intent label)

# 3. MODEL TRAINING (Neural Network)
# We use an MLP (Multi-Layer Perceptron) Classifier.
# - Hidden Layers: (128, 64) - Two layers of neurons to learn complex patterns.
# - Max Iter: 1000 - How many times it loops through data to learn.
print("Training model...")
model = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=1000, activation='relu', solver='adam')
model.fit(train_x, train_y)

print("Saving model...")
# Save all necessary data structures to use in chat.py
data = {
    'model': model,
    'words': words,
    'classes': classes
}

with open('resources/python/chatbot_model.pkl', 'wb') as f:
    pickle.dump(data, f)

print("Training Complete. Model saved to resources/python/chatbot_model.pkl")
