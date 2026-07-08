import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { GraduationCap, BookOpen, ShieldAlert, ArrowRight, Lock } from 'lucide-react';

export default function SystemSetup() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selected) return;
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/configure-system', { systemType: selected });
      if (res.data.success) {
        setUser(res.data.user);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Configuration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      key: 'semester',
      label: 'Semester System',
      sublabel: 'University / Higher Education',
      description:
        'Fee cycles are tied to academic semesters (e.g. 1st Semester, 2nd Semester). Students are grouped by session year.',
      icon: GraduationCap,
      gradient: 'from-brandTeal-600/20 to-brandTeal-500/5',
      border: 'border-brandTeal-500/40',
      activeBorder: 'border-brandTeal-500',
      activeRing: 'ring-brandTeal-500/20',
      iconBg: 'bg-brandTeal-500/15 text-brandTeal-400',
      checkColor: 'bg-brandTeal-500',
      badge: 'bg-brandTeal-500/10 text-brandTeal-400 border-brandTeal-500/20',
    },
    {
      key: 'annual',
      label: 'Annual System',
      sublabel: 'School / Primary & Secondary',
      description:
        'Fee cycles are charged monthly or annually. Students are grouped by class level (e.g. Class 8, Class 10).',
      icon: BookOpen,
      gradient: 'from-brandPurple-600/20 to-brandPurple-500/5',
      border: 'border-brandPurple-500/40',
      activeBorder: 'border-brandPurple-500',
      activeRing: 'ring-brandPurple-500/20',
      iconBg: 'bg-brandPurple-500/15 text-brandPurple-400',
      checkColor: 'bg-brandPurple-500',
      badge: 'bg-brandPurple-500/10 text-brandPurple-400 border-brandPurple-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-brandTeal-500/4 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-brandPurple-500/4 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full">
            <Lock className="w-3 h-3" />
            One-Time Configuration — Cannot Be Changed Later
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
            Configure Your{' '}
            <span className="bg-gradient-to-r from-brandTeal-400 to-brandPurple-400 bg-clip-text text-transparent">
              Institution System
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            Welcome, <span className="text-slate-200 font-semibold">{user?.name}</span>. Select the billing
            system that matches your institution type. This setting is permanent for your account.
          </p>
        </div>

        {/* Option Cards */}
        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = selected === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelected(opt.key)}
                className={`relative text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-gradient-to-br ${opt.gradient} ${
                  isActive
                    ? `${opt.activeBorder} ring-4 ${opt.activeRing} scale-[1.02]`
                    : `${opt.border} hover:scale-[1.01] hover:brightness-110`
                } bg-darkCard`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    isActive ? `${opt.checkColor} border-transparent` : 'border-slate-600'
                  }`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${opt.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Labels */}
                <h3 className="text-lg font-bold text-white mb-0.5">{opt.label}</h3>
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mb-3 ${opt.badge}`}>
                  {opt.sublabel}
                </span>
                <p className="text-slate-400 text-xs leading-relaxed">{opt.description}</p>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Warning notice */}
        <div className="mb-5 bg-amber-500/5 border border-amber-500/15 rounded-xl px-4 py-3 flex items-start space-x-2.5">
          <Lock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-amber-300/70 text-xs leading-relaxed">
            <span className="font-semibold text-amber-300">This selection is permanent.</span> Once confirmed, the system type
            cannot be modified for this admin account. All students and billing cycles will follow the configured system.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full flex items-center justify-center space-x-2.5 py-4 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-brandTeal-600 to-brandPurple-600 hover:from-brandTeal-500 hover:to-brandPurple-500 text-white shadow-lg shadow-brandTeal-500/10 hover:shadow-brandTeal-500/20 disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Confirm & Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
