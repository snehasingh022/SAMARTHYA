// Gemini API integration for intelligent learning features

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

// Check if API key is configured
export const isGeminiConfigured = () => {
  return GEMINI_API_KEY !== '' && GEMINI_API_KEY !== undefined
}

// Generic Gemini API call
const callGeminiAPI = async (prompt, options = {}) => {
  if (!isGeminiConfigured()) {
    console.warn('Gemini API key not configured')
    return null
  }

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxOutputTokens || 1024,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (error) {
    console.error('Gemini API error:', error)
    return null
  }
}

// Evaluate spoken answer for flashcards
export const evaluateSpokenAnswer = async (spokenText, expectedAnswer, cardType) => {
  const prompt = `You are an educational assistant helping children learn. 
  
The child said: "${spokenText}"
The expected answer is: "${expectedAnswer}"
Card type: ${cardType}

Evaluate if the child's answer is correct. Consider:
- Phonetic similarity (e.g., "A" and "ay" are both correct for letter A)
- Common mispronunciations
- Acceptable variations (e.g., "five" = "5", "circle" = "round")
- Be lenient with young children's speech

Respond with ONLY a JSON object in this exact format:
{
  "correct": true/false,
  "confidence": 0.0-1.0,
  "feedback": "brief positive feedback if correct, or helpful hint if incorrect"
}`

  try {
    const response = await callGeminiAPI(prompt, { temperature: 0.3 })
    if (!response) return null

    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      return result
    }
    return null
  } catch (error) {
    console.error('Error evaluating answer:', error)
    return null
  }
}

// Recognize and describe objects in image
export const recognizeObjectInImage = async (imageBase64, mimeType = 'image/jpeg') => {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Look at this image and identify any objects that a child might be learning about (letters, numbers, shapes, colors, common objects like apple, ball, book, etc.).
  
Respond with a JSON array of objects found, each with:
{
  "object": "name of object",
  "confidence": 0.0-1.0,
  "description": "brief child-friendly description",
  "learning_category": "letter/number/shape/color/object"
}`

  try {
    // Use Gemini Vision API for image analysis
    // Note: Use gemini-1.5-flash or gemini-1.5-pro for vision capabilities
    const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
    
    // Clean base64 data (remove data URL prefix if present)
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
    
    const response = await fetch(visionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini Vision API error: ${response.statusText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    console.error('Error recognizing objects:', error)
    return null
  }
}

// Convert video frame to base64
export const videoFrameToBase64 = (videoElement) => {
  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoElement, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.8)
}

// Get personalized learning recommendations
export const getLearningRecommendations = async (progressData, activityHistory) => {
  const prompt = `You are an educational AI assistant helping children with autism learn. 

Child's Progress:
- Current Level: ${progressData.currentLevel}
- Completed Activities: ${JSON.stringify(progressData)}
- Recent Activity History: ${JSON.stringify(activityHistory.slice(0, 10))}

Based on this progress, suggest:
1. What activity the child should try next
2. Why this activity is recommended
3. What skills they're developing
4. Any encouragement or tips

Respond with a JSON object:
{
  "recommended_activity": "activity name",
  "reason": "why this is recommended",
  "skills_developed": ["skill1", "skill2"],
  "encouragement": "positive message",
  "difficulty_level": "easy/medium/hard"
}`

  try {
    const response = await callGeminiAPI(prompt, { temperature: 0.7 })
    if (!response) return null

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    console.error('Error getting recommendations:', error)
    return null
  }
}

// Analyze child's progress and provide insights
export const analyzeProgress = async (progressData) => {
  const prompt = `Analyze this child's learning progress:

${JSON.stringify(progressData, null, 2)}

Provide insights:
1. Strengths (what they're good at)
2. Areas for improvement
3. Learning patterns
4. Suggested next steps

Respond with JSON:
{
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "patterns": "observations about learning patterns",
  "next_steps": ["step1", "step2"]
}`

  try {
    const response = await callGeminiAPI(prompt, { temperature: 0.5 })
    if (!response) return null

    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    console.error('Error analyzing progress:', error)
    return null
  }
}

// Generate personalized feedback for activities
export const generateFeedback = async (activityType, performance, accuracy) => {
  const prompt = `A child just completed a ${activityType} activity with ${accuracy}% accuracy.

Generate encouraging, positive feedback that:
- Celebrates their effort
- Provides gentle guidance if needed
- Uses simple, child-friendly language
- Is supportive and motivating

Keep it brief (1-2 sentences).`

  try {
    const response = await callGeminiAPI(prompt, { temperature: 0.8, maxOutputTokens: 100 })
    return response?.trim() || null
  } catch (error) {
    console.error('Error generating feedback:', error)
    return null
  }
}

