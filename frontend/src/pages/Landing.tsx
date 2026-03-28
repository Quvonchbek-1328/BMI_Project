import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4">
        <div className="text-white font-bold text-xl tracking-tight">
          RiskWatch<span className="text-indigo-400">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="!text-slate-300 hover:!text-white hover:!bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 lg:px-12 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="text-sm text-indigo-300 font-medium">AI-Powered Project Risk Analytics</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Detect Risks Early.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Predict Delays Before They Happen.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            RiskWatch AI uses machine learning to analyze project performance indicators,
            predict schedule delay probability, and provide actionable recommendations
            to keep your projects on track.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="!bg-white/5 !text-white !border-white/20 hover:!bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-24 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              title: 'Delay Prediction',
              desc: 'ML-powered probability analysis for schedule delays based on 13+ risk indicators.',
              icon: '📊',
            },
            {
              title: 'Risk Factor Detection',
              desc: 'Automatically identify the top contributing factors putting your project at risk.',
              icon: '🔍',
            },
            {
              title: 'Smart Recommendations',
              desc: 'Get actionable mitigation strategies generated from AI analysis of your project data.',
              icon: '💡',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
