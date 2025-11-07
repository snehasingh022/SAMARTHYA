import { useState, useEffect, useRef } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { useSettings } from '../contexts/SettingsContext'
import { RotateCcw, Check, AlertCircle, Lightbulb, Eye, Shuffle } from 'lucide-react'
import './Puzzles.css'

const PUZZLE_TYPES = {
  easy: {
    name: 'Easy',
    gridSize: 2, // 2x2 = 4 pieces
    pieces: 4
  },
  medium: {
    name: 'Medium',
    gridSize: 3, // 3x3 = 9 pieces
    pieces: 9
  },
  hard: {
    name: 'Hard',
    gridSize: 4, // 4x4 = 16 pieces
    pieces: 16
  }
}

// Different images to use for puzzles
const PUZZLE_IMAGES = [
  {
    name: 'Cute Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop',
    description: 'Cute orange cat',
    fallbackColor: '#FF8C42'
  },
  {
    name: 'Puppy Dog',
    url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&h=400&fit=crop',
    description: 'Adorable puppy',
    fallbackColor: '#D4A574'
  },
  {
    name: 'Colorful Parrot',
    url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop',
    description: 'Beautiful parrot',
    fallbackColor: '#4ECDC4'
  },
  {
    name: 'Cute Bunny',
    url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400&h=400&fit=crop',
    description: 'Fluffy bunny',
    fallbackColor: '#F7E7CE'
  },
  {
    name: 'Happy Duck',
    url: 'https://images.unsplash.com/photo-1598224785155-4171c1eb67f1?w=400&h=400&fit=crop',
    description: 'Yellow duck',
    fallbackColor: '#FFD93D'
  },
  {
    name: 'Butterfly',
    url: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop',
    description: 'Colorful butterfly',
    fallbackColor: '#FF6B9D'
  }
]

const Puzzles = () => {
  const [difficulty, setDifficulty] = useState('easy')
  const [currentImage, setCurrentImage] = useState(0)
  const [puzzlePieces, setPuzzlePieces] = useState([])
  const [dropZones, setDropZones] = useState([])
  const [draggedPiece, setDraggedPiece] = useState(null)
  const [moves, setMoves] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef(null)
  const { progress, updateProgress, recordActivity } = useProgress()
  const { speak, settings } = useSettings()

  const puzzleConfig = PUZZLE_TYPES[difficulty]
  const currentPuzzleImage = PUZZLE_IMAGES[currentImage]

  useEffect(() => {
    generatePuzzle()
    // Preload image with crossOrigin
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageLoaded(true)
      if (settings.textToSpeech) {
        speak(`${currentPuzzleImage.name} puzzle loaded`)
      }
    }
    img.onerror = () => {
      console.error('Failed to load image:', currentPuzzleImage.url)
      setImageLoaded(false)
    }
    img.src = currentPuzzleImage.url
  }, [difficulty, currentImage])

  useEffect(() => {
    let interval = null
    if (!isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isComplete, startTime])

  const generatePuzzle = () => {
    const gridSize = puzzleConfig.gridSize
    const pieceWidth = 100 / gridSize
    const pieceHeight = 100 / gridSize
    
    // Create puzzle pieces with their correct positions
    const pieces = []
    const zones = []
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const pieceId = row * gridSize + col
        const piece = {
          id: pieceId,
          correctRow: row,
          correctCol: col,
          currentPosition: null,
          bgPosition: `${col * pieceWidth}% ${row * pieceHeight}%`,
          bgSize: `${gridSize * 100}%`
        }
        pieces.push(piece)
        
        // Create drop zone
        zones.push({
          id: pieceId,
          row,
          col,
          occupiedBy: null
        })
      }
    }
    
    // Shuffle pieces
    const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5)
    
    setPuzzlePieces(shuffledPieces)
    setDropZones(zones)
    setMoves(0)
    setIsComplete(false)
    setShowSolution(false)
    setStartTime(Date.now())
    setElapsedTime(0)
  }

  const handleDragStart = (piece) => {
    if (isComplete) return
    setDraggedPiece(piece)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (zone) => {
    if (!draggedPiece || isComplete) return

    const newZones = dropZones.map(z => {
      // Remove piece from previous zone
      if (z.occupiedBy === draggedPiece.id) {
        return { ...z, occupiedBy: null }
      }
      // Place piece in new zone
      if (z.id === zone.id) {
        return { ...z, occupiedBy: draggedPiece.id }
      }
      return z
    })

    const newPieces = puzzlePieces.map(p => {
      if (p.id === draggedPiece.id) {
        return { ...p, currentPosition: zone.id }
      }
      return p
    })

    setDropZones(newZones)
    setPuzzlePieces(newPieces)
    setDraggedPiece(null)
    setMoves(moves + 1)
    
    checkComplete(newPieces, newZones)
  }

  const shufflePieces = () => {
    const shuffled = [...puzzlePieces].sort(() => Math.random() - 0.5)
    const resetZones = dropZones.map(z => ({ ...z, occupiedBy: null }))
    const resetPieces = shuffled.map(p => ({ ...p, currentPosition: null }))
    
    setPuzzlePieces(resetPieces)
    setDropZones(resetZones)
    setMoves(0)
    speak('Pieces shuffled!')
  }

  const checkComplete = (pieces, zones) => {
    // Check if all pieces are placed correctly
    const allPlaced = pieces.every(piece => piece.currentPosition !== null)
    if (!allPlaced) return false

    const allCorrect = pieces.every(piece => {
      const zone = zones.find(z => z.id === piece.currentPosition)
      return zone && zone.row === piece.correctRow && zone.col === piece.correctCol
    })

    if (!allCorrect) return false
    
    setIsComplete(true)
    const timeSpent = elapsedTime
    const accuracy = Math.max(0, 100 - moves * 2)
    
    updateProgress('puzzles', null, {
      completed: progress.puzzles.completed + 1,
      accuracy: accuracy,
      lastPlayed: new Date().toISOString()
    })
    recordActivity('puzzles', 100, accuracy, timeSpent)
    
    if (settings.textToSpeech) {
      speak('Puzzle completed! Great job!')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getImageStyle = (piece) => {
    const image = PUZZLE_IMAGES[currentImage]
    const gridSize = puzzleConfig.gridSize
    
    // For a gridSize x gridSize grid, calculate the position
    // Background position formula: position = -(col * 100%) for x, -(row * 100%) for y
    // But we need to show it in percentage based on remaining space
    const xPercent = gridSize === 1 ? 0 : (piece.correctCol / (gridSize - 1)) * 100
    const yPercent = gridSize === 1 ? 0 : (piece.correctRow / (gridSize - 1)) * 100
    
    return {
      backgroundImage: `url(${image.url})`,
      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
      backgroundPosition: `${xPercent}% ${yPercent}%`,
      backgroundRepeat: 'no-repeat',
      backgroundColor: image.fallbackColor,
      border: '3px solid #fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      imageRendering: 'crisp-edges'
    }
  }

  const changeImage = () => {
    const nextImage = (currentImage + 1) % PUZZLE_IMAGES.length
    setCurrentImage(nextImage)
    speak(`Now showing ${PUZZLE_IMAGES[nextImage].name} puzzle`)
  }

  return (
    <div className="puzzles">
      <div className="puzzles-header">
        <h1>🧩 Image Puzzles</h1>
        <p className="puzzle-subtitle">Drag and drop pieces to complete the picture!</p>
        <div className="current-image-name">
          {currentPuzzleImage.name}
        </div>
        <div className="difficulty-selector">
          {Object.keys(PUZZLE_TYPES).map((level) => {
            const levelProgress = progress.puzzles.level
            const isLocked = level === 'hard' && levelProgress < 2
            return (
              <button
                key={level}
                className={`difficulty-btn ${difficulty === level ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && setDifficulty(level)}
                disabled={isLocked}
              >
                {PUZZLE_TYPES[level].name} ({PUZZLE_TYPES[level].pieces} pieces)
                {isLocked && ' 🔒'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="puzzle-info">
        <div className="info-item">
          <span className="info-label">Moves:</span>
          <span className="info-value">{moves}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Time:</span>
          <span className="info-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Pieces:</span>
          <span className="info-value">{puzzleConfig.pieces}</span>
        </div>
      </div>

      {isComplete && (
        <div className="completion-message">
          <Check size={48} />
          <h2>🎉 Puzzle Complete!</h2>
          <p>Great job! You completed the puzzle in {moves} moves!</p>
          <p>Time: {formatTime(elapsedTime)}</p>
          <button className="btn-large btn-primary" onClick={generatePuzzle}>
            <RotateCcw size={24} />
            Play Again
          </button>
        </div>
      )}

      <div className="puzzle-controls">
        <button
          className="btn-large btn-shuffle"
          onClick={shufflePieces}
          disabled={isComplete}
        >
          <Shuffle size={24} />
          Shuffle Pieces
        </button>
        <button
          className="btn-large btn-solution"
          onClick={() => setShowSolution(!showSolution)}
        >
          <Eye size={24} />
          {showSolution ? 'Hide' : 'Show'} Solution
        </button>
        <button className="btn-large btn-change-image" onClick={changeImage}>
          <RotateCcw size={24} />
          Change Image
        </button>
        <button className="btn-large btn-reset" onClick={generatePuzzle}>
          <RotateCcw size={24} />
          New Puzzle
        </button>
      </div>

      <div className="puzzle-container">
        {/* Solution Preview */}
        {showSolution && (
          <div className="solution-preview">
            <h3>Solution Preview:</h3>
            <div 
              className="solution-grid" 
              style={{ 
                gridTemplateColumns: `repeat(${puzzleConfig.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${puzzleConfig.gridSize}, 1fr)`
              }}
            >
              {dropZones.map((zone) => {
                const piece = puzzlePieces.find(p => 
                  p.correctRow === zone.row && p.correctCol === zone.col
                )
                return (
                  <div
                    key={zone.id}
                    className="solution-piece"
                    style={getImageStyle(piece)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Main Puzzle Area - Side by Side Layout */}
        <div className="puzzle-main-area">
          {/* Available Pieces - LEFT SIDE */}
          <div className="pieces-tray">
            <h3>🧩 Drag Pieces</h3>
            <p className="tray-hint">Drag these pieces to the board →</p>
            <div className="pieces-container">
              {puzzlePieces
                .filter(piece => piece.currentPosition === null)
                .map((piece) => (
                  <div
                    key={piece.id}
                    className="puzzle-piece draggable"
                    draggable={!isComplete}
                    onDragStart={() => handleDragStart(piece)}
                    style={getImageStyle(piece)}
                  >
                    <span className="piece-number">{piece.id + 1}</span>
                  </div>
                ))}
              {puzzlePieces.filter(p => p.currentPosition === null).length === 0 && (
                <div className="tray-empty">
                  <p>✨ All pieces placed!</p>
                </div>
              )}
            </div>
          </div>

          {/* Puzzle Assembly Area - RIGHT SIDE */}
          <div className="puzzle-assembly">
            <h3>🎯 Puzzle Board</h3>
            <p className="board-hint">Drop pieces here to complete the picture</p>
            <div 
              className="puzzle-grid" 
              style={{ 
                gridTemplateColumns: `repeat(${puzzleConfig.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${puzzleConfig.gridSize}, 1fr)`
              }}
            >
              {dropZones.map((zone) => {
                const occupyingPiece = puzzlePieces.find(p => p.currentPosition === zone.id)
                const isCorrectPosition = occupyingPiece && 
                  occupyingPiece.correctRow === zone.row && 
                  occupyingPiece.correctCol === zone.col
                
                return (
                  <div
                    key={zone.id}
                    className={`drop-zone ${occupyingPiece ? 'occupied' : ''} ${isCorrectPosition ? 'correct' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(zone)}
                  >
                    {occupyingPiece && (
                      <div
                        className="puzzle-piece placed"
                        style={getImageStyle(occupyingPiece)}
                      >
                        {!isCorrectPosition && <span className="piece-number">{occupyingPiece.id + 1}</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Puzzles
