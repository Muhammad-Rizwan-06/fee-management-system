import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ShieldAlert, LogIn, ChevronLeft } from 'lucide-react';

export default function AdminLogin() {
  const { login, token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (token && user && user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [token, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/admin/login', formData);
      if (res.data.success) {
        login(res.data.token, res.data.user);
        if (!res.data.user.systemConfigured) {
          navigate('/admin/configure', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center px-6 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-brandTeal-500/5 blur-[100px] rounded-full -z-10"></div>

      <div className="w-full max-w-md bg-darkCard border border-darkBorder rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Top bar border glow effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brandTeal-500 to-transparent"></div>

        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors mb-4">
            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
            Back to Home
          </Link>
          <h2 className="text-3xl font-extrabold text-white">Admin Portal</h2>
          <p className="text-slate-400 text-sm mt-1">Authorized personnel login only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@domain.com"
              className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none transition-all text-sm"
            />
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brandTeal-600 to-brandTeal-500 hover:from-brandTeal-500 hover:to-brandTeal-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brandTeal-500/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center text-slate-500 text-xs">
        <p>Default seeding credentials: admin@fms.com / admin123</p>
      </div>
    </div>
  );
}
