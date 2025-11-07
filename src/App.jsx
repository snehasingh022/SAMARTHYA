import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import { ProgressProvider } from './contexts/ProgressContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Flashcards from './pages/Flashcards'
import Puzzles from './pages/Puzzles'
import ComputerVision from './pages/ComputerVision'
import Progress from './pages/Progress'
import Dashboard from './pages/Dashboard'
import LearningActivities from './pages/LearningActivities'

function App() {
  return (
    <SettingsProvider>
      <ProgressProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/puzzles" element={<Puzzles />} />
              <Route path="/activities" element={<LearningActivities />} />
              <Route path="/computer-vision" element={<ComputerVision />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Layout>
        </Router>
      </ProgressProvider>
    </SettingsProvider>
  )
}

export default App

