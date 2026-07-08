import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Shield, Sparkles, BookOpen, Clock, Send, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  const [comments, setComments] = useState([]);
  const [feedback, setFeedback] = useState({ name: '', email: '', comment: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get('/api/messages/feedback');
        if (res.data.success) {
          setComments(res.data.data.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };
    fetchComments();
  }, []);

  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const res = await axios.post('/api/messages/feedback', feedback);
      if (res.data.success) {
        setSuccess(true);
        setComments([res.data.data, ...comments].slice(0, 3));
        setFeedback({ name: '', email: '', comment: '' });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-brandTeal-500 selection:text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b border-darkBorder bg-[#090d16]/75 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wide">
              SmartPay
            </span>
            <span className="text-xs bg-darkBorder px-2 py-0.5 rounded-full text-slate-400 font-medium">FMS v2</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/student/login" className="text-slate-300 hover:text-slate-100 font-medium px-4 py-2 transition-all">
              Student Login
            </Link>
            <Link to="/admin/login" className="bg-gradient-to-r from-brandTeal-600 to-brandTeal-500 hover:from-brandTeal-500 hover:to-brandTeal-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-brandTeal-500/10 hover:shadow-brandTeal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              Admin Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden py-24 md:py-32">
          {/* Background Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brandTeal-500/10 blur-[128px] rounded-full -z-10"></div>
          <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brandPurple-500/10 blur-[128px] rounded-full -z-10"></div>

          <div className="max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center space-x-1 bg-brandTeal-500/10 border border-brandTeal-500/20 px-3 py-1.5 rounded-full text-brandTeal-500 text-xs font-semibold tracking-wide uppercase mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enhanced Fee Management System</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold font-sans tracking-tight leading-tight text-white mb-6">
              A Unified Billing Platform For <br />
              <span className="bg-gradient-to-r from-brandTeal-500 to-brandPurple-500 bg-clip-text text-transparent">
                Universities & Schools
              </span>
            </h1>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Transition seamlessly between semester-based sessions and annual monthly cycles. Verifying and auditing academic fee receipts has never been this simple, secure, and gorgeous.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/student/login" className="w-full sm:w-auto bg-gradient-to-r from-brandPurple-600 to-brandPurple-500 hover:from-brandPurple-500 hover:to-brandPurple-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-brandPurple-500/10 hover:shadow-brandPurple-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-center">
                Student Access
              </Link>
              <Link to="/admin/login" className="w-full sm:w-auto bg-darkCard border border-darkBorder hover:border-slate-700 text-slate-200 font-bold px-8 py-4 rounded-xl hover:bg-slate-800 transition-all text-center">
                Admin Panel
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 border-t border-darkBorder bg-[#0b101c]/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Powerful Features</h2>
              <p className="text-slate-400 max-w-xl mx-auto">Engineered to support both higher education institutions and primary schools out-of-the-box.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#131b2e] border border-darkBorder hover:border-slate-700 p-8 rounded-2xl transition-all hover:scale-[1.01] relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brandTeal-500/5 blur-2xl rounded-full group-hover:bg-brandTeal-500/10 transition-all"></div>
                <div className="bg-brandTeal-500/10 border border-brandTeal-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-brandTeal-500 mb-6">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Dual-Mode Billing</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Support semester-based structures (e.g. 1st, 2nd Semester) for universities, and monthly classes (e.g. January, February) for school models.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#131b2e] border border-darkBorder hover:border-slate-700 p-8 rounded-2xl transition-all hover:scale-[1.01] relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple-500/5 blur-2xl rounded-full group-hover:bg-brandPurple-500/10 transition-all"></div>
                <div className="bg-brandPurple-500/10 border border-brandPurple-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-brandPurple-500 mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Auditable Verification</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Students upload screenshots or PDF copies of receipts. Admins audit vouchers via zoomed lightboxes to verify authenticity in seconds.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#131b2e] border border-darkBorder hover:border-slate-700 p-8 rounded-2xl transition-all hover:scale-[1.01] relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brandTeal-500/5 blur-2xl rounded-full group-hover:bg-brandTeal-500/10 transition-all"></div>
                <div className="bg-brandTeal-500/10 border border-brandTeal-500/20 w-12 h-12 flex items-center justify-center rounded-xl text-brandTeal-500 mb-6">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Auto Status Reset</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bulk rollover classes or sessions into new months or semesters, resetting dues dates and fee statuses instantly to unpaid.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment Testimonials Slider */}
        <section className="py-20 border-t border-darkBorder bg-[#090d16]">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">User Testimonials</h2>
              <p className="text-slate-400">See what coordinators and administrators are saying.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c._id} className="bg-darkCard/50 border border-darkBorder p-6 rounded-2xl shadow-md">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-brandTeal-500/20 rounded-full flex items-center justify-center text-brandTeal-500 font-bold uppercase">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{c.name}</h4>
                        <span className="text-slate-400 text-xs">{c.email}</span>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed italic">"{c.comment}"</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-slate-500 flex flex-col items-center">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p>No feedback comments added yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 border-t border-darkBorder bg-[#0b101c]/30">
          <div className="max-w-xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Leave Feedback</h2>
              <p className="text-slate-400">Submit your remarks or query, and it will be visible to administrators.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-darkCard/30 p-8 rounded-3xl border border-darkBorder">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={feedback.name}
                  onChange={handleChange}
                  required
                  placeholder="Your Name"
                  className="w-full bg-[#131b2e] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={feedback.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@domain.com"
                  className="w-full bg-[#131b2e] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2" htmlFor="comment">Message</label>
                <textarea
                  name="comment"
                  id="comment"
                  rows="4"
                  value={feedback.comment}
                  onChange={handleChange}
                  required
                  placeholder="Share your thoughts about this system..."
                  className="w-full bg-[#131b2e] border border-darkBorder focus:border-brandTeal-500 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-sm">
                  Thank you! Your feedback has been submitted successfully.
                </div>
              )}

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-brandTeal-600 to-brandTeal-500 hover:from-brandTeal-500 hover:to-brandTeal-600 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-darkBorder bg-[#090d16] py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} SmartPay Fee Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
