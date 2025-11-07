import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSettings } from '../../contexts/SettingsContext'
import Navigation from './Navigation'
import SettingsPanel from './SettingsPanel'
import { Menu, X, Settings, Home, BookOpen, Puzzle, Activity, Camera, TrendingUp, Users } from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()
  const { settings } = useSettings()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { path: '/puzzles', icon: Puzzle, label: 'Puzzles' },
    { path: '/activities', icon: Activity, label: 'Activities' },
    { path: '/computer-vision', icon: Camera, label: 'Camera Games' },
    { path: '/progress', icon: TrendingUp, label: 'My Progress' },
    { path: '/dashboard', icon: Users, label: 'Parent Dashboard' }
  ]

  return (
    <div className="layout" data-theme={settings.lowLightMode ? 'low-light' : 'light'}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <header className="header">
        <button
          className="menu-toggle btn-large"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle navigation menu"
        >
          {sidebarOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
        
        <Link to="/" className="logo">
          <h1>🌈 Fun Learning</h1>
        </Link>
        
        <button
          className="settings-toggle btn-large"
          onClick={() => setSettingsOpen(!settingsOpen)}
          aria-label="Open settings"
        >
          <Settings size={32} />
        </button>
      </header>

      <div className="layout-container">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <nav className="nav" aria-label="Main navigation">
            <ul className="nav-list">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={28} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        <main id="main-content" className="main-content">
          {children}
        </main>
      </div>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default Layout

