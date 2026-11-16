import { useEffect, useRef, useState } from 'react';
import { Crosshair, Flag, Flame, Mountain, Navigation, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/sound';

export interface MapFeudSummary {
  id: number;
  roman: string;
  name: string;
  shortName: string;
  description: string;
  progressLabel: string;
  progressPct: number;
  elevation: string;
  terrainType: string;
}

interface TacticalCampaignMapProps {
  feuds: MapFeudSummary[];
  conquered: Record<number, boolean>;
  selectedFeudId: number;
  soundEnabled: boolean;
  onSelectFeud: (feudId: number, scrollToCard?: boolean) => void;
  svgIdPrefix?: string;
  showReconPanel?: boolean;
  className?: string;
}

interface TerritoryNodeSpec {
  id: number;
  x: number;
  y: number;
  artilleryOrigin: { x: number; y: number };
  sectorPath: string;
  contours: { d: string; major?: boolean }[];
  trees: { x: number; y: number; scale: number }[];
  mountains?: { x: number; y: number; w: number; h: number; snow?: boolean }[];
  elevationPos: { x: number; y: number };
  architecture: 'gate' | 'citadel' | 'sanctuary' | 'keep' | 'bastion' | 'summit';
}

const TERRITORY_SPECS: Record<number, TerritoryNodeSpec> = {
  1: {
    id: 1,
    x: 162,
    y: 356,
    artilleryOrigin: { x: 46, y: 492 },
    sectorPath:
      'M26,246 C86,232 162,238 228,266 C268,284 282,334 274,394 C264,458 214,504 128,510 C62,514 26,482 22,418 Z',
    contours: [
      {
        d: 'M46,356 C46,294 98,262 162,262 C226,262 258,302 252,360 C246,422 204,468 142,468 C82,468 46,418 46,356 Z',
      },
      {
        d: 'M78,354 C78,312 114,286 162,286 C206,286 230,316 226,356 C222,402 190,432 148,432 C104,432 78,396 78,354 Z',
        major: true,
      },
      {
        d: 'M112,352 C112,326 134,310 162,310 C190,310 206,330 202,354 C198,382 178,398 154,398 C128,398 112,378 112,352 Z',
      },
    ],
    trees: [
      { x: 64, y: 312, scale: 0.92 },
      { x: 80, y: 292, scale: 0.78 },
      { x: 58, y: 388, scale: 1.0 },
      { x: 78, y: 416, scale: 0.85 },
      { x: 234, y: 332, scale: 0.88 },
      { x: 218, y: 422, scale: 0.94 },
    ],
    mountains: [
      { x: 52, y: 274, w: 46, h: 34 },
      { x: 90, y: 266, w: 38, h: 28 },
    ],
    elevationPos: { x: 96, y: 452 },
    architecture: 'gate',
  },
  2: {
    id: 2,
    x: 326,
    y: 146,
    artilleryOrigin: { x: 162, y: 356 },
    sectorPath:
      'M178,38 C264,28 388,30 458,64 C478,108 468,184 446,232 C412,262 316,264 236,246 C188,218 164,132 178,38 Z',
    contours: [
      {
        d: 'M208,144 C208,78 262,48 332,48 C402,48 446,84 440,148 C434,206 388,236 322,236 C252,236 208,200 208,144 Z',
      },
      {
        d: 'M238,144 C238,94 278,68 330,68 C382,68 418,98 412,146 C406,192 370,214 322,214 C272,214 238,186 238,144 Z',
        major: true,
      },
      {
        d: 'M268,144 C268,110 296,92 328,92 C364,92 388,112 384,144 C380,174 354,192 324,192 C292,192 268,172 268,144 Z',
      },
    ],
    trees: [
      { x: 222, y: 184, scale: 0.88 },
      { x: 242, y: 204, scale: 0.76 },
      { x: 404, y: 188, scale: 0.92 },
      { x: 424, y: 162, scale: 0.8 },
      { x: 386, y: 92, scale: 0.82 },
    ],
    mountains: [
      { x: 248, y: 84, w: 54, h: 42 },
      { x: 304, y: 68, w: 66, h: 52, snow: true },
      { x: 368, y: 82, w: 52, h: 38 },
    ],
    elevationPos: { x: 246, y: 112 },
    architecture: 'citadel',
  },
  3: {
    id: 3,
    x: 492,
    y: 376,
    artilleryOrigin: { x: 326, y: 146 },
    sectorPath:
      'M340,282 C412,268 564,264 624,296 C648,354 644,442 608,494 C544,518 408,520 338,488 C312,430 314,332 340,282 Z',
    contours: [
      {
        d: 'M364,380 C364,320 416,292 492,292 C568,292 616,326 610,382 C604,442 556,478 486,478 C412,478 364,436 364,380 Z',
      },
      {
        d: 'M402,380 C402,336 440,316 492,316 C546,316 582,340 578,382 C574,424 538,452 488,452 C436,452 402,420 402,380 Z',
        major: true,
      },
    ],
    trees: [
      { x: 384, y: 342, scale: 0.92 },
      { x: 400, y: 422, scale: 0.84 },
      { x: 576, y: 344, scale: 0.96 },
      { x: 592, y: 398, scale: 0.84 },
      { x: 556, y: 446, scale: 0.78 },
    ],
    elevationPos: { x: 564, y: 468 },
    architecture: 'sanctuary',
  },
  4: {
    id: 4,
    x: 636,
    y: 168,
    artilleryOrigin: { x: 492, y: 376 },
    sectorPath:
      'M476,48 C562,36 704,40 774,68 C796,122 790,210 752,256 C684,280 544,278 474,244 C454,192 456,102 476,48 Z',
    contours: [
      {
        d: 'M494,166 C494,100 552,66 636,66 C718,66 766,104 762,168 C758,224 708,254 632,254 C550,254 494,220 494,166 Z',
      },
      {
        d: 'M530,166 C530,118 574,90 636,90 C698,90 734,120 730,168 C726,208 688,230 634,230 C576,230 530,206 530,166 Z',
        major: true,
      },
      {
        d: 'M568,166 C568,136 598,116 636,116 C676,116 700,136 698,166 C696,192 670,206 634,206 C598,206 568,190 568,166 Z',
      },
    ],
    trees: [
      { x: 514, y: 122, scale: 0.86 },
      { x: 534, y: 102, scale: 0.74 },
      { x: 726, y: 118, scale: 0.92 },
      { x: 744, y: 146, scale: 0.82 },
      { x: 706, y: 222, scale: 0.84 },
    ],
    mountains: [
      { x: 556, y: 74, w: 46, h: 32 },
      { x: 678, y: 78, w: 44, h: 30 },
    ],
    elevationPos: { x: 552, y: 226 },
    architecture: 'keep',
  },
  5: {
    id: 5,
    x: 808,
    y: 368,
    artilleryOrigin: { x: 636, y: 168 },
    sectorPath:
      'M658,274 C744,258 898,260 974,296 C996,356 988,448 948,498 C876,522 722,520 650,486 C630,424 634,328 658,274 Z',
    contours: [
      {
        d: 'M678,368 C678,306 734,278 810,278 C886,278 942,312 936,370 C930,432 880,468 806,468 C730,468 678,424 678,368 Z',
      },
      {
        d: 'M714,368 C714,322 754,300 810,300 C866,300 906,326 902,370 C898,414 862,442 808,442 C754,442 714,410 714,368 Z',
        major: true,
      },
      {
        d: 'M750,368 C750,340 776,324 810,324 C846,324 870,342 868,368 C866,396 842,414 810,414 C776,414 750,394 750,368 Z',
      },
    ],
    trees: [
      { x: 696, y: 334, scale: 0.88 },
      { x: 716, y: 420, scale: 0.96 },
      { x: 902, y: 328, scale: 0.94 },
      { x: 922, y: 378, scale: 0.84 },
      { x: 886, y: 446, scale: 0.88 },
    ],
    mountains: [
      { x: 856, y: 462, w: 54, h: 36 },
      { x: 912, y: 446, w: 48, h: 32 },
    ],
    elevationPos: { x: 736, y: 454 },
    architecture: 'bastion',
  },
  6: {
    id: 6,
    x: 966,
    y: 146,
    artilleryOrigin: { x: 808, y: 368 },
    sectorPath:
      'M802,38 C896,26 1024,30 1086,68 C1100,126 1094,218 1064,264 C998,284 874,280 806,248 C786,192 786,96 802,38 Z',
    contours: [
      {
        d: 'M822,150 C822,74 888,40 966,40 C1044,40 1086,84 1080,152 C1074,218 1024,254 960,254 C884,254 822,216 822,150 Z',
      },
      {
        d: 'M852,148 C852,90 902,60 966,60 C1028,60 1062,96 1056,150 C1050,200 1012,230 962,230 C902,230 852,198 852,148 Z',
        major: true,
      },
      {
        d: 'M884,148 C884,106 920,82 966,82 C1012,82 1038,110 1034,148 C1030,184 1002,206 964,206 C920,206 884,182 884,148 Z',
      },
      {
        d: 'M918,146 C918,122 938,106 966,106 C994,106 1012,122 1010,146 C1008,168 990,182 966,182 C940,182 918,168 918,146 Z',
      },
    ],
    trees: [
      { x: 844, y: 184, scale: 0.92 },
      { x: 866, y: 206, scale: 0.78 },
      { x: 1052, y: 182, scale: 0.92 },
      { x: 1034, y: 214, scale: 0.8 },
    ],
    mountains: [
      { x: 882, y: 84, w: 62, h: 48, snow: true },
      { x: 966, y: 58, w: 82, h: 64, snow: true },
      { x: 1034, y: 88, w: 58, h: 46, snow: true },
    ],
    elevationPos: { x: 1038, y: 236 },
    architecture: 'summit',
  },
};

const BORDER_MOUNTAINS: { x: number; y: number; w: number; h: number; snow?: boolean }[] = [
  { x: 64, y: 74, w: 72, h: 56 },
  { x: 118, y: 60, w: 88, h: 66, snow: true },
  { x: 174, y: 78, w: 64, h: 46 },
  { x: 46, y: 136, w: 54, h: 40 },
  { x: 446, y: 64, w: 58, h: 42 },
  { x: 492, y: 58, w: 68, h: 50, snow: true },
  { x: 752, y: 58, w: 64, h: 46 },
  { x: 798, y: 66, w: 56, h: 42 },
  { x: 1042, y: 312, w: 66, h: 50 },
  { x: 1068, y: 368, w: 54, h: 42 },
  { x: 1046, y: 458, w: 74, h: 54, snow: true },
  { x: 256, y: 496, w: 56, h: 38 },
  { x: 626, y: 496, w: 62, h: 42 },
];

const MAIN_RIVER_PATH =
  'M 1095 62 C 985 112, 922 195, 845 232 C 770 268, 702 228, 652 272 C 594 324, 628 438, 526 474 C 446 502, 378 446, 336 374 C 296 305, 294 248, 224 278 C 142 314, 118 448, 18 504';

const TRIBUTARY_STREAMS: { d: string; bankWidth: number; waterWidth: number; delay: string }[] = [
  {
    d: 'M 392 26 C 414 102, 434 188, 372 256 C 344 286, 316 286, 294 282',
    bankWidth: 12,
    waterWidth: 7,
    delay: '0s',
  },
  {
    d: 'M 744 36 C 722 104, 718 186, 682 252',
    bankWidth: 11,
    waterWidth: 6.5,
    delay: '-1.2s',
  },
  {
    d: 'M 556 462 C 534 508, 456 534, 384 494 C 346 472, 332 426, 336 374',
    bankWidth: 11,
    waterWidth: 6.5,
    delay: '-2.4s',
  },
  {
    d: 'M 964 496 C 892 468, 848 456, 756 436 C 686 420, 646 372, 616 334',
    bankWidth: 10,
    waterWidth: 5.8,
    delay: '-3.1s',
  },
];

function MountainPeak({
  x,
  y,
  w,
  h,
  snow = false,
  idPrefix = '',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  snow?: boolean;
  idPrefix?: string;
}) {
  const half = w / 2;
  const topY = y - h;
  const ridgeMidX = x + w * 0.05;
  const ridgeMidY = y - h * 0.45;

  return (
    <g filter={`url(#${idPrefix}topoMountainShadow)`}>
      {/* Encosta iluminada (Oeste/Noroeste) */}
      <polygon
        points={`${x - half},${y} ${x},${topY} ${ridgeMidX},${ridgeMidY} ${x - half * 0.1},${y + 3}`}
        fill={`url(#${idPrefix}topoRockLight)`}
      />
      {/* Encosta em sombra profunda (Leste/Sudeste) */}
      <polygon
        points={`${x},${topY} ${x + half},${y + 2} ${x - half * 0.1},${y + 3} ${ridgeMidX},${ridgeMidY}`}
        fill={`url(#${idPrefix}topoRockDark)`}
      />
      {/* Aresta rochosa central */}
      <polyline
        points={`${x},${topY} ${ridgeMidX},${ridgeMidY} ${x - half * 0.1},${y + 3}`}
        fill="none"
        stroke="rgba(228,199,112,0.22)"
        strokeWidth="0.9"
      />
      {/* Cume nevado / cristal dourado nas cadeias mais altas */}
      {snow && (
        <>
          <polygon
            points={`${x},${topY} ${x - half * 0.34},${topY + h * 0.34} ${x - half * 0.08},${topY + h * 0.28} ${x + half * 0.03},${topY + h * 0.35}`}
            fill="#e7dcc6"
            opacity="0.72"
          />
          <polygon
            points={`${x},${topY} ${x + half * 0.34},${topY + h * 0.34} ${x + half * 0.03},${topY + h * 0.35}`}
            fill="#8d8270"
            opacity="0.6"
          />
        </>
      )}
    </g>
  );
}

function TacticalTreeCluster({
  x,
  y,
  scale,
  conquered,
}: {
  x: number;
  y: number;
  scale: number;
  conquered: boolean;
}) {
  const outerFill = conquered ? '#047857' : '#262b26';
  const midFill = conquered ? '#10b981' : '#32352f';
  const tipFill = conquered ? '#6ee7b7' : '#57463e';
  const shadowFill = conquered ? 'rgba(6, 78, 59, 0.5)' : 'rgba(15, 10, 10, 0.65)';

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`} pointerEvents="none">
      <ellipse cx="1" cy="7" rx="8.5" ry="3.2" fill={shadowFill} className="map-border-transition" />
      <rect x="-1.2" y="1" width="2.4" height="6" fill="#2d1f16" />
      {/* Copa em 3 camadas táticas de pinheiro com transição fluida */}
      <polygon
        points="0,-16 -8,-3 8,-3"
        fill={outerFill}
        stroke="#0b0d0e"
        strokeWidth="0.6"
        className="map-border-transition"
      />
      <polygon
        points="0,-21 -6.5,-9 6.5,-9"
        fill={midFill}
        stroke="#0b0d0e"
        strokeWidth="0.55"
        className="map-border-transition"
      />
      <polygon
        points="0,-25 -4.5,-15 4.5,-15"
        fill={tipFill}
        opacity="0.92"
        className="map-border-transition"
      />
    </g>
  );
}

function FortressIcon({
  x,
  y,
  architecture,
  conquered,
  selected,
}: {
  x: number;
  y: number;
  architecture: TerritoryNodeSpec['architecture'];
  conquered: boolean;
  selected: boolean;
}) {
  const wallFill = conquered ? 'url(#emeraldGem)' : 'url(#brushedIron)';
  const wallStroke = conquered ? '#6ee7b7' : selected ? '#e4c770' : '#6b7280';
  const roofFill = conquered ? 'url(#goldMetal)' : '#7f1d1d';
  const roofStroke = conquered ? '#fef3c7' : '#b91c1c';

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Base de pedra hexagonal 3D */}
      <polygon
        points="-26,8 -15,-6 15,-6 26,8 15,20 -15,20"
        fill="#16181c"
        stroke={conquered ? '#10b981' : '#4b5563'}
        strokeWidth="1.4"
        opacity="0.95"
      />
      {architecture === 'gate' && (
        <g>
          <rect x="-20" y="-12" width="11" height="24" rx="1.5" fill={wallFill} stroke={wallStroke} strokeWidth="1.5" />
          <rect x="9" y="-12" width="11" height="24" rx="1.5" fill={wallFill} stroke={wallStroke} strokeWidth="1.5" />
          <rect x="-11" y="-4" width="22" height="16" fill={wallFill} stroke={wallStroke} strokeWidth="1.3" />
          <path d="M-5,12 V4 A5,5 0 0,1 5,4 V12 Z" fill="#0b0c0e" stroke="#c59b27" strokeWidth="1" />
          <polygon points="-21,-12 -14.5,-20 -8,-12" fill={roofFill} stroke={roofStroke} strokeWidth="0.9" />
          <polygon points="8,-12 14.5,-20 21,-12" fill={roofFill} stroke={roofStroke} strokeWidth="0.9" />
        </g>
      )}
      {architecture === 'citadel' && (
        <g>
          <rect x="-19" y="-10" width="38" height="22" rx="1.5" fill={wallFill} stroke={wallStroke} strokeWidth="1.5" />
          <rect x="-9" y="-20" width="18" height="14" fill={wallFill} stroke={wallStroke} strokeWidth="1.3" />
          <path
            d="M-21,-10 H21 V-15 H15 V-12 H8 V-15 H1 V-12 H-6 V-15 H-13 V-12 H-21 Z"
            fill={conquered ? 'url(#goldMetal)' : '#3f444c'}
          />
          <polygon points="-10,-20 0,-30 10,-20" fill={roofFill} stroke={roofStroke} strokeWidth="1" />
        </g>
      )}
      {architecture === 'sanctuary' && (
        <g>
          <rect x="-18" y="-8" width="36" height="20" rx="2" fill={wallFill} stroke={wallStroke} strokeWidth="1.5" />
          <path d="M-14,-8 C-14,-21 14,-21 14,-8 Z" fill={roofFill} stroke={roofStroke} strokeWidth="1.2" />
          <line x1="0" y1="-26" x2="0" y2="-16" stroke="#e4c770" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="-4" y1="-22" x2="4" y2="-22" stroke="#e4c770" strokeWidth="2" strokeLinecap="round" />
          <circle cx="0" cy="2" r="4" fill="#0d1117" stroke="#c59b27" strokeWidth="1.1" />
        </g>
      )}
      {architecture === 'keep' && (
        <g>
          <rect x="-18" y="-12" width="36" height="24" rx="1.5" fill={wallFill} stroke={wallStroke} strokeWidth="1.5" />
          <rect x="-22" y="-16" width="9" height="28" rx="1" fill={wallFill} stroke={wallStroke} strokeWidth="1.2" />
          <rect x="13" y="-16" width="9" height="28" rx="1" fill={wallFill} stroke={wallStroke} strokeWidth="1.2" />
          <polygon points="-10,-12 0,-25 10,-12" fill={roofFill} stroke={roofStroke} strokeWidth="1" />
          <path d="M-4,12 V3 A4,4 0 0,1 4,3 V12 Z" fill="#0b0c0e" />
        </g>
      )}
      {architecture === 'bastion' && (
        <g>
          <polygon
            points="-20,-6 -11,-16 11,-16 20,-6 17,12 -17,12"
            fill={wallFill}
            stroke={wallStroke}
            strokeWidth="1.6"
          />
          <polygon points="-12,-16 0,-25 12,-16" fill={roofFill} stroke={roofStroke} strokeWidth="1" />
          <line x1="-12" y1="-2" x2="12" y2="-2" stroke="#e4c770" strokeWidth="1.6" opacity="0.85" />
          <circle cx="0" cy="5" r="3.5" fill="#e4c770" />
        </g>
      )}
      {architecture === 'summit' && (
        <g>
          <rect x="-20" y="-10" width="40" height="22" rx="1.5" fill={wallFill} stroke={wallStroke} strokeWidth="1.6" />
          <rect x="-12" y="-22" width="24" height="14" fill={wallFill} stroke={wallStroke} strokeWidth="1.4" />
          <polygon points="-14,-22 0,-34 14,-22" fill="url(#goldMetal)" stroke="#fef3c7" strokeWidth="1.1" />
          <polygon points="-22,-10 -15,-22 -8,-10" fill={roofFill} stroke={roofStroke} strokeWidth="0.9" />
          <polygon points="8,-10 15,-22 22,-10" fill={roofFill} stroke={roofStroke} strokeWidth="0.9" />
        </g>
      )}
    </g>
  );
}

export function TacticalCampaignMap({
  feuds,
  conquered,
  selectedFeudId,
  soundEnabled,
  onSelectFeud,
  svgIdPrefix = '',
  showReconPanel = true,
  className = '',
}: TacticalCampaignMapProps) {
  const [artilleryTargetId, setArtilleryTargetId] = useState<number | null>(null);
  const barrageTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (barrageTimerRef.current !== null) {
        window.clearTimeout(barrageTimerRef.current);
      }
    };
  }, []);

  const triggerArtilleryStrike = (feudId: number, scrollToCard = false) => {
    onSelectFeud(feudId, scrollToCard);
    setArtilleryTargetId(feudId);
    if (!conquered[feudId]) {
      soundFx.strike(soundEnabled);
    } else {
      soundFx.chime(soundEnabled);
    }
    if (barrageTimerRef.current !== null) {
      window.clearTimeout(barrageTimerRef.current);
    }
    barrageTimerRef.current = window.setTimeout(() => {
      setArtilleryTargetId(null);
    }, 2400);
  };

  // Identifica o feudo ativo na linha de frente (primeiro não conquistado)
  const frontlineId = feuds.find((f) => !conquered[f.id])?.id ?? null;
  const activeArtilleryId = artilleryTargetId ?? frontlineId;

  const selectedFeud = feuds.find((f) => f.id === selectedFeudId) ?? feuds[0];
  const selectedIsConquered = !!conquered[selectedFeud.id];
  const pid = (id: string) => `${svgIdPrefix}${id}`;

  const routeSegments: { from: number; to: number; path: string }[] = [
    { from: 1, to: 2, path: 'M 162 356 C 194 276 254 220 326 146' },
    { from: 2, to: 3, path: 'M 326 146 C 396 226 420 326 492 376' },
    { from: 3, to: 4, path: 'M 492 376 C 564 316 588 232 636 168' },
    { from: 4, to: 5, path: 'M 636 168 C 708 236 742 320 808 368' },
    { from: 5, to: 6, path: 'M 808 368 C 878 292 918 228 966 146' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative rounded-xl overflow-hidden border border-[#eab308]/45 bg-[#120d08] shadow-[0_6px_0_#090604,inset_0_0_52px_rgba(0,0,0,0.88),0_20px_44px_rgba(0,0,0,0.82)]">
        <svg
          viewBox="0 0 1120 560"
          className="w-full h-auto block select-none"
          role="region"
          aria-label="Mapa topográfico militar interativo dos 6 Territórios da Família Conceição"
        >
          <defs>
            {/* Pergaminho antigo de campanha militar sobre mesa de carvalho escuro */}
            <radialGradient id={pid('topoTableBase')} cx="50%" cy="46%" r="68%">
              <stop offset="0%" stopColor="#2c2217" />
              <stop offset="56%" stopColor="#1e1710" />
              <stop offset="100%" stopColor="#100c08" />
            </radialGradient>

            <linearGradient id={pid('topoSectorBesieged')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#31261b" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#221b14" stopOpacity="0.86" />
              <stop offset="100%" stopColor="#16110d" stopOpacity="0.94" />
            </linearGradient>

            <linearGradient id={pid('topoSectorConquered')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#133a2c" stopOpacity="0.92" />
              <stop offset="60%" stopColor="#0d2b21" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#081d16" stopOpacity="0.94" />
            </linearGradient>

            {/* Gradientes 3D de relevo montanhoso */}
            <linearGradient id={pid('topoRockLight')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#867257" />
              <stop offset="100%" stopColor="#4c3e2f" />
            </linearGradient>
            <linearGradient id={pid('topoRockDark')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2c231a" />
              <stop offset="100%" stopColor="#140f0b" />
            </linearGradient>

            {/* Gradientes da hidrografia */}
            <linearGradient id={pid('topoRiverWater')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e5670" />
              <stop offset="50%" stopColor="#123a4f" />
              <stop offset="100%" stopColor="#0d2b3c" />
            </linearGradient>

            <linearGradient id={pid('topoRiverHighlight')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.42" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.38" />
            </linearGradient>

            <radialGradient id={pid('topoArtilleryFlash')} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#ea580c" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id={pid('topoConqueredAura')} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fde047" stopOpacity="0.16" />
              <stop offset="38%" stopColor="#34d399" stopOpacity="0.32" />
              <stop offset="72%" stopColor="#059669" stopOpacity="0.11" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={pid('topoTacticalRimGrad')} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id={pid('topoTerrainElevation')} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.72" />
            </filter>

            <filter id={pid('topoTacticalGlow')} x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="tacticalBlur" />
              <feMerge>
                <feMergeNode in="tacticalBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id={pid('topoMountainShadow')} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="2.2" floodColor="#000000" floodOpacity="0.78" />
            </filter>

            <filter id={pid('topoRiverBankShadow')} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.85" />
            </filter>

            <pattern id={pid('topoParchmentGrain')} width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="6" r="0.65" fill="rgba(234,179,8,0.08)" />
              <circle cx="16" cy="18" r="0.55" fill="rgba(239,227,200,0.05)" />
              <line x1="0" y1="12" x2="24" y2="12" stroke="rgba(234,179,8,0.025)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Camada 1: Pergaminho Antigo Envelhecido & Dobraduras de Campanha */}
          <rect x="8" y="8" width="1104" height="544" rx="10" fill={`url(#${pid('topoTableBase')})`} />
          <rect x="8" y="8" width="1104" height="544" rx="10" fill={`url(#${pid('topoParchmentGrain')})`} />
          <g stroke="rgba(234,179,8,0.06)" strokeWidth="1" pointerEvents="none">
            <line x1="373" y1="12" x2="373" y2="548" strokeDasharray="10 6" />
            <line x1="746" y1="12" x2="746" y2="548" strokeDasharray="10 6" />
            <line x1="12" y1="280" x2="1108" y2="280" strokeDasharray="12 8" />
          </g>

          {/* Grade Militar UTM & Coordenadas Cartográficas */}
          <g stroke="rgba(197,155,39,0.09)" strokeWidth="0.75">
            {[160, 320, 480, 640, 800, 960].map((gx) => (
              <line key={`gx-${gx}`} x1={gx} y1="22" x2={gx} y2="538" />
            ))}
            {[140, 280, 420].map((gy) => (
              <line key={`gy-${gy}`} x1="22" y1={gy} x2="1098" y2={gy} />
            ))}
          </g>
          <g fill="rgba(197,155,39,0.42)" fontSize="9" fontFamily="JetBrains Mono, monospace">
            {['A', 'B', 'C', 'D', 'E', 'F'].map((col, idx) => (
              <text key={col} x={100 + idx * 172} y="24" textAnchor="middle">
                SETOR {col}
              </text>
            ))}
            <text x="26" y="145">N-01</text>
            <text x="26" y="285">C-02</text>
            <text x="26" y="425">S-03</text>
          </g>

          {/* Camada 2: Platôs Territoriais em 3D + Fronteiras Fluidas + Brilho Tático Conquistado */}
          {feuds.map((feud) => {
            const spec = TERRITORY_SPECS[feud.id];
            const isConquered = !!conquered[feud.id];
            const isSelected = selectedFeudId === feud.id;

            return (
              <g key={`terrain-${feud.id}`}>
                {/* Base do platô sob cerco com sombra projetada */}
                <path
                  d={spec.sectorPath}
                  fill={`url(#${pid('topoSectorBesieged')})`}
                  opacity={isConquered ? 0.14 : 1}
                  filter={`url(#${pid('topoTerrainElevation')})`}
                  className="map-border-transition"
                />

                {/* Camada de platô conquistado em crossfade suave */}
                <path
                  d={spec.sectorPath}
                  fill={`url(#${pid('topoSectorConquered')})`}
                  opacity={isConquered ? 1 : 0}
                  className="map-border-transition"
                  pointerEvents="none"
                />

                {/* Brilho Tático nos territórios conquistados (halo difuso + aura central + varredura perimetral) */}
                <g
                  style={{ opacity: isConquered ? 1 : 0 }}
                  className="map-border-transition"
                  pointerEvents="none"
                >
                  <path
                    d={spec.sectorPath}
                    fill="none"
                    stroke={isSelected ? '#fde047' : '#34d399'}
                    strokeWidth={isSelected ? 9 : 7}
                    strokeLinejoin="round"
                    filter={`url(#${pid('topoTacticalGlow')})`}
                    className="map-conquered-tactical-glow"
                  />
                  <ellipse
                    cx={spec.x}
                    cy={spec.y}
                    rx="124"
                    ry="84"
                    fill={`url(#${pid('topoConqueredAura')})`}
                    className="map-conquered-tactical-glow"
                  />
                  <path
                    d={spec.sectorPath}
                    fill="none"
                    stroke={isSelected ? '#fde047' : 'rgba(52, 211, 153, 0.85)'}
                    strokeWidth={isSelected ? 2.5 : 1.75}
                    strokeLinejoin="round"
                    className="map-border-transition"
                  />
                  <path
                    d={spec.sectorPath}
                    fill="none"
                    stroke={`url(#${pid('topoTacticalRimGrad')})`}
                    strokeWidth={isSelected ? 2.4 : 1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="map-conquered-rim-flow"
                    opacity="0.88"
                  />
                </g>

                {/* Linha de fronteira ativa em cerco (crossfade fluido para fora ao conquistar) */}
                <path
                  d={spec.sectorPath}
                  fill="none"
                  stroke={isSelected ? '#e4c770' : 'rgba(185, 28, 28, 0.5)'}
                  strokeWidth={isSelected ? 2.2 : 1.35}
                  strokeLinejoin="round"
                  opacity={isConquered ? 0 : 1}
                  className="map-border-transition map-siege-border-flow"
                  pointerEvents="none"
                />

                {/* Halo externo suave quando um feudo está selecionado */}
                <path
                  d={spec.sectorPath}
                  fill="none"
                  stroke={isConquered ? 'rgba(253, 224, 71, 0.5)' : 'rgba(228, 199, 112, 0.36)'}
                  strokeWidth="4.2"
                  strokeLinejoin="round"
                  opacity={isSelected ? 0.85 : 0}
                  className="map-border-transition"
                  pointerEvents="none"
                />

                {/* Curvas de nível concêntricas simulando elevação */}
                {spec.contours.map((contour, idx) => (
                  <path
                    key={`contour-${feud.id}-${idx}`}
                    d={contour.d}
                    fill={
                      isConquered
                        ? 'rgba(16, 185, 129, 0.065)'
                        : 'rgba(197, 155, 39, 0.035)'
                    }
                    stroke={
                      isConquered
                        ? contour.major
                          ? 'rgba(110, 231, 183, 0.44)'
                          : 'rgba(52, 211, 153, 0.22)'
                        : contour.major
                          ? 'rgba(212, 175, 55, 0.28)'
                          : 'rgba(166, 153, 130, 0.14)'
                    }
                    strokeWidth={contour.major ? 1.3 : 0.85}
                    strokeDasharray={contour.major ? undefined : '4 3'}
                    className="map-border-transition"
                    pointerEvents="none"
                  />
                ))}

                {/* Cota topográfica de altitude */}
                <text
                  x={spec.elevationPos.x}
                  y={spec.elevationPos.y}
                  textAnchor="middle"
                  fill={isConquered ? 'rgba(167, 243, 208, 0.85)' : 'rgba(213, 199, 176, 0.52)'}
                  fontSize="8.5"
                  fontFamily="JetBrains Mono, monospace"
                  className="map-border-transition"
                  pointerEvents="none"
                >
                  ▲ {feud.elevation}
                </text>
              </g>
            );
          })}

          {/* Camada 3: Hidrografia Sinuosa Fluida (Rio da Providência + 4 Afluentes + Correnteza Contínua) */}
          <g filter={`url(#${pid('topoRiverBankShadow')})`} pointerEvents="none">
            {/* Margens escavadas do rio principal */}
            <path
              d={MAIN_RIVER_PATH}
              fill="none"
              stroke="#08161f"
              strokeWidth="26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Margens dos afluentes */}
            {TRIBUTARY_STREAMS.map((trib, idx) => (
              <path
                key={`trib-bank-${idx}`}
                d={trib.d}
                fill="none"
                stroke="#08161f"
                strokeWidth={trib.bankWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Leito principal do Rio da Providência */}
            <path
              d={MAIN_RIVER_PATH}
              fill="none"
              stroke={`url(#${pid('topoRiverWater')})`}
              strokeWidth="17"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Reflexo luminoso suave no leito principal */}
            <path
              d={MAIN_RIVER_PATH}
              fill="none"
              stroke={`url(#${pid('topoRiverHighlight')})`}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="map-river-shimmer"
            />

            {/* Afluentes */}
            {TRIBUTARY_STREAMS.map((trib, idx) => (
              <g key={`trib-water-${idx}`}>
                <path
                  d={trib.d}
                  fill="none"
                  stroke={`url(#${pid('topoRiverWater')})`}
                  strokeWidth={trib.waterWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={trib.d}
                  fill="none"
                  stroke="rgba(125, 211, 252, 0.34)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  className="map-river-flow-secondary"
                  style={{ animationDelay: trib.delay }}
                />
              </g>
            ))}

            {/* Fios animados duplos de correnteza contínua sem emenda no leito principal */}
            <path
              d={MAIN_RIVER_PATH}
              fill="none"
              stroke="rgba(186, 230, 253, 0.44)"
              strokeWidth="1.9"
              strokeLinecap="round"
              className="map-river-flow"
            />
            <path
              d={MAIN_RIVER_PATH}
              fill="none"
              stroke="rgba(56, 189, 248, 0.32)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="map-river-flow-secondary"
              style={{ animationDelay: '-1.9s' }}
            />
            <text
              x="472"
              y="495"
              fill="rgba(125, 211, 252, 0.62)"
              fontSize="8.5"
              fontStyle="italic"
              fontFamily="Crimson Pro, serif"
              letterSpacing="1.4"
            >
              Rio da Providência
            </text>
          </g>

          {/* Camada 4: Cadeias de Montanhas nas Bordas e Marcos Elevados */}
          <g pointerEvents="none">
            {BORDER_MOUNTAINS.map((m, idx) => (
              <MountainPeak key={`bm-${idx}`} {...m} idPrefix={svgIdPrefix} />
            ))}
            {feuds.map((f) =>
              TERRITORY_SPECS[f.id].mountains?.map((m, idx) => (
                <MountainPeak key={`tm-${f.id}-${idx}`} {...m} idPrefix={svgIdPrefix} />
              ))
            )}
          </g>

          {/* Camada 5: Vegetação e Florestas Dinâmicas (Sombria sob cerco -> Esmeralda quando conquistada) */}
          <g pointerEvents="none">
            {feuds.map((f) => {
              const isConquered = !!conquered[f.id];
              return TERRITORY_SPECS[f.id].trees.map((tree, idx) => (
                <TacticalTreeCluster
                  key={`tree-${f.id}-${idx}`}
                  x={tree.x}
                  y={tree.y}
                  scale={tree.scale}
                  conquered={isConquered}
                />
              ));
            })}
          </g>

          {/* Camada 6: Rota Militar Dourada & Pontes de Travessia sobre o Rio */}
          <g pointerEvents="none">
            {routeSegments.map((seg) => {
              const segDone = !!conquered[seg.from] && !!conquered[seg.to];
              const segInProgress = !!conquered[seg.from] && !conquered[seg.to];
              return (
                <g key={`route-${seg.from}-${seg.to}`}>
                  <path
                    d={seg.path}
                    fill="none"
                    stroke="rgba(0,0,0,0.65)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Linha tracejada para marcha em progresso/pendente */}
                  <path
                    d={seg.path}
                    fill="none"
                    stroke={segInProgress ? '#e4c770' : '#c59b27'}
                    strokeWidth="2.2"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                    opacity={segDone ? 0 : segInProgress ? 0.9 : 0.48}
                    className="map-border-transition"
                  />
                  {/* Rota consolidada em brilho esmeralda quando ambos feudos estão conquistados */}
                  <path
                    d={seg.path}
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    opacity={segDone ? 0.94 : 0}
                    className="map-border-transition"
                  />
                </g>
              );
            })}

            {/* Pontes fortificadas nos cruzamentos da rota com o rio */}
            {[
              { x: 232, y: 274, angle: -42 },
              { x: 562, y: 294, angle: -56 },
              { x: 874, y: 224, angle: -52 },
            ].map((bridge, idx) => (
              <g
                key={`bridge-${idx}`}
                transform={`translate(${bridge.x}, ${bridge.y}) rotate(${bridge.angle})`}
              >
                <rect
                  x="-11"
                  y="-6"
                  width="22"
                  height="12"
                  rx="2"
                  fill="#443728"
                  stroke="#c59b27"
                  strokeWidth="1.2"
                />
                <line x1="-11" y1="-2" x2="11" y2="-2" stroke="#1f1710" strokeWidth="1" />
                <line x1="-11" y1="2" x2="11" y2="2" stroke="#1f1710" strokeWidth="1" />
              </g>
            ))}
          </g>

          {/* Camada 7: Artilharia Ativa nos Territórios Atacados / Sob Cerco */}
          {activeArtilleryId && TERRITORY_SPECS[activeArtilleryId] && !conquered[activeArtilleryId] && (
            <g pointerEvents="none">
              {(() => {
                const target = TERRITORY_SPECS[activeArtilleryId];
                const origin = target.artilleryOrigin;
                const ctrlX = (origin.x + target.x) / 2;
                const ctrlY = Math.min(origin.y, target.y) - 96;
                const arcD = `M ${origin.x} ${origin.y} Q ${ctrlX} ${ctrlY} ${target.x} ${target.y - 8}`;
                return (
                  <>
                    {/* Arco balístico da artilharia */}
                    <path
                      d={arcD}
                      fill="none"
                      stroke="rgba(234, 88, 12, 0.25)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <path
                      d={arcD}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="map-artillery-arc"
                    />
                    {/* Retícula tática giratória sobre o alvo */}
                    <g transform={`translate(${target.x}, ${target.y})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="34"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                        strokeDasharray="6 5"
                        className="map-reticle-spin"
                        opacity="0.72"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="28"
                        fill={`url(#${pid('topoArtilleryFlash')})`}
                        className="map-artillery-burst"
                      />
                    </g>
                  </>
                );
              })()}
            </g>
          )}

          {/* Camada 8: Nós Interativos dos 6 Territórios + Bandeiras + Placas de Progresso */}
          {feuds.map((feud) => {
            const spec = TERRITORY_SPECS[feud.id];
            const isConquered = !!conquered[feud.id];
            const isSelected = selectedFeudId === feud.id;
            const flagColor = isConquered ? '#10b981' : '#991b1b';
            const barWidth = Math.max(0, Math.min(100, feud.progressPct));

            return (
              <g
                key={`node-${feud.id}`}
                role="button"
                tabIndex={0}
                aria-label={`${feud.roman}. ${feud.name} — ${
                  isConquered ? 'Conquistado' : `${feud.progressPct}% em campanha`
                }`}
                onClick={() => triggerArtilleryStrike(feud.id, false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerArtilleryStrike(feud.id, false);
                  }
                }}
                className="cursor-pointer group focus:outline-none"
              >
                {/* Hit area invisível generosa (toque móvel >= 44px) */}
                <circle cx={spec.x} cy={spec.y} r="44" fill="transparent" />

                {/* Brilho de cerco inimigo quando em campanha */}
                <circle
                  cx={spec.x}
                  cy={spec.y}
                  r="30"
                  fill="rgba(185, 28, 28, 0.22)"
                  opacity={isConquered ? 0 : 1}
                  className={isConquered ? 'map-node-transition' : 'map-siege-ember map-node-transition'}
                />

                {/* Halo tático atrás da fortaleza quando conquistada */}
                <circle
                  cx={spec.x}
                  cy={spec.y}
                  r="32"
                  fill="rgba(16, 185, 129, 0.16)"
                  stroke="rgba(110, 231, 183, 0.42)"
                  strokeWidth="1.1"
                  opacity={isConquered ? 1 : 0}
                  className={isConquered ? 'map-conquered-tactical-glow map-node-transition' : 'map-node-transition'}
                />

                {/* Anel de seleção ativa */}
                <circle
                  cx={spec.x}
                  cy={spec.y + 4}
                  r="36"
                  fill="none"
                  stroke={isConquered ? '#fde047' : '#e4c770'}
                  strokeWidth="1.8"
                  strokeDasharray="4 3"
                  opacity={isSelected ? 1 : 0}
                  className="map-node-transition"
                />

                {/* Espadas cruzadas de vitória nos territórios conquistados */}
                <g
                  stroke="url(#steelBlade)"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity={isConquered ? 0.9 : 0}
                  className="map-node-transition"
                >
                  <line x1={spec.x - 28} y1={spec.y + 18} x2={spec.x + 28} y2={spec.y - 20} />
                  <line x1={spec.x + 28} y1={spec.y + 18} x2={spec.x - 28} y2={spec.y - 20} />
                </g>

                {/* Arquitetura 3D da Fortaleza */}
                <FortressIcon
                  x={spec.x}
                  y={spec.y}
                  architecture={spec.architecture}
                  conquered={isConquered}
                  selected={isSelected}
                />

                {/* Mastro e Bandeira balançando ao vento */}
                <line
                  x1={spec.x}
                  y1={spec.y - 24}
                  x2={spec.x}
                  y2={spec.y - 54}
                  stroke="url(#steelBlade)"
                  strokeWidth="2.1"
                />
                <g
                  style={{ transformOrigin: `${spec.x}px ${spec.y - 48}px` }}
                  className="banner-flutter"
                >
                  <polygon
                    points={`${spec.x},${spec.y - 54} ${spec.x + 26},${spec.y - 47} ${spec.x + 19},${spec.y - 42} ${spec.x + 26},${spec.y - 37} ${spec.x},${spec.y - 34}`}
                    fill={flagColor}
                    stroke={isConquered ? '#e4c770' : '#fca5a5'}
                    strokeWidth="0.9"
                    className="map-node-transition"
                  />
                </g>

                {/* Placa cartográfica do território + barra de progresso */}
                <g transform={`translate(${spec.x}, ${spec.y + 34})`}>
                  <rect
                    x="-62"
                    y="-10"
                    width="124"
                    height="30"
                    rx="4"
                    fill="#0d0f12"
                    fillOpacity="0.92"
                    stroke={
                      isSelected
                        ? '#e4c770'
                        : isConquered
                          ? '#10b981'
                          : 'rgba(197, 155, 39, 0.35)'
                    }
                    strokeWidth={isSelected ? 1.5 : 1}
                    className="map-node-transition"
                  />
                  <text
                    x="0"
                    y="2.5"
                    textAnchor="middle"
                    fill={isConquered ? '#6ee7b7' : '#f3ead6'}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Cinzel, serif"
                    className="map-node-transition"
                  >
                    {feud.roman} · {feud.shortName}
                  </text>
                  {/* Barra de progresso interna */}
                  <rect x="-50" y="9" width="100" height="4.5" rx="2.2" fill="#1f242b" />
                  <rect
                    x="-50"
                    y="9"
                    width={barWidth}
                    height="4.5"
                    rx="2.2"
                    fill={isConquered ? '#10b981' : '#c59b27'}
                    className="map-node-transition"
                  />
                </g>
              </g>
            );
          })}

          {/* Camada 9: Rosa dos Ventos Militar (Inferior Esquerdo) & Cartela de Legenda (Superior Esquerdo) */}
          <g transform="translate(56, 56)" pointerEvents="none">
            <circle cx="0" cy="0" r="24" fill="#101215" fillOpacity="0.82" stroke="#7d5d28" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="19" fill="none" stroke="rgba(228,199,112,0.35)" strokeWidth="0.75" strokeDasharray="2 2" />
            <path d="M0 -22 L4 -4 L22 0 L4 4 L0 22 L-4 4 L-22 0 L-4 -4 Z" fill="url(#goldMetal)" />
            <path d="M0 -22 L4 -4 L0 0 Z" fill="#fef3c7" />
            <text x="0" y="-26" textAnchor="middle" fill="#e4c770" fontSize="8.5" fontWeight="700" fontFamily="Cinzel, serif">
              N
            </text>
          </g>

          {/* Escala Cartográfica no canto inferior direito */}
          <g transform="translate(970, 526)" pointerEvents="none">
            <rect x="0" y="-12" width="128" height="22" rx="3" fill="#0d0f12" fillOpacity="0.86" stroke="#7d5d28" strokeWidth="0.9" />
            <line x1="12" y1="0" x2="72" y2="0" stroke="#e4c770" strokeWidth="1.6" />
            <line x1="12" y1="-3" x2="12" y2="3" stroke="#e4c770" strokeWidth="1.4" />
            <line x1="42" y1="-2" x2="42" y2="2" stroke="#e4c770" strokeWidth="1" />
            <line x1="72" y1="-3" x2="72" y2="3" stroke="#e4c770" strokeWidth="1.4" />
            <text x="80" y="3" fill="#c7b8a0" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
              12 LÉGUAS
            </text>
          </g>

          {/* Moldura externa em bronze oxidado com rebites */}
          <rect
            x="8"
            y="8"
            width="1104"
            height="544"
            rx="10"
            fill="none"
            stroke="url(#oxidizedBronze)"
            strokeWidth="3.5"
            pointerEvents="none"
          />
          <rect
            x="13"
            y="13"
            width="1094"
            height="534"
            rx="7"
            fill="none"
            stroke="rgba(228,199,112,0.22)"
            strokeWidth="1"
            pointerEvents="none"
          />
        </svg>
      </div>

      {/* Painel de Reconhecimento Tático do Território Selecionado (Sem Pills) */}
      {showReconPanel && (
        <>
          <div className="parchment-box p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border border-[#7d5d28]/45">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#a69982]">
                <span className="font-epic text-[#c59b27]">
                  Reconhecimento · Feudo {selectedFeud.roman}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-[#9e9380]" aria-hidden="true" />
                  <span>{selectedFeud.terrainType} ({selectedFeud.elevation})</span>
                </span>
                <span aria-hidden="true">·</span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold ${
                    selectedIsConquered ? 'text-emerald-400' : 'text-amber-300'
                  }`}
                >
                  {selectedIsConquered ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Território Conquistado</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                      <span>Sob Cerco · {selectedFeud.progressPct}% concluído</span>
                    </>
                  )}
                </span>
              </div>

              <h3 className="font-epic text-base sm:text-lg text-[#f3ead6]">
                {selectedFeud.roman}. {selectedFeud.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#c7b8a0] leading-relaxed">
                {selectedFeud.description}{' '}
                <span className="font-mono-num text-[#dfc168] font-semibold">
                  ({selectedFeud.progressLabel})
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => triggerArtilleryStrike(selectedFeud.id, false)}
                className="rpg-btn-crimson px-4 py-2.5 rounded-lg text-xs font-epic inline-flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <Crosshair className="w-4 h-4" aria-hidden="true" />
                <span>
                  {selectedIsConquered ? 'Salva de Honra' : 'Disparar Artilharia'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectFeud(selectedFeud.id, true)}
                className="rpg-btn-iron px-4 py-2.5 rounded-lg text-xs font-epic inline-flex items-center gap-2 cursor-pointer whitespace-nowrap min-h-[42px]"
              >
                <Navigation className="w-4 h-4 text-[#dfc168]" aria-hidden="true" />
                <span>Inspecionar Feudo</span>
              </button>
            </div>
          </div>

          {/* Legenda Cartográfica Compacta em Texto Limpo */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs text-[#9e9380]">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span>Território Conquistado & Floresta Esmeralda</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
                <span>Território sob Cerco & Artilharia</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-0.5 bg-sky-400/75" aria-hidden="true" />
                <span>Rio da Providência & Afluentes</span>
              </span>
            </div>
            <span className="text-[11px] text-[#848890]">
              Clique em qualquer fortaleza no mapa para alvejar ou inspecionar
            </span>
          </div>
        </>
      )}
    </div>
  );
}
