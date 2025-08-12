import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useTeam } from '../contexts/TeamContext'
import { useUser } from '../contexts/UserContext'
import { LogOut, Hash, MessageCircle, VolumeX, Volume2, Settings, Users } from 'lucide-react'

export default function Sidebar({ selectedChannel, onChannelSelect }) {
  const { teams, selectedTeam, setSelectedTeam, teamMembers, channels } = useTeam()
  const user = useUser()
  const [channelSettings, setChannelSettings] = useState({})

  useEffect(() => {
    if (user && channels.length > 0) {
      fetchChannelSettings()
    }
  }, [user, channels])

  async function fetchChannelSettings() {
    try {
      const { data: settings } = await supabase
        .from('user_channel_settings')
        .select('channel_id, is_muted, notifications_enabled')
        .eq('user_id', user.id)

      const settingsMap = {}
      settings?.forEach(setting => {
        settingsMap[setting.channel_id] = setting
      })
      setChannelSettings(settingsMap)
    } catch (error) {
      console.error('Error fetching channel settings:', error)
    }
  }

  async function toggleChannelMute(channelId) {
    const currentSetting = channelSettings[channelId]
    const newMuteState = !currentSetting?.is_muted

    try {
      await supabase
        .from('user_channel_settings')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          is_muted: newMuteState,
          notifications_enabled: !newMuteState
        })

      setChannelSettings(prev => ({
        ...prev,
        [channelId]: {
          ...prev[channelId],
          is_muted: newMuteState,
          notifications_enabled: !newMuteState
        }
      }))
    } catch (error) {
      console.error('Error updating channel settings:', error)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const generalChannels = channels.filter(ch => ch.type === 'general')
  const ramblingsChannels = channels.filter(ch => ch.type === 'ramblings')

  function isChannelMuted(channelId) {
    const setting = channelSettings[channelId]
    return setting?.is_muted ?? true
  }

  function getChannelIcon(channel) {
    if (channel.type === 'ramblings') {
      return <MessageCircle size={16} />
    }
    return <Hash size={16} />
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="team-selector">
          {teams.length > 1 ? (
            <select 
              value={selectedTeam?.id || ''} 
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value)
                setSelectedTeam(team)
              }}
              className="team-select"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          ) : (
            <h2 className="team-name">{selectedTeam?.name || 'Ramblings'}</h2>
          )}
        </div>
      </div>

      <div className="sidebar-content">
        {/* General Channels */}
        {generalChannels.length > 0 && (
          <div className="channel-section">
            <div className="section-header">
              <h3>Channels</h3>
            </div>
            <div className="channel-list">
              {generalChannels.map(channel => (
                <div 
                  key={channel.id}
                  className={`channel-item ${selectedChannel?.id === channel.id ? 'selected' : ''}`}
                  onClick={() => onChannelSelect(channel)}
                >
                  <div className="channel-info">
                    {getChannelIcon(channel)}
                    <span className="channel-name">{channel.name}</span>
                    {isChannelMuted(channel.id) && (
                      <VolumeX size={14} className="mute-indicator" />
                    )}
                  </div>
                  <button
                    className="mute-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleChannelMute(channel.id)
                    }}
                    title={isChannelMuted(channel.id) ? 'Unmute channel' : 'Mute channel'}
                  >
                    {isChannelMuted(channel.id) ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ramblings Section */}
        <div className="channel-section ramblings-section">
          <div className="section-header">
            <h3>Ramblings</h3>
            <span className="section-subtitle">Personal channels for thoughts and ideas</span>
          </div>
          <div className="channel-list">
            {ramblingsChannels.map(channel => {
              const owner = teamMembers.find(m => m.user_id === channel.owner_id)
              const isOwner = channel.owner_id === user.id
              
              return (
                <div 
                  key={channel.id}
                  className={`channel-item ramblings-channel ${selectedChannel?.id === channel.id ? 'selected' : ''} ${isOwner ? 'owned' : ''}`}
                  onClick={() => onChannelSelect(channel)}
                >
                  <div className="channel-info">
                    {getChannelIcon(channel)}
                    <span className="channel-name">
                      {isOwner ? 'Your Ramblings' : channel.name}
                    </span>
                    {isChannelMuted(channel.id) && (
                      <VolumeX size={14} className="mute-indicator" />
                    )}
                  </div>
                  <button
                    className="mute-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleChannelMute(channel.id)
                    }}
                    title={isChannelMuted(channel.id) ? 'Unmute channel' : 'Mute channel'}
                  >
                    {isChannelMuted(channel.id) ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team Members */}
        <div className="channel-section">
          <div className="section-header">
            <Users size={16} />
            <h3>Team Members</h3>
          </div>
          <div className="member-list">
            {teamMembers.map(member => (
              <div key={member.user_id} className="member-item">
                <div className="member-avatar">
                  {member.profiles.avatar_url ? (
                    <img src={member.profiles.avatar_url} alt={member.profiles.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(member.profiles.full_name || member.profiles.username)[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="member-name">
                  {member.profiles.full_name || member.profiles.username}
                  {member.user_id === user.id && <span className="you-indicator"> (you)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {(user.full_name || user.username)[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <span className="user-name">{user.full_name || user.username}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
        <div className="sidebar-actions">
          <button className="action-button" title="Settings">
            <Settings size={16} />
          </button>
          <button className="action-button" onClick={handleSignOut} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}