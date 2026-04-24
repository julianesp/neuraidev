"use client";
import React from "react";
import styles from "../styles/components/LogoAnimado.module.css";

const LogoAnimado = ({ width = 300, height = 375, className = "" }) => {
  return (
    <div
      className={`${styles.logoWrapper} ${className}`}
      style={{ width, height }}
    >
      <svg
        viewBox="0 0 300 375"
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        className={styles.logoSvg}
        aria-label="NeurAI Dev Logo"
        role="img"
      >
        <defs>
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0d2040" />
            <stop offset="100%" stopColor="#060e1a" />
          </radialGradient>

          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4895a" />
            <stop offset="60%" stopColor="#c47a48" />
            <stop offset="100%" stopColor="#a86035" />
          </linearGradient>

          <linearGradient id="skinShadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b8693a" />
            <stop offset="100%" stopColor="#8a4a22" />
          </linearGradient>

          <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a5a8c" />
            <stop offset="50%" stopColor="#1e4a7a" />
            <stop offset="100%" stopColor="#153860" />
          </linearGradient>

          <linearGradient id="robotLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3a7ab0" />
            <stop offset="100%" stopColor="#2a5a8c" />
          </linearGradient>

          <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e0f8ff" />
            <stop offset="30%" stopColor="#80e0ff" />
            <stop offset="60%" stopColor="#00aadd" />
            <stop offset="100%" stopColor="#005a8a" />
          </radialGradient>

          <radialGradient id="irisGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#40c8f0" />
            <stop offset="50%" stopColor="#0090c0" />
            <stop offset="100%" stopColor="#004a70" />
          </radialGradient>

          <clipPath id="leftHalf">
            <rect x="0" y="0" width="150" height="375" />
          </clipPath>

          <clipPath id="rightHalf">
            <rect x="150" y="0" width="150" height="375" />
          </clipPath>

          <clipPath id="eyeClip">
            <circle cx="195" cy="155" r="32" />
          </clipPath>

          <filter id="blueGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* FONDO */}
        <rect width="300" height="375" fill="url(#bgGrad)" rx="8" />

        {/* LADO HUMANO */}
        <g clipPath="url(#leftHalf)">
          <ellipse cx="145" cy="175" rx="115" ry="130" fill="url(#skinGrad)" />
          <rect x="95" y="280" width="70" height="90" rx="15" fill="url(#skinGrad)" />
          <path d="M 40 220 Q 50 270 80 300 Q 100 315 130 320 L 150 320 L 150 270 Q 120 265 100 240 Q 80 215 70 200 Z" fill="url(#skinShadow)" opacity="0.4" />
          <ellipse cx="75" cy="235" rx="40" ry="30" fill="#9a5225" opacity="0.25" />
          <path d="M 30 130 Q 35 100 50 85 Q 60 75 75 70 L 150 70 L 150 100 Q 100 105 75 120 Q 55 135 45 155 Z" fill="#b87040" opacity="0.3" />

          {/* Ceja izquierda */}
          <path d="M 55 118 Q 75 106 112 109 Q 126 110 130 115 Q 125 120 110 119 Q 75 116 58 124 Z" fill="#1a1005" />

          {/* Ojo humano */}
          <ellipse cx="95" cy="155" rx="28" ry="18" fill="#c07040" opacity="0.4" />
          <ellipse cx="95" cy="155" rx="22" ry="14" fill="#f5f0e8" />
          <circle cx="95" cy="155" r="10" fill="#3d2010" />
          <circle cx="95" cy="155" r="5" fill="#0d0805" />
          <circle cx="100" cy="151" r="3" fill="white" opacity="0.8" />
          <circle cx="102" cy="153" r="1.5" fill="white" opacity="0.5" />
          <path d="M 73 148 Q 95 138 117 148" stroke="#1a0f05" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 75 162 Q 95 170 115 162" stroke="#8a4520" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />

          {/* Nariz */}
          <path d="M 120 155 Q 125 180 130 195 Q 138 210 145 215 Q 148 217 150 217" stroke="#a05030" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 115 205 Q 105 210 108 215 Q 112 220 125 218 Q 135 216 140 210" stroke="#8a4020" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="115" cy="208" rx="10" ry="7" fill="#9a4525" opacity="0.3" />

          {/* Boca */}
          <path d="M 95 248 Q 110 244 125 248 Q 135 252 140 256 Q 148 261 150 262" stroke="#8a3a18" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 90 252 Q 85 262 90 268 Q 95 272 105 270" stroke="#8a3a18" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 92 268 Q 110 278 135 270 Q 145 266 150 264" fill="#c07050" opacity="0.5" />
          <path d="M 92 268 Q 110 278 135 270 Q 145 266 150 264" stroke="#8a3a18" strokeWidth="1.5" fill="none" />
          <ellipse cx="112" cy="272" rx="12" ry="4" fill="white" opacity="0.15" />

          {/* Pómulo highlight */}
          <ellipse cx="68" cy="195" rx="22" ry="14" fill="#e0956a" opacity="0.25" transform="rotate(-15 68 195)" />
        </g>

        {/* PELO */}
        <g>
          <path d="M 35 100 Q 28 75 38 55 Q 50 35 75 28" stroke="#1a1208" strokeWidth="8" fill="none" strokeLinecap="round" />
          <path d="M 48 88 Q 42 65 55 48 Q 68 33 90 27" stroke="#252010" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 58 80 Q 55 60 65 46 Q 78 32 100 27" stroke="#1a1208" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M 35 100 Q 30 70 45 50 Q 60 30 90 25 Q 120 20 145 28 Q 155 32 160 38 L 150 45 Q 140 38 115 35 Q 85 32 65 48 Q 48 62 45 85 Q 42 100 45 115 Z" fill="#1a1208" />
        </g>

        <g clipPath="url(#rightHalf)">
          <path d="M 150 38 Q 165 28 190 25 Q 220 22 245 35 Q 265 48 270 70 Q 275 90 268 110 L 260 105 Q 265 85 260 68 Q 252 50 232 40 Q 210 30 185 33 Q 165 36 155 44 Z" fill="#1a1208" />
          <path d="M 260 100 Q 268 75 258 55 Q 248 37 225 30" stroke="#1a1208" strokeWidth="7" fill="none" strokeLinecap="round" />
        </g>

        {/* LADO ROBOT */}
        <g clipPath="url(#rightHalf)">
          <ellipse cx="155" cy="175" rx="115" ry="130" fill="url(#robotGrad)" />
          <path d="M 150 70 Q 200 72 235 95 Q 260 115 265 150 Q 270 185 260 220 Q 248 255 225 275 Q 205 290 175 298 Q 162 301 150 300 Z" fill="url(#robotLight)" opacity="0.7" />

          {/* Segmentos */}
          <path d="M 150 80 Q 180 78 210 90 Q 230 100 245 120" stroke="#1a3a5c" strokeWidth="3" fill="none" strokeLinecap="round" className={styles.robotSegment} />
          <path d="M 150 180 Q 175 178 200 185 Q 218 190 228 205" stroke="#1a3a5c" strokeWidth="3" fill="none" strokeLinecap="round" className={styles.robotSegment} />
          <path d="M 150 250 Q 175 252 198 262 Q 215 270 222 282" stroke="#1a3a5c" strokeWidth="2.5" fill="none" strokeLinecap="round" className={styles.robotSegment} />
          <path d="M 175 90 Q 178 140 177 190 Q 176 235 175 275" stroke="#1a3a5c" strokeWidth="2.5" fill="none" strokeLinecap="round" className={styles.robotSegment} />
          <path d="M 215 105 Q 220 140 220 180 Q 220 220 215 255" stroke="#1a3a5c" strokeWidth="2" fill="none" strokeLinecap="round" className={styles.robotSegment} />
          <path d="M 255 130 Q 268 160 265 195 Q 262 220 250 240" stroke="#1a3a5c" strokeWidth="2.5" fill="none" strokeLinecap="round" className={styles.robotSegment} />
          <path d="M 258 140 Q 272 145 275 165 Q 278 185 270 200 Q 265 185 263 165 Q 261 148 258 140 Z" fill="#1e4878" stroke="#152f55" strokeWidth="1.5" />

          {/* OJO ROBOT */}
          <g className={styles.robotEye}>
            <circle cx="195" cy="155" r="36" fill="#0d2540" stroke="#0a1a30" strokeWidth="2" />
            <circle cx="195" cy="155" r="33" fill="none" stroke="#2a5a8c" strokeWidth="4" className={styles.eyeRing} />
            <circle cx="195" cy="155" r="28" fill="url(#eyeGrad)" filter="url(#blueGlow)" />
            <circle cx="195" cy="155" r="18" fill="url(#irisGrad)" />
            <circle cx="195" cy="155" r="18" fill="none" stroke="#00aadd" strokeWidth="1.5" opacity="0.7" />
            <circle cx="195" cy="155" r="10" fill="#003050" />
            <circle cx="195" cy="155" r="5" fill="#c0f0ff" filter="url(#strongGlow)" />
            <ellipse cx="188" cy="148" rx="5" ry="3" fill="white" opacity="0.9" className={styles.eyeGlint} />
            <circle cx="186" cy="146" r="2" fill="white" opacity="0.7" />
            <g clipPath="url(#eyeClip)">
              <rect className={styles.scanline} x="163" y="155" width="64" height="2" fill="#00eaff" opacity="0.4" rx="1" />
            </g>
            <circle cx="195" cy="122" r="2" fill="#00aadd" opacity="0.6" />
            <circle cx="195" cy="188" r="2" fill="#00aadd" opacity="0.6" />
            <circle cx="162" cy="155" r="2" fill="#00aadd" opacity="0.6" />
            <circle cx="228" cy="155" r="2" fill="#00aadd" opacity="0.6" />
          </g>

          {/* Ceja robot */}
          <path d="M 152 115 Q 172 106 200 108 Q 218 110 230 116 Q 228 122 215 120 Q 195 118 172 120 Q 158 122 152 120 Z" fill="#1e4878" />
          <path d="M 152 115 Q 172 108 200 110 Q 218 112 230 118" stroke="#1a3a5c" strokeWidth="5" fill="none" strokeLinecap="round" />

          {/* Nariz robot */}
          <path d="M 150 200 Q 152 215 155 225 Q 158 232 160 238" stroke="#2a5a8c" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 150 218 Q 155 222 160 220 Q 165 218 168 214" stroke="#1a3a5c" strokeWidth="1.5" fill="none" strokeLinecap="round" />

          {/* Boca robot */}
          <path d="M 150 262 Q 162 268 178 270 Q 192 271 205 268 Q 215 265 222 260" stroke="#2a5a8c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 155 263 L 155 270" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 163 265 L 163 272" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 171 266 L 171 273" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 179 267 L 179 273" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 187 267 L 187 272" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 195 266 L 195 271" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 203 265 L 203 270" stroke="#1a3a5c" strokeWidth="1.5" />
          <path d="M 150 258 Q 175 255 205 258 Q 215 260 222 256" stroke="#2060a0" strokeWidth="1.5" fill="none" opacity="0.5" />

          {/* Cuello robot */}
          <rect x="140" y="310" width="80" height="65" rx="10" fill="#1a4070" />
          <path d="M 155 315 L 155 370" stroke="#1a3a5c" strokeWidth="2" />
          <path d="M 175 315 L 175 370" stroke="#1a3a5c" strokeWidth="2" />
          <path d="M 195 315 L 195 370" stroke="#1a3a5c" strokeWidth="2" />
          <path d="M 145 335 L 215 335" stroke="#1a3a5c" strokeWidth="1.5" opacity="0.5" />
          <path d="M 145 350 L 215 350" stroke="#1a3a5c" strokeWidth="1.5" opacity="0.5" />
        </g>

        {/* JERSEY */}
        <g clipPath="url(#leftHalf)">
          <path d="M 80 320 Q 88 310 105 305 Q 125 300 150 300 L 150 375 L 50 375 Q 55 355 70 340 Q 75 332 80 320 Z" fill="#1a3560" />
          <path d="M 88 312 Q 100 306 120 303 Q 138 300 150 300" stroke="#152a50" strokeWidth="2" fill="none" />
        </g>
        <g clipPath="url(#rightHalf)">
          <path d="M 150 300 Q 168 298 185 303 Q 200 308 210 316 Q 220 328 225 342 Q 235 360 240 375 L 300 375 L 300 340 L 285 330 Q 270 315 250 305 Q 220 295 195 292 L 150 295 Z" fill="#1a3560" />
          <path d="M 150 300 Q 168 298 185 303 Q 200 308 210 316" stroke="#152a50" strokeWidth="2" fill="none" />
        </g>

        {/* CONTORNOS */}
        <ellipse cx="150" cy="175" rx="115" ry="130" fill="none" stroke="#0d1a2a" strokeWidth="3" />
        <path d="M 150 30 Q 149 80 148 130 Q 147 175 148 220 Q 149 265 150 310" stroke="#0d1a2a" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 35 100 Q 28 70 42 48 Q 58 28 90 22 Q 120 17 150 25 Q 178 17 210 22 Q 242 28 258 48 Q 272 68 265 100" stroke="#0d0a05" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 75 318 Q 100 308 150 305 Q 200 302 225 315 Q 240 325 248 340" stroke="#0f1f35" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
};

export default LogoAnimado;
