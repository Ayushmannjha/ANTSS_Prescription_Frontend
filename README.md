# ANTSS Prescription - Next.js Application

This repository contains the Next.js full-stack application for the **ANTSS Prescription** system. Built with Next.js (App Router), this application serves both the user interface (Frontend) and lightweight server-side operations (Backend API Routes) in a single unified repository.

## 🏗️ Architecture: Frontend vs. Backend Distinction

Next.js is a full-stack React framework. To clear up the distinction within this repository, here is how the Frontend and Backend are separated:

### 1. Frontend (Client-Side & UI)
The **Frontend** is responsible for rendering the UI, handling user interactions, and managing client-side state. It resides mainly in the `app/` (excluding `app/api/`) and `components/` directories.

- **Framework**: React 19 & Next.js 16 (App Router).
- **Styling**: Tailwind CSS & PostCSS, offering responsive and modern UI out of the box.
- **UI Components**: Radix UI primitives and shadcn/ui are heavily used for accessible, high-quality components (Dialogs, Dropdowns, Selects, etc.).
- **Animations**: Framer Motion and `@splinetool/react-spline` for dynamic user experiences.
- **State Management**: Zustand for robust global state management, combined with React Hook Form & Zod for form validations.
- **Routing**: Next.js App Router handles navigating between pages like `/login`, `/doctor`, `/patients`, `/prescription`, etc.

**Key Directories:**
- `app/(pages)`: Contains page routes like `login`, `doctor`, `prescription`.
- `components/`: Contains reusable React components (UI elements, forms, layouts).
- `styles/` & `public/`: For global CSS (`globals.css`) and static assets.
- `hooks/`, `lib/`, `services/`: Client-side utilities and data-fetching logic.

### 2. Backend (Server-Side & API)
The **Backend** within this Next.js project handles server-side logic, secure API communications, and AI processing. It resides exclusively in the `app/api/` directory.

- **Framework**: Next.js API Routes (Serverless Functions).
- **AI Integration**: Uses `@ai-sdk/groq` and the `ai` package to securely communicate with Large Language Models (e.g., `llama-3.3-70b-versatile`).
- **Data Extraction**: The primary backend feature is the `/api/extract-patient` route. It receives raw conversational text, securely calls the Groq API (using `GROQ_API_KEY` hidden from the frontend), and utilizes Zod schemas to rigidly extract and structure medical data (diagnoses, complaints, medicines, vitals).
- **Security**: The backend acts as a secure proxy. API keys and sensitive server operations are executed here, meaning the frontend never exposes sensitive credentials.

**Key Directories:**
- `app/api/`: Contains all server-side route handlers. For example, `app/api/extract-patient/route.ts` parses incoming text into structured patient JSON data using an LLM.

---

> **Note on External Backend**: While this Next.js app has its own API routes for AI processing and BFF (Backend-for-Frontend) tasks, the primary system database and core business logic might still be handled by a separate enterprise backend (like `ANTSS_Prescription_Backend` built in Java/Spring Boot). The Next.js API routes act as an intermediary layer or handle specialized tasks like AI integrations.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- `pnpm` (recommended package manager)

### Installation
1. Clone the repository and navigate into the project directory.
2. Install the dependencies:
   ```bash
   pnpm install
   ```

### Environment Variables
Create a `.env.local` file in the root directory and add the necessary environment variables. Example:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### Running the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build for Production
To build the application for production deployment:
```bash
pnpm build
pnpm start
```
