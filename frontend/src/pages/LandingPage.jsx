import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, MessageSquare, Lightbulb, ArrowRight, Brain, Sparkles, Zap } from 'lucide-react';
import Header from '../components/Header';

const features = [
  {
    icon: Upload,
    title: 'Upload PDFs',
    description: 'Drag and drop your PDF documents. We extract and index every page for intelligent search.',
    gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
  },
  {
    icon: MessageSquare,
    title: 'Ask Questions',
    description: 'Chat naturally with your documents. Ask anything and get precise, context-aware answers.',
    gradient: 'linear-gradient(135deg, #4f46e5, #4338ca)',
  },
  {
    icon: Lightbulb,
    title: 'Get Insights',
    description: 'Powered by Google Gemini AI and RAG technology for accurate, document-grounded responses.',
    gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Header showNav={true} />

      {/* Animated Background */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #12121a 30%, #1a1025 50%, #0f0f1a 80%, #0a0a0f 100%)',
          backgroundSize: '400% 400%',
        }}
        className="animate-gradient"
      />

      {/* Glow orbs */}
      <div
        style={{
          position: 'fixed',
          top: '15%',
          left: '15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }}
        className="animate-float"
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '10%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          animationDelay: '3s',
        }}
        className="animate-float"
      />

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '140px 24px 80px',
          textAlign: 'center',
        }}
      >
        {/* Badge */}
        <motion.div variants={itemVariants} style={{ marginBottom: '24px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              background: 'rgba(124, 58, 237, 0.08)',
              color: 'var(--accent-purple-light)',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            <Sparkles size={14} />
            Powered by Google Gemini AI
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={itemVariants}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
          }}
        >
          <span className="glow-text gradient-text">DocuMind AI</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={itemVariants}
          style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.35rem)',
            color: 'var(--text-secondary)',
            maxWidth: '580px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}
        >
          Chat with your documents intelligently. Upload PDFs, ask questions, and get AI-powered insights in seconds.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} style={{ marginBottom: '80px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 36px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: 'white',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 30px rgba(124, 58, 237, 0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 40px rgba(124, 58, 237, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 30px rgba(124, 58, 237, 0.35)';
            }}
          >
            Get Started
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            maxWidth: '960px',
            margin: '0 auto',
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              style={{
                padding: '32px 24px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                background: 'rgba(18, 18, 26, 0.6)',
                backdropFilter: 'blur(12px)',
                textAlign: 'left',
                cursor: 'default',
                transition: 'border-color 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: feature.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.2)',
                }}
              >
                <feature.icon size={22} color="white" />
              </div>
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '8px',
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Section — Stats */}
        <motion.div
          variants={itemVariants}
          style={{
            marginTop: '80px',
            display: 'flex',
            justifyContent: 'center',
            gap: '48px',
            flexWrap: 'wrap',
          }}
        >
          {[
            { icon: Brain, label: 'RAG-Powered', desc: 'Retrieval Augmented Generation' },
            { icon: Zap, label: 'Instant', desc: 'Real-time document analysis' },
            { icon: Sparkles, label: 'Gemini AI', desc: 'Google\'s latest AI model' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <stat.icon
                size={24}
                color="var(--accent-purple)"
                style={{ margin: '0 auto 8px' }}
              />
              <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {stat.desc}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
