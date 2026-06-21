import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Bot, Lock, BarChart3, Users, Shield,
  ArrowRight, CheckCircle2, Play, Sparkles,
  Activity, Workflow, CreditCard, GitBranch,
  Menu, X, Star, ChevronRight, Globe, Cpu,
  LayoutDashboard, Calendar, Bell, TrendingUp,
} from "lucide-react";
import "../styles/landing.css";

const up = (d = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay: d, ease: [0.22, 1, 0.36, 1] },
});

/* ── Navbar ── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`nav ${scrolled ? "nav-solid" : ""}`}>
      <div className="nav-inner">
        <Link to="/" className="logo">
          <div className="logo-icon"><Zap size={18} /></div>
          <span className="logo-text">TaskFlow</span>
        </Link>
        <div className="nav-links">
          {["features","workflow","pricing"].map(l => (
            <a key={l} href={`#${l}`} className="nav-a">{l.charAt(0).toUpperCase()+l.slice(1)}</a>
          ))}
        </div>
        <div className="nav-ctas">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register" className="btn-primary btn-sm">Get Started <ChevronRight size={13}/></Link>
        </div>
        <button className="hamburger" onClick={() => setOpen(!open)}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} className="mobile-menu">
            {["features","workflow","pricing"].map(l => (
              <a key={l} href={`#${l}`} className="mobile-a" onClick={() => setOpen(false)}>{l.charAt(0).toUpperCase()+l.slice(1)}</a>
            ))}
            <Link to="/login" className="btn-ghost" onClick={() => setOpen(false)}>Sign in</Link>
            <Link to="/register" className="btn-primary" onClick={() => setOpen(false)} style={{textAlign:"center",padding:".85rem"}}>Get Started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="hero">
      <div className="hero-orb hero-orb1" />
      <div className="hero-orb hero-orb2" />
      <div className="hero-orb hero-orb3" />
      <div className="hero-grid" />
      <div className="hero-inner">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.6}} className="hero-badge">
          <Sparkles size={13}/>
          <span>AI-Powered Workspace · v2.0</span>
          <span className="badge-live"><span className="live-dot"/>Live</span>
        </motion.div>
        <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.1}} className="hero-title">
          Manage Projects.<br/>
          <span className="grad-text">Ship Faster.</span>
        </motion.h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.2}} className="hero-sub">
          TaskFlow is the all-in-one SaaS platform that brings Kanban boards, real-time collaboration, 
          AI automation, and Stripe billing into a single blazing-fast workspace.
        </motion.p>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.3}} className="hero-ctas">
          <Link to="/register" className="btn-primary btn-lg btn-glow" id="hero-start">
            Start for free <ArrowRight size={17} className="arrow"/>
          </Link>
          <button className="btn-outline btn-lg" id="hero-demo">
            <Play size={15} fill="currentColor"/> Watch demo
          </button>
        </motion.div>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}} className="hero-trust">
          {["No credit card","14-day Pro trial","Cancel anytime","SOC 2 Compliant"].map(t=>(
            <span key={t} className="trust-pill"><CheckCircle2 size={13}/>{t}</span>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.9,delay:.4}} className="mockup-wrap">
          <div className="mockup-topbar">
            <span className="dot red"/><span className="dot yellow"/><span className="dot green"/>
            <span className="mockup-url">app.taskflow.io/workspace/sprint-4</span>
          </div>
          <div className="mockup-body">
            {/* Sidebar */}
            <div className="mock-sidebar">
              <div className="mock-brand"><Zap size={14}/></div>
              {[LayoutDashboard, GitBranch, BarChart3, Calendar, Bell, Users].map((Icon,i)=>(
                <div key={i} className={`mock-icon ${i===0?"mock-icon-active":""}`}><Icon size={14}/></div>
              ))}
            </div>
            {/* Content */}
            <div className="mock-content">
              <div className="mock-toprow">
                <div>
                  <div className="mock-h">Sprint 4 — Q3 Launch 🚀</div>
                  <div className="mock-meta">12 tasks · 4 members · Due Jul 15</div>
                </div>
                <div className="mock-tags">
                  <span className="tag tag-green">On Track</span>
                  <span className="tag tag-purple">AI Active</span>
                </div>
              </div>
              <div className="mock-board">
                {[
                  {label:"To Do",color:"#818cf8",cards:[{t:"Design system tokens",u:"AS"},{t:"Setup CI/CD pipeline",u:"MR"},{t:"API rate limiting",u:"PK"}]},
                  {label:"In Progress",color:"#a78bfa",cards:[{t:"Auth middleware",u:"AS"},{t:"Kanban drag & drop",u:"LW"}]},
                  {label:"Done",color:"#34d399",cards:[{t:"DB schema v2",u:"MR"},{t:"Stripe webhooks",u:"AS"},{t:"Unit tests",u:"PK"}]},
                ].map(col=>(
                  <div key={col.label} className="board-col">
                    <div className="col-header" style={{color:col.color}}>
                      <span className="col-dot" style={{background:col.color}}/>
                      {col.label} <span className="col-count">{col.cards.length}</span>
                    </div>
                    {col.cards.map(c=>(
                      <div key={c.t} className="board-card">
                        <div className="card-title">{c.t}</div>
                        <div className="card-meta">
                          <span className="card-priority">High</span>
                          <div className="card-avatar">{c.u}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Tech strip ── */
function TechStrip() {
  return (
    <div className="tech-strip">
      <p className="tech-label">Trusted stack powering 2,000+ teams</p>
      <div className="tech-logos">
        {["React 18","Node.js","MongoDB","Socket.io","Stripe","Redis","Docker"].map(t=>(
          <span key={t} className="tech-logo">{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Features ── */
const FEATURES = [
  {icon:Activity,title:"Real-Time Collaboration",desc:"Sub-100ms updates powered by Socket.io. Every card move, comment, and status change syncs instantly across every device.",color:"indigo",big:true},
  {icon:Bot,title:"Neural AI Assistant",desc:"Auto-generates tasks from meeting notes, predicts sprint velocity, and surfaces blockers before they slow you down.",color:"purple",big:false},
  {icon:Shield,title:"Enterprise Security",desc:"AES-256 encryption at rest, TLS in transit, granular RBAC, audit logs, and SOC 2 Type II compliance.",color:"cyan",big:false},
  {icon:BarChart3,title:"Deep Analytics",desc:"Live burndown charts, velocity tracking, cycle time, and custom KPI dashboards with exportable reports.",color:"purple",big:false},
  {icon:Calendar,title:"Multi-View Boards",desc:"Switch seamlessly between Kanban, List, and Calendar views. Visualize work the way your team thinks — no extra setup needed.",color:"indigo",big:false},
  {icon:Workflow,title:"Smart Automations",desc:"Build powerful no-code rules — auto-assign tasks, send Slack alerts, move cards, and more with zero manual effort.",color:"indigo",big:true},
  {icon:CreditCard,title:"Stripe Billing Built-in",desc:"Tiered subscriptions, seat-based pricing, webhook sync, proration, and in-app upgrade flows out of the box.",color:"cyan",big:false},
];

const C = {
  indigo:{bg:"rgba(99,102,241,.12)",text:"#818cf8",glow:"rgba(99,102,241,.25)",border:"rgba(99,102,241,.25)"},
  purple:{bg:"rgba(168,85,247,.12)",text:"#c084fc",glow:"rgba(168,85,247,.25)",border:"rgba(168,85,247,.25)"},
  cyan:  {bg:"rgba(34,211,238,.1)", text:"#22d3ee",glow:"rgba(34,211,238,.2)", border:"rgba(34,211,238,.2)"},
};

function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <motion.div {...up()} className="section-head">
          <div className="section-badge"><TrendingUp size={12}/>Features</div>
          <h2 className="section-title">Everything your team needs,<br/><span className="grad-text">nothing you don't.</span></h2>
          <p className="section-sub">One platform to replace Jira, Notion, Slack bots, and billing dashboards.</p>
        </motion.div>
        <div className="bento-grid">
          {FEATURES.map(({icon:Icon,title,desc,color,big},i)=>{
            const c=C[color];
            return (
              <motion.div key={title} {...up(i*0.07)} className={`bento-card ${big?"bento-big":""}`}
                style={{"--accent":c.text,"--border":c.border,"--glow":c.glow}}
                whileHover={{y:-6,transition:{duration:.2}}}
              >
                <div className="bento-icon" style={{background:c.bg,color:c.text}}><Icon size={22}/></div>
                <h3 className="bento-title">{title}</h3>
                <p className="bento-desc">{desc}</p>
                <div className="bento-shine"/>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
function Stats() {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {[{v:"2K+",l:"Teams worldwide"},{v:"10M+",l:"Tasks shipped"},{v:"99.9%",l:"Uptime SLA"},{v:"<80ms",l:"Real-time latency"}].map(({v,l})=>(
            <motion.div key={l} {...up()} className="stat-card">
              <span className="stat-val">{v}</span>
              <span className="stat-lbl">{l}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Workflow ── */
const STEPS = [
  {icon:Users,      title:"Create your workspace",  desc:"Spin up a team workspace in 30 seconds. Invite members, set roles (Owner, Admin, Member, Guest), and configure your settings."},
  {icon:GitBranch,  title:"Build & organize projects",desc:"Use Kanban, List, or Calendar view. Create tasks, set priorities, assign owners, add due dates, and attach files effortlessly."},
  {icon:Bot,        title:"Automate repetitive work", desc:"Define rules like \"When task moves to Done → notify Slack\". Let the AI assistant draft task descriptions and estimate effort."},
  {icon:BarChart3,  title:"Measure & ship faster",    desc:"Track your team's velocity with live dashboards. Hit sprint goals, celebrate wins, and continuously improve your process."},
];

function WorkflowSection() {
  return (
    <section id="workflow" className="section workflow-section">
      <div className="container">
        <div className="workflow-layout">
          <motion.div {...up()} className="workflow-left">
            <div className="section-badge"><Cpu size={12}/>How It Works</div>
            <h2 className="section-title" style={{textAlign:"left"}}>From zero to<br/><span className="grad-text">shipping in minutes.</span></h2>
            <p className="section-sub" style={{textAlign:"left",margin:"0 0 2rem"}}>No onboarding calls. No consultants. Just open TaskFlow and go.</p>
            <Link to="/register" className="btn-primary btn-lg">Start free today <ArrowRight size={16}/></Link>
          </motion.div>
          <div className="steps">
            {STEPS.map(({icon:Icon,title,desc},i)=>(
              <motion.div key={title} {...up(i*0.1)} className="step">
                <div className="step-left">
                  <div className="step-num">{i+1}</div>
                  {i<STEPS.length-1 && <div className="step-line"/>}
                </div>
                <div className="step-body">
                  <div className="step-icon-wrap"><Icon size={16}/></div>
                  <h4 className="step-title">{title}</h4>
                  <p className="step-desc">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const TESTI = [
  {q:"TaskFlow cut our sprint planning time by 60%. The AI task suggestions are genuinely impressive.",name:"Priya Sharma",role:"Engineering Lead · Zeta Corp",init:"P"},
  {q:"We migrated from Jira in a single weekend. The Kanban board is buttery smooth and our team actually enjoys using it.",name:"Marcus Webb",role:"CTO · Launchpad AI",init:"M"},
  {q:"Finally a tool that feels like it was designed this decade. Fast, clean, and insanely powerful under the hood.",name:"Aiko Tanaka",role:"Product Manager · Flux Systems",init:"A"},
];

function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <motion.div {...up()} className="section-head">
          <div className="section-badge"><Star size={12}/>Testimonials</div>
          <h2 className="section-title">Loved by <span className="grad-text">high-performance teams.</span></h2>
        </motion.div>
        <div className="testi-grid">
          {TESTI.map(({q,name,role,init},i)=>(
            <motion.div key={name} {...up(i*0.1)} className="testi-card" whileHover={{y:-5,transition:{duration:.2}}}>
              <div className="testi-stars">{Array(5).fill(0).map((_,si)=><Star key={si} size={14} fill="#f59e0b" color="#f59e0b"/>)}</div>
              <p className="testi-q">"{q}"</p>
              <div className="testi-author">
                <div className="testi-avatar">{init}</div>
                <div><div className="testi-name">{name}</div><div className="testi-role">{role}</div></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
const PLANS = [
  {name:"Free",   price:"0",  period:"",    desc:"Perfect for solo builders and side projects.",
   feats:["3 projects","5 team members","Basic Kanban board","1 GB storage","Discord support"],cta:"Get started free",hi:false},
  {name:"Pro",    price:"19", period:"/mo", desc:"For fast-moving teams that need the full toolkit.",
   feats:["Unlimited projects","Unlimited members","AI assistant","Advanced analytics","10 GB storage","Custom automations","Priority support"],cta:"Start 14-day trial",hi:true},
  {name:"Team",   price:"49", period:"/mo", desc:"For enterprises that demand control and compliance.",
   feats:["Everything in Pro","SSO & SAML login","Audit logs","REST API access","100 GB storage","Dedicated SLA","Custom roles & RBAC"],cta:"Contact sales",hi:false},
];

function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="container">
        <motion.div {...up()} className="section-head">
          <div className="section-badge"><CreditCard size={12}/>Pricing</div>
          <h2 className="section-title">Simple, <span className="grad-text">transparent pricing.</span></h2>
          <p className="section-sub">No hidden fees. No contracts. Upgrade, downgrade, or cancel anytime.</p>
        </motion.div>
        <div className="price-grid">
          {PLANS.map(({name,price,period,desc,feats,cta,hi},i)=>(
            <motion.div key={name} {...up(i*0.1)} className={`price-card ${hi?"price-card-hi":""}`}>
              {hi && <div className="price-badge"><Sparkles size={11}/>Most Popular</div>}
              <div className="price-name">{name}</div>
              <div className="price-amount">
                <span className="price-num">{price==="0"?"Free":`$${price}`}</span>
                <span className="price-per">{period}</span>
              </div>
              <p className="price-desc">{desc}</p>
              <ul className="price-feats">
                {feats.map(f=><li key={f}><CheckCircle2 size={14}/>{f}</li>)}
              </ul>
              <Link to="/register" className={hi?"btn-primary btn-full":"btn-outline btn-full"}>{cta}</Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <motion.div {...up()} className="cta-card">
          <div className="cta-orb cta-orb1"/><div className="cta-orb cta-orb2"/>
          <div className="cta-inner">
            <div className="section-badge" style={{margin:"0 auto 1.5rem"}}><Sparkles size={12}/>Limited Beta</div>
            <h2 className="cta-title">Ready to transform<br/>how your team works?</h2>
            <p className="cta-sub">Join 2,000+ engineering teams already shipping faster with TaskFlow.</p>
            <Link to="/register" className="btn-white btn-lg">Start for free — no card needed</Link>
            <p className="cta-note">✓ 14-day Pro trial &nbsp;·&nbsp; ✓ Cancel anytime &nbsp;·&nbsp; ✓ SOC 2 compliant</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="logo" style={{marginBottom:"1rem"}}>
              <div className="logo-icon"><Zap size={16}/></div>
              <span className="logo-text">TaskFlow</span>
            </div>
            <p className="footer-tagline">The high-performance workspace for modern engineering teams. Built for speed, styled for impact.</p>
          </div>
          {[
            {title:"Product",links:["Features","Pricing","Changelog","Roadmap","API Docs"]},
            {title:"Company",links:["About","Blog","Careers","Press","Contact"]},
            {title:"Legal",  links:["Privacy Policy","Terms of Service","Security","Cookie Policy"]},
          ].map(({title,links})=>(
            <div key={title}>
              <h5 className="footer-col-title">{title}</h5>
              <ul className="footer-col-links">
                {links.map(l=><li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© 2026 TaskFlow, Inc. All rights reserved.</span>
          <div className="footer-socials">
            {["GitHub","Twitter","LinkedIn","Discord"].map(s=><a key={s} href="#">{s}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ── */
export default function LandingPage() {
  return (
    <div className="lp">
      <Navbar/>
      <Hero/>
      <TechStrip/>
      <Features/>
      <Stats/>
      <WorkflowSection/>
      <Testimonials/>
      <Pricing/>
      <CTA/>
      <Footer/>
    </div>
  );
}
