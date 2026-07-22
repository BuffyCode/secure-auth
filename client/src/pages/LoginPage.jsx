import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login, requestOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await login(email, password, otp || null);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleSendOtp = async () => {
    setError('');
    setMessage('');

    try {
      await requestOtp(email);
      setMessage('OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send OTP');
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="helper-text">Use password login or request an OTP code for email-based sign in.</p>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <div className="password-field">
          <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <button type="button" className="ghost-btn" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="otp-row">
          <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="OTP (optional)" />
          <button type="button" className="ghost-btn" onClick={handleSendOtp}>Send OTP</button>
        </div>
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
