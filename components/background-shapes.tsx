export const BackgroundShapes = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,192,203,0.2)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,255,255,0)', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: 'rgba(255,192,203,0.1)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'rgba(255,105,180,0.2)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <path d="M0,0 Q50,100 100,0 V100 H0 Z" fill="url(#grad1)" />
        <circle cx="80%" cy="60%" r="100" fill="rgba(255,192,203,0.2)" />
        <path d="M100,100 Q50,0 0,100 Z" fill="rgba(255,192,203,0.1)" />
        <path d="M0,50 Q50,0 100,50 T200,50" fill="none" stroke="url(#grad2)" strokeWidth="2" />
        <g transform="translate(50, 50)">
          <path d="M0,0 C10,20 30,20 40,0 C50,-20 70,-20 80,0" fill="none" stroke="rgba(255,105,180,0.3)" strokeWidth="2" />
          <animateTransform attributeName="transform" type="translate" from="0 0" to="0 20" dur="5s" repeatCount="indefinite" />
        </g>
        <g transform="translate(150, 150)">
          <path d="M0,0 L20,20 L40,0 L20,-20 Z" fill="rgba(255,192,203,0.2)" />
          <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="10s" repeatCount="indefinite" />
        </g>
      </svg>
    </div>
  );