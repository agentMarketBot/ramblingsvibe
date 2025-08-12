import { useState } from 'react'
import { format } from 'date-fns'
import { Send } from 'lucide-react'

export default function MessageThread({ message, replies, onSendReply, currentUser }) {
  const [replyContent, setReplyContent] = useState('')

  function handleSendReply() {
    if (!replyContent.trim()) return

    onSendReply(replyContent)
    setReplyContent('')
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  return (
    <div className="message-thread">
      <div className="thread-connector" />
      
      <div className="thread-content">
        {replies.length > 0 && (
          <div className="thread-replies">
            {replies.map(reply => (
              <div key={reply.id} className="thread-reply">
                <div className="reply-header">
                  <div className="reply-author-info">
                    <div className="reply-author-avatar">
                      {reply.profiles.avatar_url ? (
                        <img src={reply.profiles.avatar_url} alt={reply.profiles.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          {(reply.profiles.full_name || reply.profiles.username)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="reply-author-name">
                      {reply.profiles.full_name || reply.profiles.username}
                    </span>
                    <span className="reply-time">
                      {format(new Date(reply.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
                <div className="reply-content">
                  <p>{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="thread-composer">
          <div className="composer-header">
            <span className="thread-title">
              Reply to {message.profiles.full_name || message.profiles.username}
            </span>
          </div>
          <div className="composer-input">
            <div className="input-container">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Write a reply..."
                className="reply-input"
                rows={2}
              />
            </div>
            <button 
              className="send-reply-button"
              onClick={handleSendReply}
              disabled={!replyContent.trim()}
              title="Send reply"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}