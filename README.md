# VerifyDoc — AI Fact-Check Agent

Upload a PDF. Get every factual claim extracted, searched, and verified automatically.

VerifyDoc reads your document, pulls out statements that can be fact-checked (dates, stats, financial figures, technical claims), searches the web for evidence, and gives you a verdict on each one — verified, misleading, inaccurate, or false.

---

## How It Works

```
PDF Upload  →  Extract Text  →  Gemini AI extracts claims  →  Tavily searches each claim  →  Gemini verifies against sources  →  Report
```

1. You upload a PDF on the homepage
2. The server extracts text using `pdf-parse`
3. Gemini 2.5 Flash identifies factual claims (dates, numbers, statistics, financial/technical statements)
4. Each claim is sent to the Tavily Search API to find real-world sources
5. Gemini evaluates the claim against those sources and returns a verdict + confidence score
6. The report page shows results live as each claim gets verified

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + Framer Motion + shadcn/ui |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Search | Tavily API (`@tavily/core`) |
| PDF Parsing | `pdf-parse` |
| Export | Browser Print API (CSS print styles) |

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/amitprasad21/CogCuliture_Assignment.git
cd ai-fact-check-agent
npm install
```

### 2. Get API keys (free)

You need two API keys:

- **Gemini API Key** — Go to [Google AI Studio](https://aistudio.google.com/apikey), sign in, click "Create API Key"
- **Tavily API Key** — Go to [Tavily](https://tavily.com), sign up, copy your API key from the dashboard

### 3. Create `.env.local`

Create a file called `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

That's it. No database setup needed — the app works without Supabase.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload a PDF to try it out.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                          # Homepage with upload UI
│   ├── layout.tsx                        # Root layout with dark theme
│   ├── api/
│   │   ├── upload/route.ts               # PDF parsing + Gemini claim extraction
│   │   └── verify/route.ts               # Tavily search + Gemini verification
│   └── dashboard/report/[id]/page.tsx    # Report page with live verification
├── components/
│   ├── UploadSection.tsx                 # Drag-and-drop file upload component
│   └── ui/                              # shadcn/ui components
└── lib/
    └── utils.ts                          # Utility functions
```

---

## API Routes

### `POST /api/upload`

Accepts a PDF file via `FormData`. Extracts text, sends it to Gemini to identify factual claims.

**Returns:** `{ reportId, fileName, claims[] }`

### `POST /api/verify`

Accepts `{ claimText, category }`. Searches Tavily for evidence, then asks Gemini to verify the claim.

**Returns:** `{ status, confidence_score, corrected_fact, explanation, sources[] }`

---

## Available Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Jest) |
| `npm run test:e2e` | Run end-to-end tests (Playwright) |

---

## Deployment

Works on Vercel out of the box:

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` and `TAVILY_API_KEY` as environment variables
4. Deploy

---

## Notes

- Max upload size: 10MB
- PDF text is truncated to 5000 characters for the AI prompt
- Claims are verified sequentially (one at a time) to stay within API rate limits
- Export uses the browser's native print dialog for accurate PDF output
