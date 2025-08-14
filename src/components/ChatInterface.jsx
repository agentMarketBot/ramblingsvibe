import { useState } from 'react'
import './ChatInterface.css'
import MessageThread from './MessageThread'
import MessageComposer from './MessageComposer'

const ChatInterface = ({ selectedMember, ramblings, currentUser, isOwnChannel }) => {
  const [expandedThreads, setExpandedThreads] = useState(new Set())
  const [newRamblings, setNewRamblings] = useState([])

  const toggleThread = (messageId) => {
    const newExpanded = new Set(expandedThreads)
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId)
    } else {
      newExpanded.add(messageId)
    }
    setExpandedThreads(newExpanded)
  }

  const addNewRambling = (content, type = 'text', url = null) => {
    const newMessage = {
      id: Date.now(),
      author: currentUser.name,
      content,
      type,
      url,
      timestamp: new Date(),
      replies: []
    }
    setNewRamblings(prev => [...prev, newMessage])
  }

  const addReply = (messageId, replyContent) => {
    const reply = {
      id: Date.now(),
      author: currentUser.name,
      content: replyContent,
      timestamp: new Date()
    }

    // Update ramblings replies (this would normally be handled by a state management system)
    setNewRamblings(prev => 
      prev.map(rambling => 
        rambling.id === messageId 
          ? { ...rambling, replies: [...rambling.replies, reply] }
          : rambling
      )
    )
  }

  const allRamblings = [...ramblings, ...newRamblings]

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="channel-info">
          <span className="channel-avatar">{selectedMember?.avatar}</span>
          <div className="channel-details">
            <h3>{selectedMember?.name}'s Ramblings</h3>
            <p className="channel-description">
              {isOwnChannel 
                ? "Share your thoughts, ideas, and discoveries with the team"
                : `${selectedMember?.name}'s personal space for thoughts and ideas`}
            </p>
          </div>
        </div>
        {!isOwnChannel && (
          <div className="channel-status">
            <span className="muted-badge">🔇 Muted</span>
          </div>
        )}
      </div>

      <div className="chat-content">
        {allRamblings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💭</div>
            <h4>No ramblings yet</h4>
            <p>
              {isOwnChannel 
                ? "Start sharing your thoughts and ideas with the team!"
                : `${selectedMember?.name} hasn't shared any ramblings yet.`}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {allRamblings.map(rambling => (
              <MessageThread
                key={rambling.id}
                message={rambling}
                isExpanded={expandedThreads.has(rambling.id)}
                onToggleThread={() => toggleThread(rambling.id)}
                onReply={(replyContent) => addReply(rambling.id, replyContent)}
                currentUser={currentUser}
                canReply={!isOwnChannel || rambling.author === currentUser.name}
              />
            ))}
          </div>
        )}
      </div>

      {isOwnChannel && (
        <MessageComposer 
          onSendMessage={addNewRambling}
          placeholder="Share a thought, idea, or discovery..."
        />
      )}
    </div>
  )
}

export default ChatInterface