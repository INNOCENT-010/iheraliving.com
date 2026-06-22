'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'visible' | 'fading' | 'gone'>('visible')

  useEffect(() => {
    // Skip if already seen this session
    if (sessionStorage.getItem('ihera-splash-seen')) {
      setPhase('gone')
      return
    }

    // Phase 1 — show for 2.2s then fade
    const fadeTimer = setTimeout(() => {
      setPhase('fading')
    }, 2200)

    // Phase 2 — remove from DOM after fade completes
    const removeTimer = setTimeout(() => {
      setPhase('gone')
      sessionStorage.setItem('ihera-splash-seen', '1')
    }, 3000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        backgroundColor: '#0d0d0d',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        flexDirection:   'column',
        opacity:         phase === 'fading' ? 0 : 1,
        transition:      'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents:   phase === 'fading' ? 'none' : 'all',
      }}
    >
      <style>{`
        @keyframes drawLine {
          from { stroke-dashoffset: 400; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes drawLineH {
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandWidth {
          from { width: 0; }
          to   { width: 48px; }
        }
        @keyframes gridFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.92); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes shimmer {
          0%   { opacity: 0.3; }
          50%  { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
      `}</style>

      {/* ── Blueprint grid background ── */}
      <div
        style={{
          position: 'absolute',
          inset:    0,
          animation: 'gridFadeIn 0.6s ease forwards',
          opacity:  0,
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0 }}
        >
          <defs>
            <pattern
              id="grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="rgba(184,146,74,0.06)"
                strokeWidth="0.5"
              />
            </pattern>
            <pattern
              id="gridLarge"
              width="192"
              height="192"
              patternUnits="userSpaceOnUse"
            >
              <rect
                width="192"
                height="192"
                fill="url(#grid)"
              />
              <path
                d="M 192 0 L 0 0 0 192"
                fill="none"
                stroke="rgba(184,146,74,0.1)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridLarge)" />
        </svg>
      </div>

      {/* ── Architectural lines — drawing in ── */}
      <div
        style={{
          position: 'absolute',
          inset:    0,
          display:  'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 600 400"
          width="600"
          height="400"
          style={{ position: 'absolute', opacity: 0.5 }}
        >
          {/* Horizontal floor line */}
          <line
            x1="0" y1="320" x2="600" y2="320"
            stroke="rgba(184,146,74,0.25)"
            strokeWidth="0.5"
            strokeDasharray="600"
            strokeDashoffset="600"
            style={{
              animation: 'drawLineH 1.2s ease 0.2s forwards',
            }}
          />
          {/* Left vertical wall */}
          <line
            x1="80" y1="0" x2="80" y2="400"
            stroke="rgba(184,146,74,0.15)"
            strokeWidth="0.5"
            strokeDasharray="400"
            strokeDashoffset="400"
            style={{
              animation: 'drawLine 1s ease 0.4s forwards',
            }}
          />
          {/* Right vertical wall */}
          <line
            x1="520" y1="0" x2="520" y2="400"
            stroke="rgba(184,146,74,0.15)"
            strokeWidth="0.5"
            strokeDasharray="400"
            strokeDashoffset="400"
            style={{
              animation: 'drawLine 1s ease 0.5s forwards',
            }}
          />
          {/* Ceiling line */}
          <line
            x1="80" y1="60" x2="520" y2="60"
            stroke="rgba(184,146,74,0.15)"
            strokeWidth="0.5"
            strokeDasharray="440"
            strokeDashoffset="440"
            style={{
              animation: 'drawLineH 0.9s ease 0.7s forwards',
            }}
          />
          {/* Perspective left */}
          <line
            x1="80" y1="60" x2="260" y2="200"
            stroke="rgba(184,146,74,0.1)"
            strokeWidth="0.5"
            strokeDasharray="240"
            strokeDashoffset="240"
            style={{
              animation: 'drawLine 0.7s ease 1s forwards',
            }}
          />
          {/* Perspective right */}
          <line
            x1="520" y1="60" x2="340" y2="200"
            stroke="rgba(184,146,74,0.1)"
            strokeWidth="0.5"
            strokeDasharray="240"
            strokeDashoffset="240"
            style={{
              animation: 'drawLine 0.7s ease 1.1s forwards',
            }}
          />
          {/* Vanishing point cross */}
          <line
            x1="285" y1="195" x2="315" y2="195"
            stroke="rgba(184,146,74,0.3)"
            strokeWidth="0.5"
            strokeDasharray="30"
            strokeDashoffset="30"
            style={{
              animation: 'drawLineH 0.3s ease 1.5s forwards',
            }}
          />
          <line
            x1="300" y1="185" x2="300" y2="210"
            stroke="rgba(184,146,74,0.3)"
            strokeWidth="0.5"
            strokeDasharray="25"
            strokeDashoffset="25"
            style={{
              animation: 'drawLine 0.3s ease 1.5s forwards',
            }}
          />
          {/* Floor detail lines */}
          <line
            x1="80" y1="320" x2="260" y2="200"
            stroke="rgba(184,146,74,0.07)"
            strokeWidth="0.5"
            strokeDasharray="220"
            strokeDashoffset="220"
            style={{
              animation: 'drawLine 0.8s ease 1.2s forwards',
            }}
          />
          <line
            x1="520" y1="320" x2="340" y2="200"
            stroke="rgba(184,146,74,0.07)"
            strokeWidth="0.5"
            strokeDasharray="220"
            strokeDashoffset="220"
            style={{
              animation: 'drawLine 0.8s ease 1.3s forwards',
            }}
          />
          {/* Measurement tick marks */}
          {[160, 240, 360, 440].map((x, i) => (
            <g key={x}>
              <line
                x1={x} y1="315" x2={x} y2="325"
                stroke="rgba(184,146,74,0.2)"
                strokeWidth="0.5"
                strokeDasharray="10"
                strokeDashoffset="10"
                style={{
                  animation: `drawLine 0.2s ease ${1.4 + i * 0.1}s forwards`,
                }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* ── Monogram + wordmark ── */}
      <div
        style={{
          position:  'relative',
          zIndex:    10,
          textAlign: 'center',
          animation: 'scaleIn 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) 0.3s both',
        }}
      >
        {/* Monogram SVG — IhR mark */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <svg
            viewBox="0 0 80 90"
            width="64"
            height="72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* I — left vertical */}
            <rect x="8"  y="4"  width="6" height="60" fill="#b8924a" />
            {/* H crossbar */}
            <rect x="8"  y="30" width="44" height="5"  fill="#b8924a" />
            {/* Right vertical of H */}
            <rect x="46" y="4"  width="6" height="42" fill="#b8924a" />
            {/* R leg — curved */}
            <path
              d="M52 46 Q80 54 68 82"
              stroke="#b8924a"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Apostrophe */}
            <path
              d="M56 2 Q58 8 54 12"
              stroke="#b8924a"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Wordmark */}
        <p
          style={{
            fontFamily:    "'Cormorant', serif",
            fontSize:      '28px',
            letterSpacing: '0.5em',
            color:         '#f5f0e8',
            margin:        '0 0 6px',
            fontWeight:    300,
          }}
        >
          IHE&apos;RA
        </p>

        {/* Divider line — expands out */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            '10px',
            margin:         '8px 0',
          }}
        >
          <div
            style={{
              height:          '1px',
              backgroundColor: 'rgba(184,146,74,0.5)',
              animation:       'expandWidth 0.8s ease 0.8s both',
              width:           0,
            }}
          />
          <div
            style={{
              width:           '3px',
              height:          '3px',
              borderRadius:    '50%',
              backgroundColor: '#b8924a',
              opacity:         0,
              animation:       'fadeInUp 0.4s ease 1.2s forwards',
            }}
          />
          <div
            style={{
              height:          '1px',
              backgroundColor: 'rgba(184,146,74,0.5)',
              animation:       'expandWidth 0.8s ease 0.8s both',
              width:           0,
            }}
          />
        </div>

        {/* Tagline */}
        <p
          style={{
            fontFamily:    "'Jost', sans-serif",
            fontSize:      '9px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color:         'rgba(184,146,74,0.6)',
            margin:        0,
            opacity:       0,
            animation:     'fadeInUp 0.6s ease 1s forwards',
          }}
        >
          Curated Living
        </p>
      </div>

      {/* ── Loading indicator — thin brass line at bottom ── */}
      <div
        style={{
          position:        'absolute',
          bottom:          0,
          left:            0,
          height:          '2px',
          backgroundColor: '#b8924a',
          animation:       'expandWidth 2s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards',
          width:           0,
          maxWidth:        '100%',
        }}
      />
    </div>
  )
}