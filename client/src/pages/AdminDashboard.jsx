import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  Users, CreditCard, AlertCircle, FileCheck, TrendingUp,
  LogOut, Search, Check, X, Plus, Send, Trash2, Bell,
  MessageSquare, Eye, Settings, FolderOpen, RefreshCw,
  GraduationCap, BookOpen, Lock, Menu, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const lockedSystemType = user?.systemType || 'semester';
  const isSemester = lockedSystemType === 'semester';
  const groupLabel = isSemester ? 'Session' : 'Class';
  const periodLabel = isSemester ? 'Semester' : 'Month';

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalStudents: 0, paidCount: 0, pendingCount: 0,
    unpaidCount: 0, totalCollected: 0, totalPendingAmount: 0
  });

  // ── Data ───────────────────────────────────────────────────────────────────
  const [pendingChallans, setPendingChallans] = useState([]);
  const [students, setStudents] = useState([]);
  const [comments, setComments] = useState([]);
  const [groups, setGroups] = useState([]);

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Active Section ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('verification');

  // ── Alert ──────────────────────────────────────────────────────────────────
  const [alert, setAlert] = useState({ type: '', msg: '' });

  // ── Add Student Modal ──────────────────────────────────────────────────────
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '', fatherName: '', rollNo: '', email: '',
    dob: '', idCard: '', gender: 'male',
    systemType: lockedSystemType, session: '', classLevel: ''
  });

  // ── Reject Modal ───────────────────────────────────────────────────────────
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [zoomReceipt, setZoomReceipt] = useState(null);

  // ── Announcement ───────────────────────────────────────────────────────────
  const [announcement, setAnnouncement] = useState({ subject: '', message: '' });

  // ── Add Group Modal ────────────────────────────────────────────────────────
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', currentPeriod: '', dueDate: '' });

  // ── Rollover Modal ─────────────────────────────────────────────────────────
  const [showRolloverModal, setShowRolloverModal] = useState(false);
  const [rolloverTarget, setRolloverTarget] = useState(null);
  const [rolloverForm, setRolloverForm] = useState({ currentPeriod: '', dueDate: '' });

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchAll(); }, [search, filterGroup, filterStatus]);
  useEffect(() => { fetchGroups(); }, []);

  const fetchAll = () => { fetchStats(); fetchPendingChallans(); fetchStudents(); fetchComments(); };

  const triggerAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  // ── API ────────────────────────────────────────────────────────────────────
  const fetchStats = async () => {
    try { const r = await axios.get('/api/challans/stats'); if (r.data.success) setStats(r.data.stats); } catch { }
  };
  const fetchPendingChallans = async () => {
    try { const r = await axios.get('/api/challans/pending'); if (r.data.success) setPendingChallans(r.data.data); } catch { }
  };
  const fetchStudents = async () => {
    try {
      const params = { search, systemType: lockedSystemType, feeStatus: filterStatus };
      if (isSemester && filterGroup) params.session = filterGroup;
      if (!isSemester && filterGroup) params.classLevel = filterGroup;
      const r = await axios.get('/api/students', { params });
      if (r.data.success) setStudents(r.data.data);
    } catch { }
  };
  const fetchComments = async () => {
    try { const r = await axios.get('/api/messages/feedback'); if (r.data.success) setComments(r.data.data); } catch { }
  };
  const fetchGroups = async () => {
    try { const r = await axios.get('/api/groups'); if (r.data.success) setGroups(r.data.data); } catch { }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); navigate('/'); };

  const navigate_tab = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  const handleVerify = async (challanId, action, reasonText = '') => {
    try {
      const r = await axios.post('/api/challans/verify', { challanId, action, reason: reasonText });
      if (r.data.success) {
        triggerAlert('success', `Receipt ${action === 'approve' ? 'approved' : 'rejected'}`);
        fetchPendingChallans(); fetchStats(); fetchStudents();
        setShowRejectModal(false); setRejectReason(''); setSelectedChallan(null);
      }
    } catch (err) { triggerAlert('error', err.response?.data?.error || 'Verification failed'); }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post('/api/students', newStudent);
      if (r.data.success) {
        triggerAlert('success', 'Student registered successfully');
        setShowAddStudent(false);
        setNewStudent({ name: '', fatherName: '', rollNo: '', email: '', dob: '', idCard: '', gender: 'male', systemType: lockedSystemType, session: '', classLevel: '' });
        fetchAll(); fetchGroups();
      }
    } catch (err) { triggerAlert('error', err.response?.data?.error || 'Failed to register student'); }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      const r = await axios.delete(`/api/students/${id}`);
      if (r.data.success) { triggerAlert('success', 'Student removed'); fetchAll(); fetchGroups(); }
    } catch { triggerAlert('error', 'Delete failed'); }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post('/api/messages/announcements', announcement);
      if (r.data.success) { triggerAlert('success', 'Announcement published'); setAnnouncement({ subject: '', message: '' }); }
    } catch { triggerAlert('error', 'Announcement failed'); }
  };

  const handleAddGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post('/api/groups', newGroup);
      if (r.data.success) {
        triggerAlert('success', `${groupLabel} created`);
        setShowAddGroup(false); setNewGroup({ name: '', currentPeriod: '', dueDate: '' }); fetchGroups();
      }
    } catch (err) { triggerAlert('error', err.response?.data?.error || 'Failed to create group'); }
  };

  const handleDeleteGroup = async (id, name) => {
    if (!window.confirm(`Delete ${groupLabel} "${name}"?`)) return;
    try {
      const r = await axios.delete(`/api/groups/${id}`);
      if (r.data.success) { triggerAlert('success', `${groupLabel} deleted`); fetchGroups(); }
    } catch (err) { triggerAlert('error', err.response?.data?.error || 'Delete failed'); }
  };

  const handleRolloverSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.post(`/api/groups/${rolloverTarget._id}/rollover`, rolloverForm);
      if (r.data.success) {
        triggerAlert('success', r.data.message);
        setShowRolloverModal(false); setRolloverTarget(null); setRolloverForm({ currentPeriod: '', dueDate: '' });
        fetchGroups(); fetchAll();
      }
    } catch (err) { triggerAlert('error', err.response?.data?.error || 'Rollover failed'); }
  };

  // ── Nav Items ──────────────────────────────────────────────────────────────
  const navItems = [
    { key: 'verification', icon: FileCheck, label: 'Pending Slips', badge: pendingChallans.length || null },
    { key: 'groups', icon: isSemester ? GraduationCap : BookOpen, label: `${groupLabel}s` },
    { key: 'students', icon: Users, label: 'Students' },
    { key: 'announcements', icon: Bell, label: 'Announcements' },
    { key: 'comments', icon: MessageSquare, label: 'Comments' },
  ];

  const isBadgeColor = isSemester ? 'brandTeal' : 'brandPurple';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex">

      {/* ── Mobile overlay ── */}
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
        <div className="p-6 border-b border-darkBorder">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-extrabold text-white">
                SmartPay
              </span>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium tracking-wide">Admin Portal</p>
            </div>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* System badge */}
          <div className={`mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-full border ${isSemester ? 'bg-brandTeal-500/10 text-brandTeal-400 border-brandTeal-500/20' : 'bg-brandPurple-500/10 text-brandPurple-400 border-brandPurple-500/20'
            }`}>
            <Lock className="w-2.5 h-2.5" />
            {isSemester ? 'Semester System' : 'Annual System'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider px-3 mb-2">Navigation</p>
          {navItems.map(({ key, icon: Icon, label, badge }) => (
            <button
              key={key}
              onClick={() => navigate_tab(key)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${activeTab === key
                ? 'bg-brandTeal-500/10 text-brandTeal-400 border border-brandTeal-500/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeTab === key ? 'text-brandTeal-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{label}</span>
              </div>
              {badge ? (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {badge}
                </span>
              ) : activeTab === key ? (
                <ChevronRight className="w-3.5 h-3.5 text-brandTeal-400" />
              ) : null}
            </button>
          ))}
        </nav>

        {/* Stats Summary in sidebar */}
        <div className="px-3 py-3 mx-3 mb-3 bg-[#121929] rounded-xl border border-darkBorder space-y-2">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider">Quick Stats</p>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-sm font-bold text-white">{stats.totalStudents}</div>
              <div className="text-[9px] text-slate-500">Students</div>
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-400">{stats.paidCount}</div>
              <div className="text-[9px] text-slate-500">Paid</div>
            </div>
            <div>
              <div className="text-sm font-bold text-amber-400">{stats.pendingCount}</div>
              <div className="text-[9px] text-slate-500">Pending</div>
            </div>
            <div>
              <div className="text-sm font-bold text-rose-400">{stats.unpaidCount}</div>
              <div className="text-[9px] text-slate-500">Unpaid</div>
            </div>
          </div>
        </div>

        {/* Admin info + logout */}
        <div className="p-4 border-t border-darkBorder">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brandTeal-500/20 text-brandTeal-400 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-darkBorder hover:border-rose-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top bar (mobile) ── */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#0c1424] border-b border-darkBorder px-4 py-3.5 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-base font-extrabold bg-gradient-to-r from-brandTeal-400 to-brandPurple-400 bg-clip-text text-transparent">SmartPay</span>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* ── Page title bar ── */}
        <div className="border-b border-darkBorder bg-[#0a0f1e] px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white">
              {navItems.find(n => n.key === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'verification' && 'Review and action pending fee receipts'}
              {activeTab === 'groups' && `Manage ${isSemester ? 'university sessions' : 'school classes'} and billing periods`}
              {activeTab === 'students' && 'Browse, search and manage enrolled students'}
              {activeTab === 'announcements' && 'Broadcast notices to all students'}
              {activeTab === 'comments' && 'View feedback submitted from the landing page'}
            </p>
          </div>
          {/* Quick action buttons per section */}
          {activeTab === 'groups' && (
            <button onClick={() => setShowAddGroup(true)} className="bg-brandTeal-500 hover:bg-brandTeal-600 text-slate-900 font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all text-xs">
              <Plus className="w-4 h-4" /><span>Add {groupLabel}</span>
            </button>
          )}
          {activeTab === 'students' && (
            <button onClick={() => setShowAddStudent(true)} className="bg-brandTeal-500 hover:bg-brandTeal-600 text-slate-900 font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all text-xs">
              <Plus className="w-4 h-4" /><span>Add Student</span>
            </button>
          )}
        </div>

        {/* ── Floating Alert ── */}
        {alert.msg && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-xl flex items-center space-x-3 text-sm border ${alert.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{alert.msg}</span>
          </div>
        )}

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

            {/* Stats row — always visible */}
            <div className="hidden lg:grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: stats.totalStudents, icon: Users, colorClass: 'bg-brandPurple-500/10 border-brandPurple-500/20 text-brandPurple-500' },
                { label: 'Collected (Verified)', value: `PKR ${stats.totalCollected.toLocaleString()}`, icon: TrendingUp, colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                { label: 'Pending Review', value: stats.pendingCount, icon: AlertCircle, colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
                { label: 'Unpaid Accounts', value: stats.unpaidCount, icon: CreditCard, colorClass: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
              ].map(({ label, value, icon: Icon, colorClass }) => (
                <div key={label} className="bg-darkCard border border-darkBorder p-5 rounded-2xl flex items-center space-x-4">
                  <div className={`p-2.5 rounded-xl border ${colorClass}`}><Icon className="w-5 h-5" /></div>
                  <div>
                    <span className="block text-slate-500 text-xs">{label}</span>
                    <span className="text-xl font-bold text-white">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION: PENDING VERIFICATION
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'verification' && (
              pendingChallans.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {pendingChallans.map((c) => (
                    <div key={c._id} className="bg-darkCard border border-darkBorder p-5 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{c.studentId?.name}</h4>
                            <span className="text-xs text-slate-400 uppercase tracking-wider">{c.rollNo}</span>
                          </div>
                          <span className="bg-brandPurple-500/10 text-brandPurple-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-brandPurple-500/20 capitalize">{c.systemType}</span>
                        </div>
                        <div className="bg-[#0b101c] p-3.5 rounded-xl border border-darkBorder space-y-1.5 text-xs">
                          <div className="flex justify-between"><span className="text-slate-500">Period:</span><span className="text-slate-200 font-medium">{c.period}</span></div>
                          <div className="flex justify-between"><span className="text-slate-500">{groupLabel}:</span><span className="text-slate-200 font-medium">{c.groupIdentifier}</span></div>
                          <div className="flex justify-between font-bold text-white border-t border-darkBorder pt-1.5 mt-1">
                            <span>Amount:</span><span>PKR {c.amount}</span>
                          </div>
                        </div>
                        <div className="relative h-36 bg-[#0b101c] rounded-xl border border-darkBorder overflow-hidden group cursor-pointer" onClick={() => setZoomReceipt(c.challanUrl)}>
                          <img src={c.challanUrl} alt="Slip" className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-5">
                        <button onClick={() => handleVerify(c._id, 'approve')} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all">
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => { setSelectedChallan(c); setShowRejectModal(true); }} className="flex-1 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-rose-500/20 transition-all">
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FileCheck className="w-14 h-14 text-slate-700 mb-4" />
                  <p className="text-slate-400 font-semibold">All clear!</p>
                  <p className="text-slate-600 text-sm mt-1">No pending fee receipts to review.</p>
                </div>
              )
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION: GROUPS
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'groups' && (
              groups.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {groups.map((g) => (
                    <div key={g._id} className="bg-darkCard border border-darkBorder rounded-2xl p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isSemester ? 'bg-brandTeal-500/10 text-brandTeal-400' : 'bg-brandPurple-500/10 text-brandPurple-400'}`}>
                            {isSemester ? <GraduationCap className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{g.name}</h4>
                            <span className="text-[10px] text-slate-500">{g.studentCount} student{g.studentCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteGroup(g._id, g.name)} className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-[#0b101c] rounded-xl border border-darkBorder p-3 space-y-2 text-xs">
                        <div className="flex justify-between"><span className="text-slate-500">Active {periodLabel}:</span><span className="text-slate-200 font-semibold">{g.currentPeriod || '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Due Date:</span><span className="text-slate-200">{g.dueDate ? new Date(g.dueDate).toLocaleDateString() : 'Not set'}</span></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg py-2"><div className="font-bold text-emerald-400">{g.paidCount}</div><div className="text-slate-500 text-[10px]">Paid</div></div>
                        <div className="bg-amber-500/5 border border-amber-500/15 rounded-lg py-2"><div className="font-bold text-amber-400">{g.pendingCount}</div><div className="text-slate-500 text-[10px]">Pending</div></div>
                        <div className="bg-rose-500/5 border border-rose-500/15 rounded-lg py-2"><div className="font-bold text-rose-400">{g.unpaidCount}</div><div className="text-slate-500 text-[10px]">Unpaid</div></div>
                      </div>
                      <button
                        onClick={() => { setRolloverTarget(g); setRolloverForm({ currentPeriod: '', dueDate: '' }); setShowRolloverModal(true); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-brandTeal-500/30 text-brandTeal-400 hover:bg-brandTeal-500/10 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Rollover to Next {periodLabel}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <FolderOpen className="w-14 h-14 text-slate-700 mb-4" />
                  <p className="text-slate-400 font-semibold">No {groupLabel.toLowerCase()}s yet</p>
                  <p className="text-slate-600 text-sm mt-1 mb-4">Create your first {groupLabel.toLowerCase()} to start enrolling students.</p>
                  <button onClick={() => setShowAddGroup(true)} className="bg-brandTeal-500 hover:bg-brandTeal-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs transition-all">
                    <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Create {groupLabel}</span>
                  </button>
                </div>
              )
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION: STUDENTS
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'students' && (
              <div className="space-y-5">
                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-darkCard p-4 rounded-2xl border border-darkBorder">
                  <div className="col-span-2 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, roll, email, cnic..."
                      className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl pl-9 pr-4 py-2.5 text-slate-100 placeholder-slate-600 outline-none text-xs transition-all" />
                  </div>
                  <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)}
                    className="bg-[#0b101c] border border-darkBorder rounded-xl px-3 py-2.5 text-slate-300 outline-none text-xs">
                    <option value="">All {groupLabel}s</option>
                    {groups.map((g) => <option key={g._id} value={g.name}>{g.name}</option>)}
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-[#0b101c] border border-darkBorder rounded-xl px-3 py-2.5 text-slate-300 outline-none text-xs">
                    <option value="">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                {/* Table */}
                <div className="bg-darkCard border border-darkBorder rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-darkBorder text-slate-500 font-semibold uppercase bg-[#0b101c]">
                          <th className="px-5 py-3.5">Roll No</th>
                          <th className="px-5 py-3.5">Name</th>
                          <th className="px-5 py-3.5">{groupLabel}</th>
                          <th className="px-5 py-3.5">Current {periodLabel}</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-darkBorder">
                        {students.length > 0 ? students.map((s) => (
                          <tr key={s._id} className="text-slate-300 hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4 font-bold text-white">{s.rollNo}</td>
                            <td className="px-5 py-4">
                              <span className="font-semibold text-slate-200 block">{s.name}</span>
                              <span className="text-[10px] text-slate-500">{s.email}</span>
                            </td>
                            <td className="px-5 py-4">{s.session || s.classLevel}</td>
                            <td className="px-5 py-4 text-slate-400">{s.currentPeriod}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${s.feeStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                                s.feeStatus === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-rose-500/10 text-rose-400'
                                }`}>{s.feeStatus}</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button onClick={() => handleDeleteStudent(s._id)} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="6" className="text-center py-12 text-slate-500">No students found matching filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION: ANNOUNCEMENTS
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'announcements' && (
              <div className="max-w-xl">
                <form onSubmit={handleAnnouncementSubmit} className="space-y-5 bg-darkCard border border-darkBorder p-6 rounded-2xl">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="subject">Subject Header</label>
                    <input type="text" id="subject" required value={announcement.subject}
                      onChange={(e) => setAnnouncement({ ...announcement, subject: e.target.value })}
                      placeholder="e.g. July Fee Deadline Extension"
                      className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none text-sm transition-all" />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="annbody">Announcement Body</label>
                    <textarea id="annbody" required rows="5" value={announcement.message}
                      onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                      placeholder="Provide details about dates, exceptions, or general notices..."
                      className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none text-sm transition-all resize-none" />
                  </div>
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brandPurple-600 to-brandPurple-500 hover:from-brandPurple-500 hover:to-brandPurple-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all">
                    <Send className="w-4 h-4" /> Publish Notice
                  </button>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION: COMMENTS
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'comments' && (
              comments.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-5">
                  {comments.map((c) => (
                    <div key={c._id} className="bg-darkCard border border-darkBorder p-5 rounded-2xl">
                      <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-darkBorder">
                        <div className="w-8 h-8 bg-brandTeal-500/20 text-brandTeal-400 rounded-full flex items-center justify-center font-bold text-xs uppercase">{c.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-white text-xs">{c.name}</p>
                          <p className="text-[10px] text-slate-500">{c.email}</p>
                        </div>
                        <span className="ml-auto text-[9px] text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic leading-relaxed">"{c.comment}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <MessageSquare className="w-14 h-14 text-slate-700 mb-4" />
                  <p className="text-slate-500 text-sm">No public comments yet.</p>
                </div>
              )
            )}

          </div>
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD STUDENT
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowAddStudent(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkBorder">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-6">Register New Student</h3>

            {groups.length === 0 && (
              <div className="mb-5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>No {groupLabel.toLowerCase()}s exist. <button onClick={() => { setShowAddStudent(false); setActiveTab('groups'); }} className="underline">Create one first.</button></span>
              </div>
            )}

            <form onSubmit={handleAddStudentSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {[['Full Name', 'name', 'text'], ['Father\'s Name', 'fatherName', 'text']].map(([label, field, type]) => (
                  <div key={field}>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">{label}</label>
                    <input type={type} required value={newStudent[field]} onChange={(e) => setNewStudent({ ...newStudent, [field]: e.target.value })}
                      className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-2.5 text-slate-100 outline-none text-xs transition-all" />
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[['Roll Number', 'rollNo', 'text'], ['Email Address', 'email', 'email'], ['CNIC / ID Card', 'idCard', 'text']].map(([label, field, type]) => (
                  <div key={field}>
                    <label className="block text-slate-300 text-xs font-semibold mb-1">{label}</label>
                    <input type={type} required value={newStudent[field]} onChange={(e) => setNewStudent({ ...newStudent, [field]: e.target.value })}
                      className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-2.5 text-slate-100 outline-none text-xs transition-all" />
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Date of Birth</label>
                  <input type="date" required value={newStudent.dob} onChange={(e) => setNewStudent({ ...newStudent, dob: e.target.value })}
                    className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-2.5 text-slate-100 outline-none text-xs transition-all" />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Gender</label>
                  <select value={newStudent.gender} onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                    className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-3 py-2.5 text-slate-100 outline-none text-xs transition-all">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">System Type</label>
                  <div className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold ${isSemester ? 'bg-brandTeal-500/5 border-brandTeal-500/20 text-brandTeal-400' : 'bg-brandPurple-500/5 border-brandPurple-500/20 text-brandPurple-400'}`}>
                    <Settings className="w-3.5 h-3.5 opacity-70" />
                    {isSemester ? 'University — Semester' : 'School — Annual'}
                    <span className="ml-auto text-[9px] text-slate-500">Locked</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">Assign to {groupLabel}</label>
                <select required value={isSemester ? newStudent.session : newStudent.classLevel}
                  onChange={(e) => setNewStudent({ ...newStudent, [isSemester ? 'session' : 'classLevel']: e.target.value })}
                  className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-2.5 text-slate-100 outline-none text-xs transition-all">
                  <option value="">— Select {groupLabel} —</option>
                  {groups.map((g) => <option key={g._id} value={g.name}>{g.name} · {g.currentPeriod}</option>)}
                </select>
                {groups.length > 0 && <p className="text-[10px] text-slate-500 mt-1">Inherits active {periodLabel.toLowerCase()} and due date from group.</p>}
              </div>
              <button type="submit" disabled={groups.length === 0}
                className="w-full bg-brandTeal-500 hover:bg-brandTeal-600 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-lg text-sm disabled:opacity-40 disabled:pointer-events-none">
                Register Student Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ADD GROUP
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowAddGroup(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkBorder">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Create {groupLabel}</h3>
            <p className="text-slate-400 text-xs mb-6">{isSemester ? 'e.g. 2023-2027, 2024-2028' : 'e.g. Class 8, Class 10'}</p>
            <form onSubmit={handleAddGroupSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">{groupLabel} Name</label>
                <input type="text" required value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder={isSemester ? 'e.g. 2023-2027' : 'e.g. Class 10'}
                  className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Initial {periodLabel}</label>
                <input type="text" value={newGroup.currentPeriod} onChange={(e) => setNewGroup({ ...newGroup, currentPeriod: e.target.value })}
                  placeholder={isSemester ? 'e.g. 1st Semester' : 'e.g. January 2026'}
                  className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Due Date</label>
                <input type="date" value={newGroup.dueDate} onChange={(e) => setNewGroup({ ...newGroup, dueDate: e.target.value })}
                  className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 outline-none text-sm transition-all" />
              </div>
              <button type="submit" className="w-full bg-brandTeal-500 hover:bg-brandTeal-600 text-slate-900 font-bold py-3.5 rounded-xl transition-all text-sm">Create {groupLabel}</button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ROLLOVER PERIOD
      ══════════════════════════════════════════════════════════════════════ */}
      {showRolloverModal && rolloverTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-8 max-w-md w-full relative">
            <button onClick={() => { setShowRolloverModal(false); setRolloverTarget(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkBorder">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Rollover {periodLabel}</h3>
            <p className="text-slate-400 text-xs mb-6">
              <span className="text-slate-200 font-semibold">{rolloverTarget.name}</span> · current: <span className="text-slate-200">{rolloverTarget.currentPeriod || '—'}</span>
            </p>
            <form onSubmit={handleRolloverSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">New {periodLabel} Label</label>
                <input type="text" required value={rolloverForm.currentPeriod} onChange={(e) => setRolloverForm({ ...rolloverForm, currentPeriod: e.target.value })}
                  placeholder={isSemester ? 'e.g. 4th Semester' : 'e.g. February 2026'}
                  className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 placeholder-slate-600 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">New Due Date</label>
                <input type="date" required value={rolloverForm.dueDate} onChange={(e) => setRolloverForm({ ...rolloverForm, dueDate: e.target.value })}
                  className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3.5 text-slate-100 outline-none text-sm transition-all" />
              </div>
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 text-xs text-rose-400">
                ⚠ Resets <strong>{rolloverTarget.studentCount}</strong> student(s) to unpaid for the new {periodLabel.toLowerCase()}.
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-brandTeal-600 to-brandTeal-500 hover:from-brandTeal-500 hover:to-brandTeal-600 text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Execute Rollover
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: REJECT REASON
      ══════════════════════════════════════════════════════════════════════ */}
      {showRejectModal && selectedChallan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-darkCard border border-darkBorder rounded-3xl p-6 max-w-md w-full relative">
            <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedChallan(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-darkBorder">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-2">Reject Fee Challan</h3>
            <p className="text-slate-400 text-xs mb-4">This reason will appear on the student's dashboard.</p>
            <textarea required rows="4" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete image, incorrect amount, or blurry receipt."
              className="w-full bg-[#0b101c] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 outline-none text-xs transition-all resize-none mb-5" />
            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedChallan(null); }}
                className="flex-1 border border-darkBorder hover:border-slate-600 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-all">Cancel</button>
              <button onClick={() => handleVerify(selectedChallan._id, 'reject', rejectReason)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL: ZOOM RECEIPT
      ══════════════════════════════════════════════════════════════════════ */}
      {zoomReceipt && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6 cursor-zoom-out" onClick={() => setZoomReceipt(null)}>
          <div className="max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-xl border border-white/10">
            <img src={zoomReceipt} alt="Receipt zoomed" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
