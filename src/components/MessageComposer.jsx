import { useState } from 'react'
import './MessageComposer.css'

const MessageComposer = ({ onSendMessage, placeholder }) => {
  const [content, setContent] = useState('')
  const [messageType, setMessageType] = useState('text')
  const [url, setUrl] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (content.trim()) {
      onSendMessage(content.trim(), messageType, messageType === 'link' ? url : null)
      setContent('')
      setUrl('')
      setMessageType('text')
      setIsExpanded(false)
    }
  }

  const messageTypes = [
    { value: 'text', label: '💬 Text', icon: '💬' },
    { value: 'idea', label: '💡 Idea', icon: '💡' },
    { value: 'link', label: '🔗 Link', icon: '🔗' },
    { value: 'photo', label: '📸 Photo', icon: '📸' }
  ]

  return (
    <div className="message-composer">
      <form onSubmit={handleSubmit} className="composer-form">
        <div className="composer-header">
          <div className="type-selector">
            {messageTypes.map(type => (
              <button
                key={type.value}
                type="button"
                className={`type-button ${messageType === type.value ? 'active' : ''}`}
                onClick={() => setMessageType(type.value)}
                title={type.label}
              >
                {type.icon}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            className="expand-button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '🔽' : '🔼'}
          </button>
        </div>

        <div className="composer-content">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className={`composer-input ${isExpanded ? 'expanded' : ''}`}
            rows={isExpanded ? 4 : 2}
          />
          
          {messageType === 'link' && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste the link URL here..."
              className="url-input"
            />
          )}
        </div>

        <div className="composer-footer">
          <div className="composer-hints">
            {messageType === 'text' && (
              <span className="hint">Share your thoughts and observations</span>
            )}
            {messageType === 'idea' && (
              <span className="hint">Share a project idea or suggestion</span>
            )}
            {messageType === 'link' && (
              <span className="hint">Share an interesting link or resource</span>
            )}
            {messageType === 'photo' && (
              <span className="hint">Share a photo or visual content</span>
            )}
          </div>
          
          <div className="composer-actions">
            <button
              type="submit"
              className="send-button"
              disabled={!content.trim() || (messageType === 'link' && !url.trim())}
            >
              Post Rambling
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MessageComposer