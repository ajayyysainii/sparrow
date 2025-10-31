# AI Voice Assistant Setup Guide

## Overview
This project creates a voice calling system where users can have conversations with an AI assistant about any topic. The system uses:
- **ElevenLabs** for text-to-speech (AI voice)
- **OpenAI** for AI conversation
- **Web Speech API** for speech-to-text (user voice input)

## Setup Instructions

### 1. Install Dependencies
The required packages are already installed:
- `@elevenlabs/elevenlabs-js` - ElevenLabs TTS
- `openai` - OpenAI API client

### 2. API Keys Setup
Create a `.env` file in the `client` directory with your API keys:

```bash
# In client/.env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Vite uses `VITE_` prefix for environment variables instead of `REACT_APP_`.

### 3. Get API Keys

#### ElevenLabs API Key:
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up/Login
3. Go to your profile settings
4. Copy your API key

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login
3. Go to API Keys section
4. Create a new API key

### 4. Run the Application
```bash
# Start the client
cd client
npm run dev

# In another terminal, start the server (optional)
cd server
npm run dev
```

## How to Use

1. **Start a Conversation**: Enter a topic you want to discuss (e.g., "Space exploration", "Cooking", "Technology trends")

2. **Voice Interaction**: 
   - Click "Start Speaking" to begin voice input
   - Speak naturally - the AI will respond with voice
   - Use "Stop Listening" to pause voice input
   - Use "Mute" to silence AI responses

3. **End Call**: Click "End Call" to finish the conversation

## Features

- **Topic-based Conversations**: AI adapts responses based on your chosen topic
- **Real-time Voice**: Two-way voice conversation with natural speech
- **Call Controls**: Start/stop listening, mute, end call
- **Conversation History**: See the chat log during the call
- **Responsive UI**: Clean, modern interface with Tailwind CSS

## Browser Compatibility

- **Chrome/Edge**: Full support for Web Speech API
- **Firefox**: Limited support
- **Safari**: Limited support

For best experience, use Chrome or Edge browsers.

## Troubleshooting

1. **No voice output**: Check your ElevenLabs API key
2. **No voice input**: Ensure microphone permissions are granted
3. **AI not responding**: Check your OpenAI API key
4. **Browser compatibility**: Use Chrome or Edge for best results

## Customization

You can customize:
- **AI Voice**: Change the voice in the `textToSpeech` function (line ~150)
- **AI Model**: Modify the OpenAI model in `getAIResponse` function
- **UI Styling**: Update Tailwind classes for different appearance
- **Conversation Length**: Adjust `max_tokens` parameter for longer/shorter responses
