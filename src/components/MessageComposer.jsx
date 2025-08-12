import { useState, useRef } from 'react'
import { Send, Link, Image, Lightbulb, HelpCircle, Type, X } from 'lucide-react'

export default function MessageComposer({ onSendMessage, placeholder = 'Type a message...', showContentTypes = false }) {
  const [content, setContent] = useState('')
  const [selectedType, setSelectedType] = useState('text')
  const [metadata, setMetadata] = useState(null)
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const fileInputRef = useRef(null)

  const contentTypes = [
    { id: 'text', label: 'Text', icon: Type, description: 'Regular text message' },
    { id: 'idea', label: 'Idea', icon: Lightbulb, description: 'Project idea or suggestion' },
    { id: 'whatif', label: 'What if...', icon: HelpCircle, description: 'Hypothetical or brainstorming' },
    { id: 'link', label: 'Link', icon: Link, description: 'Share a URL' },
    { id: 'photo', label: 'Photo', icon: Image, description: 'Share an image' }
  ]

  function handleTypeSelect(type) {
    setSelectedType(type)
    setShowTypePicker(false)
    setMetadata(null)
    setLinkUrl('')
    setLinkTitle('')
    setPhotoUrl('')
  }

  function handleSend() {
    if (!content.trim() && selectedType !== 'photo') return

    let finalMetadata = null

    if (selectedType === 'link' && linkUrl) {
      finalMetadata = {
        url: linkUrl,
        title: linkTitle || linkUrl
      }
    } else if (selectedType === 'photo' && photoUrl) {
      finalMetadata = {
        photoUrl: photoUrl
      }
    }

    onSendMessage(content, selectedType, finalMetadata)
    
    setContent('')
    setSelectedType('text')
    setMetadata(null)
    setLinkUrl('')
    setLinkTitle('')
    setPhotoUrl('')
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoUrl(e.target.result)
        setSelectedType('photo')
      }
      reader.readAsDataURL(file)
    }
  }

  const selectedTypeInfo = contentTypes.find(t => t.id === selectedType)

  return (
    <div className="message-composer">
      {showContentTypes && (
        <div className="content-type-selector">
          <div className="selected-type">
            <button 
              className="type-button selected"
              onClick={() => setShowTypePicker(!showTypePicker)}
              title={selectedTypeInfo?.description}
            >
              <selectedTypeInfo.icon size={16} />
              <span>{selectedTypeInfo?.label}</span>
            </button>
          </div>

          {showTypePicker && (
            <div className="type-picker">
              {contentTypes.map(type => (
                <button
                  key={type.id}
                  className={`type-option ${selectedType === type.id ? 'selected' : ''}`}
                  onClick={() => handleTypeSelect(type.id)}
                  title={type.description}
                >
                  <type.icon size={16} />
                  <div className="type-info">
                    <span className="type-label">{type.label}</span>
                    <span className="type-description">{type.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedType === 'link' && (
        <div className="link-input-section">
          <div className="link-inputs">
            <input
              type="url"
              placeholder="Paste URL here..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="link-url-input"
            />
            <input
              type="text"
              placeholder="Link title (optional)"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="link-title-input"
            />
          </div>
        </div>
      )}

      {selectedType === 'photo' && (
        <div className="photo-input-section">
          <div className="photo-options">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button 
              className="photo-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={16} />
              Upload Photo
            </button>
            <span className="photo-separator">or</span>
            <input
              type="url"
              placeholder="Paste image URL..."
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="photo-url-input"
            />
          </div>
          {photoUrl && (
            <div className="photo-preview">
              <img src={photoUrl} alt="Preview" />
              <button 
                className="remove-photo"
                onClick={() => setPhotoUrl('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="composer-main">
        <div className="input-container">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedType === 'idea' ? 'Describe your idea...' :
              selectedType === 'whatif' ? 'What if...' :
              selectedType === 'link' ? 'Add a description for this link...' :
              selectedType === 'photo' ? 'Add a caption for this photo...' :
              placeholder
            }
            className="message-input"
            rows={selectedType === 'text' ? 1 : 2}
          />
        </div>
        <button 
          className="send-button"
          onClick={handleSend}
          disabled={!content.trim() && selectedType !== 'photo'}
          title="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}