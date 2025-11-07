import { useProgress } from '../contexts/ProgressContext'
import { Target, Star, Award, TrendingUp, Calendar, Clock } from 'lucide-react'
import './Progress.css'

const Progress = () => {
  const { progress } = useProgress()

  const calculateOverallProgress = () => {
    const flashcardProgress = Object.values(progress.flashcards).reduce((sum, f) => {
      return sum + (f.completed / f.total) * 100
    }, 0) / Object.keys(progress.flashcards).length

    const puzzleProgress = (progress.puzzles.completed / 10) * 100
    const activityProgress = Object.values(progress.activities).reduce((sum, a) => {
      return sum + (a.completed / 10) * 100
    }, 0) / Object.keys(progress.activities).length

    const cvProgress = Object.values(progress.computerVision).reduce((sum, cv) => {
      return sum + (cv.completed / 10) * 100
    }, 0) / Object.keys(progress.computerVision).length

    return Math.round((flashcardProgress + puzzleProgress + activityProgress + cvProgress) / 4)
  }

  const overallProgress = calculateOverallProgress()

  const stats = [
    {
      label: 'Current Level',
      value: progress.currentLevel,
      icon: Target,
      color: 'blue'
    },
    {
      label: 'Day Streak',
      value: progress.streaks.current,
      icon: Star,
      color: 'yellow'
    },
    {
      label: 'Longest Streak',
      value: progress.streaks.longest,
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Badges Earned',
      value: progress.badges.length,
      icon: Award,
      color: 'purple'
    }
  ]

  const recentActivities = progress.activityHistory.slice(0, 10)

  return (
    <div className="progress-page">
      <div className="progress-header">
        <h1>📊 My Progress</h1>
        <p>Track your learning journey</p>
      </div>

      <div className="overall-progress">
        <h2>Overall Progress</h2>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="progress-percentage">{overallProgress}%</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`stat-card stat-card-${stat.color}`}>
              <Icon size={48} className="stat-icon" />
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="progress-sections">
        <div className="progress-section">
          <h3>📚 Flashcards Progress</h3>
          <div className="progress-items">
            {Object.entries(progress.flashcards).map(([key, value]) => {
              const percentage = Math.round((value.completed / value.total) * 100)
              return (
                <div key={key} className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="progress-item-stats">
                      {value.completed}/{value.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="progress-bar-small">
                    <div
                      className="progress-bar-fill-small"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {value.accuracy > 0 && (
                    <div className="progress-item-accuracy">
                      Accuracy: {value.accuracy}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="progress-section">
          <h3>🧩 Puzzles Progress</h3>
          <div className="progress-items">
            <div className="progress-item">
              <div className="progress-item-header">
                <span className="progress-item-name">Puzzles Completed</span>
                <span className="progress-item-stats">{progress.puzzles.completed}</span>
              </div>
              {progress.puzzles.accuracy > 0 && (
                <div className="progress-item-accuracy">
                  Average Accuracy: {progress.puzzles.accuracy}%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="progress-section">
          <h3>🎮 Activities Progress</h3>
          <div className="progress-items">
            {Object.entries(progress.activities).map(([key, value]) => (
              <div key={key} className="progress-item">
                <div className="progress-item-header">
                  <span className="progress-item-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="progress-item-stats">{value.completed} completed</span>
                </div>
                {value.accuracy > 0 && (
                  <div className="progress-item-accuracy">
                    Accuracy: {value.accuracy}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {progress.badges.length > 0 && (
          <div className="progress-section">
            <h3>🏆 Badges Earned</h3>
            <div className="badges-grid">
              {progress.badges.map((badge, index) => (
                <div key={index} className="badge-item">
                  <Award size={32} />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentActivities.length > 0 && (
          <div className="progress-section">
            <h3>📅 Recent Activities</h3>
            <div className="activity-history">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-type">{activity.type}</div>
                  <div className="activity-details">
                    <span>Score: {activity.score}</span>
                    <span>Accuracy: {activity.accuracy}%</span>
                    <span>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Progress

