# Insightful Reader - AI Document Analysis App

Insightful Reader is a Next.js application that leverages Generative AI (via Genkit and Google Gemini) to provide users with summaries, keyword extraction, important point identification, and character analysis from text documents. Users can either paste text directly or upload files (.txt, .md, .docx, .pdf).

_**This application is solely made through Google's Firebase Studio for learning purposes.**_

## Features

-   **Text Input & File Upload**: Supports direct text pasting or uploading of `.txt`, `.md`, `.docx`, and `.pdf` files.
-   **AI-Powered Analysis**:
    -   **Summarization**: Generates a concise narrative summary of the document.
    -   **Keyword Extraction**: Identifies key terms and concepts.
    -   **Important Points**: Highlights crucial information from the text.
    -   **Character Identification**: Lists characters found in the document along with brief descriptions.
-   **User-Friendly Interface**: Dark-themed, responsive UI built with ShadCN components and Tailwind CSS.
-   **Client-Side File Processing**: Extracts text from various file formats directly in the browser.

## Tech Stack

-   **Framework**: Next.js (App Router, Server Components, Server Actions)
-   **AI Integration**: Genkit with Google Gemini
-   **UI**: React, ShadCN UI, Tailwind CSS
-   **File Processing**: `mammoth` (for .docx), `pdfjs-dist` (for .pdf)
-   **Language**: TypeScript

## Prerequisites

-   Node.js (version 18.x or later recommended)
-   npm, yarn, or pnpm

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd insightful-reader # or your project's directory name
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open the `.env` file and add your Google AI API key:

```
GOOGLE_API_KEY="YOUR_GOOGLE_AI_API_KEY_HERE"
```

You can obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Run the Development Server

To run the Next.js application:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at `http://localhost:9002` (or the port specified in your `package.json`).

Genkit flows run within the Next.js server in this setup. If you need to run Genkit dev services separately (e.g., for the Genkit Developer UI), you can use:
```bash
npm run genkit:dev
# or in watch mode
npm run genkit:watch
```
The Genkit Developer UI will typically be available at `http://localhost:4000`.

### 5. Build for Production

To create a production build:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

### 6. Start the Production Server

After building, you can start the production server:

```bash
npm run start
# or
yarn start
# or
pnpm start
```

## Project Structure

-   `src/app/`: Next.js App Router pages and layouts.
    -   `src/app/page.tsx`: The main page component for the application.
    -   `src/app/globals.css`: Global styles and Tailwind CSS theme configuration.
-   `src/ai/`: Genkit related files.
    -   `src/ai/genkit.ts`: Genkit main configuration.
    -   `src/ai/schemas.ts`: Shared Zod schemas for AI flows.
    -   `src/ai/flows/`: Contains the Genkit flow definitions (e.g., `summarize-document.ts`).
-   `src/components/`: Reusable React components, particularly ShadCN UI components.
-   `src/hooks/`: Custom React hooks (e.g., `useToast.ts`, `use-mobile.ts`).
-   `src/lib/`: Utility functions.
-   `public/`: Static assets.
-   `next.config.ts`: Next.js configuration.
-   `tailwind.config.ts`: Tailwind CSS configuration.
-   `tsconfig.json`: TypeScript configuration.

## Deployment

This project is configured for standard Next.js deployments. You can deploy it to platforms like:

-   Vercel (recommended for Next.js)
-   Netlify
-   AWS Amplify
-   Google Cloud Run
-   Other Node.js hosting providers

Ensure your hosting provider has Node.js 18.x or later. You will also need to configure the `GOOGLE_API_KEY` environment variable in your deployment environment.

## Linting and Type Checking

-   To run ESLint: `npm run lint`
-   To type check with TypeScript: `npm run typecheck`

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.
(If you have specific contribution guidelines, add them here).
```
