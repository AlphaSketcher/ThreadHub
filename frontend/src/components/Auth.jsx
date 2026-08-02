import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await authService.login(email, password);
      } else {
        res = await authService.register(username, email, password);
      }
      
      // Save token and user details to localStorage
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify({ 
        username: res.username, 
        email: res.email,
        bio: res.bio,
        location: res.location,
        profileImage: res.profileImage
      }));
      
      // Redirect to home/dashboard
      navigate('/');
      
    } catch (err) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } }
  };

  return (
    <div className="new-auth-page">
      <div className="new-auth-container">
        
        {/* LEFT PANEL - ILLUSTRATION */}
        <div className="new-auth-left">
          {/* Changed path to /auth-left.png to match the generated image */}
          <img src="/auth-left.png" alt="Illustration" className="new-auth-illus" onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";
          }}/>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="new-auth-right">
          
          <Link to="/" className="new-auth-logo">
            <img src="/logo.png" alt="ThreadHub" />
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-form' : 'signup-form'}
              variants={fadeVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="new-form-wrapper"
            >
              <h2 className="new-form-title">
                {isLogin ? 'Welcome\nback' : 'Create\naccount'}
              </h2>

              <form onSubmit={handleSubmit} className="new-form">
                {error && <div className="error-banner" style={{color: 'red', marginBottom: '10px', fontSize: '14px', backgroundColor: '#fee2e2', padding: '8px', borderRadius: '8px'}}>{error}</div>}
                
                {!isLogin && (
                  <div className="new-input-group">
                    <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                  </div>
                )}

                <div className="new-input-group">
                  <input type={isLogin ? "text" : "email"} placeholder={isLogin ? "Email or username" : "Email address"} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="new-input-group">
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" className="new-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {isLogin && (
                  <div className="new-form-options">
                    <label className="new-checkbox">
                      <input type="checkbox" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="new-forgot">Forgot password?</a>
                  </div>
                )}

                <button type="submit" className="new-btn-submit" disabled={loading}>
                  {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create account')}
                </button>
              </form>

              <div className="new-social-section">
                <div className="new-divider">
                  <span className="divider-line"></span>
                  <span className="new-social-text">or</span>
                  <span className="divider-line"></span>
                </div>
                
                <button type="button" className="new-google-btn" onClick={() => {
                  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8080';
                  window.location.href = `${baseUrl}/oauth2/authorization/google`;
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span>{isLogin ? 'Log in with Google' : 'Continue with Google'}</span>
                </button>
              </div>

              <div className="new-terms">
                {isLogin ? (
                  <p>We respect your privacy. Your data is safe with us.</p>
                ) : (
                  <p>By creating an account you agree to ThreadHub's <a href="#">Terms of Services</a> and <a href="#">Privacy Policy</a>.</p>
                )}
              </div>

              <div className="new-auth-switch">
                <span>{isLogin ? "Don't have an account?" : "Have an account?"}</span>
                <button onClick={toggleMode} className="new-switch-link">
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Auth;
