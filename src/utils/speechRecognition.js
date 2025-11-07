// Speech Recognition utility using Web Speech API

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

export const isSpeechRecognitionSupported = () => {
  return SpeechRecognition !== undefined
}

export const createSpeechRecognition = (options = {}) => {
  if (!isSpeechRecognitionSupported()) {
    return null
  }

  const recognition = new SpeechRecognition()
  
  // Default settings (autism-friendly with improved listening)
  recognition.continuous = options.continuous || false
  recognition.interimResults = options.interimResults || true // Enable interim results for better feedback
  recognition.lang = options.lang || 'en-US'
  recognition.maxAlternatives = options.maxAlternatives || 5 // Increase alternatives for better matching
  
  return recognition
}

// Normalize text for comparison (removes punctuation, lowercase, etc.)
export const normalizeText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
}

// Check if spoken text matches the expected answer
export const checkAnswer = (spokenText, expectedAnswer) => {
  const normalizedSpoken = normalizeText(spokenText)
  const normalizedExpected = normalizeText(expectedAnswer)
  
  // Exact match
  if (normalizedSpoken === normalizedExpected) {
    return { match: true, confidence: 1.0 }
  }
  
  // Check if spoken text contains the expected answer
  if (normalizedSpoken.includes(normalizedExpected)) {
    return { match: true, confidence: 0.8 }
  }
  
  // Check if expected answer contains spoken text (partial match)
  if (normalizedExpected.includes(normalizedSpoken)) {
    return { match: true, confidence: 0.7 }
  }
  
  // Check for common variations
  const variations = getAnswerVariations(normalizedExpected)
  for (const variation of variations) {
    if (normalizedSpoken === variation || normalizedSpoken.includes(variation)) {
      return { match: true, confidence: 0.6 }
    }
  }
  
  return { match: false, confidence: 0 }
}

// Get variations of answers (for more flexible matching)
const getAnswerVariations = (text) => {
  const variations = [text]
  
  // For letters: "A" -> "letter a", "a", "the letter a"
  if (text.match(/^letter\s+([a-z])$/)) {
    const letter = text.match(/^letter\s+([a-z])$/)[1]
    variations.push(letter)
    variations.push(`the letter ${letter}`)
  }
  
  // For numbers: "Number 5" -> "5", "five", "the number five"
  if (text.match(/^number\s+(\d+)$/)) {
    const num = text.match(/^number\s+(\d+)$/)[1]
    variations.push(num)
    const numWord = numberToWord(parseInt(num))
    variations.push(numWord)
    variations.push(`the number ${numWord}`)
    variations.push(`number ${numWord}`)
  }
  
  // For single numbers: "5" -> "five", "number five"
  if (text.match(/^\d+$/)) {
    const num = parseInt(text)
    if (num <= 10) {
      variations.push(numberToWord(num))
      variations.push(`number ${numberToWord(num)}`)
    }
  }
  
  // For number words: "five" -> "5", "number 5"
  const numFromWord = wordToNumber(text)
  if (numFromWord) {
    variations.push(numFromWord)
    variations.push(`number ${numFromWord}`)
  }
  
  // For shapes/colors/objects: "This is a Circle" -> "circle", "a circle", "it's a circle"
  if (text.match(/^(this is a|the)\s+(.+)$/i)) {
    const item = text.match(/^(this is a|the)\s+(.+)$/i)[2]
    variations.push(item)
    variations.push(`a ${item}`)
    variations.push(`the ${item}`)
    variations.push(`it's a ${item}`)
    variations.push(`it is a ${item}`)
  }
  
  return variations
}

// Convert number to word (basic 0-10)
const numberToWord = (num) => {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  return words[num] || num.toString()
}

// Convert word to number
const wordToNumber = (word) => {
  const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
  const index = words.indexOf(word.toLowerCase())
  return index !== -1 ? index.toString() : null
}

