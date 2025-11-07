import { useState, useEffect, useRef } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { useSettings } from '../contexts/SettingsContext'
import { ArrowLeft, ArrowRight, RotateCcw, Check, X, Mic, MicOff, Volume2 } from 'lucide-react'
import { createSpeechRecognition, isSpeechRecognitionSupported, checkAnswer } from '../utils/speechRecognition'
import './Flashcards.css'

const FLASHCARD_SETS = {
  letters: {
    name: 'Letters',
    items: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
      front: letter,
      back: `Letter ${letter}`,
      expectedAnswer: letter.toLowerCase(),
      image: null
    }))
  },
  numbers: {
    name: 'Numbers',
    items: Array.from({ length: 10 }, (_, i) => ({
      front: i.toString(),
      back: `Number ${i}`,
      expectedAnswer: i.toString(),
      image: null
    }))
  },
  shapes: {
    name: 'Shapes',
    items: ['Circle', 'Square', 'Triangle', 'Rectangle', 'Star', 'Heart', 'Diamond', 'Oval'].map(shape => ({
      front: shape,
      back: `This is a ${shape}`,
      expectedAnswer: shape.toLowerCase(),
      image: null
    }))
  },
  colors: {
    name: 'Colors',
    items: ['Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Black', 'White'].map(color => ({
      front: color,
      back: `The color ${color}`,
      expectedAnswer: color.toLowerCase(),
      image: null,
      colorValue: color.toLowerCase()
    }))
  },
  objects: {
    name: 'Objects',
    items: ['Apple', 'Ball', 'Car', 'Dog', 'Elephant', 'Fish', 'Guitar', 'House', 'Ice Cream', 'Jacket', 'Key', 'Lamp', 'Moon', 'Nest', 'Orange', 'Pencil', 'Queen', 'Rabbit', 'Sun', 'Tree'].map(object => ({
      front: object,
      back: `This is a ${object}`,
      expectedAnswer: object.toLowerCase(),
      image: null
    }))
  }
}

const Flashcards = () => {
  const [selectedSet, setSelectedSet] = useState('letters')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recognitionResult, setRecognitionResult] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [listeningTimeout, setListeningTimeout] = useState(null)
  const recognitionRef = useRef(null)
  const { progress, updateProgress, recordActivity } = useProgress()
  const { speak, settings } = useSettings()

  const currentSet = FLASHCARD_SETS[selectedSet]
  const currentCard = currentSet.items[currentIndex]
  const totalCards = currentSet.items.length

  useEffect(() => {
    // Check if speech recognition is supported
    setSpeechSupported(isSpeechRecognitionSupported())
    
    // Initialize speech recognition
    if (speechSupported && !recognitionRef.current) {
      recognitionRef.current = createSpeechRecognition({
        continuous: false,
        interimResults: false,
        lang: 'en-US'
      })

      if (recognitionRef.current) {
        recognitionRef.current.onresult = async (event) => {
          // Handle interim results for better user feedback
          let interim = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              setRecognitionResult(transcript)
              setInterimTranscript('')
              await checkSpokenAnswer(transcript)
            } else {
              interim += transcript
            }
          }
          if (interim) {
            setInterimTranscript(interim)
          }
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          setInterimTranscript('')
          
          if (event.error === 'no-speech') {
            speak('I did not hear anything. Please speak clearly and try again.')
            // Auto-restart listening after a brief pause
            setTimeout(() => {
              if (!isListening) {
                startListening()
              }
            }, 1500)
          } else if (event.error === 'not-allowed') {
            speak('Microphone permission denied. Please allow microphone access.')
          } else if (event.error === 'audio-capture') {
            speak('Microphone not found. Please check your microphone.')
          } else if (event.error === 'aborted') {
            // Silently handle aborted errors (usually from manual stop)
          } else {
            speak('There was an error. Please try again.')
          }
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
          setInterimTranscript('')
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [speechSupported])

  useEffect(() => {
    if (settings.audioInstructions && currentCard) {
      // Clear feedback when card changes
      setFeedback(null)
      setRecognitionResult(null)
      setInterimTranscript('')
      stopListening()
      
      if (!isFlipped) {
        const promptText = selectedSet === 'letters' 
          ? `Say the letter` 
          : selectedSet === 'numbers' 
          ? `Say the number` 
          : `Say the word`
        speak(promptText)
      }
    }
  }, [currentIndex, selectedSet])

  const checkSpokenAnswer = async (spokenText) => {
    setIsEvaluating(true)
    setInterimTranscript('')
    
    // For letters, use just the letter; for numbers, use the number; for others, use the front text
    let expectedAnswer
    if (selectedSet === 'letters') {
      expectedAnswer = currentCard.front.toLowerCase()
    } else if (selectedSet === 'numbers') {
      expectedAnswer = currentCard.front // Keep as string number
    } else {
      expectedAnswer = currentCard.expectedAnswer || currentCard.front.toLowerCase()
    }
    
    let isCorrect = false
    let feedbackMessage = ''
    
    // Use basic matching for better offline support
    const result = checkAnswer(spokenText, expectedAnswer)
    isCorrect = result.match
    feedbackMessage = isCorrect ? 'Correct! Great job!' : `That's not quite right. Try saying "${currentCard.front}"`
    
    setIsEvaluating(false)
    
    if (isCorrect) {
      setFeedback('correct')
      const newCorrectCount = correctCount + 1
      setCorrectCount(newCorrectCount)
      speak(feedbackMessage || 'Correct! Great job!')
      
      // Move to next card after a delay
      setTimeout(() => {
        if (currentIndex < totalCards - 1) {
          setCurrentIndex(currentIndex + 1)
          setIsFlipped(false)
          setFeedback(null)
          setRecognitionResult(null)
        } else {
          // Completed set
          handleComplete()
        }
      }, 2000)
    } else {
      setFeedback('incorrect')
      speak(feedbackMessage || `That's not quite right. Try saying "${currentCard.front}"`)
      
      // Auto-restart listening after incorrect answer
      setTimeout(() => {
        setFeedback(null)
        setRecognitionResult(null)
        setInterimTranscript('')
        // Restart listening to give another chance
        if (speechSupported) {
          setTimeout(() => startListening(), 500)
        }
      }, 2500)
    }
  }

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      speak('Speech recognition is not supported in your browser.')
      return
    }

    try {
      setIsListening(true)
      setFeedback(null)
      setRecognitionResult(null)
      setInterimTranscript('')
      recognitionRef.current.start()
      speak('Listening... Please say the answer clearly.')
      
      // Auto-stop listening after 10 seconds for better UX
      const timeout = setTimeout(() => {
        if (isListening) {
          stopListening()
          speak('Listening timeout. Please try again.')
        }
      }, 10000)
      setListeningTimeout(timeout)
    } catch (error) {
      console.error('Error starting recognition:', error)
      setIsListening(false)
      setInterimTranscript('')
      
      // Handle "already started" error by stopping first
      if (error.message && error.message.includes('already started')) {
        recognitionRef.current.stop()
        setTimeout(() => startListening(), 300)
      } else {
        speak('Unable to start listening. Please check microphone permissions.')
      }
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped && settings.textToSpeech) {
      speak(currentCard.back)
    }
    // Clear feedback when flipping
    setFeedback(null)
    setRecognitionResult(null)
  }

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowResult(false)
      setFeedback(null)
      setRecognitionResult(null)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    stopListening()
    setFeedback(null)
    setRecognitionResult(null)
    const accuracy = Math.round((correctCount / totalCards) * 100)
    updateProgress('flashcards', selectedSet, {
      completed: Math.max(progress.flashcards[selectedSet].completed, totalCards),
      accuracy: accuracy,
      lastPlayed: new Date().toISOString()
    })
    recordActivity(`flashcards-${selectedSet}`, correctCount, accuracy, 0)
    setShowResult(true)
    speak(`Great job! You completed ${correctCount} out of ${totalCards} correctly!`)
  }
  
  const stopListening = () => {
    if (listeningTimeout) {
      clearTimeout(listeningTimeout)
      setListeningTimeout(null)
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript('')
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowResult(false)
      setFeedback(null)
      setRecognitionResult(null)
    }
  }

  const handleCorrect = () => {
    setCorrectCount(correctCount + 1)
    speak('Correct!')
    setTimeout(() => {
      handleNext()
    }, 1000)
  }

  const handleReset = () => {
    stopListening()
    setCurrentIndex(0)
    setIsFlipped(false)
    setCorrectCount(0)
    setShowResult(false)
    setFeedback(null)
    setRecognitionResult(null)
    setInterimTranscript('')
  }

  if (showResult) {
    const accuracy = Math.round((correctCount / totalCards) * 100)
    return (
      <div className="flashcards">
        <div className="result-screen">
          <h2>🎉 Great Job!</h2>
          <div className="result-stats">
            <div className="result-stat">
              <div className="result-value">{correctCount}/{totalCards}</div>
              <div className="result-label">Correct</div>
            </div>
            <div className="result-stat">
              <div className="result-value">{accuracy}%</div>
              <div className="result-label">Accuracy</div>
            </div>
          </div>
          <button className="btn-large btn-primary" onClick={handleReset}>
            <RotateCcw size={24} />
            Try Again
          </button>
          <button
            className="btn-large btn-secondary"
            onClick={() => {
              setShowResult(false)
              setSelectedSet('letters')
              handleReset()
            }}
          >
            Choose Another Set
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flashcards">
      <div className="flashcards-header">
        <h1>📚 Flashcards</h1>
        <div className="set-selector">
          {Object.keys(FLASHCARD_SETS).map((setKey) => (
            <button
              key={setKey}
              className={`set-btn ${selectedSet === setKey ? 'active' : ''}`}
              onClick={() => {
                setSelectedSet(setKey)
                setCurrentIndex(0)
                setIsFlipped(false)
                setCorrectCount(0)
                setFeedback(null)
                setRecognitionResult(null)
                setInterimTranscript('')
                stopListening()
              }}
            >
              {FLASHCARD_SETS[setKey].name}
            </button>
          ))}
        </div>
      </div>

      <div className="flashcards-container">
        <div className="progress-indicator">
          Card {currentIndex + 1} of {totalCards}
        </div>

        {!isFlipped && (
          <div className="speech-instructions">
            <p>👆 Click the microphone button and say the answer clearly!</p>
            {!speechSupported && (
              <p className="warning-text">
                ⚠️ Speech recognition is not supported in your browser. Use the buttons below instead.
              </p>
            )}
            {isEvaluating && (
              <p className="evaluating-text">
                ✨ Evaluating your answer...
              </p>
            )}
          </div>
        )}

        <div
          className={`flashcard ${isFlipped ? 'flipped' : ''} ${feedback ? `feedback-${feedback}` : ''}`}
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleFlip()
            }
          }}
        >
          <div className="flashcard-inner">
            <div className="flashcard-front">
              {currentCard.colorValue ? (
                <div
                  className="color-display"
                  style={{ backgroundColor: currentCard.colorValue }}
                >
                  <h2>{currentCard.front}</h2>
                </div>
              ) : (
                <div className="card-content">
                  <h2 className="card-text-large">{currentCard.front}</h2>
                </div>
              )}
              <p className="flip-hint">Click to flip</p>
              
              {feedback === 'correct' && (
                <div className="feedback-overlay correct-feedback">
                  <Check size={64} />
                  <p>Correct! 🎉</p>
                </div>
              )}
              {feedback === 'incorrect' && (
                <div className="feedback-overlay incorrect-feedback">
                  <X size={64} />
                  <p>Try again!</p>
                </div>
              )}
            </div>
            <div className="flashcard-back">
              <div className="card-content">
                <h2>{currentCard.back}</h2>
              </div>
              <p className="flip-hint">Click to flip back</p>
            </div>
          </div>
        </div>

        {!isFlipped && (
          <div className="speech-recognition-section">
            {(recognitionResult || interimTranscript) && (
              <div className="recognition-result">
                {recognitionResult ? (
                  <p>You said: <strong>"{recognitionResult}"</strong></p>
                ) : (
                  <p className="interim-text">Hearing: <em>"{interimTranscript}"</em></p>
                )}
              </div>
            )}
            
            <button
              className={`btn-large btn-microphone ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={!speechSupported}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? (
                <>
                  <MicOff size={32} />
                  <span>Stop Listening</span>
                </>
              ) : (
                <>
                  <Mic size={32} />
                  <span>Speak Answer</span>
                </>
              )}
            </button>
            
            {isListening && (
              <div className="listening-indicator">
                <div className="pulse-ring"></div>
                <p>🎤 Listening...</p>
              </div>
            )}
          </div>
        )}

        <div className="flashcard-controls">
          <button
            className="btn-large btn-control"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label="Previous card"
          >
            <ArrowLeft size={24} />
            Previous
          </button>

          <button
            className="btn-large btn-flip"
            onClick={handleFlip}
            aria-label="Flip card"
          >
            <Volume2 size={24} />
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </button>

          <button
            className="btn-large btn-control"
            onClick={handleNext}
            disabled={currentIndex === totalCards - 1}
            aria-label="Next card"
          >
            Next
            <ArrowRight size={24} />
          </button>
        </div>

        <div className="answer-buttons">
          <button
            className="btn-large btn-incorrect"
            onClick={() => handleNext()}
            aria-label="Skip card"
          >
            <X size={24} />
            Skip
          </button>
          <button
            className="btn-large btn-correct"
            onClick={handleCorrect}
            aria-label="Mark as correct"
          >
            <Check size={24} />
            Got It!
          </button>
        </div>
      </div>
    </div>
  )
}

export default Flashcards
