import { useState } from 'react';
import { Hash, Volume, VolumeX, Settings, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const Sidebar = ({ channels, selectedChannel, onChannelSelect, user }) => {
  const [userPreferences, setUserPreferences] = useState({});

  // Group channels by type
  const regularChannels = channels.filter(ch => ch.type === 'regular');
  const ramblingsChannels = channels.filter(ch => ch.type === 'ramblings');

  const handleChannelToggleMute = async (channelId, currentMuteState) => {
    try {
      const { error } = await supabase
        .from('user_channel_preferences')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          is_muted: !currentMuteState
        });

      if (!error) {
        setUserPreferences(prev => ({
          ...prev,
          [channelId]: !currentMuteState
        }));
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const isChannelMuted = (channel) => {
    return userPreferences[channel.id] ?? channel.is_muted_default;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Ramblings</h2>
        <button className="settings-btn" onClick={handleSignOut}>
          <Settings size={18} />
        </button>
      </div>

      <div className="channels-section">
        {regularChannels.length > 0 && (
          <>
            <div className="section-header">
              <Users size={16} />
              <span>Channels</span>
            </div>
            <div className="channel-list">
              {regularChannels.map(channel => (
                <div
                  key={channel.id}
                  className={clsx(
                    'channel-item',
                    selectedChannel?.id === channel.id && 'selected',
                    isChannelMuted(channel) && 'muted'
                  )}
                  onClick={() => onChannelSelect(channel)}
                >
                  <div className="channel-info">
                    <Hash size={16} />
                    <span className="channel-name">{channel.name}</span>
                  </div>
                  <button
                    className="mute-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChannelToggleMute(channel.id, isChannelMuted(channel));
                    }}
                  >
                    {isChannelMuted(channel) ? (
                      <VolumeX size={14} />
                    ) : (
                      <Volume size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="section-header ramblings-header">
          <Hash size={16} />
          <span>Ramblings</span>
        </div>
        <div className="channel-list ramblings-list">
          {ramblingsChannels.map(channel => (
            <div
              key={channel.id}
              className={clsx(
                'channel-item',
                'ramblings-channel',
                selectedChannel?.id === channel.id && 'selected',
                isChannelMuted(channel) && 'muted'
              )}
              onClick={() => onChannelSelect(channel)}
            >
              <div className="channel-info">
                <div className="avatar">
                  {channel.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="channel-name">{channel.name}</span>
                {channel.owner_id === user.id && (
                  <span className="owner-badge">You</span>
                )}
              </div>
              <button
                className="mute-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChannelToggleMute(channel.id, isChannelMuted(channel));
                }}
              >
                {isChannelMuted(channel) ? (
                  <VolumeX size={14} />
                ) : (
                  <Volume size={14} />
                )}
              </button>
            </div>
          ))}
        </div>

        {ramblingsChannels.length === 0 && (
          <div className="empty-state">
            <p>No ramblings channels yet</p>
            <p className="empty-subtitle">Join a team to see ramblings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;