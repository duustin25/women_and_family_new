# 🤖 AI Chatbot ("The Sentinel") NLP & Neural Network Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 🧠 1. Subsystem Architecture Overview

"The Sentinel" is a hybrid Decision Support AI engineered to provide 24/7 legal guidance, emergency hotlines, and public service information to residents while maintaining strict confidentiality boundaries.

```
+-----------------------------------------------------------------------------------+
|                           CLIENT CHAT WIDGET (REACT 19)                           |
|       Persistent Legal Disclaimer  *  Axios Transport  *  Interactive Chips       |
+-----------------------------------------+-----------------------------------------+
                                          | JSON HTTP POST (/chat/send) [throttle:10,1]
+-----------------------------------------v-----------------------------------------+
|                                LARAVEL CHATBOT SERVICE                            |
|        ChatbotController.php  *  ChatbotService.php  *  Feature Switch Toggle     |
+--------------------+------------------------------------+-------------------------+
                     |                                    |
+--------------------v----+                     +---------v-------------------------+
|    PYTHON NLP / MLP     |                     |     LIVE DATABASE INTERCEPTOR     |
| NLTK Tokenizer          |                     | Real-time Queries:                |
| English WordNet Lemma   |                     | - Latest Barangay Announcements   |
| Bag-of-Words (240 dims) |                     | - Active Barangay Officials       |
| Scikit-Learn MLP (128,64)                     | - Accredited Organization Details |
+--------------------+----+                     +-------------------+---------------+
                     |                                              |
+--------------------v----------------------------------------------v---------------+
|                             DYNAMIC RESPONSE SYNTHESIZER                          |
|         Combines Intent Guidance with Live Relational Records & Emergency Links   |
+-----------------------------------------------------------------------------------+
```

---

## 🔬 2. NLP Pipeline & Machine Learning Stack

### 2.1 Natural Language Processing Pipeline
1. **Input Validation & Sanitization:** Enforces string type validation and whitespace normalization via Laravel.
2. **NLTK Tokenization:** Breaks raw Tagalog/English input into atomic word tokens via `nltk.word_tokenize`.
3. **Lemmatization (English-Only via WordNet):** Uses `nltk.stem.WordNetLemmatizer` for English inflection reduction (e.g., *"files"* -> *"file"*, *"beaten"* -> *"beat"*).  
   * **Language Limitation Note:** Because WordNet is an English lexical database, Filipino/Tagalog inflected words (e.g., *"binubugbog"*, *"sinasaktan"*, *"magreklamo"*) are **not** morphologically reduced to their root forms (*"bugbog"*, *"sakit"*); they are indexed and matched as distinct surface tokens in the Bag-of-Words feature dictionary.
4. **Vectorization:** Converts token sequences into a 240-dimensional binary Bag-of-Words (BoW) feature vector matching the unique vocabulary dictionary.

### 2.2 Neural Network Classification (`MLPClassifier`)
- The intent classification engine is a Multi-Layer Perceptron neural network implemented in Python via **Scikit-Learn**:
  - **Input Layer:** Dimension equals training vocabulary size ($V = 240$ unique lemmatized tokens).
  - **Hidden Layers:** Dual hidden layers $(128, 64)$ with ReLU activation functions.
  - **Output Layer:** Probability distribution across 16 predefined intent classes via `predict_proba`.
  - **Confidence Threshold:** If classification probability $P \le 0.70$ (70%), the system triggers the fallback response (*"I apologize, I do not understand that yet..."*) and presents interactive category options rather than assigning an unsupported intent.

---

## 🎛️ 3. Administrative Maintenance Feature Toggle & Safety Controls

Per governance requirements, the barangay administrator has full control over the AI engine via `/admin/settings` (Feature Toggles):

- **Feature Switch (`chatbot_enabled`):** When toggled off by an administrator, the frontend widget switches to maintenance mode, displaying an advisory notice and direct emergency phone links (`tel:911`).
- **Process Timeout Isolation:** Uses Symfony Process with an 8.0-second execution limit (`$process->setTimeout(8.0)`) to terminate hung Python processes and prevent memory starvation.
- **Graceful Keyword Fallback:** If the Python execution environment is unavailable or times out, `ChatbotService` seamlessly fails over to deterministic PHP keyword routing (`fallbackLogic()`) and notifies the client interface.
- **Zero Disclosures Policy:** Under `case_status_inquiry`, the assistant strictly refuses to disclose personal case statuses, names of parties, or blotter records, advising citizens to log into their authenticated dashboard or visit the Barangay VAW Desk in person with valid identification in compliance with the Data Privacy Act of 2012 (RA 10173).
- **Mandatory Non-Legal Disclaimer:** The interface and initial greeting explicitly state that the assistant is an informational guide and does not provide formal legal advice, legal counsel, or legal determinations, nor does it replace authorized VAWC personnel.
