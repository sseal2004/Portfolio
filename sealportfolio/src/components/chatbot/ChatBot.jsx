import React, { useState, useEffect, useRef } from 'react';

// ─── Persona — fill in YOUR details ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful AI assistant embedded in a personal portfolio website.
Your job is to answer questions about the portfolio owner warmly and concisely.

About the owner:
- Name: [Your Name]
- Role: Full-Stack Developer / [Your Role]
- Skills: React, Node.js, Tailwind CSS, [add your stack]
- Projects: [briefly describe 1-2 key projects]
- Experience: [X years, companies, etc.]
- Contact: [your email or preferred contact]

Keep answers short (2-4 sentences). Be friendly and professional.
If asked something you don't know, say "You can reach out directly via the Contact section!"`;

// ─── Animated Neural-Net Canvas Background ───────────────────────────────────
const NeuralCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animFrameId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NODE_COUNT = 28;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark bg gradient
      const bg = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.5, canvas.width * 1.1
      );
      bg.addColorStop(0, '#0d0d1a');
      bg.addColorStop(0.6, '#070710');
      bg.addColorStop(1, '#020205');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Corner glows (purple + blue + orange)
      [
        { x: 0.1,  y: 0.15, r: 0.5,  c: 'rgba(180,60,255,0.09)' },
        { x: 0.9,  y: 0.8,  r: 0.45, c: 'rgba(60,120,255,0.07)' },
        { x: 0.5,  y: 1.0,  r: 0.4,  c: 'rgba(251,146,60,0.06)' },
      ].forEach(({ x, y, r, c }) => {
        const g = ctx.createRadialGradient(
          x * canvas.width, y * canvas.height, 0,
          x * canvas.width, y * canvas.height, r * canvas.width
        );
        g.addColorStop(0, c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.018;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 85) {
            const alpha = (1 - dist / 85) * 0.22;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(251,146,60,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        const pulse = 0.6 + 0.4 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,146,60,${0.5 * pulse})`;
        ctx.fill();
        if (n.r > 2) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * pulse + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(251,146,60,${0.1 * pulse})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      animFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />;
};

// ─── Main ChatBot Component ──────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen]       = useState(false);
  const [messages, setMessages]   = useState([{
    role: 'assistant',
    content: "Hey there! 👋 I'm here to answer any questions about this portfolio. Ask me anything!",
  }]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const [hovered, setHovered]     = useState(false);
  const messagesEndRef            = useRef(null);
  const inputRef                  = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMsg(false);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg        = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data          = await response.json();
      const assistantText = data?.content?.[0]?.text ?? "Sorry, couldn't fetch a response. Try again!";
      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
      if (!isOpen) setHasNewMsg(true);
    } catch (err) {
      console.error('ChatBot error:', err);
      setMessages((prev) => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* ── Global Keyframes ── */}
      <style>{`
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes spin-angle { to { --angle: 360deg; } }
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
        @keyframes orb-ping {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0;   }
        }
        .chatbot-spin-ring {
          background: conic-gradient(from var(--angle), #fb923c, #a855f7, #3b82f6, #fb923c);
          animation: spin-angle 3s linear infinite;
        }
        .chatbot-spin-ring-slow {
          background: conic-gradient(from var(--angle), #7c3aed, #fb923c, #1d4ed8, #7c3aed);
          animation: spin-angle 5s linear infinite;
        }
        .chatbot-float { animation: float-up 3.5s ease-in-out infinite; }
        .chatbot-float:hover { animation: none; }
        .chatbot-orb-ping {
          animation: orb-ping 2s ease-out infinite;
        }
        .chatbot-messages::-webkit-scrollbar { width: 4px; }
        .chatbot-messages::-webkit-scrollbar-track { background: transparent; }
        .chatbot-messages::-webkit-scrollbar-thumb { background: rgba(251,146,60,0.25); border-radius: 4px; }
      `}</style>

      {/* ── Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

        {/* Tooltip */}
        <div
          className="transition-all duration-300 ease-out"
          style={{
            opacity: hovered && !isOpen ? 1 : 0,
            transform: hovered && !isOpen ? 'translateX(0)' : 'translateX(12px)',
            pointerEvents: hovered && !isOpen ? 'auto' : 'none',
          }}
        >
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #0d0d1a, #1a0a2e)',
              border: '1px solid rgba(251,146,60,0.3)',
              color: '#fb923c',
              boxShadow: '0 0 16px rgba(251,146,60,0.15)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Ask me anything
          </span>
        </div>

        {/* Button wrapper */}
        <div className="chatbot-float relative" style={{ width: 64, height: 64 }}>

          {/* Ambient orb ping */}
          {!isOpen && (
            <span
              className="chatbot-orb-ping absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(251,146,60,0.35) 0%, transparent 70%)' }}
            />
          )}

          {/* Spinning border */}
          <span
            className={`chatbot-spin-ring absolute rounded-full`}
            style={{ inset: -3 }}
          />

          {/* Button face */}
          <button
            onClick={() => setIsOpen((p) => !p)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label="Toggle Chatbot"
            className="absolute rounded-full flex items-center justify-center overflow-hidden transition-transform duration-200 active:scale-90"
            style={{
              inset: 2,
              background: 'radial-gradient(circle at 40% 35%, #1a0d2e, #07070f)',
              boxShadow: 'inset 0 0 12px rgba(251,146,60,0.08)',
            }}
          >
            {/* Notification dot */}
            {hasNewMsg && !isOpen && (
              <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-orange-500 border-2"
                style={{ borderColor: '#07070f' }} />
            )}

            {isOpen ? (
              /* Close X */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="cb-close" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path d="M6 18L18 6M6 6l12 12" stroke="url(#cb-close)" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              /* Neural chat icon */
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="cb-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#fb923c" />
                    <stop offset="50%"  stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="cb-icon2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                {/* Chat bubble */}
                <path
                  d="M14 4C9.03 4 5 7.69 5 12.2c0 2.56 1.34 4.85 3.44 6.34L7.5 22.5l3.94-1.69A9.8 9.8 0 0014 21.4c4.97 0 9-3.69 9-8.2S18.97 4 14 4z"
                  fill="url(#cb-icon)"
                  opacity="0.14"
                />
                <path
                  d="M14 4C9.03 4 5 7.69 5 12.2c0 2.56 1.34 4.85 3.44 6.34L7.5 22.5l3.94-1.69A9.8 9.8 0 0014 21.4c4.97 0 9-3.69 9-8.2S18.97 4 14 4z"
                  stroke="url(#cb-icon)"
                  strokeWidth="1.4"
                  fill="none"
                />

                {/* Dots */}
                <circle cx="10"  cy="12.5" r="1.2" fill="url(#cb-icon)" />
                <circle cx="14"  cy="12.5" r="1.2" fill="url(#cb-icon)" />
                <circle cx="18"  cy="12.5" r="1.2" fill="url(#cb-icon)" />

                {/* Neural connection lines from dots upward */}
                <line x1="10" y1="11.3" x2="9"  y2="8.5"  stroke="url(#cb-icon2)" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
                <line x1="14" y1="11.3" x2="14" y2="8"    stroke="url(#cb-icon2)" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
                <line x1="18" y1="11.3" x2="19" y2="8.5"  stroke="url(#cb-icon2)" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />

                {/* Small node dots at top of lines */}
                <circle cx="9"  cy="8.5" r="0.9" fill="#fb923c" opacity="0.7" />
                <circle cx="14" cy="8"   r="0.9" fill="#a855f7" opacity="0.7" />
                <circle cx="19" cy="8.5" r="0.9" fill="#3b82f6" opacity="0.7" />

                {/* Top-right sparkle */}
                <line x1="23" y1="4.5" x2="23" y2="7"   stroke="#fb923c" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="21.75" y1="5.75" x2="24.25" y2="5.75" stroke="#fb923c" strokeWidth="1.2" strokeLinecap="round" />

                {/* Bottom-left mini sparkle */}
                <line x1="4.5" y1="20" x2="4.5" y2="22"  stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" />
                <line x1="3.5" y1="21" x2="5.5" y2="21"  stroke="#3b82f6" strokeWidth="1" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Chat Window ── */}
      <div
        className="fixed z-[9998] flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          bottom: 88,
          right: 24,
          width: 360,
          maxHeight: 540,
          borderRadius: 20,
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1)'   : 'scale(0.88)',
          opacity:   isOpen ? 1            : 0,
          pointerEvents: isOpen ? 'auto'   : 'none',
          border: '1px solid rgba(251,146,60,0.18)',
          boxShadow: '0 0 0 1px rgba(168,85,247,0.1), 0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(251,146,60,0.08)',
        }}
      >
        {/* ── Header with neural canvas bg ── */}
        <div className="relative flex-shrink-0 overflow-hidden" style={{ height: 68 }}>
          <NeuralCanvas />

          {/* Header content overlay */}
          <div className="absolute inset-0 flex items-center gap-3 px-4"
            style={{ background: 'linear-gradient(90deg, rgba(13,13,26,0.6) 0%, transparent 100%)' }}>

            {/* Avatar with spinning ring */}
            <div className="relative flex-shrink-0" style={{ width: 38, height: 38 }}>
              <div className="chatbot-spin-ring-slow absolute rounded-full" style={{ inset: -2 }} />
              <div
                className="absolute flex items-center justify-center rounded-full text-base"
                style={{ inset: 1.5, background: '#0d0d1a' }}
              >🤖</div>
            </div>

            <div>
              <p className="font-semibold text-sm" style={{ color: '#fb923c', letterSpacing: '0.03em' }}>
                Portfolio AI
              </p>
              <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: 'rgba(251,146,60,0.6)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                Neural net online
              </p>
            </div>

            {/* Decorative node dots top-right */}
            <div className="ml-auto flex gap-1.5 opacity-50">
              {['#fb923c', '#a855f7', '#3b82f6'].map((c, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Messages ── */}
        <div
          className="chatbot-messages flex-1 overflow-y-auto px-3 py-3 space-y-3"
          style={{ background: '#07070f' }}
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #fb923c, #a855f7)' }}
                >🤖</div>
              )}
              <div
                className="max-w-[78%] px-3 py-2 text-sm leading-relaxed"
                style={{
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  ...(msg.role === 'user'
                    ? {
                        background: 'linear-gradient(135deg, rgba(251,146,60,0.2), rgba(168,85,247,0.2))',
                        border: '1px solid rgba(251,146,60,0.25)',
                        color: '#fcd9b0',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: 'rgba(255,255,255,0.82)',
                      }
                  ),
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #fb923c, #a855f7)' }}
              >🤖</div>
              <div
                className="px-4 py-3 flex gap-1.5"
                style={{
                  borderRadius: '4px 16px 16px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {['#fb923c', '#a855f7', '#3b82f6'].map((c, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: c, animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div
          className="px-3 py-3 flex gap-2 flex-shrink-0"
          style={{
            background: '#0a0a16',
            borderTop: '1px solid rgba(251,146,60,0.12)',
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            className="flex-1 resize-none text-sm outline-none transition-all duration-200 max-h-24 overflow-y-auto"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(251,146,60,0.15)',
              borderRadius: 12,
              padding: '8px 12px',
              color: 'rgba(255,255,255,0.85)',
              scrollbarWidth: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(251,146,60,0.45)')}
            onBlur={(e)  => (e.target.style.borderColor = 'rgba(251,146,60,0.15)')}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send"
            className="flex-shrink-0 flex items-center justify-center transition-all duration-150 active:scale-90"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              alignSelf: 'flex-end',
              marginBottom: 2,
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #fb923c, #a855f7)'
                : 'rgba(255,255,255,0.07)',
              opacity: input.trim() && !loading ? 1 : 0.4,
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>

        {/* Bottom glow line */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(251,146,60,0.3), rgba(168,85,247,0.3), transparent)',
        }} />
      </div>
    </>
  );
}