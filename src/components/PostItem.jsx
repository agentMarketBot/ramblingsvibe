import { useState } from 'react';
import { MessageSquare, Send, Link as LinkIcon, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

const PostItem = ({ post, user, channelType, supabase }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('replies')
        .insert({
          post_id: post.id,
          author_id: user.id,
          content: replyContent.trim(),
          content_type: 'text'
        });

      if (error) throw error;

      setReplyContent('');
      // Trigger a refresh of the post data
      window.location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error creating reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content, contentType, metadata) => {
    if (contentType === 'link') {
      const url = metadata?.url || content;
      return (
        <div className="link-content">
          <a href={url} target="_blank" rel="noopener noreferrer" className="link-preview">
            <LinkIcon size={16} />
            <span>{url}</span>
            <ExternalLink size={14} />
          </a>
        </div>
      );
    }

    return <p className="post-text">{content}</p>;
  };

  const replies = post.replies || [];
  const replyCount = replies.length;

  return (
    <div className="post-item">
      <div className="post-header">
        <div className="author-info">
          <div className="avatar">
            {post.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <span className="author-name">{post.profiles?.display_name}</span>
          <span className="post-time">{formatTime(post.created_at)}</span>
        </div>
      </div>

      <div className="post-content">
        {renderContent(post.content, post.content_type, post.metadata)}
      </div>

      <div className="post-actions">
        <button
          className={clsx('reply-button', showReplies && 'active')}
          onClick={() => setShowReplies(!showReplies)}
        >
          <MessageSquare size={16} />
          <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
        </button>
      </div>

      {showReplies && (
        <div className="replies-section">
          {replies.map(reply => (
            <div key={reply.id} className="reply-item">
              <div className="reply-header">
                <div className="author-info">
                  <div className="avatar small">
                    {reply.profiles?.display_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="author-name">{reply.profiles?.display_name}</span>
                  <span className="reply-time">{formatTime(reply.created_at)}</span>
                </div>
              </div>
              <div className="reply-content">
                {renderContent(reply.content, reply.content_type, reply.metadata)}
              </div>
            </div>
          ))}

          <form onSubmit={handleSubmitReply} className="reply-form">
            <div className="reply-input-wrapper">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="reply-input"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitReply(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!replyContent.trim() || loading}
                className="reply-send-button"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostItem;