import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Grid & Accents */}
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto backdrop-blur-xl border-b border-slate-800/50 sticky top-0 mt-2 rounded-2xl bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">TaskFlow</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-indigo-600/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto text-center border-b border-slate-800/30">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[13px] font-semibold mb-8 animate-fade-in shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
          Revolutionizing team production
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.95]">
          Built for teams <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-500">that move fast.</span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          TaskFlow is a comprehensive project management suite designed to eliminate fragmented workflows. We combine task tracking, automation, and real-time collaboration into one lightning-fast interface.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto mb-16">
          <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
            Build your workspace
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600/10 text-indigo-400 font-bold rounded-xl border border-indigo-500/20 hover:bg-indigo-500/20 transition-all">
            Join Waitlist
          </button>
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold rounded-xl border border-slate-800 hover:border-slate-700 transition-all font-medium">
            View Live Demo
          </Link>
        </div>
      </header>

      {/* Detailed Features Section */}
      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Execution meets intelligence.</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We've spent thousands of hours perfecting the core features that drive high-performance teams, removing every bit of friction in the process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Visual Kanban Engine",
              desc: "Manage task lifecycles with a fluid, drag-and-drop interface. Customize columns to match your team's specific workflow—from design to deployment.",
              icon: "📊"
            },
            {
              title: "Multi-Tenant Workspaces",
              desc: "Isolate your projects securely. Each workspace is a dedicated environment with its own members, permissions, and specialized configurations.",
              icon: "🏢"
            },
            {
              title: "Real-time Operations",
              desc: "Never refresh your browser again. State updates propagate instantly across all connected team members through our low-latency websocket core.",
              icon: "⚡"
            },
            {
              title: "Granular Security (RBAC)",
              desc: "Control access at every level. Define specific roles for owners, admins, and members to ensure sensitive project data stays in the right hands.",
              icon: "🛡️"
            },
            {
              title: "Smart Notifications",
              desc: "Stay updated without the noise. Our intelligent notification system filters updates based on your involvement and delivery preferences.",
              icon: "🔔"
            },
            {
              title: "Project Analytics",
              desc: "Turn your team's output into actionable data. Track progress, velocity, and task completion rates with our built-in visualization tools.",
              icon: "📈"
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-32 bg-slate-900/40 border-y border-slate-800/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="space-y-12">
                {[
                  { step: "01", title: "Create Your Workspace", desc: "Start by defining your organization. Set up a secure workspace and invite your core team members via email." },
                  { step: "02", title: "Scale with Projects", desc: "Break down your goals into actionable projects. Create boards, set milestones, and define custom automation rules." },
                  { step: "03", title: "Execute with Clarity", desc: "Assign tasks, track time, and communicate within task threads. Monitor everything from a unified dashboard." }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6 group">
                    <span className="text-3xl font-black text-indigo-500/40 group-hover:text-indigo-400 transition-colors">{s.step}</span>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{s.title}</h4>
                      <p className="text-slate-400 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Simple process, <br/> powerful results.</h2>
              <p className="text-lg text-slate-400 mb-10 leading-relaxed">
                We believe that complex tools don't have to be complicated. TaskFlow's onboarding is designed to get your team productive within minutes, not weeks of training.
              </p>
              <div className="inline-block p-1 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500">
                <div className="px-8 py-4 bg-slate-950 rounded-lg text-white font-bold flex items-center gap-3">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  Currently used by 100+ hyper-growth teams
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Tasks Completed", value: "2M+" },
            { label: "Active Teams", value: "500+" },
            { label: "Uptime", value: "99.9%" },
            { label: "User Rating", value: "4.9/5" }
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">T</div>
              <span className="font-bold text-xl text-white">TaskFlow</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              The engineered approach to project management. We provide the architecture for high-velocity teams to focus on building, not managing.
            </p>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold mb-6 text-sm">PRODUCT</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-400 transition-all">Features</a>
              <a href="#" className="hover:text-indigo-400 transition-all">Automation</a>
              <a href="#" className="hover:text-indigo-400 transition-all">Integrations</a>
              <a href="#" className="hover:text-indigo-400 transition-all">Changelog</a>
            </div>
          </div>
          <div>
            <h4 className="text-slate-200 font-bold mb-6 text-sm">COMPANY</h4>
            <div className="flex flex-col gap-4 text-sm text-slate-500">
              <a href="#" className="hover:text-indigo-400 transition-all">About Us</a>
              <a href="#" className="hover:text-indigo-400 transition-all">Security</a>
              <a href="#" className="hover:text-indigo-400 transition-all">Privacy Policy</a>
              <a href="#" className="hover:text-indigo-400 transition-all">Status</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-slate-600 text-xs tracking-widest uppercase gap-4">
          <p>&copy; {new Date().getFullYear()} TaskFlow Inc. Precision built.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors underline underline-offset-4 decoration-indigo-500/50">Terms</a>
            <a href="#" className="hover:text-white transition-colors underline underline-offset-4 decoration-indigo-500/50">Privacy</a>
            <a href="#" className="hover:text-white transition-colors underline underline-offset-4 decoration-indigo-500/50">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
