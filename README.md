This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## ElevenLabs Text-to-Speech Integration

This project includes ElevenLabs text-to-speech functionality that automatically plays audio responses from the AI consultant.

### Setup

1. Get your ElevenLabs API key from [https://elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)
2. Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Features

- **Automatic TTS**: AI responses are automatically converted to speech after streaming ends
- **Audio Controls**: Toggle audio on/off using the audio button in the header
- **Visual Feedback**: Audio playback status is shown with animated icons
- **Smart Detection**: Only plays TTS for new AI messages, not when scrolling through history

### Voice Configuration

The default voice ID is `JBFqnCBsd6RMkjVDRZzb`. You can change this in the `WebSocketChat.tsx` component to use different ElevenLabs voices.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
