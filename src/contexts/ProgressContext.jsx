import { createContext, useContext, useState, useEffect } from 'react'

const ProgressContext = createContext()

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider')
  }
  return context
}

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('autism-learning-progress')
    return saved ? JSON.parse(saved) : {
      currentLevel: 1,
      flashcards: {
        letters: { completed: 0, total: 26, accuracy: 0, lastPlayed: null },
        numbers: { completed: 0, total: 10, accuracy: 0, lastPlayed: null },
        shapes: { completed: 0, total: 8, accuracy: 0, lastPlayed: null },
        colors: { completed: 0, total: 10, accuracy: 0, lastPlayed: null },
        objects: { completed: 0, total: 20, accuracy: 0, lastPlayed: null }
      },
      puzzles: {
        level: 1,
        completed: 0,
        accuracy: 0,
        bestTime: null,
        lastPlayed: null
      },
      activities: {
        matching: { completed: 0, accuracy: 0, lastPlayed: null },
        sorting: { completed: 0, accuracy: 0, lastPlayed: null },
        memory: { completed: 0, accuracy: 0, lastPlayed: null }
      },
      computerVision: {
        objectRecognition: { completed: 0, accuracy: 0, lastPlayed: null },
        gestures: { completed: 0, accuracy: 0, lastPlayed: null },
        emotions: { completed: 0, accuracy: 0, lastPlayed: null },
        matching: { completed: 0, accuracy: 0, lastPlayed: null }
      },
      streaks: {
        current: 0,
        longest: 0,
        lastActivityDate: null
      },
      badges: [],
      totalTimeSpent: 0,
      activityHistory: []
    }
  })

  useEffect(() => {
    localStorage.setItem('autism-learning-progress', JSON.stringify(progress))
  }, [progress])

  const updateProgress = (category, subcategory, data) => {
    setProgress(prev => {
      const newProgress = { ...prev }
      if (subcategory) {
        newProgress[category] = {
          ...newProgress[category],
          [subcategory]: {
            ...newProgress[category][subcategory],
            ...data
          }
        }
      } else {
        newProgress[category] = {
          ...newProgress[category],
          ...data
        }
      }
      return newProgress
    })
  }

  const recordActivity = (activityType, score, accuracy, timeSpent) => {
    const activity = {
      type: activityType,
      score,
      accuracy,
      timeSpent,
      timestamp: new Date().toISOString()
    }

    setProgress(prev => {
      // Update streak
      const today = new Date().toDateString()
      const lastDate = prev.streaks.lastActivityDate
        ? new Date(prev.streaks.lastActivityDate).toDateString()
        : null

      let newStreak = prev.streaks.current
      if (lastDate === today) {
        // Already played today, no change
      } else if (lastDate && new Date(today) - new Date(lastDate) === 86400000) {
        // Consecutive day
        newStreak = prev.streaks.current + 1
      } else {
        // New streak
        newStreak = 1
      }

      // Check for level up
      const totalCompleted = 
        Object.values(prev.flashcards).reduce((sum, f) => sum + f.completed, 0) +
        prev.puzzles.completed +
        Object.values(prev.activities).reduce((sum, a) => sum + a.completed, 0)

      const newLevel = Math.floor(totalCompleted / 10) + 1

      return {
        ...prev,
        currentLevel: Math.max(prev.currentLevel, newLevel),
        streaks: {
          current: newStreak,
          longest: Math.max(prev.streaks.longest, newStreak),
          lastActivityDate: today
        },
        totalTimeSpent: prev.totalTimeSpent + timeSpent,
        activityHistory: [activity, ...prev.activityHistory].slice(0, 50)
      }
    })
  }

  const unlockBadge = (badgeName) => {
    setProgress(prev => {
      if (!prev.badges.includes(badgeName)) {
        return {
          ...prev,
          badges: [...prev.badges, badgeName]
        }
      }
      return prev
    })
  }

  const getRecommendedActivity = async () => {
    // Simple recommendation logic - can be enhanced with AI
    const { flashcards, puzzles, activities } = progress
    
    // Try Gemini AI recommendations if available
    try {
      const { getLearningRecommendations, isGeminiConfigured } = await import('../utils/geminiApi')
      if (isGeminiConfigured()) {
        const recommendation = await getLearningRecommendations(progress, progress.activityHistory || [])
        if (recommendation && recommendation.recommended_activity) {
          // Map Gemini recommendation to activity type
          const activityMap = {
            'flashcards': 'flashcards',
            'puzzles': 'puzzles',
            'activities': 'activities',
            'matching': 'activities',
            'sorting': 'activities',
            'memory': 'activities'
          }
          const recommended = recommendation.recommended_activity.toLowerCase()
          for (const [key, value] of Object.entries(activityMap)) {
            if (recommended.includes(key)) {
              return value
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting Gemini recommendations:', error)
    }
    
    // Fallback to simple logic
    const flashcardScores = Object.values(flashcards).map(f => f.completed / f.total)
    const avgFlashcard = flashcardScores.reduce((a, b) => a + b, 0) / flashcardScores.length
    
    const puzzleScore = puzzles.completed / 10
    const activityScores = Object.values(activities).map(a => a.completed / 10)
    const avgActivity = activityScores.reduce((a, b) => a + b, 0) / activityScores.length
    
    if (avgFlashcard < 0.5) return 'flashcards'
    if (puzzleScore < 0.5) return 'puzzles'
    if (avgActivity < 0.5) return 'activities'
    return 'flashcards' // Default
  }
  
  // Keep synchronous version for backward compatibility
  const getRecommendedActivitySync = () => {
    const { flashcards, puzzles, activities } = progress
    
    const flashcardScores = Object.values(flashcards).map(f => f.completed / f.total)
    const avgFlashcard = flashcardScores.reduce((a, b) => a + b, 0) / flashcardScores.length
    
    const puzzleScore = puzzles.completed / 10
    const activityScores = Object.values(activities).map(a => a.completed / 10)
    const avgActivity = activityScores.reduce((a, b) => a + b, 0) / activityScores.length
    
    if (avgFlashcard < 0.5) return 'flashcards'
    if (puzzleScore < 0.5) return 'puzzles'
    if (avgActivity < 0.5) return 'activities'
    return 'flashcards'
  }

  return (
    <ProgressContext.Provider value={{
      progress,
      updateProgress,
      recordActivity,
      unlockBadge,
      getRecommendedActivity: getRecommendedActivitySync,
      getRecommendedActivityAsync: getRecommendedActivity
    }}>
      {children}
    </ProgressContext.Provider>
  )
}

