import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { useSettings } from '../contexts/SettingsContext'
import { BookOpen, Puzzle, Activity, Camera, TrendingUp, Star, Award, Target, Sparkles } from 'lucide-react'
import { getLearningRecommendations, isGeminiConfigured } from '../utils/geminiApi'
import './Home.css'

const Home = () => {
  const { progress, getRecommendedActivity } = useProgress()
  const { speak } = useSettings()
  const [geminiRecommendation, setGeminiRecommendation] = useState(null)
  const [useGemini, setUseGemini] = useState(false)
  const recommendedActivity = getRecommendedActivity()

  useEffect(() => {
    setUseGemini(isGeminiConfigured())
    if (isGeminiConfigured()) {
      loadGeminiRecommendations()
    }
  }, [])

  const loadGeminiRecommendations = async () => {
    try {
      const recommendation = await getLearningRecommendations(progress, progress.activityHistory || [])
      if (recommendation) {
        setGeminiRecommendation(recommendation)
      }
    } catch (error) {
      console.error('Error loading Gemini recommendations:', error)
    }
  }

  const activityCards = [
    {
      path: '/flashcards',
      icon: BookOpen,
      title: 'Flashcards',
      description: 'Learn letters, numbers, shapes, colors, and objects',
      color: 'blue',
      badge: progress.flashcards.letters.completed > 0
    },
    {
      path: '/puzzles',
      icon: Puzzle,
      title: 'Puzzles',
      description: 'Solve fun puzzles and build logic skills',
      color: 'green',
      badge: progress.puzzles.completed > 0
    },
    {
      path: '/activities',
      icon: Activity,
      title: 'Activities',
      description: 'Matching, sorting, and memory games',
      color: 'purple',
      badge: progress.activities.matching.completed > 0
    },
    {
      path: '/computer-vision',
      icon: Camera,
      title: 'Camera Games',
      description: 'Interactive games using your camera',
      color: 'pink',
      badge: progress.computerVision.objectRecognition.completed > 0
    }
  ]

  const stats = [
    { label: 'Current Level', value: progress.currentLevel, icon: Target },
    { label: 'Day Streak', value: progress.streaks.current, icon: Star },
    { label: 'Badges Earned', value: progress.badges.length, icon: Award }
  ]

  return (
    <div className="home">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to Fun Learning! 🎉</h1>
        <p className="hero-subtitle">Let's learn and have fun together!</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="stat-card">
              <Icon size={40} className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="recommended-section">
        <h2 className="section-title">🌟 Recommended for You</h2>
        {geminiRecommendation ? (
          <div className="gemini-recommendation">
            {useGemini && (
              <div className="gemini-badge-home">
                <Sparkles size={16} /> AI-Powered Recommendation
              </div>
            )}
            <p className="section-description">{geminiRecommendation.reason}</p>
            <p className="recommended-activity">
              Try: <strong>{geminiRecommendation.recommended_activity}</strong>
            </p>
            {geminiRecommendation.encouragement && (
              <p className="encouragement-text">{geminiRecommendation.encouragement}</p>
            )}
          </div>
        ) : (
          <p className="section-description">
            Based on your progress, we recommend trying {recommendedActivity} next!
          </p>
        )}
      </div>

      <div className="activities-grid">
        {activityCards.map((activity) => {
          const Icon = activity.icon
          return (
            <Link
              key={activity.path}
              to={activity.path}
              className={`activity-card activity-card-${activity.color}`}
              onClick={() => speak(`Opening ${activity.title}`)}
            >
              <div className="activity-icon-wrapper">
                <Icon size={64} />
                {activity.badge && <span className="completed-badge">✓</span>}
              </div>
              <h3 className="activity-title">{activity.title}</h3>
              <p className="activity-description">{activity.description}</p>
              <div className="activity-arrow">→</div>
            </Link>
          )
        })}
      </div>

      <div className="quick-actions">
        <Link to="/progress" className="quick-action-btn">
          <TrendingUp size={32} />
          <span>View My Progress</span>
        </Link>
        <Link to="/dashboard" className="quick-action-btn">
          <span>Parent Dashboard</span>
        </Link>
      </div>
    </div>
  )
}

export default Home

