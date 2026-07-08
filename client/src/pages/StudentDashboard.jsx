import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  LogOut, User, CreditCard, History, Bell, UploadCloud,
  CheckCircle, Clock, AlertTriangle, Info, Calendar,
  FileText, Menu, X, ChevronRight, Lock
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── States ──────────────────────────────────────────────────────────────────
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ── Sidebar & Active Tab ───────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('payment'); // 'payment', 'notifications', 'ledger'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [histRes, msgRes, annRes] = await Promise.all([
        axios.get('/api/challans/history'),
        axios.get('/api/challans/messages'),
        axios.get('/api/messages/announcements')
      ]);

      if (histRes.data.success) setHistory(histRes.data.data);
      if (msgRes.data.success) setMessages(msgRes.data.data);
      if (annRes.data.success) setAnnouncements(annRes.data.data);
    } catch (err) {
      console.error('Error fetching student dashboard data:', err);
    }
  };

  const handleFileChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigateTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleSubmitReceipt = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount.');
      setLoading(false);
      return;
    }

    if (!receipt) {
      setError('Please select an image or PDF of your fee receipt.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('receipt', receipt);

    try {
      const res = await axios.post('/api/challans/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setSuccess(true);
        setAmount('');
        setReceipt(null);

        // Refresh User profile in AuthContext
        const profileRes = await axios.get('/api/auth/me');
        if (profileRes.data.success) {
          setUser({ ...profileRes.data.user, role: profileRes.data.role || 'student' });
        }

        fetchDashboardData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload fee receipt. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = (dueDateString) => {
    if (!dueDateString) return null;
    const due = new Date(dueDateString);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!user) return null;

  const daysLeft = getDaysLeft(user.dueDate);

  // ── Navigation Items ───────────────────────────────────────────────────────
  const navItems = [
    { key: 'payment', icon: CreditCard, label: 'Dues & Payment' },
    { key: 'notifications', icon: Bell, label: 'Notice Board', badge: (messages.length + announcements.length) || null },
    { key: 'ledger', icon: History, label: 'Payment Ledger' }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-[#0c1424] border-r border-darkBorder z-40 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-darkBorder flex items-center justify-between">
          <div>
            <span className="text-xl text-white font-extrabold ">
              SmartPay
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-wide">Student Portal</p>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider px-3 mb-2">My Desk</p>
          {navItems.map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => navigateTab(key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${activeTab === key
                  ? 'bg-brandPurple-500/10 text-brandPurple-400 border border-brandPurple-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeTab === key ? 'text-brandPurple-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{label}</span>
              </div>
              {badge ? (
                <span className="bg-brandPurple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge}
                </span>
              ) : activeTab === key ? (
                <ChevronRight className="w-3.5 h-3.5 text-brandPurple-400" />
              ) : null}
            </button>
          ))}
        </nav>

        {/* User Card in sidebar */}
        <div className="p-4 border-t border-darkBorder">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brandPurple-500/10 border border-brandPurple-500/20 text-brandPurple-400 flex items-center justify-center font-bold text-base">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase">{user.rollNo}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-darkBorder hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#0c1424] border-b border-darkBorder px-4 py-3.5 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-base font-extrabold bg-gradient-to-r from-brandPurple-400 to-brandTeal-400 bg-clip-text text-transparent">SmartPay</span>
          <div className="w-9" />
        </header>

        {/* Section title bar */}
        <div className="border-b border-darkBorder bg-[#0a0f1e] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              {navItems.find(n => n.key === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'payment' && 'Verify your active billing details and submit fee receipts'}
              {activeTab === 'notifications' && 'View official community announcements and direct messages'}
              {activeTab === 'ledger' && 'Access history of your uploaded challans and payment statuses'}
            </p>
          </div>
          <div className="hidden md:block">
            <span className="bg-brandPurple-500/10 border border-brandPurple-500/20 text-brandPurple-400 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {user.systemType} Billing
            </span>
          </div>
        </div>

        {/* Content Body */}
        <main className="flex-grow overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">

            {/* ═══════════════════════════════════════════════════════════════
                TAB: DUES & FEE PAYMENT
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                {/* Profile Quick Summary Card */}
                <div className="bg-darkCard border border-darkBorder rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-brandPurple-500/5 to-transparent pointer-events-none" />
                  <div className="w-16 h-16 bg-brandPurple-500/10 rounded-xl flex items-center justify-center border border-brandPurple-500/20 text-brandPurple-400 text-2xl font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <p className="text-slate-400 text-xs">Father's Name: <span className="text-slate-300 font-medium">{user.fatherName}</span></p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-[#121929] text-brandPurple-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-brandPurple-500/10">
                        {user.systemType === 'semester' ? `Session: ${user.session}` : `Class: ${user.classLevel}`}
                      </span>
                      <span className="bg-[#121929] text-brandTeal-400 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-brandTeal-500/10">
                        Roll: {user.rollNo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Period / Upload Slip Box */}
                <div className="bg-darkCard border border-darkBorder rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center border-b border-darkBorder pb-4">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-brandTeal-500" />
                      <h3 className="text-sm font-bold text-white">Active Period Details</h3>
                    </div>
                    <span className="bg-brandTeal-500/10 border border-brandTeal-500/20 text-brandTeal-400 text-xs font-semibold px-3 py-1 rounded-full">
                      {user.currentPeriod}
                    </span>
                  </div>

                  {/* 1. Paid State */}
                  {user.feeStatus === 'paid' && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-xl text-center space-y-3">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                      <h4 className="text-base font-bold text-white">Dues Cleared!</h4>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        Your fee verification voucher for {user.currentPeriod} has been accepted. No outstanding payments remain.
                      </p>
                    </div>
                  )}

                  {/* 2. Pending Verification State */}
                  {user.feeStatus === 'pending' && (
                    <div className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-xl text-center space-y-3">
                      <Clock className="w-12 h-12 text-amber-400 mx-auto animate-pulse" />
                      <h4 className="text-base font-bold text-white">Receipt Verification Pending</h4>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        Your proof of payment has been uploaded successfully. An administrator is currently auditing the slip.
                      </p>
                    </div>
                  )}

                  {/* 3. Unpaid / Rejected State */}
                  {user.feeStatus === 'unpaid' && (
                    <div className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-[#121929] border border-darkBorder p-4 rounded-xl flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-brandPurple-500" />
                          <div>
                            <span className="block text-slate-500 text-[10px] uppercase font-semibold">Due Date Deadline</span>
                            <span className="text-xs font-bold text-slate-200">
                              {user.dueDate ? new Date(user.dueDate).toLocaleDateString() : 'Not Set'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-[#121929] border border-darkBorder p-4 rounded-xl flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500" />
                          <div>
                            <span className="block text-slate-500 text-[10px] uppercase font-semibold">Countdown</span>
                            <span className={`text-xs font-bold ${daysLeft !== null && daysLeft < 3 ? 'text-rose-400' : 'text-slate-200'}`}>
                              {daysLeft !== null ? (daysLeft > 0 ? `${daysLeft} Days Left` : daysLeft === 0 ? 'Due Today' : `${Math.abs(daysLeft)} Days Overdue`) : 'No Active Limit'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Slip Form */}
                      <form onSubmit={handleSubmitReceipt} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="amt_field">
                              Amount Paid (PKR)
                            </label>
                            <input
                              type="number"
                              id="amt_field"
                              required
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="e.g. 45000"
                              className="w-full bg-[#121929] border border-darkBorder focus:border-brandPurple-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none transition-all text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                              Upload Proof of Payment
                            </label>
                            <div className="relative">
                              <input
                                type="file"
                                required
                                onChange={handleFileChange}
                                accept="image/*,application/pdf"
                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                              />
                              <div className="w-full bg-[#121929] border border-darkBorder border-dashed hover:border-brandPurple-500 rounded-xl px-4 py-3 text-slate-400 text-xs flex items-center justify-between transition-all">
                                <span className="truncate max-w-[180px]">
                                  {receipt ? receipt.name : 'Select file (Image/PDF)'}
                                </span>
                                <UploadCloud className="w-4 h-4 text-brandPurple-500" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {success && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl text-xs">
                            Fee proof submitted! Reloading status.
                          </div>
                        )}

                        {error && (
                          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl text-xs">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brandPurple-600 to-brandPurple-500 hover:from-brandPurple-500 hover:to-brandPurple-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:pointer-events-none text-xs"
                        >
                          {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <UploadCloud className="w-4 h-4" />
                              <span>Submit Verification Proof</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB: NOTICE BOARD / NOTIFICATIONS
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'notifications' && (
              <div className="grid md:grid-cols-2 gap-6">

                {/* Personal status changes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-darkBorder pb-2">
                    <Bell className="w-4 h-4 text-brandPurple-400" />
                    <h3 className="font-bold text-white text-sm">Direct Messages</h3>
                  </div>
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {messages.length > 0 ? (
                      messages.map((m) => (
                        <div key={m._id} className="bg-darkCard border border-darkBorder p-4 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-white truncate max-w-[160px]">{m.subject}</h4>
                            <span className="text-[9px] text-slate-500">{new Date(m.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: m.message }} />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-600 text-xs">No direct coordinator notifications.</div>
                    )}
                  </div>
                </div>

                {/* Campus Announcements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-darkBorder pb-2">
                    <Info className="w-4 h-4 text-brandTeal-400" />
                    <h3 className="font-bold text-white text-sm">Campus Board</h3>
                  </div>
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {announcements.length > 0 ? (
                      announcements.map((a) => (
                        <div key={a._id} className="bg-darkCard border border-darkBorder p-4 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-slate-200">{a.subject}</h4>
                            <span className="text-[9px] text-slate-500">{new Date(a.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{a.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-600 text-xs">No notice announcements published yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB: PAYMENT LEDGER
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'ledger' && (
              <div className="bg-darkCard border border-darkBorder rounded-2xl p-6">
                <div className="overflow-x-auto">
                  {history.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-darkBorder text-slate-500 font-semibold uppercase">
                          <th className="pb-3">Billing Period</th>
                          <th className="pb-3">Amount Submitted</th>
                          <th className="pb-3">Upload Date</th>
                          <th className="pb-3">Slip Document</th>
                          <th className="pb-3 text-right">Audited Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder text-slate-300">
                        {history.map((h) => (
                          <tr key={h._id}>
                            <td className="py-4 font-bold text-white">{h.period}</td>
                            <td className="py-4">PKR {h.amount.toLocaleString()}</td>
                            <td className="py-4 text-slate-500">{new Date(h.uploadedDate).toLocaleDateString()}</td>
                            <td className="py-4">
                              <a href={h.challanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brandPurple-400 hover:text-brandPurple-300 font-medium">
                                <FileText className="w-3.5 h-3.5" /> View Proof
                              </a>
                            </td>
                            <td className="py-4 text-right">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${h.feeStatus === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                  h.feeStatus === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                    'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>{h.feeStatus}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10 text-slate-500">No payment transaction records exist.</div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
