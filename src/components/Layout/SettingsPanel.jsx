import { useState } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { X, Moon, Sun, Volume2, VolumeX, Eye, EyeOff, Zap, ZapOff } from 'lucide-react'
import './SettingsPanel.css'

const SettingsPanel = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings()

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={32} />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <h3>Visual Settings</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <Moon size={24} />
                <span>Low Light Mode</span>
              </label>
              <button
                className={`toggle-btn ${settings.lowLightMode ? 'active' : ''}`}
                onClick={() => updateSettings({ lowLightMode: !settings.lowLightMode })}
                aria-label="Toggle low light mode"
              >
                {settings.lowLightMode ? <Moon /> : <Sun />}
              </button>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <Zap size={24} />
                <span>Reduce Animations</span>
              </label>
              <button
                className={`toggle-btn ${settings.reduceAnimation ? 'active' : ''}`}
                onClick={() => updateSettings({ reduceAnimation: !settings.reduceAnimation })}
                aria-label="Toggle reduce animations"
              >
                {settings.reduceAnimation ? <ZapOff /> : <Zap />}
              </button>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <Eye size={24} />
                <span>Low Stimulation Mode</span>
              </label>
              <button
                className={`toggle-btn ${settings.lowStimulationMode ? 'active' : ''}`}
                onClick={() => updateSettings({ lowStimulationMode: !settings.lowStimulationMode })}
                aria-label="Toggle low stimulation mode"
              >
                {settings.lowStimulationMode ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="setting-group">
            <h3>Audio Settings</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <Volume2 size={24} />
                <span>Soft Audio Mode</span>
              </label>
              <button
                className={`toggle-btn ${settings.softAudio ? 'active' : ''}`}
                onClick={() => updateSettings({ softAudio: !settings.softAudio })}
                aria-label="Toggle soft audio mode"
              >
                {settings.softAudio ? <Volume2 /> : <VolumeX />}
              </button>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span>Audio Instructions</span>
              </label>
              <button
                className={`toggle-btn ${settings.audioInstructions ? 'active' : ''}`}
                onClick={() => updateSettings({ audioInstructions: !settings.audioInstructions })}
                aria-label="Toggle audio instructions"
              >
                {settings.audioInstructions ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span>Text to Speech</span>
              </label>
              <button
                className={`toggle-btn ${settings.textToSpeech ? 'active' : ''}`}
                onClick={() => updateSettings({ textToSpeech: !settings.textToSpeech })}
                aria-label="Toggle text to speech"
              >
                {settings.textToSpeech ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="setting-item">
              <label className="setting-label">
                <span>Volume: {Math.round(settings.volume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="volume-slider"
              />
            </div>
          </div>

          <div className="setting-group">
            <h3>Features</h3>
            
            <div className="setting-item">
              <label className="setting-label">
                <span>Computer Vision Modules</span>
              </label>
              <button
                className={`toggle-btn ${settings.cvModulesEnabled ? 'active' : ''}`}
                onClick={() => updateSettings({ cvModulesEnabled: !settings.cvModulesEnabled })}
                aria-label="Toggle computer vision modules"
              >
                {settings.cvModulesEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel

