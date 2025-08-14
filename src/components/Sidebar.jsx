import './Sidebar.css'

const Sidebar = ({ teamMembers, selectedChannel, onChannelSelect, currentUser }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Team Chat</h2>
      </div>
      
      <div className="sidebar-content">
        {/* Regular channels section could go here */}
        
        <div className="ramblings-section">
          <div className="section-header">
            <span className="section-title">🌀 Ramblings</span>
            <span className="section-badge">Personal channels</span>
          </div>
          
          <div className="channels-list">
            {teamMembers.map(member => (
              <div
                key={member.id}
                className={`channel-item ${selectedChannel === member.id ? 'active' : ''} ${member.id !== currentUser.id ? 'muted' : ''}`}
                onClick={() => onChannelSelect(member.id)}
              >
                <div className="channel-info">
                  <span className="member-avatar">{member.avatar}</span>
                  <span className="channel-name">{member.name}'s Ramblings</span>
                </div>
                <div className="channel-indicators">
                  {member.id !== currentUser.id && (
                    <span className="muted-indicator" title="Muted by default">🔇</span>
                  )}
                  {member.id === currentUser.id && (
                    <span className="owner-indicator" title="Your channel">👑</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="sidebar-footer">
        <div className="current-user">
          <span className="user-avatar">{currentUser.name.charAt(0)}</span>
          <span className="user-name">{currentUser.name}</span>
          <span className="user-status">●</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar