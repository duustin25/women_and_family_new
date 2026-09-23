# 🤖 AI Chatbot ("The Sentinel") NLP & Neural Network Architecture

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Barangay 183, Villamor Airbase, Pasay City**

---

## 🧠 1. Subsystem Architecture Overview

"The Sentinel" is a hybrid Decision Support AI engineered to provide 24/7 legal guidance, emergency hotlines, and public service information to residents while maintaining strict confidentiality boundaries.

```
+-----------------------------------------------------------------------------------+
|                           CLIENT CHAT WIDGET (REACT 19)                           |
|            Voice Speech Input  *  Optimistic UI  *  Markdown Parser               |
+-----------------------------------------+-----------------------------------------+
                                          | JSON HTTP POST (/api/chat)
+-----------------------------------------v-----------------------------------------+
|                                LARAVEL CHATBOT SERVICE                            |
|        ChatbotController.php  *  ChatbotService.php  *  Maintenance Toggle        |
+--------------------+------------------------------------+-------------------------+
                     |                                    |
+--------------------v----+                     +---------v-------------------------+
|    PYTHON NLP / MLP     |                     |     LIVE DATABASE INTERCEPTOR     |
| NLTK Lemmatizer         |                     | Real-time Queries:                |
| Bag-of-Words (BoW)      |                     | - Active GAD Event Schedules      |
| Scikit-Learn Neural Net |                     | - Accredited Organization Names   |
| (MLPClassifier)         |                     | - Barangay Health Center Hours    |
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
1. **Sanitization:** Strips HTML, malicious prompt-injection payloads, and emojis.
2. **NLTK Tokenization:** Breaks raw Tagalog/English input into atomic word tokens.
3. **Lemmatization:** Reduces inflected forms to root lemma (e.g. *"binubugbog"* -> *"bugbog"*, *"beaten"* -> *"beat"*).
4. **Vectorization:** Converts token sequences into a Bag-of-Words (BoW) numerical feature vector matching the training dictionary.

### 2.2 Neural Network Classification (`MLPClassifier`)
- The intent classification engine is a Multi-Layer Perceptron neural network implemented in Python via **Scikit-Learn**:
  - **Input Layer:** Dimension equals training vocabulary size ($V \approx 450$ tokens).
  - **Hidden Layers:** Dual hidden layers $(128, 64)$ with ReLU activation functions.
  - **Output Layer:** Softmax distribution over predefined intent classes (`vawc_emergency`, `bpo_procedure`, `bcpc_feeding`, `org_application`, `gad_schedule`).
  - **Confidence Threshold:** If classification probability $P < 0.70$, the system triggers an educational fallback rather than hallucinating legal advice.

---

## 🎛️ 3. Administrative Maintenance Feature Toggle

Per IT Expert recommendations, the administrator has full control over the AI engine via `/admin/settings`:

```php
// app/Services/ChatbotService.php
public function respond(string $userMessage): array
{
    $isEnabled = (bool) Setting::get('ai_chatbot_enabled', true);

    if (!$isEnabled) {
        return [
            'reply' => "The Barangay Virtual Assistant is currently offline for scheduled maintenance. For emergencies, please call the Pasay Police VAWC Desk at 8831-7322.",
            'is_fallback' => true,
        ];
    }

    // Execute Python sub-process with 5-second process timeout...
}
```

* **Process Timeout Isolation:** Uses Symfony Process with a strict 5-second execution limit to prevent hung background Python workers from consuming web server memory.
* **Zero Disclosures Policy:** The AI model is strictly prohibited from answering queries regarding active case identities, names of victims, or ongoing blotter records.
