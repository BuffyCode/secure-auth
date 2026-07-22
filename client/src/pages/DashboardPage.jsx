import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, getProfile, getAdminDashboard } = useAuth();
  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
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

    if (user) {
      loadDashboard();
    }
  }, [getAdminDashboard, getProfile, user]);

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
        </div>
      ) : (
        <p>Loading dashboard...</p>
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
