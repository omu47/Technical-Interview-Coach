# AI Interview Coach

An AI-powered technical interview coach that helps you practice and prepare for technical interviews.

## Features

- 🤖 AI-powered interview questions and feedback
- 💻 Interactive whiteboard for coding problems
- 📝 Real-time chat interface
- 🎯 Role-specific interview preparation (Frontend, Backend, Fullstack, etc.)
- 📊 Seniority level customization

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Markdown**: react-markdown
- **Deployment**: Vercel

## Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

To get a Google AI API key:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your environment variables

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Add your GOOGLE_AI_API_KEY to .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Vercel Deployment

### Automatic Deployment

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add `GOOGLE_AI_API_KEY` as an environment variable in Vercel dashboard
4. Deploy!

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build and deploy:
```bash
npm run build
vercel --prod
```

## Build Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/chat/         # Chat API route
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── ChatPanel.tsx     # Chat interface
│   │   └── WhiteboardPanel.tsx # Whiteboard component
│   ├── hooks/
│   │   └── useInterviewState.ts # State management
│   └── types/
│       └── interview.ts      # TypeScript types
├── public/                   # Static assets
├── .env.example             # Environment variables template
├── vercel.json              # Vercel configuration
└── next.config.ts           # Next.js configuration
```

## License

MIT License
