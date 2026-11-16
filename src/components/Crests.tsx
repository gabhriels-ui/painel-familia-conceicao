export function SvgDefs() {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ead38c" />
          <stop offset="48%" stopColor="#c59b27" />
          <stop offset="100%" stopColor="#5e430b" />
        </linearGradient>
        <linearGradient id="oxidizedBronze" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b08843" />
          <stop offset="52%" stopColor="#7d5d28" />
          <stop offset="100%" stopColor="#3b290f" />
        </linearGradient>
        <linearGradient id="steelBlade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#474d56" />
          <stop offset="46%" stopColor="#cbd5e1" />
          <stop offset="72%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#232629" />
        </linearGradient>
        <linearGradient id="brushedIron" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#363a40" />
          <stop offset="50%" stopColor="#232629" />
          <stop offset="100%" stopColor="#141517" />
        </linearGradient>
        <linearGradient id="crimsonShield" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="55%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#2b0606" />
        </linearGradient>
        <linearGradient id="emeraldGem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="45%" stopColor="#047857" />
          <stop offset="100%" stopColor="#022c22" />
        </linearGradient>
        <linearGradient id="sapphireGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="rubyGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#2a0505" />
        </linearGradient>
        <linearGradient id="demonFire" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="48%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#180404" />
        </linearGradient>
        <linearGradient id="specterMist" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="55%" stopColor="#3b0764" />
          <stop offset="100%" stopColor="#0d0318" />
        </linearGradient>
        <linearGradient id="shadowVoid" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="50%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <radialGradient id="divineRay" cx="50%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#f5e19c" stopOpacity="0.46" />
          <stop offset="60%" stopColor="#c59b27" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#c59b27" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="headlightBeam" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.88" />
          <stop offset="45%" stopColor="#dfc168" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#c59b27" stopOpacity="0" />
        </linearGradient>
        <filter id="goldShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.6" floodColor="#c59b27" floodOpacity="0.48" />
        </filter>
        <filter id="deepRelief" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.8" floodColor="#000000" floodOpacity="0.9" />
        </filter>
      </defs>
    </svg>
  );
}

export function CommanderShieldCrest({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true" filter="url(#deepRelief)">
      {/* Espadas cruzadas de ferro por trás do brasão */}
      <path d="M22 114 L118 22" stroke="url(#steelBlade)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M118 114 L22 22" stroke="url(#steelBlade)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M24 98 L40 114 M116 98 L100 114" stroke="url(#oxidizedBronze)" strokeWidth="3.2" strokeLinecap="round" />

      {/* Elmo de Cavaleiro em aço escovado */}
      <path
        d="M52 22 Q70 8 88 22 L92 38 H48 Z"
        fill="url(#brushedIron)"
        stroke="url(#goldMetal)"
        strokeWidth="2.2"
      />
      <path d="M70 11 V38 M54 27 H86" stroke="url(#goldMetal)" strokeWidth="2.4" />
      <path d="M56 23 H65 M75 23 H84" stroke="#090a0c" strokeWidth="2.2" strokeLinecap="round" />

      {/* Escudo de Guerra em Ferro Batido & Carmesim Imperial com marcas de batalha */}
      <path
        d="M70 36 L108 48 V78 C108 106 70 128 70 128 C70 128 32 106 32 78 V48 Z"
        fill="url(#crimsonShield)"
        stroke="url(#brushedIron)"
        strokeWidth="5"
        filter="url(#goldShadow)"
      />
      <path
        d="M70 39 L105 50 V78 C105 103 70 124 70 124 C70 124 35 103 35 78 V50 Z"
        fill="none"
        stroke="url(#goldMetal)"
        strokeWidth="1.6"
      />
      {/* Rebites da borda do escudo */}
      <circle cx="42" cy="54" r="1.7" fill="#cbd5e1" />
      <circle cx="98" cy="54" r="1.7" fill="#cbd5e1" />
      <circle cx="42" cy="82" r="1.7" fill="#cbd5e1" />
      <circle cx="98" cy="82" r="1.7" fill="#cbd5e1" />
      <circle cx="70" cy="120" r="1.7" fill="#cbd5e1" />

      {/* Cruz Templária em ouro velho */}
      <path d="M70 49 V112 M46 74 H94" stroke="url(#goldMetal)" strokeWidth="7" strokeLinecap="round" />
      <circle cx="70" cy="74" r="6.5" fill="url(#brushedIron)" stroke="url(#goldMetal)" strokeWidth="2" />
      <circle cx="70" cy="74" r="2.6" fill="url(#goldMetal)" />

      {/* Marcas de corte de espada (battle scars) */}
      <path d="M47 56 L62 66" stroke="#cbd5e1" strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />
      <path d="M84 88 L96 95" stroke="#cbd5e1" strokeWidth="1.1" opacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

export function CathedralRoseWindowSvg({ className = 'w-20 h-20' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={`${className} stained-shimmer`} aria-hidden="true" filter="url(#deepRelief)">
      <circle cx="60" cy="60" r="54" fill="url(#divineRay)" />
      <g className="animate-rays-slow" opacity="0.42">
        <line x1="60" y1="4" x2="60" y2="116" stroke="#dfc168" strokeWidth="1.1" strokeDasharray="3 5" />
        <line x1="4" y1="60" x2="116" y2="60" stroke="#dfc168" strokeWidth="1.1" strokeDasharray="3 5" />
        <line x1="20" y1="20" x2="100" y2="100" stroke="#dfc168" strokeWidth="0.9" strokeDasharray="3 6" />
        <line x1="100" y1="20" x2="20" y2="100" stroke="#dfc168" strokeWidth="0.9" strokeDasharray="3 6" />
      </g>
      <circle cx="60" cy="60" r="44" fill="#111214" stroke="url(#oxidizedBronze)" strokeWidth="4" />
      <circle cx="60" cy="60" r="41" fill="none" stroke="url(#goldMetal)" strokeWidth="1.2" />
      {/* Pétalas de Vitral Safira e Carmesim */}
      <path d="M60 18 L70 44 L60 60 L50 44 Z" fill="url(#sapphireGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M60 102 L70 76 L60 60 L50 76 Z" fill="url(#sapphireGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M18 60 L44 50 L60 60 L44 70 Z" fill="url(#rubyGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M102 60 L76 50 L60 60 L76 70 Z" fill="url(#rubyGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M30 30 L52 42 L60 60 L42 52 Z" fill="url(#rubyGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M90 30 L78 52 L60 60 L68 42 Z" fill="url(#rubyGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M30 90 L42 68 L60 60 L52 78 Z" fill="url(#sapphireGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <path d="M90 90 L68 78 L60 60 L78 68 Z" fill="url(#sapphireGlass)" stroke="url(#goldMetal)" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="14" fill="url(#goldMetal)" stroke="#291d08" strokeWidth="1.5" />
      <path d="M60 50 V70 M50 60 H70" stroke="#141517" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function WatchTorchHourglassSvg({
  secondsLeft,
  active,
}: {
  secondsLeft: number | null;
  active: boolean;
}) {
  const ratio = active && secondsLeft !== null ? Math.max(0, Math.min(1, secondsLeft / 60)) : 1;
  const topSandHeight = Math.round(18 * ratio);
  const bottomSandHeight = Math.round(18 * (1 - ratio));

  return (
    <svg viewBox="0 0 110 80" className="w-24 h-18 shrink-0" aria-hidden="true" filter="url(#deepRelief)">
      {/* Tocha da muralha à esquerda */}
      <g>
        <rect x="20" y="36" width="8" height="34" rx="2" fill="url(#oxidizedBronze)" stroke="#232629" strokeWidth="1.5" />
        <path d="M15 36 H33 L30 43 H18 Z" fill="url(#brushedIron)" stroke="url(#goldMetal)" strokeWidth="1.2" />
        <path
          d="M24 10 C32 20 34 29 24 36 C14 29 16 20 24 10 Z"
          fill={active ? '#ea580c' : '#57534e'}
          className={active ? 'torch-flame' : ''}
        />
        {active && (
          <path
            d="M24 17 C28 23 28 30 24 35 C20 30 20 23 24 17 Z"
            fill="#fde047"
            className="torch-flame"
          />
        )}
      </g>

      {/* Ampulheta de bronze à direita */}
      <g transform="translate(48, 8)">
        <rect x="6" y="4" width="38" height="4" rx="1.5" fill="url(#oxidizedBronze)" stroke="url(#goldMetal)" strokeWidth="1" />
        <rect x="6" y="58" width="38" height="4" rx="1.5" fill="url(#oxidizedBronze)" stroke="url(#goldMetal)" strokeWidth="1" />
        <line x1="10" y1="8" x2="10" y2="58" stroke="url(#steelBlade)" strokeWidth="2" />
        <line x1="40" y1="8" x2="40" y2="58" stroke="url(#steelBlade)" strokeWidth="2" />
        <path
          d="M13 9 H37 L27 32 L37 57 H13 L23 32 Z"
          fill="rgba(20, 21, 23, 0.72)"
          stroke="rgba(223, 193, 104, 0.55)"
          strokeWidth="1.2"
        />
        {/* Areia superior */}
        {topSandHeight > 0 && (
          <rect
            x="16"
            y={30 - topSandHeight}
            width="18"
            height={topSandHeight}
            rx="2"
            fill="url(#goldMetal)"
            opacity="0.88"
          />
        )}
        {/* Fio de areia caindo durante vigília */}
        {active && ratio > 0 && (
          <line x1="25" y1="31" x2="25" y2="56" stroke="#dfc168" strokeWidth="1.5" strokeDasharray="2 2" />
        )}
        {/* Areia inferior */}
        {bottomSandHeight > 0 && (
          <rect
            x="15"
            y={56 - bottomSandHeight}
            width="20"
            height={bottomSandHeight}
            rx="2"
            fill="url(#goldMetal)"
            opacity="0.92"
          />
        )}
      </g>
    </svg>
  );
}

export function CommanderBattleCrest({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 130" className={className} aria-hidden="true" filter="url(#deepRelief)">
      {/* Estandarte militar */}
      <line x1="28" y1="14" x2="28" y2="116" stroke="url(#steelBlade)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 18 H68 L60 36 L68 54 H30 Z" fill="url(#crimsonShield)" stroke="url(#goldMetal)" strokeWidth="2" />
      <path d="M46 25 V47 M37 36 H55" stroke="url(#goldMetal)" strokeWidth="2.5" strokeLinecap="round" />
      {/* Espada templária de aço */}
      <path d="M108 16 L52 94" stroke="url(#steelBlade)" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M90 34 L114 48" stroke="url(#oxidizedBronze)" strokeWidth="4.8" strokeLinecap="round" />
      <circle cx="108" cy="18" r="4" fill="url(#goldMetal)" />
      {/* Escudo frontal reforçado */}
      <path
        d="M74 36 L110 50 V78 C110 104 74 122 74 122 C74 122 38 104 38 78 V50 Z"
        fill="url(#crimsonShield)"
        stroke="url(#brushedIron)"
        strokeWidth="4.5"
        filter="url(#goldShadow)"
      />
      <path
        d="M74 40 L106 53 V78 C106 101 74 117 74 117 C74 117 42 101 42 78 V53 Z"
        fill="none"
        stroke="url(#goldMetal)"
        strokeWidth="1.5"
      />
      <path d="M74 49 V106 M51 74 H97" stroke="url(#goldMetal)" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="74" cy="74" r="6" fill="url(#brushedIron)" stroke="url(#goldMetal)" strokeWidth="1.8" />
    </svg>
  );
}

export function VictoryCrownCrest({ className = 'w-20 h-20' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" filter="url(#goldShadow)">
      <path d="M18 82 L82 18 M82 82 L18 18" stroke="url(#steelBlade)" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M22 65 L15 35 L38 50 L50 22 L62 50 L85 35 L78 65 Z"
        fill="url(#goldMetal)"
        stroke="#2b1e06"
        strokeWidth="2"
      />
      <circle cx="50" cy="52" r="5" fill="url(#crimsonShield)" stroke="#ead38c" strokeWidth="1.2" />
    </svg>
  );
}

export function DemonBossCrest({
  className = 'w-24 h-24',
  variant = 'rotativo',
}: {
  className?: string;
  variant?: 'rotativo' | 'impulso' | 'inflacao' | 'procrastinacao';
}) {
  if (variant === 'impulso') {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true" filter="url(#deepRelief)">
        <circle cx="60" cy="60" r="48" fill="url(#specterMist)" opacity="0.22" />
        <path
          d="M60 12 C34 12 24 36 24 62 L18 106 L36 94 L48 108 L60 94 L72 108 L84 94 L102 106 L96 62 C96 36 86 12 60 12 Z"
          fill="url(#specterMist)"
          stroke="#a855f7"
          strokeWidth="2.5"
        />
        <path d="M40 44 Q60 32 80 44 L76 68 Q60 78 44 68 Z" fill="#090414" stroke="#c084fc" strokeWidth="1.5" />
        <circle cx="49" cy="54" r="4.5" fill="#f0abfc" />
        <circle cx="71" cy="54" r="4.5" fill="#f0abfc" />
        <circle cx="20" cy="38" r="7" fill="url(#goldMetal)" filter="url(#goldShadow)" />
        <circle cx="100" cy="38" r="7" fill="url(#goldMetal)" filter="url(#goldShadow)" />
      </svg>
    );
  }

  if (variant === 'inflacao') {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true" filter="url(#deepRelief)">
        <path d="M8 40 L34 22 L42 62 Z" fill="#5c1111" stroke="url(#goldMetal)" strokeWidth="2.2" />
        <path d="M112 40 L86 22 L78 62 Z" fill="#5c1111" stroke="url(#goldMetal)" strokeWidth="2.2" />
        <path
          d="M34 24 L46 42 L60 14 L74 42 L86 24 L90 70 L60 108 L30 70 Z"
          fill="url(#demonFire)"
          stroke="url(#goldMetal)"
          strokeWidth="2.5"
        />
        <path d="M42 54 L56 60 L44 65 Z" fill="#fef08a" />
        <path d="M78 54 L64 60 L76 65 Z" fill="#fef08a" />
        <path d="M46 82 Q60 98 74 82 Q60 72 46 82 Z" fill="#ea580c" />
      </svg>
    );
  }

  if (variant === 'procrastinacao') {
    return (
      <svg viewBox="0 0 120 120" className={className} aria-hidden="true" filter="url(#deepRelief)">
        <path
          d="M60 10 L96 36 L88 100 L60 112 L32 100 L24 36 Z"
          fill="url(#shadowVoid)"
          stroke="#71717a"
          strokeWidth="2.5"
        />
        <path
          d="M40 36 H80 L60 60 L80 84 H40 L60 60 Z"
          fill="none"
          stroke="url(#goldMetal)"
          strokeWidth="3.2"
          strokeLinejoin="round"
          filter="url(#goldShadow)"
        />
        <circle cx="48" cy="45" r="3.5" fill="#fde047" />
        <circle cx="72" cy="45" r="3.5" fill="#fde047" />
        <path d="M50 78 H70 L60 66 Z" fill="#d97706" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" filter="url(#deepRelief)">
      <circle cx="60" cy="64" r="46" fill="url(#demonFire)" opacity="0.22" />
      <path d="M22 46 Q6 12 36 20 Q32 36 44 41 Z" fill="url(#oxidizedBronze)" stroke="url(#goldMetal)" strokeWidth="1.5" />
      <path d="M98 46 Q114 12 84 20 Q88 36 76 41 Z" fill="url(#oxidizedBronze)" stroke="url(#goldMetal)" strokeWidth="1.5" />
      <path
        d="M30 38 Q60 22 90 38 L96 76 Q60 108 24 76 Z"
        fill="url(#demonFire)"
        stroke="#290505"
        strokeWidth="3"
      />
      <path d="M34 66 H86" stroke="url(#steelBlade)" strokeWidth="2.5" opacity="0.65" />
      <path d="M40 52 L53 59 L41 64 Z" fill="#fef08a" />
      <path d="M80 52 L67 59 L79 64 Z" fill="#fef08a" />
      <path d="M44 82 L52 75 L60 83 L68 75 L76 82" fill="none" stroke="#fef08a" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

export function RelicIconSvg({
  relicId,
  unlocked,
  className = 'w-12 h-12',
}: {
  relicId: string;
  unlocked: boolean;
  className?: string;
}) {
  const strokeMain = unlocked ? 'url(#goldMetal)' : '#4b5058';
  const fillMain = unlocked ? 'url(#goldMetal)' : '#232629';
  const gemFill = unlocked ? 'url(#emeraldGem)' : '#141517';
  const filterAttr = unlocked ? 'url(#goldShadow)' : undefined;

  switch (relicId) {
    case 'primeiro_milhar':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <circle cx="26" cy="36" r="14" fill={fillMain} stroke={strokeMain} strokeWidth="2.5" />
          <circle cx="38" cy="28" r="14" fill={fillMain} stroke="#2b1e06" strokeWidth="2" />
          <text x="38" y="33" textAnchor="middle" fill={unlocked ? '#141517' : '#71717a'} fontSize="13" fontWeight="900">$</text>
        </svg>
      );
    case 'guardiao_fiel':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <path d="M32 8 L52 16 V34 C52 48 32 56 32 56 C32 56 12 48 12 34 V16 Z" fill={unlocked ? 'url(#crimsonShield)' : '#181a1d'} stroke={strokeMain} strokeWidth="2.5" />
          <path d="M32 18 V44 M22 29 H42" stroke={strokeMain} strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'cavaleiro_rosario':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <circle cx="32" cy="24" r="14" fill="none" stroke={strokeMain} strokeWidth="2.5" strokeDasharray="3 4" />
          <path d="M32 38 V56 M25 45 H39" stroke={strokeMain} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="32" cy="38" r="3.5" fill={gemFill} />
        </svg>
      );
    case 'muralha_erguida':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <path d="M12 52 V24 H20 V30 H28 V20 H36 V30 H44 V24 H52 V52 Z" fill={fillMain} stroke="#141517" strokeWidth="2" />
          <rect x="27" y="38" width="10" height="14" rx="5" fill={unlocked ? '#141517' : '#0b0c0e'} />
        </svg>
      );
    case 'libertador_credito':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <path d="M14 48 L48 14" stroke={unlocked ? 'url(#steelBlade)' : '#4b5058'} strokeWidth="5" strokeLinecap="round" />
          <path d="M18 36 L28 46" stroke={strokeMain} strokeWidth="4" strokeLinecap="round" />
          <circle cx="46" cy="44" r="8" fill="none" stroke={strokeMain} strokeWidth="2.5" strokeDasharray="10 4" />
        </svg>
      );
    case 'matador_gigantes':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <path d="M14 46 L10 22 L24 32 L32 14 L40 32 L54 22 L50 46 Z" fill={fillMain} stroke="#2b1e06" strokeWidth="2" />
          <circle cx="32" cy="36" r="4" fill={gemFill} />
        </svg>
      );
    case 'provedor_nazare':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <path d="M14 26 L42 26 L46 34 H14 Z" fill={fillMain} stroke="#2b1e06" strokeWidth="2" />
          <rect x="34" y="16" width="8" height="36" rx="2" fill={unlocked ? 'url(#steelBlade)' : '#4b5058'} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter={filterAttr}>
          <path d="M18 14 H44 V50 H18 Z" fill={unlocked ? '#231b15' : '#181a1d'} stroke={strokeMain} strokeWidth="2.5" />
          <line x1="24" y1="24" x2="38" y2="24" stroke={strokeMain} strokeWidth="2" />
          <line x1="24" y1="32" x2="38" y2="32" stroke={strokeMain} strokeWidth="2" />
          <circle cx="38" cy="42" r="5" fill={unlocked ? '#7f1d1d' : '#232629'} stroke={strokeMain} strokeWidth="1.5" />
        </svg>
      );
  }
}

export function CorollaSilhouetteSvg({
  className = 'w-full max-w-md h-44',
  revving = false,
  progressPct = 100,
}: {
  className?: string;
  revving?: boolean;
  progressPct?: number;
}) {
  const pct = Math.min(100, Math.max(0, progressPct));
  const engineUnlocked = pct > 20; // Fase 2 (21-40%): Bloco do Motor 2.0
  const bodyUnlocked = pct > 40; // Fase 3 (41-60%): Carroceria e pintura
  const wheelsUnlocked = pct > 60; // Fase 4 (61-80%): Rodas e suspensão
  const readyUnlocked = pct > 80; // Fase 5 (81-100%): Faróis acesos + Selo Pronto para Compra à Vista

  const activePhase = readyUnlocked
    ? 5
    : wheelsUnlocked
    ? 4
    : bodyUnlocked
    ? 3
    : engineUnlocked
    ? 2
    : 1;

  return (
    <svg
      viewBox="0 0 460 172"
      className={`${className} ${revving ? 'engine-vibrate' : ''}`}
      role="img"
      aria-label={`Montagem do Corolla XEi 2017 em fase ${activePhase} de 5 (${Math.round(pct)}% da Caixinha 3)`}
    >
      {/* Grade tática do Hangar de Engenharia em aço e ouro envelhecido */}
      <g stroke="rgba(234,179,8,0.14)" strokeWidth="0.75">
        <line x1="14" y1="22" x2="446" y2="22" />
        <line x1="14" y1="52" x2="446" y2="52" />
        <line x1="14" y1="82" x2="446" y2="82" />
        <line x1="14" y1="112" x2="446" y2="112" />
        <line x1="14" y1="138" x2="446" y2="138" />
        <line x1="64" y1="12" x2="64" y2="146" />
        <line x1="160" y1="12" x2="160" y2="146" />
        <line x1="256" y1="12" x2="256" y2="146" />
        <line x1="352" y1="12" x2="352" y2="146" />
      </g>

      {/* Piso do Hangar & Bancada Hidráulica */}
      <line x1="24" y1="138" x2="436" y2="138" stroke="rgba(234,179,8,0.45)" strokeWidth="1.2" />
      {!wheelsUnlocked && (
        <g opacity="0.88">
          {/* Cavaletes de montagem visíveis até destravar rodas e suspensão na Fase 4 */}
          <path d="M114 138 L122 117 H134 L142 138 Z" fill="#1c2026" stroke="#855e21" strokeWidth="1.2" />
          <path d="M312 138 L320 117 H332 L340 138 Z" fill="#1c2026" stroke="#855e21" strokeWidth="1.2" />
        </g>
      )}

      {/* Silhueta fantasma (planta técnica pontilhada das fases ainda bloqueadas) */}
      <g
        fill="none"
        stroke="rgba(162,172,186,0.22)"
        strokeWidth="1"
        strokeDasharray="3 3"
        style={{ transition: 'opacity 450ms ease', opacity: bodyUnlocked ? 0.08 : 0.45 }}
      >
        <path d="M48 106 L62 80 L122 72 L172 42 L274 42 L328 72 L386 80 L398 106 L378 112 H66 Z" />
        <circle cx="128" cy="114" r="21" />
        <circle cx="326" cy="114" r="21" />
      </g>

      {/* FASE 1 (0–20%): Chassi & Esqueleto Estrutural Blindado */}
      <g style={{ transition: 'opacity 450ms ease', opacity: 1 }}>
        {/* Longarina principal e assoalho de aço */}
        <path
          d="M60 110 H384 L378 117 H68 Z"
          fill="url(#steelBlade)"
          stroke="url(#oxidizedBronze)"
          strokeWidth="1.5"
        />
        {/* Travessas estruturais e gaiola do habitáculo */}
        <path
          d="M74 110 L88 83 L134 76 L176 46 H270 L322 76 L372 84 L380 110"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <line x1="176" y1="46" x2="152" y2="110" stroke="#64748b" strokeWidth="1.8" />
        <line x1="224" y1="46" x2="224" y2="110" stroke="#94a3b8" strokeWidth="2.2" />
        <line x1="270" y1="46" x2="296" y2="110" stroke="#64748b" strokeWidth="1.8" />
        {/* Parede corta-fogo e berço frontal do motor */}
        <path d="M300 76 V110 H376" fill="none" stroke="#eab308" strokeWidth="1.4" opacity="0.72" />
        {/* Eixos de referência para montagem das rodas */}
        <circle cx="128" cy="114" r="4.5" fill="#1e293b" stroke="#eab308" strokeWidth="1.2" />
        <circle cx="326" cy="114" r="4.5" fill="#1e293b" stroke="#eab308" strokeWidth="1.2" />
      </g>

      {/* FASE 2 (21–40%): Bloco do Motor 2.0 Dual VVT-i */}
      <g
        style={{
          transition: 'opacity 500ms ease, transform 500ms ease',
          opacity: engineUnlocked ? (bodyUnlocked ? 0.52 : 1) : 0,
          transform: engineUnlocked ? 'translateY(0px)' : 'translateY(-6px)',
        }}
      >
        {/* Bloco fundido e cárter */}
        <rect
          x="306"
          y="78"
          width="54"
          height="29"
          rx="3"
          fill="url(#brushedIron)"
          stroke="#eab308"
          strokeWidth="1.4"
        />
        {/* Cabeçote Dual VVT-i dourado */}
        <path d="M310 74 H354 L350 80 H314 Z" fill="url(#goldMetal)" />
        {/* Coletores de admissão (4 cilindros) */}
        <g stroke="#cbd5e1" strokeWidth="1.6" strokeLinecap="round">
          <line x1="316" y1="82" x2="316" y2="96" />
          <line x1="325" y1="82" x2="325" y2="96" />
          <line x1="334" y1="82" x2="334" y2="96" />
          <line x1="343" y1="82" x2="343" y2="96" />
        </g>
        {/* Polias, correia & radiador frontal */}
        <circle cx="352" cy="95" r="5" fill="#111317" stroke="#eab308" strokeWidth="1.3" />
        <rect x="364" y="79" width="5" height="28" rx="1" fill="#334155" stroke="#94a3b8" strokeWidth="0.9" />
        {!bodyUnlocked && (
          <text
            x="334"
            y="67"
            textAnchor="middle"
            fill="#fde047"
            fontSize="7.5"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            MOTOR 2.0 154 CV
          </text>
        )}
      </g>

      {/* FASE 3 (41–60%): Carroceria Blindada & Pintura em Aço Escovado / Bronze */}
      <g
        style={{
          transition: 'opacity 500ms ease, transform 500ms ease',
          opacity: bodyUnlocked ? 1 : 0,
          transform: bodyUnlocked ? 'translateY(0px)' : 'translateY(-8px)',
        }}
      >
        {/* Escapamento traseiro e fumaça apenas ao acelerar no Cockpit */}
        {revving && (
          <g>
            <circle cx="38" cy="108" r="6" fill="rgba(148,163,184,0.45)" className="exhaust-smoke-1" />
            <circle cx="30" cy="105" r="8" fill="rgba(100,116,139,0.38)" className="exhaust-smoke-2" />
          </g>
        )}
        <rect x="40" y="106" width="14" height="5" rx="1" fill="url(#steelBlade)" />

        {/* Lataria esculpida em aço escovado */}
        <path
          d="M48 108 L60 80 L122 72 L172 42 L274 42 L328 72 L386 80 L398 108 L378 113 H66 Z"
          fill="url(#brushedIron)"
          stroke="url(#oxidizedBronze)"
          strokeWidth="2.8"
          strokeLinejoin="round"
          filter="url(#deepRelief)"
          fillOpacity={0.94}
        />
        {/* Recorte translúcido sutil de engenharia para manter o Motor 2.0 perceptível */}
        <path
          d="M304 75 H362 L372 106 H304 Z"
          fill="rgba(11,13,18,0.42)"
          stroke="rgba(234,179,8,0.45)"
          strokeWidth="0.9"
          strokeDasharray="3 2"
        />
        {/* Vinco lateral em ouro envelhecido */}
        <path
          d="M54 105 L64 82 L124 74 L174 45 L272 45 L326 74 L383 82 L393 105"
          fill="none"
          stroke="url(#goldMetal)"
          strokeWidth="1.3"
          opacity="0.78"
        />
        {/* Portas, colunas blindadas e rebites */}
        <line x1="146" y1="74" x2="146" y2="111" stroke="rgba(203,213,225,0.28)" strokeWidth="1" />
        <line x1="224" y1="45" x2="224" y2="112" stroke="rgba(203,213,225,0.38)" strokeWidth="1.2" />
        <line x1="298" y1="74" x2="298" y2="111" stroke="rgba(203,213,225,0.28)" strokeWidth="1" />
        <circle cx="154" cy="88" r="1.4" fill="#eab308" />
        <circle cx="232" cy="88" r="1.4" fill="#eab308" />
        <circle cx="306" cy="88" r="1.4" fill="#eab308" />

        {/* Vidros blindados & retrovisor */}
        <path
          d="M178 48 L268 48 L314 72 H138 Z"
          fill="rgba(16,18,22,0.9)"
          stroke="url(#steelBlade)"
          strokeWidth="1.4"
        />
        <line x1="222" y1="48" x2="222" y2="72" stroke="url(#oxidizedBronze)" strokeWidth="2" />
        <path d="M292 67 L305 64 L305 71 L292 71 Z" fill="url(#brushedIron)" stroke="#eab308" strokeWidth="0.9" />

        {/* Grade dianteira cromada/aço e carcaças apagadas dos faróis */}
        <path d="M386 85 H399 L396 98 H383 Z" fill="url(#steelBlade)" />
        <path d="M364 81 L388 83 L381 91 L359 89 Z" fill="#3a3326" stroke="#855e21" strokeWidth="0.8" />
        <path d="M50 83 L64 81 L62 90 L48 90 Z" fill="#450a0a" stroke="#7f1d1d" strokeWidth="0.8" />
      </g>

      {/* FASE 4 (61–80%): Rodas Forjadas & Suspensão Independente */}
      <g
        style={{
          transition: 'opacity 500ms ease, transform 500ms ease',
          opacity: wheelsUnlocked ? 1 : 0,
          transform: wheelsUnlocked ? 'translateY(0px)' : 'translateY(8px)',
        }}
      >
        {/* Molas helicoidais e amortecedores dourados */}
        <g stroke="#eab308" strokeWidth="1.8" strokeLinecap="round">
          <line x1="128" y1="84" x2="128" y2="110" />
          <path d="M122 89 H134 M122 94 H134 M122 99 H134" />
          <line x1="326" y1="84" x2="326" y2="110" />
          <path d="M320 89 H332 M320 94 H332 M320 99 H332" />
        </g>

        {/* Caixas de roda recortadas */}
        <circle cx="128" cy="114" r="23" fill="#090a0d" />
        <circle cx="326" cy="114" r="23" fill="#090a0d" />

        {/* Roda Traseira Forjada */}
        <g className={revving ? 'animate-wheel-spin-left' : ''}>
          <circle cx="128" cy="114" r="20" fill="#0c0d0f" stroke="url(#steelBlade)" strokeWidth="3.4" />
          <circle cx="128" cy="114" r="12" fill="none" stroke="url(#oxidizedBronze)" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="128" y1="98" x2="128" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="112" y1="114" x2="144" y2="114" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="117" y1="103" x2="139" y2="125" stroke="#94a3b8" strokeWidth="1.1" />
          <line x1="139" y1="103" x2="117" y2="125" stroke="#94a3b8" strokeWidth="1.1" />
          <circle cx="128" cy="114" r="5" fill="url(#goldMetal)" />
        </g>

        {/* Roda Dianteira Forjada */}
        <g className={revving ? 'animate-wheel-spin-right' : ''}>
          <circle cx="326" cy="114" r="20" fill="#0c0d0f" stroke="url(#steelBlade)" strokeWidth="3.4" />
          <circle cx="326" cy="114" r="12" fill="none" stroke="url(#oxidizedBronze)" strokeWidth="2" strokeDasharray="3 3" />
          <line x1="326" y1="98" x2="326" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="310" y1="114" x2="342" y2="114" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="315" y1="103" x2="337" y2="125" stroke="#94a3b8" strokeWidth="1.1" />
          <line x1="337" y1="103" x2="315" y2="125" stroke="#94a3b8" strokeWidth="1.1" />
          <circle cx="326" cy="114" r="5" fill="url(#goldMetal)" />
        </g>
      </g>

      {/* FASE 5 (81–100%): Faróis Acesos, Brasão & Selo "Pronto para Compra à Vista" */}
      <g
        style={{
          transition: 'opacity 550ms ease',
          opacity: readyUnlocked ? 1 : 0,
        }}
      >
        {/* Faróis LED acesos e facho dourado */}
        <path
          d="M364 81 L388 83 L381 91 L359 89 Z"
          fill="#ffffff"
          filter="url(#goldShadow)"
        />
        <polygon
          points={revving ? '388,78 458,46 458,122 388,92' : '388,82 454,64 454,106 388,90'}
          fill="url(#headlightBeam)"
          opacity={revving ? 1 : 0.78}
        />
        {/* Lanterna traseira acesa */}
        <path d="M50 83 L64 81 L62 90 L48 90 Z" fill="#ef4444" filter="url(#deepRelief)" />
        {/* Emblema dourado na porta */}
        <circle cx="248" cy="88" r="4" fill="none" stroke="#eab308" strokeWidth="1.2" />
        <path d="M248 85 L250.5 88 L248 91 L245.5 88 Z" fill="#fde047" />
        {/* Selo de engenharia no canto superior */}
        <g transform="translate(20, 18)">
          <rect
            x="0"
            y="0"
            width="178"
            height="20"
            rx="4"
            fill="rgba(6,78,59,0.88)"
            stroke="#34d399"
            strokeWidth="1.1"
          />
          <text
            x="89"
            y="13"
            textAnchor="middle"
            fill="#ecfdf5"
            fontSize="8.2"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            PRONTO PARA COMPRA À VISTA
          </text>
        </g>
      </g>

      {/* Legenda de engenharia inferior */}
      <text
        x="230"
        y="156"
        textAnchor="middle"
        fill="#eab308"
        fontSize="8.5"
        fontWeight="600"
        fontFamily="JetBrains Mono, monospace"
      >
        HANGAR COROLLA XEi 2.0 · FASE {activePhase}/5 ({Math.round(pct)}% DA ARCA III)
      </text>
    </svg>
  );
}

export function CrusadeMapSvg({
  conquered,
}: {
  conquered: Record<number, boolean>;
}) {
  const nodes: { id: number; roman: string; x: number; y: number; label: string }[] = [
    { id: 1, roman: 'I', x: 75, y: 155, label: 'Portão do Crédito' },
    { id: 2, roman: 'II', x: 185, y: 85, label: 'Cidadela S. José' },
    { id: 3, roman: 'III', x: 300, y: 150, label: 'Vale Manjedoura' },
    { id: 4, roman: 'IV', x: 420, y: 80, label: 'Planície da Honra' },
    { id: 5, roman: 'V', x: 540, y: 150, label: 'Bastião Corolla' },
    { id: 6, roman: 'VI', x: 660, y: 75, label: 'Monte do Legado' },
  ];

  return (
    <svg viewBox="0 0 740 232" className="w-full h-auto" role="img" aria-label="Mapa topográfico militar dos 6 Feudos da Cruzada">
      {/* Mesa de guerra em couro escuro e pedra */}
      <rect x="4" y="4" width="732" height="224" rx="6" fill="#131110" stroke="url(#oxidizedBronze)" strokeWidth="2" />

      {/* Grade cartográfica e curvas de nível topográficas */}
      <g stroke="rgba(197,155,39,0.08)" strokeWidth="0.8">
        <line x1="120" y1="8" x2="120" y2="224" />
        <line x1="245" y1="8" x2="245" y2="224" />
        <line x1="370" y1="8" x2="370" y2="224" />
        <line x1="495" y1="8" x2="495" y2="224" />
        <line x1="620" y1="8" x2="620" y2="224" />
        <line x1="8" y1="75" x2="732" y2="75" />
        <line x1="8" y1="150" x2="732" y2="150" />
      </g>

      {/* Linhas de fronteira territorial */}
      <g stroke="rgba(127,29,29,0.42)" strokeWidth="1.2" strokeDasharray="4 4">
        <path d="M130 14 Q142 118 130 220" fill="none" />
        <path d="M242 14 Q230 118 242 220" fill="none" />
        <path d="M362 14 Q375 118 362 220" fill="none" />
        <path d="M482 14 Q470 118 482 220" fill="none" />
        <path d="M600 14 Q612 118 600 220" fill="none" />
      </g>

      {/* Relevo de montanhas e curvas topográficas */}
      <path d="M18 190 L70 128 L108 166 L158 112 L205 168 L268 106 L325 178 L412 102 L490 174 L592 94 L665 160 L720 114" fill="none" stroke="rgba(166,153,130,0.16)" strokeWidth="1.8" />
      <ellipse cx="185" cy="85" rx="44" ry="26" fill="none" stroke="rgba(197,155,39,0.12)" strokeWidth="1" />
      <ellipse cx="420" cy="80" rx="46" ry="28" fill="none" stroke="rgba(197,155,39,0.12)" strokeWidth="1" />
      <ellipse cx="660" cy="75" rx="48" ry="28" fill="none" stroke="rgba(197,155,39,0.12)" strokeWidth="1" />

      {/* Rosa dos Ventos discreta no canto superior esquerdo */}
      <g transform="translate(34, 34)" opacity="0.5">
        <circle cx="0" cy="0" r="14" fill="none" stroke="#c59b27" strokeWidth="1" />
        <path d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z" fill="#c59b27" />
      </g>

      {/* Trilha militar da campanha */}
      <path
        d="M75 155 Q130 95 185 85 T300 150 T420 80 T540 150 T660 75"
        fill="none"
        stroke="url(#goldMetal)"
        strokeWidth="2.8"
        strokeDasharray="8 5"
        opacity="0.72"
      />

      {nodes.map((node) => {
        const done = !!conquered[node.id];
        const fillCastelo = done ? 'url(#emeraldGem)' : 'url(#brushedIron)';
        const strokeCastelo = done ? '#34d399' : '#525861';
        const flagColor = done ? '#10b981' : '#7f1d1d';

        return (
          <g key={node.id} filter={done ? 'url(#goldShadow)' : 'url(#deepRelief)'}>
            {/* Espadas cruzadas marcando batalhas vencidas */}
            {done && (
              <g stroke="url(#steelBlade)" strokeWidth="2.4" strokeLinecap="round" opacity="0.9">
                <line x1={node.x - 24} y1={node.y + 18} x2={node.x + 24} y2={node.y - 18} />
                <line x1={node.x + 24} y1={node.y + 18} x2={node.x - 24} y2={node.y - 18} />
              </g>
            )}

            {/* Bastião / Fortaleza */}
            <rect x={node.x - 16} y={node.y - 12} width="32" height="24" rx="2" fill={fillCastelo} stroke={strokeCastelo} strokeWidth="2" />
            <path
              d={`M${node.x - 18} ${node.y - 12} H${node.x + 18} V${node.y - 18} H${node.x + 10} V${node.y - 14} H${node.x + 3} V${node.y - 18} H${node.x - 3} V${node.y - 14} H${node.x - 10} V${node.y - 18} H${node.x - 18} Z`}
              fill={done ? 'url(#goldMetal)' : '#3a3f45'}
            />

            {/* Bandeira de campanha tremulando ao vento */}
            <line x1={node.x} y1={node.y - 18} x2={node.x} y2={node.y - 40} stroke="url(#steelBlade)" strokeWidth="2" />
            <g
              style={{ transformOrigin: `${node.x}px ${node.y - 34}px` }}
              className="banner-flutter"
            >
              <polygon
                points={`${node.x},${node.y - 40} ${node.x + 20},${node.y - 34} ${node.x + 14},${node.y - 30} ${node.x + 20},${node.y - 26} ${node.x},${node.y - 24}`}
                fill={flagColor}
                stroke={done ? '#dfc168' : '#3a3f45'}
                strokeWidth="0.9"
              />
            </g>

            <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="800" fontFamily="Cinzel, serif">
              {node.roman}
            </text>
            <text x={node.x} y={node.y + 29} textAnchor="middle" fill={done ? '#6ee7b7' : '#d5c7b0'} fontSize="10" fontWeight="700">
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function VaultChestSvg({
  vaultId,
  className = 'w-10 h-10',
  breatheDelayMs = 0,
}: {
  vaultId: 1 | 2 | 3 | 4;
  className?: string;
  breatheDelayMs?: number;
}) {
  const gemFill =
    vaultId === 1
      ? 'url(#rubyGlass)'
      : vaultId === 2
      ? 'url(#emeraldGem)'
      : vaultId === 3
      ? 'url(#goldMetal)'
      : 'url(#sapphireGlass)';

  const trimStroke =
    vaultId === 2
      ? '#34d399'
      : vaultId === 4
      ? '#60a5fa'
      : 'url(#goldMetal)';

  return (
    <svg
      viewBox="0 0 64 64"
      className={`${className} arca-breathe`}
      style={breatheDelayMs > 0 ? { animationDelay: `${breatheDelayMs}ms` } : undefined}
      aria-hidden="true"
    >
      {/* Aura sutil de prosperidade */}
      <ellipse cx="32" cy="36" rx="24" ry="18" fill="url(#divineRay)" opacity="0.55" />

      {/* Tampa arqueada da arca */}
      <path
        d="M11 27 C11 16 20 12 32 12 C44 12 53 16 53 27 Z"
        fill="url(#oxidizedBronze)"
        stroke={trimStroke}
        strokeWidth="2"
      />
      {/* Corpo reforçado em ferro e couro */}
      <rect
        x="10"
        y="27"
        width="44"
        height="24"
        rx="4"
        fill="url(#brushedIron)"
        stroke={trimStroke}
        strokeWidth="2"
      />
      {/* Cintas metálicas verticais */}
      <rect x="18" y="15" width="4.5" height="36" rx="1" fill="url(#goldMetal)" opacity="0.9" />
      <rect x="41.5" y="15" width="4.5" height="36" rx="1" fill="url(#goldMetal)" opacity="0.9" />
      {/* Divisa da tampa */}
      <line x1="10" y1="27" x2="54" y2="27" stroke="#e4c770" strokeWidth="1.6" />

      {/* Fechadura real com gema da Arca */}
      <rect
        x="26.5"
        y="22.5"
        width="11"
        height="13"
        rx="2.5"
        fill="#141517"
        stroke="url(#goldMetal)"
        strokeWidth="1.8"
      />
      <circle cx="32" cy="29" r="3.4" fill={gemFill} stroke="#f3ead6" strokeWidth="0.8" />
    </svg>
  );
}

export function ParchmentScrollIcon({
  variant = 'calendar',
  className = 'w-12 h-12',
}: {
  variant?: 'calendar' | 'wealth' | 'xp';
  className?: string;
}) {
  const sealFill =
    variant === 'calendar'
      ? 'url(#crimsonShield)'
      : variant === 'wealth'
      ? 'url(#emeraldGem)'
      : 'url(#goldMetal)';

  const sealStroke = variant === 'xp' ? '#2b1e06' : '#e4c770';

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      filter="url(#deepRelief)"
    >
      {/* Brilho sutil atrás do pergaminho */}
      <circle cx="32" cy="32" r="24" fill="url(#divineRay)" opacity="0.45" />

      {/* Corpo do pergaminho desenrolado */}
      <path
        d="M16 14 H48 V48 C48 51 45 53 42 53 H19 C17 53 16 51 16 49 Z"
        fill="#241c14"
        stroke="url(#goldMetal)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Sombra interna da folha */}
      <rect
        x="19"
        y="17"
        width="26"
        height="31"
        rx="1.5"
        fill="none"
        stroke="rgba(228, 199, 112, 0.22)"
        strokeWidth="0.9"
      />

      {/* Rolo superior de madeira & pontas em bronze oxidado */}
      <rect
        x="11"
        y="10"
        width="42"
        height="7"
        rx="3.5"
        fill="url(#oxidizedBronze)"
        stroke="url(#goldMetal)"
        strokeWidth="1.4"
      />
      <circle cx="11.5" cy="13.5" r="2.6" fill="url(#goldMetal)" />
      <circle cx="52.5" cy="13.5" r="2.6" fill="url(#goldMetal)" />

      {/* Rolo inferior */}
      <rect
        x="13"
        y="48"
        width="38"
        height="6.5"
        rx="3.2"
        fill="url(#oxidizedBronze)"
        stroke="url(#goldMetal)"
        strokeWidth="1.3"
      />
      <circle cx="13.5" cy="51.25" r="2.2" fill="url(#goldMetal)" />
      <circle cx="50.5" cy="51.25" r="2.2" fill="url(#goldMetal)" />

      {/* Linhas caligráficas do pergaminho */}
      <line x1="23" y1="24" x2="41" y2="24" stroke="#d5c7b0" strokeWidth="1.7" strokeLinecap="round" opacity="0.82" />
      <line x1="23" y1="30" x2="38" y2="30" stroke="#9e9380" strokeWidth="1.5" strokeLinecap="round" opacity="0.72" />
      <line x1="23" y1="36" x2="32" y2="36" stroke="#9e9380" strokeWidth="1.5" strokeLinecap="round" opacity="0.68" />

      {/* Selo de cera real característico da métrica */}
      <circle
        cx="41"
        cy="40"
        r="8.2"
        fill={sealFill}
        stroke={sealStroke}
        strokeWidth="1.4"
        filter="url(#goldShadow)"
      />
      {variant === 'calendar' && (
        <path
          d="M38 36.5 H44 L41 40 L44 43.5 H38 L41 40 Z"
          fill="none"
          stroke="#f3ead6"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      )}
      {variant === 'wealth' && (
        <path
          d="M41 35.8 V44.2 M37.5 40 H44.5"
          stroke="#f3ead6"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      {variant === 'xp' && (
        <path
          d="M41 35.4 L42.4 38.4 L45.6 38.8 L43.2 41 L43.8 44.2 L41 42.6 L38.2 44.2 L38.8 41 L36.4 38.8 L39.6 38.4 Z"
          fill="#141517"
        />
      )}
    </svg>
  );
}

export function TacticalStrategistCrest({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" filter="url(#deepRelief)">
      <circle cx="32" cy="32" r="26" fill="url(#divineRay)" opacity="0.4" />
      <circle cx="32" cy="32" r="24" fill="url(#brushedIron)" stroke="url(#oxidizedBronze)" strokeWidth="2.4" />
      <circle cx="32" cy="32" r="20.5" fill="none" stroke="url(#goldMetal)" strokeWidth="1" strokeDasharray="3 3" />
      {/* Espada de comando e bastão de marechal cruzados */}
      <line x1="16" y1="48" x2="48" y2="16" stroke="url(#steelBlade)" strokeWidth="3.6" strokeLinecap="round" />
      <line x1="19" y1="39" x2="25" y2="45" stroke="url(#goldMetal)" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="16" y1="16" x2="48" y2="48" stroke="url(#oxidizedBronze)" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.6" fill="url(#goldMetal)" />
      <circle cx="48" cy="48" r="2.6" fill="url(#goldMetal)" />
      {/* Rosa tática central */}
      <polygon
        points="32,20 35.2,28.8 44,32 35.2,35.2 32,44 28.8,35.2 20,32 28.8,28.8"
        fill="url(#crimsonShield)"
        stroke="url(#goldMetal)"
        strokeWidth="1.4"
        filter="url(#goldShadow)"
      />
      <circle cx="32" cy="32" r="3" fill="url(#goldMetal)" />
    </svg>
  );
}



