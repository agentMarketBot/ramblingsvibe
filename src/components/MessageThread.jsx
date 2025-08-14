import { useState } from 'react'
import './MessageThread.css'

const MessageThread = ({ message, isExpanded, onToggleThread, onReply, canReply }) => {
  const [replyText, setReplyText] = useState('')
  const [showReplyBox, setShowReplyBox] = useState(false)

  const handleReply = (e) => {
    e.preventDefault()
    if (replyText.trim()) {
      onReply(replyText.trim())
      setReplyText('')
      setShowReplyBox(false)
    }
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const renderContent = () => {
    switch (message.type) {
      case 'link':
        return (
          <div className="message-link">
            <p className="message-text">{message.content}</p>
            <a href={message.url} target="_blank" rel="noopener noreferrer" className="link-preview">
              🔗 {message.url}
            </a>
          </div>
        )
      case 'idea':
        return (
          <div className="message-idea">
            <span className="idea-icon">💡</span>
            <p className="message-text">{message.content}</p>
          </div>
        )
      case 'photo':
        return (
          <div className="message-photo">
            <p className="message-text">{message.content}</p>
            <div className="photo-placeholder">📸 Photo</div>
          </div>
        )
      default:
        return <p className="message-text">{message.content}</p>
    }
  }

  return (
    <div className="message-thread">
      <div className="main-message">
        <div className="message-header">
          <span className="message-author">{message.author}</span>
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {message.type && message.type !== 'text' && (
            <span className="message-type-badge">{message.type}</span>
          )}
        </div>
        
        <div className="message-content">
          {renderContent()}
        </div>

        <div className="message-actions">
          {message.replies.length > 0 && (
            <button 
              className="replies-toggle"
              onClick={onToggleThread}
            >
              {isExpanded ? '▼' : '▶'} {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
          
          {canReply && (
            <button 
              className="reply-button"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              💬 Reply
            </button>
          )}
        </div>
      </div>

      {isExpanded && message.replies.length > 0 && (
        <div className="replies-list">
          {message.replies.map(reply => (
            <div key={reply.id} className="reply-message">
              <div className="reply-header">
                <span className="reply-author">{reply.author}</span>
                <span className="reply-time">{formatTime(reply.timestamp)}</span>
              </div>
              <p className="reply-content">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {showReplyBox && canReply && (
        <form className="reply-form" onSubmit={handleReply}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="reply-input"
            rows="2"
            autoFocus
          />
          <div className="reply-actions">
            <button 
              type="button" 
              onClick={() => setShowReplyBox(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="send-button"
              disabled={!replyText.trim()}
            >
              Reply
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default MessageThread