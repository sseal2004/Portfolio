import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Backend ──────────────────────────────────────────────────────────────
// Your trained ML chatbot API (Flask on Render).
const CHATBOT_API_URL = 'https://portfolio-chatbot-tyh3.onrender.com/chat';

// ─── Design tokens ───────────────────────────────────────────────────────
// "Aurora signal" — a dark instrument panel with a living cyan/violet/magenta
// aurora that only fully ignites when the bot is actually listening or
// speaking. The halo brightness is driven by real microphone amplitude
// while listening, so it's not decoration — it's a readout.
const T = {
  void: '#06060f',
  panel: '#0b0b18',
  panel2: '#111022',
  line: 'rgba(155,130,255,0.16)',
  cyan: '#2ce0c9',
  violet: '#9b6bff',
  magenta: '#ff5fa8',
  text: '#f4f2fb',
  textDim: 'rgba(244,242,251,0.62)',
  textFaint: 'rgba(244,242,251,0.38)',
};

const FONT_IMPORT_ID = 'portfolio-chatbot-fonts';

function ensureFontsLoaded() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(FONT_IMPORT_ID)) return;
  const link = document.createElement('link');
  link.id = FONT_IMPORT_ID;
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap';
  document.head.appendChild(link);
}

// ─── Voice halo — audio-reactive SVG ring ───────────────────────────────
// state: 'idle' | 'listening' | 'speaking' | 'thinking'
const VoiceHalo = ({ state, amplitude = 0, size = 40 }) => {
  const base = size;
  const boost =
    state === 'listening' ? amplitude * 0.9 : state === 'speaking' ? 0.35 : 0;
  const ringColor =
    state === 'listening'
      ? T.cyan
      : state === 'speaking'
      ? T.magenta
      : state === 'thinking'
      ? T.violet
      : T.violet;

  return (
    <div
      className={state === 'thinking' ? 'pcb-halo-spin' : ''}
      style={{ position: 'relative', width: base, height: base, flexShrink: 0 }}
    >
      <div
        className={state === 'idle' ? 'pcb-halo-breathe' : ''}
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ringColor}33 0%, transparent 70%)`,
          transform: `scale(${1 + boost})`,
          transition: state === 'listening' ? 'transform 60ms linear' : 'transform 200ms ease',
        }}
      />
      <svg
        width={base}
        height={base}
        viewBox="0 0 40 40"
        style={{ position: 'relative', display: 'block' }}
      >
        <defs>
          <linearGradient id="pcb-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={T.cyan} />
            <stop offset="50%" stopColor={T.violet} />
            <stop offset="100%" stopColor={T.magenta} />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="17.5" fill={T.panel2} stroke="url(#pcb-ring-grad)" strokeWidth={1.4} />
        <circle
          cx="20"
          cy="20"
          r={17.5 + boost * 4}
          fill="none"
          stroke={ringColor}
          strokeWidth={1}
          opacity={state === 'idle' ? 0.25 : 0.6 + boost * 0.3}
          style={{ transition: 'r 60ms linear, opacity 120ms ease' }}
        />
        <text x="20" y="26" textAnchor="middle" fontSize="17">
          🤖
        </text>
      </svg>
    </div>
  );
};

// ─── Waveform bars (used inline for the "speaking" typing-style indicator) ──
const WaveformBars = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 14 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className={active ? 'pcb-bar-active' : ''}
        style={{
          display: 'inline-block',
          width: 2.5,
          height: active ? undefined : 4,
          borderRadius: 2,
          background: `linear-gradient(180deg, ${T.cyan}, ${T.magenta})`,
          animationDelay: `${i * 90}ms`,
        }}
      />
    ))}
  </div>
);

export default function PortfolioChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hey! I'm Soumyadipta's portfolio assistant. Ask me about his skills, projects, experience, or how to reach him — or just tap the mic and talk to me. 🎙️",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Thinking…');
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );

  // Voice output (TTS)
  const [voiceOn, setVoiceOn] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const femaleVoiceRef = useRef(null);

  // Voice input (STT)
  const [listening, setListening] = useState(false);
  const [voiceInputSupported, setVoiceInputSupported] = useState(true);
  const [amplitude, setAmplitude] = useState(0);
  const recognitionRef = useRef(null);
  const finalizedRef = useRef(false);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const rafRef = useRef(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Renders straight into document.body via a portal (see return statement
  // below) so this widget is never affected by an ancestor's transform /
  // filter / backdrop-filter — those silently change what "position: fixed"
  // is measured against, which is what was causing the mobile card to
  // stretch to fill the wrong box instead of the real viewport. `mounted`
  // guards against SSR frameworks (Next.js etc.) where `document` doesn't
  // exist during server rendering.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    ensureFontsLoaded();
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMsg(false);
    }
  }, [isOpen]);

  // ── Pick a female-sounding voice for speechSynthesis ──
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      if (!voices.length) return;
      const knownFemale = [
        'Google UK English Female',
        'Google US English',
        'Microsoft Zira',
        'Microsoft Jenny',
        'Samantha',
        'Victoria',
        'Moira',
        'Karen',
        'Tessa',
        'Fiona',
      ];
      const byNameMatch = voices.find((v) => /female/i.test(v.name));
      const byKnownList = voices.find((v) => knownFemale.includes(v.name));
      const byEnglish = voices.find((v) => v.lang?.startsWith('en'));
      femaleVoiceRef.current = byNameMatch || byKnownList || byEnglish || voices[0];
    };
    pickVoice();
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice);
  }, []);

  // ── Set up SpeechRecognition (voice input) ──
  useEffect(() => {
    const SR =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      setVoiceInputSupported(false);
      return;
    }
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript);
      const last = e.results[e.results.length - 1];
      if (last.isFinal && !finalizedRef.current) {
        finalizedRef.current = true;
        recog.stop();
        // slight delay so the user sees their final transcript land before it sends
        setTimeout(() => doSend(transcript), 250);
      }
    };
    recog.onend = () => {
      setListening(false);
      stopAmplitudeMeter();
    };
    recog.onerror = () => {
      setListening(false);
      stopAmplitudeMeter();
    };
    recognitionRef.current = recog;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startAmplitudeMeter = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAmplitude(Math.min(1, avg / 130));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      // mic permission denied for the visualizer — recognition can still work independently
    }
  };

  const stopAmplitudeMeter = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
    }
    setAmplitude(0);
  };

  const toggleListening = () => {
    if (!voiceInputSupported || !recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
      stopAmplitudeMeter();
    } else {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
      finalizedRef.current = false;
      setInput('');
      try {
        recognitionRef.current.start();
        setListening(true);
        startAmplitudeMeter();
      } catch (e) {
        // recognition may already be running; ignore
      }
    }
  };

  const speak = useCallback(
    (text) => {
      if (!voiceOn || typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      if (femaleVoiceRef.current) utter.voice = femaleVoiceRef.current;
      utter.pitch = 1.12;
      utter.rate = 1.02;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
    },
    [voiceOn]
  );

  const doSend = async (rawText) => {
    const trimmed = (rawText ?? '').trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setLoadingLabel('Thinking…');

    const wakeTimer = setTimeout(() => {
      setLoadingLabel('Waking the server up — first request can take up to a minute…');
    }, 6000);

    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      const reply = data?.reply || "Sorry, I couldn't process that — please try again.";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      if (!isOpen) setHasNewMsg(true);
      speak(reply);
    } catch (err) {
      const fallback =
        "⚠️ I couldn't reach the server just now. It may be waking up from sleep — please try again in a few seconds.";
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      clearTimeout(wakeTimer);
      setLoading(false);
      setLoadingLabel('Thinking…');
    }
  };

  const sendMessage = () => doSend(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const botState = listening ? 'listening' : speaking ? 'speaking' : loading ? 'thinking' : 'idle';

  // ── Responsive geometry ──
  // Mobile is NOT edge-to-edge full screen — it's a floating card with
  // real margins (matching the reference layout: visible page behind it,
  // rounded corners preserved, launcher FAB floating just past its
  // bottom-right corner). Sizes come from viewport math, not a fixed
  // desktop card stretched to fit.
  const winStyle = isMobile
    ? {
        top: 'max(16px, env(safe-area-inset-top, 0px))',
        left: 16,
        width: 'calc(100vw - 32px)',
        height: 'calc(100dvh - 16px - max(16px, env(safe-area-inset-top, 0px)) - 92px)',
        borderRadius: 28,
        border: `1px solid ${T.line}`,
      }
    : {
        bottom: 96,
        right: 24,
        width: 372,
        height: 560,
        borderRadius: 22,
        border: `1px solid ${T.line}`,
      };

  const fabPos = isMobile ? { bottom: 16, right: 16 } : { bottom: 24, right: 24 };
  const fabSize = isMobile ? 54 : 64;

  if (!mounted) return null;

  return createPortal(
    <>
      <style>{`
        @property --pcb-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes pcb-spin { to { --pcb-angle: 360deg; } }
        @keyframes pcb-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes pcb-ping {
          0%   { transform: scale(1);   opacity: 0.45; }
          100% { transform: scale(1.9); opacity: 0;    }
        }
        @keyframes pcb-breathe {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.9;  transform: scale(1.05); }
        }
        @keyframes pcb-bar {
          0%, 100% { height: 4px; }
          50%      { height: 14px; }
        }
        @keyframes pcb-slide-up {
          from { transform: translateY(14px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .pcb-spin-ring {
          background: conic-gradient(from var(--pcb-angle), ${T.cyan}, ${T.violet}, ${T.magenta}, ${T.cyan});
          animation: pcb-spin 3.2s linear infinite;
        }
        .pcb-halo-spin { animation: pcb-spin 1.1s linear infinite; }
        .pcb-halo-breathe { animation: pcb-breathe 3.4s ease-in-out infinite; }
        .pcb-float { animation: pcb-float 3.6s ease-in-out infinite; }
        .pcb-float:hover { animation: none; }
        .pcb-orb-ping { animation: pcb-ping 2s ease-out infinite; }
        .pcb-bar-active { animation: pcb-bar 0.9s ease-in-out infinite; }
        .pcb-msg-in { animation: pcb-slide-up 0.28s ease-out; }
        .pcb-messages::-webkit-scrollbar { width: 4px; }
        .pcb-messages::-webkit-scrollbar-track { background: transparent; }
        .pcb-messages::-webkit-scrollbar-thumb { background: rgba(155,107,255,0.28); border-radius: 4px; }
        .pcb-input::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .pcb-spin-ring, .pcb-halo-spin, .pcb-halo-breathe, .pcb-float, .pcb-orb-ping, .pcb-bar-active, .pcb-msg-in {
            animation: none !important;
          }
        }
      `}</style>

      {/* ── Floating launcher ── */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 12,
          ...fabPos,
        }}
      >
        <div
          style={{
            transition: 'all 300ms ease-out',
            opacity: hovered && !isOpen && !isMobile ? 1 : 0,
            transform: hovered && !isOpen && !isMobile ? 'translateX(0)' : 'translateX(12px)',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.06em',
              padding: '7px 12px',
              borderRadius: 999,
              whiteSpace: 'nowrap',
              background: `linear-gradient(135deg, ${T.void}, ${T.panel2})`,
              border: `1px solid ${T.line}`,
              color: T.cyan,
              boxShadow: `0 0 18px ${T.cyan}22`,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: T.cyan,
                boxShadow: `0 0 6px ${T.cyan}`,
              }}
            />
            Talk to my AI twin
          </span>
        </div>

        <div className="pcb-float" style={{ position: 'relative', width: fabSize, height: fabSize }}>
          {!isOpen && (
            <span
              className="pcb-orb-ping"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${T.violet}55 0%, transparent 70%)`,
              }}
            />
          )}
          <span className="pcb-spin-ring" style={{ position: 'absolute', inset: -3, borderRadius: '50%' }} />
          <button
            onClick={() => setIsOpen((p) => !p)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label="Toggle portfolio chatbot"
            style={{
              position: 'absolute',
              inset: 2,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: 'none',
              cursor: 'pointer',
              background: `radial-gradient(circle at 38% 32%, ${T.panel2}, ${T.void})`,
              boxShadow: `inset 0 0 14px ${T.violet}22`,
              transition: 'transform 160ms ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {hasNewMsg && !isOpen && (
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  right: 3,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: T.magenta,
                  border: `2px solid ${T.void}`,
                  boxShadow: `0 0 8px ${T.magenta}`,
                }}
              />
            )}
            {isOpen ? (
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="pcb-close" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={T.cyan} />
                    <stop offset="100%" stopColor={T.magenta} />
                  </linearGradient>
                </defs>
                <path d="M6 18L18 6M6 6l12 12" stroke="url(#pcb-close)" strokeWidth={2.5} strokeLinecap="round" />
              </svg>
            ) : (
              <span style={{ fontSize: isMobile ? 24 : 26 }}>🤖</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile backdrop scrim ──
          Without this, the card's near-black background is close enough
          to a dark portfolio page's own background that the "floating
          card" margins are technically there but invisible to the eye —
          it just reads as full screen. This scrim is what actually sells
          the floating effect: it dims the page behind the card so the
          card's edge (and its margin) is unmistakable. Tapping it closes
          the chat, same as any modal scrim. */}
      {isMobile && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9997,
            background: 'rgba(3,3,10,0.6)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            transition: 'opacity 220ms ease',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        />
      )}

      {/* ── Chat window ── */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 280ms ease-in-out',
          transformOrigin: 'bottom right',
          transform: isOpen ? 'scale(1)' : 'scale(0.9)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          boxShadow: isMobile
            ? `0 0 0 1px ${T.cyan}35, 0 0 0 1px ${T.violet}25 inset, 0 30px 70px rgba(0,0,0,0.85), 0 0 60px ${T.violet}30`
            : `0 0 0 1px ${T.violet}18, 0 26px 64px rgba(0,0,0,0.75), 0 0 46px ${T.violet}14`,
          background: T.void,
          fontFamily: "'Inter', sans-serif",
          ...winStyle,
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            flexShrink: 0,
            height: 70,
            background: `linear-gradient(135deg, ${T.panel} 0%, ${T.void} 100%)`,
            borderBottom: `1px solid ${T.line}`,
          }}
        >
          <div
            style={{
              height: 70,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 16px',
            }}
          >
            <VoiceHalo state={botState} amplitude={amplitude} size={38} />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: '0.01em',
                  background: `linear-gradient(90deg, ${T.cyan}, ${T.violet})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Soumyadipta — AI Twin
              </p>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.04em',
                  color:
                    botState === 'listening'
                      ? T.cyan
                      : botState === 'speaking'
                      ? T.magenta
                      : T.textFaint,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'currentColor',
                  }}
                />
                {botState === 'listening'
                  ? 'listening…'
                  : botState === 'speaking'
                  ? 'speaking…'
                  : botState === 'thinking'
                  ? 'thinking…'
                  : 'signal online'}
              </p>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => {
                  setVoiceOn((v) => {
                    const next = !v;
                    if (!next) window.speechSynthesis?.cancel();
                    return next;
                  });
                }}
                aria-label={voiceOn ? 'Mute voice reply' : 'Unmute voice reply'}
                title={voiceOn ? 'Voice reply on' : 'Voice reply off'}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  border: `1px solid ${T.line}`,
                  background: T.panel2,
                  color: voiceOn ? T.cyan : T.textFaint,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                }}
              >
                {voiceOn ? '🔊' : '🔇'}
              </button>
              {isMobile && (
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    border: `1px solid ${T.line}`,
                    background: T.panel2,
                    color: T.textDim,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="pcb-messages"
          style={{
            flex: '1 1 0',
            minHeight: 0,
            overflowY: 'auto',
            padding: '14px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: `radial-gradient(120% 60% at 15% 0%, ${T.violet}0d 0%, transparent 60%), ${T.void}`,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className="pcb-msg-in"
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {msg.role === 'assistant' && (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    marginRight: 8,
                    marginTop: 2,
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                  }}
                >
                  🤖
                </div>
              )}
              <div
                style={{
                  maxWidth: '78%',
                  padding: '10px 13px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  ...(msg.role === 'user'
                    ? {
                        background: `linear-gradient(135deg, ${T.cyan}26, ${T.violet}26)`,
                        border: `1px solid ${T.cyan}40`,
                        color: '#e6fbf6',
                      }
                    : {
                        background: T.panel2,
                        border: `1px solid ${T.line}`,
                        color: T.text,
                      }),
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="pcb-msg-in" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  flexShrink: 0,
                  background: `linear-gradient(135deg, ${T.cyan}, ${T.violet})`,
                }}
              >
                🤖
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '4px 16px 16px 16px',
                  background: T.panel2,
                  border: `1px solid ${T.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <WaveformBars active />
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: T.textFaint,
                  }}
                >
                  {loadingLabel}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 12px',
            background: T.panel,
            borderTop: `1px solid ${T.line}`,
          }}
        >
          {voiceInputSupported && (
            <button
              onClick={toggleListening}
              aria-label={listening ? 'Stop voice input' : 'Start voice input'}
              title={listening ? 'Stop listening' : 'Speak your question'}
              style={{
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: 11,
                border: `1px solid ${listening ? T.cyan : T.line}`,
                background: listening ? `${T.cyan}1f` : T.panel2,
                color: listening ? T.cyan : T.textDim,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                boxShadow: listening ? `0 0 ${8 + amplitude * 18}px ${T.cyan}66` : 'none',
                transition: 'box-shadow 80ms linear, background 150ms ease',
              }}
            >
              {listening ? '⏺️' : '🎙️'}
            </button>
          )}

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={listening ? 'Listening… speak now' : 'Ask me anything, or tap the mic…'}
            style={{
              flex: 1,
              height: 40,
              resize: 'none',
              overflow: 'hidden',
              background: T.panel2,
              border: `1px solid ${T.line}`,
              borderRadius: 12,
              padding: '9px 12px',
              color: T.text,
              fontSize: 14,
              lineHeight: 1.4,
              outline: 'none',
              fontFamily: "'Inter', sans-serif",
              scrollbarWidth: 'none',
            }}
            className="pcb-input"
            onFocus={(e) => (e.target.style.borderColor = `${T.violet}88`)}
            onBlur={(e) => (e.target.style.borderColor = T.line)}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            aria-label="Send message"
            style={{
              flexShrink: 0,
              width: 38,
              height: 38,
              borderRadius: 11,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              opacity: input.trim() && !loading ? 1 : 0.4,
              background:
                input.trim() && !loading
                  ? `linear-gradient(135deg, ${T.cyan}, ${T.violet})`
                  : T.panel2,
              transition: 'opacity 150ms ease',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>

        <div
          style={{
            flexShrink: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${T.cyan}55, ${T.violet}55, ${T.magenta}55, transparent)`,
          }}
        />
      </div>
    </>,
    document.body
  );
}