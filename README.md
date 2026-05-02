# VoteSmart AI

VoteSmart AI is a modern, clean, and private voter education platform built to empower citizens. It features a premium "glassmorphism" dark theme UI and a highly intelligent, flexible chatbot designed to assist users with election-related queries in a natural, human-like manner.

## Features

- **Intelligent Conversational AI**: A robust chatbot backed by a structured knowledge base to provide accurate, dynamic, and non-repetitive responses.
- **Hinglish Support**: The assistant understands and responds naturally in both English and Hinglish, making it accessible to a wider audience.
- **Smart Fallback System**: Avoids generic "I don't know" responses by gently redirecting users to official sources and offering dynamic, context-aware suggestions.
- **Interactive Learning**: Includes interactive flashcards to learn essential voting concepts.
- **Eligibility Checker**: Find out if you meet voting requirements.
- **Voting Guide**: Step-by-step instructions on the voting process from registration to casting your vote.
- **Fake News Detector**: Helps verify potentially forwarded or unverified information to stop the spread of rumors.
- **Candidate Comparison**: Compare candidates' education, records, and manifestos.
- **Polling Booth Locator**: Guidance on finding your exact voting center.
- **Voice Input Integration**: Use speech recognition to chat with the assistant effortlessly.

## Technologies Used

- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js, CORS
- **Design**: Custom Glassmorphism UI, Dark Mode Aesthetics, Inter Font, FontAwesome Icons

## Project Structure

```text
/votesmart-ai
  /frontend
    index.html
    style.css
    script.js
  /backend
    package.json
    server.js
  README.md
```

## How to Run

### 1. Start the Backend
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:3000`.

### 2. Start the Frontend
1. Open the `frontend` directory.
2. Simply double-click `index.html` to open it in your default web browser, or serve it using an extension like VSCode Live Server.

## Testing the Chatbot

Try the following prompts to test the core logic and the multi-language/fallback system:
- "How to vote"
- "What is the minimum age to vote?"
- "mera voter id kho gaya hai, kya karu?" (Hinglish Support)
- "This message was forwarded on whatsapp, is it true?"
- "compare candidates"
- "kya main 17 saal ki umar me vote de sakta hu?" (Hinglish Support)
- "Tell me a joke" (To test the Smart Fallback system)
