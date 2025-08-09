import { useState, useEffect } from 'react'
import { selectPatterns } from '../services/patternSelector'
import './PromptInput.css'

interface PromptInputProps {
  onGenerate: (prompt: string) => void
  isLoading: boolean
  progress?: { percent: number; message: string } | null
}

const PromptInput: React.FC<PromptInputProps> = ({ onGenerate, isLoading, progress }) => {
  const [prompt, setPrompt] = useState('')
  const [detected, setDetected] = useState(false)

  useEffect(() => {
    setDetected(selectPatterns(prompt).some(p => p.id === 'large-blobs'))
  }, [prompt])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim())
    }
  }

  const examplePrompts = [
    "Design a scalable chat application",
    "Design a URL shortener like bit.ly",
    "Design a social media feed system",
    "Design an e-commerce platform",
    "Design a video streaming service"
  ]

  return (
    <div className="prompt-input">
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="input-group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the system you want to design (e.g., 'Design a scalable chat application')"
            className="prompt-textarea"
            rows={3}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`generate-btn ${isLoading ? 'loading' : ''}`}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Diagram'}
          </button>
        </div>
      </form>
      {isLoading && progress && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 8, background: '#e9ecef', borderRadius: 4 }}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, progress.percent))}%`,
                height: '100%',
                background: '#007bff',
                borderRadius: 4,
                transition: 'width 200ms ease'
              }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
            {progress.message}
          </div>
        </div>
      )}
      
      <div className="pattern-controls">
        {detected && <span className="pattern-badge">Large Blobs detected</span>}
      </div>

      <div className="example-prompts">
        <h3>Try these examples:</h3>
        <div className="examples-grid">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example)}
              className="example-btn"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromptInput
