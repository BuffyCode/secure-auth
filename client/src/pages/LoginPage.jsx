import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await login(email, password, mfaRequired ? mfaToken : null);

      if (response.mfaRequired) {
        setMfaRequired(true);
        setMessage('Enter the code from your authenticator app.');
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData?.mfaRequired) {
        setMfaRequired(true);
        setMessage('Enter the code from your authenticator app.');
        return;
      }

      setError(responseData?.message || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <p className="helper-text">
          Use password login. If MFA is enabled, provide the code from your authenticator app.
        </p>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <div className="password-field">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          <button type="button" className="ghost-btn" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {mfaRequired && (
          <div className="mfa-row">
            <input
              value={mfaToken}
              onChange={(event) => setMfaToken(event.target.value)}
              placeholder="Authenticator code"
            />
          </div>
        )}
        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
