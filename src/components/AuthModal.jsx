import { useState } from 'react';
import { MessageSquare, Users, Hash } from 'lucide-react';

const AuthModal = ({ supabase }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  if (!supabase) {
    return (
      <div className="auth-modal">
        <div className="auth-container">
          <div className="auth-header">
            <MessageSquare size={32} />
            <h1>Configuration Error</h1>
            <p>Supabase client not available. Please check your configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName || email.split('@')[0]
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-container">
        <div className="auth-header">
          <MessageSquare size={32} />
          <h1>Welcome to Ramblings</h1>
          <p>A minimalist team chat focused on thoughtful communication</p>
        </div>

        <div className="features-preview">
          <div className="feature">
            <Hash size={20} />
            <span>Personal channels for sharing thoughts and ideas</span>
          </div>
          <div className="feature">
            <Users size={20} />
            <span>Team collaboration with reduced noise</span>
          </div>
          <div className="feature">
            <MessageSquare size={20} />
            <span>Thread-based conversations that matter</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="toggle-button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <div className="auth-demo">
          <p className="demo-text">
            Demo: Use any email and password to try the app
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;