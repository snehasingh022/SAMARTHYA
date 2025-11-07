# Gemini API Setup Guide

This guide will help you set up Google's Gemini API for enhanced AI features in the Autism Learning Platform.

## Features Enhanced with Gemini API

1. **Flashcard Speech Evaluation** - Intelligent evaluation of spoken answers with flexible matching
2. **Object Recognition** - Enhanced object detection using Gemini Vision API
3. **Learning Recommendations** - AI-powered personalized activity recommendations
4. **Progress Analysis** - Intelligent insights into learning patterns and progress
5. **Adaptive Feedback** - Context-aware feedback for activities

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy your API key (it will look like: `AIzaSy...`)

## Setup Instructions

### Step 1: Create Environment File

1. Create a file named `.env` in the root directory of the project
2. Add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

**Important:** Replace `your_api_key_here` with your actual API key from Google AI Studio.

### Step 2: Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

### Step 3: Verify Setup

1. Open the application in your browser
2. Go to the Flashcards section
3. You should see a "✨ Powered by Gemini AI" badge if the API is configured correctly
4. Try speaking an answer - it should use Gemini for intelligent evaluation

## API Usage

### Flashcards
- **Speech Evaluation**: Gemini evaluates spoken answers with context awareness
- **Flexible Matching**: Understands variations like "five" = "5", "ay" = "A"
- **Helpful Feedback**: Provides encouraging and educational feedback

### Object Recognition
- **Vision API**: Uses Gemini Vision for enhanced object detection
- **Detailed Descriptions**: Provides child-friendly descriptions of detected objects
- **Learning Categories**: Categorizes objects (letter, number, shape, color, object)

### Recommendations & Insights
- **Personalized Suggestions**: AI analyzes progress and suggests next activities
- **Progress Analysis**: Identifies strengths and areas for improvement
- **Learning Patterns**: Detects patterns in learning behavior

## Fallback Behavior

The application works **without** the Gemini API key:
- Flashcards use basic speech recognition matching
- Object recognition falls back to TensorFlow.js COCO-SSD
- Recommendations use rule-based logic

All features are functional even without the API key - Gemini enhances the experience but is not required.

## API Costs

- Google offers **free tier** for Gemini API with generous quotas
- Check [Google AI Studio Pricing](https://ai.google.dev/pricing) for current rates
- Typical usage: ~100-500 API calls per learning session
- Free tier should be sufficient for personal/educational use

## Security Notes

⚠️ **Important Security Information:**

1. **Never commit your `.env` file** to version control
2. The `.env` file is already in `.gitignore`
3. For production, use environment variables from your hosting platform
4. API keys should be kept secret and not shared

## Troubleshooting

### API Key Not Working

1. Verify the key is correct in `.env` file
2. Check that the file is named exactly `.env` (not `.env.txt`)
3. Restart the development server after adding the key
4. Check browser console for error messages

### API Errors

- **401 Unauthorized**: Check if your API key is correct
- **429 Too Many Requests**: You've hit the rate limit, wait a moment
- **403 Forbidden**: Check API key permissions in Google AI Studio

### Features Not Using Gemini

- Check if `isGeminiConfigured()` returns `true` in browser console
- Verify the environment variable is loaded: `console.log(import.meta.env.VITE_GEMINI_API_KEY)`
- Ensure the variable name is exactly `VITE_GEMINI_API_KEY`

## Support

For issues with:
- **API Key**: Check [Google AI Studio Documentation](https://ai.google.dev/docs)
- **Application**: Check the browser console for error messages
- **Setup**: Verify the `.env` file is in the correct location

## Example .env File

```
VITE_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Remember: Replace with your actual API key!

