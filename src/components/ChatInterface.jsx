import { useState, useEffect, useRef } from 'react';
import { Send, Image, Link, Plus, MessageSquare, Hash, Users } from 'lucide-react';
import PostItem from './PostItem';
import clsx from 'clsx';

const ChatInterface = ({ channel, user, supabase }) => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [contentType, setContentType] = useState('text');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const canCreatePost = !channel || channel.type !== 'ramblings' || channel.owner_id === user?.id;

  useEffect(() => {
    if (channel) {
      loadPosts();
      
      // Subscribe to new posts
      const subscription = supabase
        .channel(`posts:${channel.id}`)
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'posts',
            filter: `channel_id=eq.${channel.id}`
          }, 
          () => {
            loadPosts();
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [channel]);

  useEffect(() => {
    scrollToBottom();
  }, [posts]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadPosts = async () => {
    if (!channel) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey (
            display_name,
            avatar_url
          ),
          replies (
            *,
            profiles!replies_author_id_fkey (
              display_name,
              avatar_url
            )
          )
        `)
        .eq('channel_id', channel.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !canCreatePost || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          channel_id: channel.id,
          author_id: user.id,
          content: newPostContent.trim(),
          content_type: contentType,
          metadata: contentType === 'link' ? { url: newPostContent.trim() } : null
        });

      if (error) throw error;

      setNewPostContent('');
      setContentType('text');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectContentType = (content) => {
    const urlRegex = /^https?:\/\/[^\s]+$/;
    if (urlRegex.test(content.trim())) {
      return 'link';
    }
    return 'text';
  };

  const handleContentChange = (e) => {
    const content = e.target.value;
    setNewPostContent(content);
    setContentType(detectContentType(content));
  };

  if (!channel) {
    return (
      <div className="chat-interface">
        <div className="welcome-state">
          <div className="welcome-content">
            <MessageSquare size={48} />
            <h2>Welcome to Ramblings</h2>
            <p>Select a channel to start reading or sharing your thoughts</p>
            <div className="features-list">
              <div className="feature">
                <Hash size={20} />
                <span>Join team channels for discussions</span>
              </div>
              <div className="feature">
                <Users size={20} />
                <span>Share personal updates in Ramblings channels</span>
              </div>
              <div className="feature">
                <MessageSquare size={20} />
                <span>Reply to others' posts in threaded conversations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="channel-info">
          <h3>
            {channel.type === 'ramblings' && (
              <span className="avatar">
                {channel.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
            {channel.name}
          </h3>
          {channel.description && (
            <p className="channel-description">{channel.description}</p>
          )}
        </div>
        {channel.type === 'ramblings' && channel.owner_id !== user.id && (
          <div className="channel-notice">
            <span>Only {channel.profiles?.display_name} can post here</span>
          </div>
        )}
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {posts.map(post => (
            <PostItem
              key={post.id}
              post={post}
              user={user}
              channelType={channel.type}
              supabase={supabase}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {canCreatePost && (
        <div className="message-input-container">
          <form onSubmit={handleSubmitPost} className="message-form">
            <div className="input-wrapper">
              <textarea
                value={newPostContent}
                onChange={handleContentChange}
                placeholder={
                  channel.type === 'ramblings' 
                    ? "Share your thoughts, ideas, or updates..."
                    : "Type a message..."
                }
                className="message-input"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitPost(e);
                  }
                }}
              />
              <div className="input-actions">
                <div className="content-type-indicator">
                  {contentType === 'link' && <Link size={16} />}
                  {contentType === 'text' && <MessageSquare size={16} />}
                </div>
                <button
                  type="submit"
                  disabled={!newPostContent.trim() || loading}
                  className="send-button"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;