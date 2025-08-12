import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useTeam } from '../contexts/TeamContext'
import MessageComposer from './MessageComposer'
import MessageThread from './MessageThread'
import { format } from 'date-fns'
import { Send, Plus, Link, Image, Lightbulb, HelpCircle, MessageCircle } from 'lucide-react'

export default function ChatInterface({ selectedChannel, currentUser }) {
  const { teamMembers } = useTeam()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedThreads, setExpandedThreads] = useState(new Set())
  const [replyingTo, setReplyingTo] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages()
      
      const subscription = supabase
        .channel(`channel:${selectedChannel.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${selectedChannel.id}`
        }, () => {
          fetchMessages()
        })
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'replies'
        }, () => {
          fetchMessages()
        })
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [selectedChannel])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  async function fetchMessages() {
    if (!selectedChannel) return

    setLoading(true)
    try {
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_author_id_fkey (
            username,
            full_name,
            avatar_url
          ),
          replies (
            *,
            profiles!replies_author_id_fkey (
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('channel_id', selectedChannel.id)
        .order('created_at', { ascending: true })

      const messagesWithReplies = messagesData?.map(message => ({
        ...message,
        replies: message.replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      })) || []

      setMessages(messagesWithReplies)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage(content, contentType = 'text', metadata = null) {
    if (!selectedChannel || !currentUser) return

    const canPostTopLevel = selectedChannel.type !== 'ramblings' || selectedChannel.owner_id === currentUser.id

    if (!canPostTopLevel) {
      alert('Only the channel owner can post top-level messages in Ramblings channels.')
      return
    }

    try {
      const { data: newMessage } = await supabase
        .from('messages')
        .insert({
          channel_id: selectedChannel.id,
          author_id: currentUser.id,
          content,
          content_type: contentType,
          metadata
        })
        .select(`
          *,
          profiles!messages_author_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (newMessage) {
        setMessages(prev => [...prev, { ...newMessage, replies: [] }])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  async function handleSendReply(messageId, content) {
    if (!currentUser) return

    try {
      const { data: newReply } = await supabase
        .from('replies')
        .insert({
          message_id: messageId,
          author_id: currentUser.id,
          content
        })
        .select(`
          *,
          profiles!replies_author_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (newReply) {
        setMessages(prev => prev.map(message => 
          message.id === messageId 
            ? { ...message, replies: [...message.replies, newReply] }
            : message
        ))
        
        setExpandedThreads(prev => new Set([...prev, messageId]))
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send reply. Please try again.')
    }
  }

  function toggleThread(messageId) {
    setExpandedThreads(prev => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }

  function getContentTypeIcon(contentType) {
    switch (contentType) {
      case 'link': return <Link size={16} />
      case 'photo': return <Image size={16} />
      case 'idea': return <Lightbulb size={16} />
      case 'whatif': return <HelpCircle size={16} />
      default: return null
    }
  }

  function formatMessageContent(message) {
    if (message.content_type === 'link' && message.metadata?.url) {
      return (
        <div className="link-message">
          <p>{message.content}</p>
          <a 
            href={message.metadata.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="link-preview"
          >
            {message.metadata.title || message.metadata.url}
          </a>
        </div>
      )
    }

    if (message.content_type === 'photo' && message.metadata?.photoUrl) {
      return (
        <div className="photo-message">
          {message.content && <p>{message.content}</p>}
          <img 
            src={message.metadata.photoUrl} 
            alt="Shared photo"
            className="shared-photo"
          />
        </div>
      )
    }

    return <p>{message.content}</p>
  }

  if (!selectedChannel) {
    return (
      <div className="chat-interface-empty">
        <div className="empty-state">
          <h2>Welcome to Ramblings</h2>
          <p>Select a channel from the sidebar to start the conversation.</p>
          <div className="empty-state-info">
            <div className="info-item">
              <MessageCircle size={24} />
              <div>
                <h3>Ramblings Channels</h3>
                <p>Personal spaces where only the owner can post top-level messages, but everyone can reply in threads.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = selectedChannel.owner_id === currentUser?.id
  const canPostTopLevel = selectedChannel.type !== 'ramblings' || isOwner
  const channelOwner = teamMembers.find(m => m.user_id === selectedChannel.owner_id)

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="channel-info">
          <h2 className="channel-name">
            {selectedChannel.type === 'ramblings' && isOwner 
              ? 'Your Ramblings' 
              : selectedChannel.name}
          </h2>
          {selectedChannel.type === 'ramblings' && (
            <p className="channel-description">
              {isOwner 
                ? 'Share your thoughts, ideas, and "what if" moments with your team.'
                : `${channelOwner?.profiles?.full_name || channelOwner?.profiles?.username}'s personal space for thoughts and ideas.`}
            </p>
          )}
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>
                  {selectedChannel.type === 'ramblings' 
                    ? isOwner 
                      ? 'Start sharing your thoughts and ideas with your team!'
                      : 'No posts yet. When there are new thoughts to share, they\'ll appear here.'
                    : 'No messages yet. Start the conversation!'}
                </p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className="message-group">
                  <div className="message">
                    <div className="message-header">
                      <div className="author-info">
                        <div className="author-avatar">
                          {message.profiles.avatar_url ? (
                            <img src={message.profiles.avatar_url} alt={message.profiles.username} />
                          ) : (
                            <div className="avatar-placeholder">
                              {(message.profiles.full_name || message.profiles.username)[0].toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="author-name">
                          {message.profiles.full_name || message.profiles.username}
                        </span>
                        <span className="message-time">
                          {format(new Date(message.created_at), 'MMM d, h:mm a')}
                        </span>
                        {getContentTypeIcon(message.content_type) && (
                          <span className="content-type-icon">
                            {getContentTypeIcon(message.content_type)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="message-content">
                      {formatMessageContent(message)}
                    </div>
                    <div className="message-actions">
                      <button 
                        className="reply-button"
                        onClick={() => toggleThread(message.id)}
                      >
                        {message.replies.length > 0 
                          ? `${message.replies.length} ${message.replies.length === 1 ? 'reply' : 'replies'}`
                          : 'Reply'}
                      </button>
                    </div>
                  </div>

                  {expandedThreads.has(message.id) && (
                    <MessageThread
                      message={message}
                      replies={message.replies}
                      onSendReply={(content) => handleSendReply(message.id, content)}
                      currentUser={currentUser}
                    />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {canPostTopLevel && (
        <MessageComposer
          onSendMessage={handleSendMessage}
          placeholder={
            selectedChannel.type === 'ramblings'
              ? 'Share a thought, idea, or "what if" moment...'
              : 'Type a message...'
          }
          showContentTypes={selectedChannel.type === 'ramblings'}
        />
      )}

      {!canPostTopLevel && (
        <div className="no-post-permission">
          <p>Only {channelOwner?.profiles?.full_name || channelOwner?.profiles?.username} can post in this Ramblings channel.</p>
          <p>You can reply to their posts in threads.</p>
        </div>
      )}
    </div>
  )
}