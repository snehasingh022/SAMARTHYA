import { useState, useEffect } from 'react'
import { useProgress } from '../contexts/ProgressContext'
import { useSettings } from '../contexts/SettingsContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Lock, Unlock, TrendingUp, Clock, Target, Award, Sparkles } from 'lucide-react'
import { getLearningRecommendations, analyzeProgress, isGeminiConfigured } from '../utils/geminiApi'
import './Dashboard.css'

const Dashboard = () => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [geminiRecommendations, setGeminiRecommendations] = useState(null)
  const [progressInsights, setProgressInsights] = useState(null)
  const [useGemini, setUseGemini] = useState(false)
  const { progress } = useProgress()
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    if (isAuthenticated) {
      setUseGemini(isGeminiConfigured())
      if (isGeminiConfigured()) {
        loadGeminiData()
      }
    }
  }, [isAuthenticated])

  const loadGeminiData = async () => {
    try {
      const [recommendations, insights] = await Promise.all([
        getLearningRecommendations(progress, progress.activityHistory || []),
        analyzeProgress(progress)
      ])
      if (recommendations) setGeminiRecommendations(recommendations)
      if (insights) setProgressInsights(insights)
    } catch (error) {
      console.error('Error loading Gemini data:', error)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    // Simple password check - in production, use proper authentication
    if (password === 'parent123' || password === 'teacher123') {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect password. Try: parent123 or teacher123')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="dashboard">
        <div className="login-container">
          <h2>🔒 Parent/Teacher Dashboard</h2>
          <p>Please enter the password to access the dashboard</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-input"
              required
            />
            <button type="submit" className="btn-large btn-primary">
              Login
            </button>
          </form>
          <p className="hint">Hint: Try "parent123" or "teacher123"</p>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const flashcardData = Object.entries(progress.flashcards).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    completed: value.completed,
    total: value.total,
    accuracy: value.accuracy
  }))

  const activityData = [
    { name: 'Matching', completed: progress.activities.matching.completed, accuracy: progress.activities.matching.accuracy },
    { name: 'Sorting', completed: progress.activities.sorting.completed, accuracy: progress.activities.sorting.accuracy },
    { name: 'Memory', completed: progress.activities.memory.completed, accuracy: progress.activities.memory.accuracy }
  ]

  const timeSpentHours = Math.round(progress.totalTimeSpent / 3600 * 10) / 10

  const recommendedActivities = []
  if (progress.flashcards.letters.completed < 26) {
    recommendedActivities.push('Continue practicing letters flashcards')
  }
  if (progress.puzzles.completed < 5) {
    recommendedActivities.push('Try more puzzle games to build logic skills')
  }
  if (progress.streaks.current < 3) {
    recommendedActivities.push('Maintain a daily learning streak')
  }

  const COLORS = ['#6B9BD2', '#7FB3A8', '#9B8FB8', '#D4A5C7', '#F5D76E', '#F7A072']

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>👨‍👩‍👧 Parent/Teacher Dashboard</h1>
        <button
          className="btn-large btn-secondary"
          onClick={() => setIsAuthenticated(false)}
        >
          Logout
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <Target size={32} />
          <div>
            <div className="stat-number">{progress.currentLevel}</div>
            <div className="stat-label">Current Level</div>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <TrendingUp size={32} />
          <div>
            <div className="stat-number">{progress.streaks.current}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <Clock size={32} />
          <div>
            <div className="stat-number">{timeSpentHours}h</div>
            <div className="stat-label">Time Spent</div>
          </div>
        </div>
        <div className="dashboard-stat-card">
          <Award size={32} />
          <div>
            <div className="stat-number">{progress.badges.length}</div>
            <div className="stat-label">Badges Earned</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>📊 Progress Reports</h2>
        <div className="charts-grid">
          <div className="chart-container">
            <h3>Flashcard Completion</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={flashcardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#6B9BD2" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <h3>Activity Accuracy</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#7FB3A8" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>📅 Activity History</h2>
        <div className="activity-table">
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {progress.activityHistory.slice(0, 20).map((activity, index) => (
                <tr key={index}>
                  <td>{activity.type}</td>
                  <td>{activity.score}</td>
                  <td>{activity.accuracy}%</td>
                  <td>{new Date(activity.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>💡 Recommended Next Lessons</h2>
        {useGemini && (
          <div className="gemini-badge-dashboard">
            <Sparkles size={16} /> AI-Powered Recommendations
          </div>
        )}
        <div className="recommendations">
          {geminiRecommendations ? (
            <div className="gemini-recommendation-dashboard">
              <h3>{geminiRecommendations.recommended_activity}</h3>
              <p>{geminiRecommendations.reason}</p>
              {geminiRecommendations.skills_developed && geminiRecommendations.skills_developed.length > 0 && (
                <div className="skills-list">
                  <strong>Skills Developed:</strong>
                  <ul>
                    {geminiRecommendations.skills_developed.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}
              {geminiRecommendations.encouragement && (
                <p className="encouragement">{geminiRecommendations.encouragement}</p>
              )}
            </div>
          ) : recommendedActivities.length > 0 ? (
            <ul>
              {recommendedActivities.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          ) : (
            <p>Great progress! Continue exploring different activities.</p>
          )}
        </div>
        {progressInsights && (
          <div className="progress-insights">
            <h3>📊 AI Insights</h3>
            {progressInsights.strengths && progressInsights.strengths.length > 0 && (
              <div className="insight-section">
                <strong>Strengths:</strong>
                <ul>
                  {progressInsights.strengths.map((strength, idx) => (
                    <li key={idx}>✓ {strength}</li>
                  ))}
                </ul>
              </div>
            )}
            {progressInsights.improvements && progressInsights.improvements.length > 0 && (
              <div className="insight-section">
                <strong>Areas for Improvement:</strong>
                <ul>
                  {progressInsights.improvements.map((improvement, idx) => (
                    <li key={idx}>→ {improvement}</li>
                  ))}
                </ul>
              </div>
            )}
            {progressInsights.patterns && (
              <div className="insight-section">
                <strong>Learning Patterns:</strong>
                <p>{progressInsights.patterns}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>⚙️ Settings & Controls</h2>
        <div className="settings-controls">
          <div className="control-item">
            <label>Computer Vision Modules</label>
            <button
              className={`toggle-btn ${settings.cvModulesEnabled ? 'active' : ''}`}
              onClick={() => updateSettings({ cvModulesEnabled: !settings.cvModulesEnabled })}
            >
              {settings.cvModulesEnabled ? <Unlock size={20} /> : <Lock size={20} />}
              {settings.cvModulesEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          <div className="control-item">
            <label>Low Stimulation Mode</label>
            <button
              className={`toggle-btn ${settings.lowStimulationMode ? 'active' : ''}`}
              onClick={() => updateSettings({ lowStimulationMode: !settings.lowStimulationMode })}
            >
              {settings.lowStimulationMode ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className="control-item">
            <label>Audio Instructions</label>
            <button
              className={`toggle-btn ${settings.audioInstructions ? 'active' : ''}`}
              onClick={() => updateSettings({ audioInstructions: !settings.audioInstructions })}
            >
              {settings.audioInstructions ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

