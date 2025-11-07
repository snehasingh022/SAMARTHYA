import { useState, useRef, useEffect } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { useSettings } from '../contexts/SettingsContext'
import { Camera, Video, VideoOff, Check, X, AlertCircle, Smile, Hand } from 'lucide-react'
import { detectObjects, drawDetections, isLearningObject, LEARNING_OBJECTS } from '../utils/computerVision'
import './ComputerVision.css'

const CV_MODULES = {
  objectRecognition: {
    name: 'Object Recognition',
    description: 'Show objects to the camera and learn their names',
    icon: Camera
  },
  gestures: {
    name: 'Gesture Learning',
    description: 'Use hand gestures to select answers',
    icon: Hand
  },
  emotions: {
    name: 'Emotion Recognition',
    description: 'Learn about different emotions and facial expressions',
    icon: Smile
  },
  matching: {
    name: 'Shape Matching',
    description: 'Match shapes using your camera',
    icon: Check
  }
}

const ComputerVision = () => {
  const [activeModule, setActiveModule] = useState(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [detectedObjects, setDetectedObjects] = useState([])
  const [targetObject, setTargetObject] = useState(null)
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(1)
  const [gameMode, setGameMode] = useState('learning') // 'learning' or 'quiz'
  const [detectedEmotion, setDetectedEmotion] = useState(null)
  const [currentShape, setCurrentShape] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationFrameRef = useRef(null)
  const emotionIntervalRef = useRef(null)
  const lastSpeakTimeRef = useRef(0)
  const lastDetectedObjectRef = useRef('')
  const quizObjectFoundRef = useRef(false)
  const detectionCountRef = useRef(0)
  const { progress, updateProgress, recordActivity } = useProgress()
  const { settings, speak } = useSettings()

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (isCameraActive && activeModule === 'objectRecognition') {
      startObjectDetection()
    } else if (isCameraActive && activeModule === 'emotions') {
      if (emotionIntervalRef.current) {
        clearInterval(emotionIntervalRef.current)
      }
      emotionIntervalRef.current = startEmotionDetection()
      return () => {
        if (emotionIntervalRef.current) {
          clearInterval(emotionIntervalRef.current)
          emotionIntervalRef.current = null
        }
      }
    } else {
      stopDetection()
    }
  }, [isCameraActive, activeModule])

  const startCamera = async () => {
    if (!settings.cvModulesEnabled) {
      speak('Computer vision modules are disabled. Please enable them in settings.')
      return
    }

    try {
      setIsModelLoading(true)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsCameraActive(true)
        setIsModelLoading(false)
        speak('Camera started')
        
        if (activeModule === 'objectRecognition' && gameMode === 'quiz') {
          setTargetObject(LEARNING_OBJECTS[Math.floor(Math.random() * LEARNING_OBJECTS.length)])
          speak(`Find a ${targetObject}`)
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setIsModelLoading(false)
      speak('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    stopDetection()
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setDetectedObjects([])
    setDetectedEmotion(null)
    // Reset tracking refs
    lastSpeakTimeRef.current = 0
    lastDetectedObjectRef.current = ''
    quizObjectFoundRef.current = false
    detectionCountRef.current = 0
  }

  const startObjectDetection = async () => {
    if (!videoRef.current || !canvasRef.current) return

    // Reset detection tracking
    quizObjectFoundRef.current = false
    detectionCountRef.current = 0

    // Use TensorFlow.js COCO-SSD for object detection
    const detect = async () => {
      if (!videoRef.current || !videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        animationFrameRef.current = requestAnimationFrame(detect)
        return
      }

      try {
        const detections = await detectObjects(videoRef.current)
        setDetectedObjects(detections)
        
        if (canvasRef.current && videoRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth
          canvasRef.current.height = videoRef.current.videoHeight
          drawDetections(canvasRef.current, detections, videoRef.current)
        }

        // Check if target object is found in quiz mode
        if (gameMode === 'quiz' && targetObject && !quizObjectFoundRef.current) {
          const found = detections.find(det => {
            const matchesName = det.class.toLowerCase().includes(targetObject.toLowerCase()) ||
                                targetObject.toLowerCase().includes(det.class.toLowerCase())
            return matchesName && det.score >= 0.5 // Accept 50% confidence or higher
          })
          if (found) {
            quizObjectFoundRef.current = true // Prevent multiple triggers
            speak(`Good job! ${found.class} detected!`)
            setTimeout(() => {
              handleCorrectGuess()
            }, 500) // Small delay to prevent race conditions
          }
        }

        // Speak detected objects in learning mode (throttled)
        if (gameMode === 'learning' && detections.length > 0 && settings.textToSpeech) {
          const learningObjects = detections.filter(det => 
            isLearningObject(det.class) && det.score >= 0.5 // Accept 50% confidence
          )
          if (learningObjects.length > 0) {
            const obj = learningObjects[0]
            const now = Date.now()
            const timeSinceLastSpeak = now - lastSpeakTimeRef.current
            const isDifferentObject = lastDetectedObjectRef.current !== obj.class
            
            // Speak if: 5 seconds passed OR different object detected
            if (timeSinceLastSpeak > 5000 || (isDifferentObject && timeSinceLastSpeak > 2000)) {
              speak(`Good job! I see a ${obj.class}!`)
              lastSpeakTimeRef.current = now
              lastDetectedObjectRef.current = obj.class
              detectionCountRef.current = 0
            } else if (isDifferentObject) {
              // Track detections of different object
              detectionCountRef.current++
              if (detectionCountRef.current >= 3 && timeSinceLastSpeak > 1000) {
                // If same new object detected 3 times in a row, speak it
                speak(`Good job! I see a ${obj.class}!`)
                lastSpeakTimeRef.current = now
                lastDetectedObjectRef.current = obj.class
                detectionCountRef.current = 0
              }
            }
          }
        }
      } catch (error) {
        console.error('Detection error:', error)
      }

      animationFrameRef.current = requestAnimationFrame(detect)
    }

    detect()
  }



  const startEmotionDetection = () => {
    // Simplified emotion detection - would use face landmarks in production
    const emotions = ['happy', 'sad', 'surprised', 'neutral']
    return setInterval(() => {
      if (!videoRef.current || !videoRef.current.srcObject) {
        return
      }
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
      setDetectedEmotion(randomEmotion)
      if (settings.textToSpeech) {
        speak(`I see a ${randomEmotion} face`)
      }
    }, 3000)
  }

  const stopDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (emotionIntervalRef.current) {
      clearInterval(emotionIntervalRef.current)
      emotionIntervalRef.current = null
    }
    setIsAnalyzing(false)
  }

  const handleCorrectGuess = () => {
    setScore(score + 10)
    setRound(round + 1)
    
    updateProgress('computerVision', 'objectRecognition', {
      completed: progress.computerVision.objectRecognition.completed + 1,
      accuracy: 100,
      lastPlayed: new Date().toISOString()
    })
    recordActivity('cv-objectRecognition', score + 10, 100, 0)
    
    // Set new target
    setTimeout(() => {
      const newTarget = LEARNING_OBJECTS[Math.floor(Math.random() * LEARNING_OBJECTS.length)]
      setTargetObject(newTarget)
      quizObjectFoundRef.current = false // Reset for next object
      speak(`Excellent! Now find a ${newTarget}`)
    }, 2000)
  }

  const handleModuleSelect = (moduleKey) => {
    if (activeModule === moduleKey) {
      setActiveModule(null)
      stopCamera()
    } else {
      setActiveModule(moduleKey)
      setScore(0)
      setRound(1)
      // Reset tracking refs when switching modules
      lastSpeakTimeRef.current = 0
      lastDetectedObjectRef.current = ''
      quizObjectFoundRef.current = false
      detectionCountRef.current = 0
      if (isCameraActive) {
        stopCamera()
      }
    }
  }

  const handleShapeMatch = (shape) => {
    // Shape matching logic
    if (currentShape === shape) {
      setScore(score + 10)
      speak('Match!')
      setCurrentShape(['circle', 'square', 'triangle', 'rectangle'][Math.floor(Math.random() * 4)])
    }
  }

  if (!settings.cvModulesEnabled) {
    return (
      <div className="computer-vision">
        <div className="cv-disabled">
          <AlertCircle size={64} />
          <h2>Computer Vision Modules Disabled</h2>
          <p>Please enable Computer Vision Modules in settings to use this feature.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="computer-vision">
      <div className="cv-header">
        <h1>📷 Camera Games</h1>
        <p className="cv-subtitle">Interactive learning with your camera</p>
      </div>

      <div className="cv-modules-grid">
        {Object.keys(CV_MODULES).map((moduleKey) => {
          const module = CV_MODULES[moduleKey]
          const Icon = module.icon
          return (
            <button
              key={moduleKey}
              className={`cv-module-card ${activeModule === moduleKey ? 'active' : ''}`}
              onClick={() => handleModuleSelect(moduleKey)}
            >
              <Icon size={48} />
              <h3>{module.name}</h3>
              <p>{module.description}</p>
            </button>
          )
        })}
      </div>

      {activeModule === 'objectRecognition' && (
        <div className="cv-activity">
          <h2>Object Recognition Game</h2>

          
          <div className="game-mode-selector">
            <button
              className={`mode-btn ${gameMode === 'learning' ? 'active' : ''}`}
              onClick={() => {
                setGameMode('learning')
                setScore(0)
                setRound(1)
              }}
            >
              Learning Mode
            </button>
            <button
              className={`mode-btn ${gameMode === 'quiz' ? 'active' : ''}`}
              onClick={() => {
                setGameMode('quiz')
                setScore(0)
                setRound(1)
                setTargetObject(LEARNING_OBJECTS[Math.floor(Math.random() * LEARNING_OBJECTS.length)])
              }}
            >
              Quiz Mode
            </button>
          </div>

          {gameMode === 'quiz' && targetObject && (
            <div className="target-object">
              <h3>Find: {targetObject}</h3>
              <p>Round {round} - Score: {score}</p>
            </div>
          )}

          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
              style={{ display: isCameraActive ? 'block' : 'none' }}
            />
            <canvas
              ref={canvasRef}
              className="detection-canvas"
              style={{ display: isCameraActive ? 'block' : 'none' }}
            />
            {!isCameraActive && (
              <div className="camera-placeholder">
                <Camera size={64} />
                <p>Camera not active</p>
                {isModelLoading && <p className="loading-text">Loading models...</p>}
              </div>
            )}
          </div>

          <div className="camera-controls">
            {!isCameraActive ? (
              <button 
                className="btn-large btn-primary" 
                onClick={startCamera}
                disabled={isModelLoading}
              >
                <Video size={24} />
                {isModelLoading ? 'Loading...' : 'Start Camera'}
              </button>
            ) : (
              <button className="btn-large btn-secondary" onClick={stopCamera}>
                <VideoOff size={24} />
                Stop Camera
              </button>
            )}
          </div>

          {isCameraActive && detectedObjects.length > 0 && (
            <div className="detection-results">
              <h3>Detected Objects:</h3>
              <div className="detected-objects-list">
                {detectedObjects
                  .slice(0, 5)
                  .map((obj, index) => (
                    <div key={index} className="detected-object-item">
                      <div className="object-info">
                        <span className="object-name">{obj.class}</span>
                        {obj.description && (
                          <span className="object-description">{obj.description}</span>
                        )}
                        {obj.category && (
                          <span className="object-category">Category: {obj.category}</span>
                        )}
                      </div>
                      <span className="object-confidence">
                        {Math.round((obj.score || 0.8) * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="score-display">
            <span>Score: {score}</span>
            <span>Round: {round}</span>
          </div>
        </div>
      )}

      {activeModule === 'emotions' && (
        <div className="cv-activity">
          <h2>Emotion Recognition</h2>
          <p>Show your face to the camera to detect emotions!</p>
          
          <div className="camera-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
              style={{ display: isCameraActive ? 'block' : 'none' }}
            />
            {!isCameraActive && (
              <div className="camera-placeholder">
                <Smile size={64} />
                <p>Camera not active</p>
              </div>
            )}
          </div>

          <div className="camera-controls">
            {!isCameraActive ? (
              <button className="btn-large btn-primary" onClick={startCamera}>
                <Video size={24} />
                Start Camera
              </button>
            ) : (
              <button className="btn-large btn-secondary" onClick={stopCamera}>
                <VideoOff size={24} />
                Stop Camera
              </button>
            )}
          </div>

          {detectedEmotion && (
            <div className="emotion-display">
              <div className={`emotion-card emotion-${detectedEmotion}`}>
                <h3>{detectedEmotion.charAt(0).toUpperCase() + detectedEmotion.slice(1)}</h3>
                <p>I see a {detectedEmotion} expression!</p>
              </div>
            </div>
          )}

          <div className="emotions-guide">
            <h3>Learn about emotions:</h3>
            <div className="emotions-list">
              {['happy', 'sad', 'surprised', 'angry', 'neutral'].map(emotion => (
                <div key={emotion} className="emotion-item">
                  <span className="emotion-icon">
                    {emotion === 'happy' && '😊'}
                    {emotion === 'sad' && '😢'}
                    {emotion === 'surprised' && '😲'}
                    {emotion === 'angry' && '😠'}
                    {emotion === 'neutral' && '😐'}
                  </span>
                  <span>{emotion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModule === 'matching' && (
        <div className="cv-activity">
          <h2>Shape Matching</h2>
          <p>Match the shape shown on screen!</p>
          
          {!currentShape && (
            <button
              className="btn-large btn-primary"
              onClick={() => setCurrentShape(['circle', 'square', 'triangle', 'rectangle'][Math.floor(Math.random() * 4)])}
            >
              Start Game
            </button>
          )}

          {currentShape && (
            <>
              <div className="shape-display">
                <div className={`shape-preview shape-${currentShape}`}>
                  {currentShape}
                </div>
                <p>Find this shape: {currentShape}</p>
              </div>

              <div className="shape-buttons">
                {['circle', 'square', 'triangle', 'rectangle'].map(shape => (
                  <button
                    key={shape}
                    className="btn-large btn-shape"
                    onClick={() => handleShapeMatch(shape)}
                  >
                    {shape}
                  </button>
                ))}
              </div>

              <div className="score-display">
                <span>Score: {score}</span>
              </div>
            </>
          )}
        </div>
      )}

      {activeModule === 'gestures' && (
        <div className="cv-activity">
          <h2>Gesture Learning</h2>
          <p>Use hand gestures to interact! (Coming soon with full MediaPipe integration)</p>
          <div className="gestures-guide">
            <div className="gesture-item">
              <span>👍</span>
              <span>Thumbs Up - Good job!</span>
            </div>
            <div className="gesture-item">
              <span>👆</span>
              <span>Pointing - Select</span>
            </div>
            <div className="gesture-item">
              <span>✋</span>
              <span>Open Palm - Stop</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComputerVision
