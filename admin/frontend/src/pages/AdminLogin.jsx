import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/admin/login', { username, password });
      localStorage.setItem('adminToken', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold text-orange mb-2">Admin Login</h1>

        {error && <p className="text-rose text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="h-12 px-4 rounded-lg bg-white/90 text-darkblue placeholder-blue focus:outline-none focus:ring-2 focus:ring-rose"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 px-4 rounded-lg bg-white/90 text-darkblue placeholder-blue focus:outline-none focus:ring-2 focus:ring-rose"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3 rounded-lg h-12 bg-gradient-to-r from-pink via-rose to-orange text-white text-lg hover:brightness-110 transition-all duration-300 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;