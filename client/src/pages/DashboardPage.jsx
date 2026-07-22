import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, getProfile, getAdminDashboard, setupMfa, verifyMfa } = useAuth();
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaMessage, setMfaMessage] = useState('');
  const [mfaError, setMfaError] = useState('');

  const loadDashboard = async () => {
    try {
      const response = user?.role === 'admin'
        ? await getAdminDashboard()
        : await getProfile();

      if (user?.role === 'admin') {
        setProfile(response.user);
        setUsers(response.users || []);
      } else {
        setProfile(response.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard');
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [getAdminDashboard, getProfile, user]);

  const handleSetupMfa = async () => {
    setMfaError('');
    setMfaMessage('');

    try {
      const response = await setupMfa();
      setQrCodeUrl(response.data.qrCodeDataURL);
      setMfaMessage('Scan the QR code with your authenticator app and verify the code.');
    } catch (err) {
      setMfaError(err.response?.data?.message || 'Unable to start MFA setup');
    }
  };

  const handleVerifyMfa = async () => {
    setMfaError('');
    setMfaMessage('');

    try {
      await verifyMfa(mfaCode);
      setMfaCode('');
      setQrCodeUrl('');
      setMfaMessage('MFA enabled successfully. Your next login will require the authenticator app code.');
      const profileResponse = await getProfile();
      setProfile(profileResponse.user);
    } catch (err) {
      setMfaError(err.response?.data?.message || 'Invalid MFA code');
    }
  };

  return (
    <div className="card">
      <h2>{user?.role === 'admin' ? 'Admin Dashboard' : 'Dashboard'}</h2>
      {error && <p className="error-text">{error}</p>}
      {profile ? (
        <div className="profile-card">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <p><strong>User ID:</strong> {profile.id}</p>
          <p><strong>MFA:</strong> {profile.mfaEnabled ? 'Enabled' : 'Disabled'}</p>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}

      {!user?.mfaEnabled && (
        <div className="mfa-section">
          <h3>Authenticator App MFA</h3>
          <p>Enable multi-factor authentication using an authenticator app such as Google Authenticator.</p>

          {!qrCodeUrl && (
            <button type="button" onClick={handleSetupMfa}>Set up MFA</button>
          )}

          {qrCodeUrl && (
            <div className="mfa-setup">
              <img src={qrCodeUrl} alt="MFA QR code" className="mfa-qr" />
              <p>Scan the QR code with your authenticator app, then enter the code below.</p>
              <input
                value={mfaCode}
                onChange={(event) => setMfaCode(event.target.value)}
                placeholder="Authenticator code"
              />
              <button type="button" onClick={handleVerifyMfa}>Verify MFA</button>
            </div>
          )}

          {mfaMessage && <p className="success-text">{mfaMessage}</p>}
          {mfaError && <p className="error-text">{mfaError}</p>}
        </div>
      )}

      {user?.role === 'admin' && (
        <div className="users-section">
          <h3>All users</h3>
          <div className="user-list">
            {users.map((item) => (
              <div key={item.id} className="user-card">
                <p><strong>{item.name}</strong></p>
                <p>{item.email}</p>
                <p className="role-pill">{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
