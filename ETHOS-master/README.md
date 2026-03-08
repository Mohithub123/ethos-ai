# Ethos: AI-Powered Moral Reflection System

![GitHub License](https://img.shields.io/github/license/ayuj0000/ETHOS?style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/ayuj0000/ETHOS?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

Ethos is a full-stack application designed to help users develop empathy through role-reversal narratives and sentiment-based reflection analysis.

## 🚀 Features

- **Victim Perspective Narratives**: Transform scenarios into impactful first-person stories using AI.
- **Sentiment Analysis**: Analyze user reflections to detect empathy levels (Remorseful vs. Defensive).
- **Progress Dashboard**: Track your empathy growth over time with visualizations and session history.
- **Privacy First**: Session data is stored locally in your browser.

## 🛠️ Tech Stack

- **Frontend**: Next.js (TypeScript), Tailwind CSS, Framer Motion, Recharts.
- **Backend**: FastAPI (Python), OpenRouter API, Sentiment Analysis Models.

## 🏁 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+

### Setup

1. **Clone the repository**:
   ```bash
   git clone [your-repo-url]
   cd ethos
   ```

2. **Backend Setup**:
   ```bash
   # Create a .env file in the root
   echo "OPENROUTER_API_KEY=your_key_here" > .env
   
   # Install dependencies
   pip install fastapi uvicorn requests python-dotenv transformers torch
   
   # Start the server
   python -m uvicorn api.main:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd web
   npm install
   npm run dev
   ```

4. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000)

## 📄 License
MIT
