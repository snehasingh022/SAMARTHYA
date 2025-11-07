import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('autism-learning-settings')
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      lowLightMode: false,
      reduceAnimation: false,
      softAudio: true,
      audioInstructions: true,
      textToSpeech: true,
      cvModulesEnabled: true,
      lowStimulationMode: false,
      volume: 0.7
    }
  })

  useEffect(() => {
    localStorage.setItem('autism-learning-settings', JSON.stringify(settings))
    
    // Apply theme
    document.documentElement.setAttribute('data-theme', settings.lowLightMode ? 'low-light' : 'light')
    document.documentElement.setAttribute('data-reduce-motion', settings.reduceAnimation ? 'true' : 'false')
  }, [settings])

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const speak = (text) => {
    if (settings.textToSpeech && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.volume = settings.volume
      utterance.rate = 0.9
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, speak }}>
      {children}
    </SettingsContext.Provider>
  )
}

