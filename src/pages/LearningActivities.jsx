import { useState, useEffect } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { useSettings } from '../contexts/SettingsContext'
import { RotateCcw, Check, X, Shuffle, ArrowRight } from 'lucide-react'
import './LearningActivities.css'

const ACTIVITY_TYPES = {
  matching: {
    name: 'Matching Game',
    description: 'Match pairs of cards'
  },
  sorting: {
    name: 'Sorting Game',
    description: 'Sort items into categories'
  },
  memory: {
    name: 'Memory Game',
    description: 'Remember the sequence'
  }
}

const CATEGORIES = {
  animals: {
    name: 'Animals',
    items: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
    color: '#FF6B6B'
  },
  fruits: {
    name: 'Fruits',
    items: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🍒', '🥝', '🍍'],
    color: '#4ECDC4'
  },
  vehicles: {
    name: 'Vehicles',
    items: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐'],
    color: '#FFE66D'
  },
  shapes: {
    name: 'Shapes',
    items: ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '⚪', '⚫', '🟤', '🔶'],
    color: '#AA96DA'
  }
}

const LearningActivities = () => {
  const [activityType, setActivityType] = useState('matching')
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [score, setScore] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  
  // Sorting game state
  const [sortingItems, setSortingItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sortedItems, setSortedItems] = useState({ animals: [], fruits: [], vehicles: [], shapes: [] })
  
  // Memory game state
  const [memorySequence, setMemorySequence] = useState([])
  const [playerSequence, setPlayerSequence] = useState([])
  const [isShowingSequence, setIsShowingSequence] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(1)
  
  const { progress, updateProgress, recordActivity } = useProgress()
  const { speak, settings } = useSettings()

  useEffect(() => {
    if (activityType === 'matching') {
      initializeMatchingGame()
    } else if (activityType === 'sorting') {
      initializeSortingGame()
    } else if (activityType === 'memory') {
      initializeMemoryGame()
    }
  }, [activityType])

  // Matching Game
  const initializeMatchingGame = () => {
    const items = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼']
    const pairs = [...items, ...items]
    const shuffled = pairs.sort(() => Math.random() - 0.5)
    setCards(shuffled.map((item, index) => ({ id: index, content: item, flipped: false })))
    setFlippedCards([])
    setMatchedPairs([])
    setScore(0)
    setGameComplete(false)
  }

  const handleCardClick = (cardId) => {
    if (gameComplete || matchedPairs.includes(cardId) || flippedCards.length >= 2) return

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, flipped: true } : card
    )
    setCards(newCards)
    setFlippedCards([...flippedCards, cardId])

    if (flippedCards.length === 1) {
      const firstCard = cards.find(c => c.id === flippedCards[0])
      const secondCard = cards.find(c => c.id === cardId)

      if (firstCard.content === secondCard.content) {
        setMatchedPairs([...matchedPairs, flippedCards[0], cardId])
        setScore(score + 10)
        speak('Match!')
        
        setTimeout(() => {
          if (matchedPairs.length + 2 >= cards.length) {
            setGameComplete(true)
            const accuracy = 100
            updateProgress('activities', activityType, {
              completed: progress.activities[activityType].completed + 1,
              accuracy: accuracy,
              lastPlayed: new Date().toISOString()
            })
            recordActivity(`activities-${activityType}`, score + 10, accuracy, 0)
            speak('Great job! You completed the game!')
          }
        }, 500)
      } else {
        setTimeout(() => {
          const resetCards = newCards.map(card =>
            matchedPairs.includes(card.id) || card.id === flippedCards[0] || card.id === cardId
              ? card
              : { ...card, flipped: false }
          )
          setCards(resetCards)
        }, 1000)
      }
      setFlippedCards([])
    }
  }

  // Sorting Game
  const initializeSortingGame = () => {
    const allItems = []
    Object.values(CATEGORIES).forEach(category => {
      category.items.forEach(item => {
        allItems.push({
          id: Math.random(),
          emoji: item,
          category: category.name.toLowerCase()
        })
      })
    })
    const shuffled = allItems.sort(() => Math.random() - 0.5).slice(0, 12)
    setSortingItems(shuffled)
    setSortedItems({ animals: [], fruits: [], vehicles: [], shapes: [] })
    setSelectedCategory(null)
    setScore(0)
    setGameComplete(false)
  }

  const handleItemClick = (item) => {
    if (selectedCategory) {
      const newSorted = { ...sortedItems }
      newSorted[selectedCategory] = [...newSorted[selectedCategory], item]
      setSortedItems(newSorted)
      
      const newItems = sortingItems.filter(i => i.id !== item.id)
      setSortingItems(newItems)
      setSelectedCategory(null)
      
      if (item.category === selectedCategory) {
        setScore(score + 10)
        speak('Correct!')
      } else {
        speak('Try again!')
        // Return item to unsorted
        setTimeout(() => {
          setSortingItems([...newItems, item])
          newSorted[selectedCategory] = newSorted[selectedCategory].filter(i => i.id !== item.id)
          setSortedItems(newSorted)
        }, 1000)
      }

      if (newItems.length === 0) {
        setGameComplete(true)
        updateProgress('activities', activityType, {
          completed: progress.activities[activityType].completed + 1,
          accuracy: 100,
          lastPlayed: new Date().toISOString()
        })
        recordActivity(`activities-${activityType}`, score + 10, 100, 0)
        speak('Great job! All items sorted!')
      }
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    speak(`Selected ${category} category`)
  }

  // Memory Game
  const initializeMemoryGame = () => {
    setCurrentLevel(1)
    setPlayerSequence([])
    generateMemorySequence(3)
  }

  const generateMemorySequence = (length) => {
    const colors = ['🔴', '🔵', '🟢', '🟡']
    const sequence = []
    for (let i = 0; i < length; i++) {
      sequence.push(colors[Math.floor(Math.random() * colors.length)])
    }
    setMemorySequence(sequence)
    setIsShowingSequence(true)
    setPlayerSequence([])
    
    // Show sequence
    setTimeout(() => {
      setIsShowingSequence(false)
    }, sequence.length * 1000 + 500)
  }

  const handleMemoryClick = (color) => {
    if (isShowingSequence) return

    const newPlayerSequence = [...playerSequence, color]
    setPlayerSequence(newPlayerSequence)

    // Check if correct
    if (newPlayerSequence[newPlayerSequence.length - 1] !== memorySequence[newPlayerSequence.length - 1]) {
      speak('Try again!')
      initializeMemoryGame()
      return
    }

    // Check if sequence complete
    if (newPlayerSequence.length === memorySequence.length) {
      speak('Correct! Next level!')
      setCurrentLevel(currentLevel + 1)
      setScore(score + 10)
      setTimeout(() => {
        generateMemorySequence(memorySequence.length + 1)
      }, 1000)
    }
  }

  // Render Matching Game
  if (activityType === 'matching') {
    return (
      <div className="learning-activities">
        <div className="activities-header">
          <h1>🎮 Learning Activities</h1>
          <div className="activity-selector">
            {Object.keys(ACTIVITY_TYPES).map((type) => (
              <button
                key={type}
                className={`activity-btn ${activityType === type ? 'active' : ''}`}
                onClick={() => setActivityType(type)}
              >
                {ACTIVITY_TYPES[type].name}
              </button>
            ))}
          </div>
        </div>

        {gameComplete && (
          <div className="completion-message">
            <Check size={48} />
            <h2>🎉 Game Complete!</h2>
            <p>Your score: {score} points</p>
            <button className="btn-large btn-primary" onClick={initializeMatchingGame}>
              <RotateCcw size={24} />
              Play Again
            </button>
          </div>
        )}

        <div className="game-info">
          <div className="info-item">
            <span className="info-label">Score:</span>
            <span className="info-value">{score}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Matches:</span>
            <span className="info-value">{matchedPairs.length / 2}</span>
          </div>
        </div>

        <div className="matching-grid">
          {cards.map((card) => (
            <button
              key={card.id}
              className={`match-card ${card.flipped || matchedPairs.includes(card.id) ? 'flipped' : ''} ${matchedPairs.includes(card.id) ? 'matched' : ''}`}
              onClick={() => handleCardClick(card.id)}
              disabled={card.flipped || matchedPairs.includes(card.id)}
              aria-label={`Card ${card.id + 1}`}
            >
              <div className="card-front">?</div>
              <div className="card-back">{card.content}</div>
            </button>
          ))}
        </div>

        <button className="btn-large btn-reset" onClick={initializeMatchingGame}>
          <Shuffle size={24} />
          New Game
        </button>
      </div>
    )
  }

  // Render Sorting Game
  if (activityType === 'sorting') {
    return (
      <div className="learning-activities">
        <div className="activities-header">
          <h1>🎮 Learning Activities</h1>
          <div className="activity-selector">
            {Object.keys(ACTIVITY_TYPES).map((type) => (
              <button
                key={type}
                className={`activity-btn ${activityType === type ? 'active' : ''}`}
                onClick={() => setActivityType(type)}
              >
                {ACTIVITY_TYPES[type].name}
              </button>
            ))}
          </div>
        </div>

        {gameComplete && (
          <div className="completion-message">
            <Check size={48} />
            <h2>🎉 All Sorted!</h2>
            <p>Your score: {score} points</p>
            <button className="btn-large btn-primary" onClick={initializeSortingGame}>
              <RotateCcw size={24} />
              Play Again
            </button>
          </div>
        )}

        <div className="sorting-instructions">
          <p>Click a category, then click an item to sort it!</p>
          <div className="info-item">
            <span className="info-label">Score:</span>
            <span className="info-value">{score}</span>
          </div>
        </div>

        <div className="sorting-game">
          <div className="categories-section">
            <h3>Categories</h3>
            <div className="categories-grid">
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <button
                  key={key}
                  className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(key)}
                  style={{ borderColor: category.color }}
                >
                  <div className="category-header">
                    <span className="category-emoji">{category.items[0]}</span>
                    <span>{category.name}</span>
                  </div>
                  <div className="sorted-items-preview">
                    {sortedItems[key].slice(0, 5).map((item, idx) => (
                      <span key={idx}>{item.emoji}</span>
                    ))}
                    {sortedItems[key].length > 5 && <span>+{sortedItems[key].length - 5}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="items-section">
            <h3>Items to Sort ({sortingItems.length} remaining)</h3>
            <div className="items-grid">
              {sortingItems.map((item) => (
                <button
                  key={item.id}
                  className="item-btn"
                  onClick={() => handleItemClick(item)}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-large btn-reset" onClick={initializeSortingGame}>
          <RotateCcw size={24} />
          New Game
        </button>
      </div>
    )
  }

  // Render Memory Game
  if (activityType === 'memory') {
    return (
      <div className="learning-activities">
        <div className="activities-header">
          <h1>🎮 Learning Activities</h1>
          <div className="activity-selector">
            {Object.keys(ACTIVITY_TYPES).map((type) => (
              <button
                key={type}
                className={`activity-btn ${activityType === type ? 'active' : ''}`}
                onClick={() => setActivityType(type)}
              >
                {ACTIVITY_TYPES[type].name}
              </button>
            ))}
          </div>
        </div>

        <div className="memory-game">
          <div className="memory-info">
            <div className="info-item">
              <span className="info-label">Level:</span>
              <span className="info-value">{currentLevel}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Score:</span>
              <span className="info-value">{score}</span>
            </div>
          </div>

          {isShowingSequence && (
            <div className="sequence-display">
              <h3>Watch the sequence!</h3>
              <div className="sequence-items">
                {memorySequence.map((color, index) => (
                  <div
                    key={index}
                    className="sequence-item"
                    style={{ animationDelay: `${index * 1000}ms` }}
                  >
                    {color}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!isShowingSequence && (
            <div className="memory-instructions">
              <p>Repeat the sequence you saw!</p>
              <div className="player-sequence">
                {playerSequence.map((color, index) => (
                  <span key={index} className="player-item">{color}</span>
                ))}
              </div>
            </div>
          )}

          <div className="memory-buttons">
            {['🔴', '🔵', '🟢', '🟡'].map((color) => (
              <button
                key={color}
                className="memory-btn"
                onClick={() => handleMemoryClick(color)}
                disabled={isShowingSequence}
              >
                {color}
              </button>
            ))}
          </div>

          <button className="btn-large btn-reset" onClick={initializeMemoryGame}>
            <RotateCcw size={24} />
            Restart Game
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default LearningActivities
