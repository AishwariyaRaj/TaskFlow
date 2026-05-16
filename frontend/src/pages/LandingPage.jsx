import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Zap, Bot, Lock, BarChart3, Users, Cloud, 
  ChevronRight, Play, CheckCircle2, MessageSquare, 
  Calendar, LayoutPanelLeft, Workflow, Bell, 
  ArrowRight, Share2, Menu, X, Sparkles, Activity, Layers, Globe, CreditCard
} from "lucide-react";
import "../styles/landing.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={isScrolled ? "fixed top-0 w-full z-[100] transition-all duration-300 py-4 glass border-b" : "fixed top-0 w-full z-[100] transition-all duration-300 py-6 bg-transparent"}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
            T
          </div>
          <span className="text-2xl font-black font-jakarta tracking-tight text-white">TaskFlow</span>
        </Link>
        
        <div className="hidden lg:flex items-center gap-8 text-sm text-gray-400 font-medium font-jakarta uppercase tracking-wider">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
          <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/login" className="px-6 py-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="bg-white text-black hover:bg-indigo-50 px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-white/5 transition-all">GET STARTED</Link>
        </div>

        <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-full left-0 w-full glass border-b p-6 flex flex-col gap-6 lg:hidden bg-black/95">
            <a href="#features" className="text-lg font-medium text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-lg font-medium text-white" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <Link to="/login" className="text-center font-bold text-lg text-white">Login</Link>
            <Link to="/register" className="bg-indigo-600 py-4 rounded-xl text-center font-bold text-lg text-white">Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, delay, color, image, highlight }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }} viewport={{ once: true }} whileHover={{ y: -10 }} className="glass p-10 rounded-[40px] group relative overflow-hidden flex flex-col h-full border border-white/5">
    <div className={"w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform " + (color === "indigo" ? "bg-indigo-500/10 text-indigo-500" : (color === "purple" ? "bg-purple-500/10 text-purple-500" : "bg-cyan-500/10 text-cyan-500"))}>
      <Icon size={28} />
    </div>
    <h3 className="text-3xl font-black mb-4 font-jakarta text-white tracking-tighter italic">{title}</h3>
    <p className="text-gray-400 font-medium leading-relaxed mb-10 flex-grow">{desc}</p>
    
    {image && (
        <div className="relative rounded-2xl overflow-hidden h-40 border border-white/5 bg-black/40">
          <img src={image} alt={title} className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity" />
        </div>
      )}
      
      {highlight && (
        <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 font-mono text-[11px] text-indigo-400">
          {highlight}
        </div>
      )}
  </motion.div>
);

const Step = ({ num, title, text }) => (
  <div className="flex gap-8 group">
    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black text-lg z-10 group-hover:scale-110 transition-transform">
      {num}
    </div>
    <div className="group-hover:translate-x-2 transition-transform">
      <h4 className="text-2xl font-black mb-2 tracking-tighter italic text-white">{title}</h4>
      <p className="text-gray-500 font-medium tracking-wide">{text}</p>
    </div>
  </div>
);

const PricingCard = ({ plan, price, features, recommended, delay }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay }} viewport={{ once: true }} className={recommended ? "p-12 rounded-[40px] flex flex-col glass border-2 border-indigo-500 shadow-2xl shadow-indigo-500/10 relative scale-105 z-10" : "p-12 rounded-[40px] flex flex-col glass border border-white/5"}>
    {recommended && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Recommended</div>}
    <h4 className="text-gray-500 font-black uppercase tracking-widest text-xs mb-2">{plan}</h4>
    <div className="flex items-baseline gap-1 mb-10">
      <span className="text-6xl font-black font-jakarta text-white tracking-tighter">{price === "0" ? "Free" : `$${price}`}</span>
      {price !== "0" && <span className="text-gray-500 text-sm font-bold">/mo</span>}
    </div>
    <div className="space-y-5 mb-12 flex-grow">
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-400">
          <CheckCircle2 size={16} className="text-indigo-500" />
          {f}
        </div>
      ))}
    </div>
    <Link to="/register" className={recommended ? "w-full py-5 rounded-2xl font-black text-center bg-indigo-600 hover:bg-indigo-500 transition-all font-jakarta uppercase tracking-widest text-xs text-white" : "w-full py-5 rounded-2xl font-black text-center glass hover:bg-white/5 transition-all font-jakarta uppercase tracking-widest text-xs text-white"}>{price === "0" ? "GET STARTED" : "UPGRADE NOW"}</Link>
  </motion.div>
);

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-[#030303] text-white min-h-screen selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Navbar />
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 z-[110] origin-left" style={{ scaleX }} />

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-6 overflow-hidden min-h-screen flex items-center">
        {/* Ambient background orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-10">
            <Sparkles size={14} /> AI-Powered Workspace v2.0
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-[120px] font-black font-jakarta leading-[0.9] tracking-tighter mb-10 text-white">
            MANAGE PROJECTS <br />
            <span className="text-gradient">AUTOMATE FLOW </span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-3xl mx-auto text-gray-400 text-lg md:text-2xl mb-14 font-medium leading-relaxed">
            The modern SaaS platform for high-performance teams. 
            Organize work, automate chores, and ship faster with Neural intelligence.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <Link to="/register" className="group bg-indigo-600 hover:bg-indigo-500 px-10 py-5 rounded-2xl font-black text-sm tracking-widest flex items-center gap-3 transition-all shadow-2xl shadow-indigo-600/30 text-white">
              START FREE TRIAL <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="glass px-10 py-5 rounded-2xl font-black text-sm tracking-widest flex items-center gap-3 hover:bg-white/5 transition-all text-white border border-white/10 uppercase">
              WATCH DEMO <Play size={18} fill="white" />
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
             {[
               { icon: Zap, label: "Real-Time" },
               { icon: Bot, label: "Neural AI" },
               { icon: Lock, label: "AES-256" },
               { icon: CreditCard, label: "Stripe" },
               { icon: Cloud, label: "Cloud Sync" },
               { icon: BarChart3, label: "Insights" }
             ].map((f, i) => (
               <div key={i} className="glass p-4 rounded-2xl flex flex-col items-center gap-3 border border-white/5 group hover:border-indigo-500/30 transition-all">
                 <f.icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">{f.label}</span>
               </div>
             ))}
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01] relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] mb-12">Building the future with</p>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale contrast-125">
             <div className="text-2xl font-black italic tracking-tighter">REACT</div>
             <div className="text-2xl font-black italic tracking-tighter">NODE.JS</div>
             <div className="text-2xl font-black italic tracking-tighter">TAILWIND</div>
             <div className="text-2xl font-black italic tracking-tighter">STRIPE</div>
             <div className="text-2xl font-black italic tracking-tighter">MONGODB</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-32 text-center">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 italic text-white uppercase">Engineered for <br/><span className="text-gradient">Peak Performance.</span></h2>
            <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">Ditch the legacy tools. TaskFlow is built with modern tech for modern speed.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Activity} 
              title="Real-Time Sync" 
              color="indigo" 
              delay={0.1} 
              desc="Collaborate instantly with 0ms latency. Updates push to all devices in milliseconds." 
              image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
            />
            <FeatureCard 
              icon={Layers} 
              title="Neural AI Assistant" 
              color="purple" 
              delay={0.2} 
              desc="Automate task creation, summarize meetings, and predict bottlenecks before they happen." 
              image="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
              highlight='"Predict Sprint 4 Velocity"'
            />
            <FeatureCard 
              icon={Globe} 
              title="Global Scale" 
              color="cyan" 
              delay={0.3} 
              desc="Deploy workspaces across regions. Enterprise-grade security out of the box." 
              image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80"
            />
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-40 px-6 bg-black relative z-10 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-20 items-center">
          <div className="flex-1">
            <h2 className="text-5xl font-black tracking-tighter mb-12 italic text-white">SET UP IN <br/>SECONDS.</h2>
            <div className="space-y-12 relative">
              <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-bottom from-indigo-500 to-transparent" />
              <Step num="1" title="Create Workspace" text="Launch your command center in one click." />
              <Step num="2" title="Invite The Crew" text="Sync your team across time zones instantly." />
              <Step num="3" title="Ship Faster" text="Let the AI handle the chores while you code." />
            </div>
          </div>
          <div className="flex-1 glass rounded-[40px] p-2 aspect-video relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
             <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="bg-[#0a0a0a] w-full h-full rounded-[32px] p-6 flex items-center justify-center">
                <Play size={80} className="text-indigo-500/20 group-hover:text-indigo-500 transition-all duration-500 group-hover:scale-110" />
             </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-40 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-24">
             <h2 className="text-4xl md:text-6xl font-black font-jakarta mb-6 text-white uppercase italic">Flexible Pricing</h2>
             <p className="text-gray-500 text-lg">Scalable plans for every stage of growth.</p>
           </div>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard plan="Free" price="0" features={["5 Projects", "Basic Flow", "Discord Support"]} delay={0.1} />
            <PricingCard plan="Pro" price="19" recommended={true} features={["Unlimited Projects", "AI Assistant", "Deep Analytics", "Priority Support"]} delay={0.2} />
            <PricingCard plan="Team" price="49" features={["Everything in Pro", "Audit Logs", "API Access", "SSO Security"]} delay={0.3} />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-64 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div whileInView={{ scale: [0.95, 1], opacity: [0, 1] }} className="glass p-24 rounded-[60px] border-indigo-500/20 shadow-2xl shadow-indigo-600/10">
            <h2 className="text-6xl font-black tracking-tighter mb-10 italic uppercase text-white">Ready to Transform?</h2>
            <p className="text-gray-400 text-xl mb-14 font-medium">Join 2,000+ teams shipping better software.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-8">
              <Link to="/register" className="bg-white text-black px-12 py-6 rounded-2xl font-black text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5">
                START FREE TRIAL
              </Link>
              <div className="flex flex-col justify-center text-left gap-1">
                 <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">No credit card required</div>
                 <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">14-Day Pro access included</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5 bg-black relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-5 gap-20">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg">T</div>
               <span className="text-2xl font-black tracking-tighter text-white">TaskFlow</span>
            </div>
            <p className="text-gray-600 text-sm max-w-sm leading-relaxed font-medium">
              The high-performance workspace designed for modern engineering teams and visionaries. 
              Built for speed, styled for impact.
            </p>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8">Platform</h5>
            <ul className="space-y-4 text-xs font-bold text-gray-600">
               <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
               <li><a href="#" className="hover:text-white transition-colors">AI Core</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8">Company</h5>
            <ul className="space-y-4 text-xs font-bold text-gray-600">
               <li><a href="#" className="hover:text-white transition-colors">About</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-[10px] uppercase tracking-[0.3em] font-black text-gray-400 mb-8">Social</h5>
            <ul className="space-y-4 text-xs font-bold text-gray-600">
               <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
               <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
               <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="text-[10px] font-black text-gray-800 tracking-[0.5em] uppercase">TASKFLOW OS © 2026</div>
           <div className="flex gap-10 text-[10px] font-black text-gray-800 tracking-[0.2em] uppercase">
             <a href="#">Security</a>
             <a href="#">Privacy</a>
             <a href="#">Terms</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
