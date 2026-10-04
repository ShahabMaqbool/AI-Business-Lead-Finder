# 🚀 AI Business Lead Finder – LeadGen AI

AI Business Lead Finder is an AI-powered B2B lead generation platform that helps users discover potential business leads based on business type and location.

The system uses Google Search grounding with Gemini AI to find real businesses, collect publicly available business information, analyze lead quality, and manage leads through a centralized dashboard.

---

## 🎯 Problem

Finding potential business customers manually is time-consuming. Businesses often need to search different websites, directories, and social platforms to collect company information and contact details.

LeadGen AI simplifies this process by combining business discovery, AI analysis, lead scoring, lead management, and outreach into one platform.

---

## 💡 Solution

LeadGen AI allows users to:

- 🔎 Search businesses by category and location
- 🤖 Use Gemini AI for business analysis
- 🌐 Find publicly available business websites
- 📧 Find publicly available business emails
- 📞 Find publicly available phone numbers
- ⭐ Calculate lead quality scores
- 💾 Save leads in MySQL database
- 📊 View leads in a dashboard
- 📋 Manage leads using a Kanban pipeline
- 📤 Export leads to CSV
- ✉️ Generate personalized AI cold emails
- 🔐 Secure user authentication with JWT

---

## 🏗️ System Architecture

```text
User
  │
  ▼
Next.js Frontend
  │
  ▼
Node.js + Express Backend
  │
  ├──────────────► Gemini AI
  │                    │
  │                    ▼
  │              Google Search
  │
  ▼
MySQL Database
  │
  ▼
Lead Dashboard
  │
  ├── Lead Management
  ├── Kanban Pipeline
  ├── Lead Scoring
  ├── CSV Export
  └── AI Outreach
