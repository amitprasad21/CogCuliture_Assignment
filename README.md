# VerifyDoc - Document Verification Platform

A production-ready fact-checking platform that automatically extracts and verifies factual claims from documents using Gemini 1.5 Flash and the Tavily Search API. Designed with a premium, responsive UI for modern enterprise SaaS.

## 🚀 Features

1. **Intelligent PDF Parsing**: Upload documents and instantly extract statements.
2. **Claim Extraction**: The system parses text to identify dates, statistics, and financial/technical statements.
3. **Automated Verification**: Uses the Tavily API to search the web and cross-reference claims against authoritative sources.
4. **PDF Report Export**: Download verification reports as complete PDF documents for offline sharing.
5. **Premium Responsive UI**: Built with Tailwind CSS, Framer Motion, and shadcn/ui. Fully optimized for desktop, tablet, and mobile viewing.

## 🏗 Architecture & Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion, shadcn/ui
- **Fonts & Icons**: Inter Font, Lucide React
- **Exporting**: html2canvas, jsPDF
- **Database (Optional)**: Supabase PostgreSQL, Supabase Auth
- **AI Integration**: `@google/genai` (Gemini 1.5 Flash)
- **Search**: `@tavily/core` (Tavily API)

## ⚙️ How to Start the Project Locally

### 1. Prerequisites
Ensure you have **Node.js 18+** and **npm** installed on your local machine.

### 2. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd ai-fact-check-agent
npm install
```

### 3. Setup Environment Variables
Create a file named `.env.local` in the root directory and add the following keys. You can get free API keys from Google AI Studio and Tavily.
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the application running locally.

## 🧪 Testing

We include a complete automated testing suite using Jest and Playwright.

- **Run E2E Browser Tests**: `npm run test:e2e`
- **Run Unit/API Tests**: `npm run test`
- **Generate Test PDFs**: `npm run test:generate`

## 🚢 Deployment

This platform is ready to be deployed on Vercel. Push your code to GitHub, import the repository into your Vercel dashboard, and configure the Environment Variables. Vercel will automatically build and deploy your Next.js application.
