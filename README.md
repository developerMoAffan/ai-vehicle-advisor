# AI Vehicle Advisor v1.0

An autonomous AI consultant designed to provide real-time, data-driven automotive recommendations. Built to bridge the gap between generic chatbot responses and actionable automotive research.

## 🚀 Overview
The **AI Vehicle Advisor** is a full-stack application that acts as a virtual automobile consultant. Unlike standard AI tools that rely on stale training data, this agent utilizes **Retrieval-Augmented Generation (RAG)** to perform live web research, providing users with the latest pricing, market trends, and technical specifications.

## 🏗️ Agent Architecture
Our agent follows a modular, robust architecture:
1.  **Orchestration Layer**: FastAPI backend handles user queries and orchestrates the research workflow.
2.  **RAG Pipeline**: Leverages `ddgs` (DuckDuckGo Search) to aggregate real-time market data, ensuring advice is based on 2026 benchmarks.
3.  **Tiered Decision Engine**: An intelligent backend logic that classifies vehicle brands into maintenance tiers (Budget, Premium, Luxury) to calculate accurate, personalized ownership cost projections.
4.  **UI/UX Layer**: A high-fidelity React dashboard that renders structured data into clean, scannable vehicle cards.

## 🛠️ Key Features
* **Autonomous Web Research**: Real-time aggregation of on-road prices and expert consensus.
* **Dynamic Financial Math**: Real-time ownership cost calculator that adjusts based on user-defined mileage and brand-specific maintenance multipliers.
* **Persona-Driven Recommendations**: Expert-level, decisive analysis provided in a professional consulting persona.
* **Safety Guardrails**: Logic designed to cross-reference user safety requirements (e.g., GNCAP) with real-world industry benchmarks.

## 🚀 Tech Stack
* **Backend**: Python, FastAPI, Groq (LLM), DuckDuckGo Search API.
* **Frontend**: React, Tailwind CSS, Vite.
* **Deployment**: Hosted on Render with automated CI/CD via GitHub.

## 📝 Submission Checklist
- [x] Autonomous web research
- [x] Information aggregation & comparative analysis
- [x] Dynamic ownership cost estimation
- [x] Working Demo Application
- [x] Defined Agent Architecture

---
*Built for the FullStack Academy Hackathon 2026 by Mohammed Affan Sakhib.*
