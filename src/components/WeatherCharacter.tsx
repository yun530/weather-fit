interface Props {
  tmp: number;
  pty: number;
  sky: number;
}

export default function WeatherCharacter({ tmp, pty, sky }: Props) {
  // 상황에 따른 결정
  const hasUmbrella = pty === 1 || pty === 4 || pty === 2;
  const isWinter = tmp < 9;
  const isSummer = tmp >= 28;

  // 배경 효과 결정
  const showRain = pty === 1 || pty === 4;
  const showSnow = pty === 2 || pty === 3;
  const showSun = pty === 0 && sky === 1;

  // 색상 테마 (부드러운 파스텔 톤)
  const skinColor = "#FFDBAC";
  const hairColor = "#5D4037";
  const dressColor = isWinter ? "#FF69B4" : isSummer ? "#FFD700" : "#4A90E2";
  const hatColor = isWinter ? "#FFC0CB" : isSummer ? "#F4A460" : "none";

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative w-[210px] h-[280px] bg-white/30 rounded-[40px] overflow-hidden backdrop-blur-md border border-white/40 shadow-xl">
        
        <svg viewBox="0 0 200 260" className="absolute inset-0 w-full h-full" shapeRendering="geometricPrecision">
          <defs>
            {/* 3D 효과를 위한 그라데이션 */}
            <radialGradient id="headGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFF2E0" />
              <stop offset="100%" stopColor={skinColor} />
            </radialGradient>
            <radialGradient id="dressGrad" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor={dressColor} />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── 날씨 배경 레이어 ── */}
          {showSun && (
            <g>
              <circle cx="160" cy="40" r="22" fill="#FFE566" opacity="0.9">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
              </circle>
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <line key={angle} x1="160" y1="40" x2={160 + 32 * Math.cos(angle * Math.PI / 180)} y2={40 + 32 * Math.sin(angle * Math.PI / 180)}
                  stroke="#FFE566" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
              ))}
            </g>
          )}

          {showRain && (
            <g opacity="0.6">
              {[...Array(8)].map((_, i) => (
                <line key={i} x1={30+i*20} y1="-20" x2={25+i*20} y2="0" stroke="#74B9FF" strokeWidth="2" strokeLinecap="round">
                  <animate attributeName="y1" values="-20;260" dur="0.7s" repeatCount="indefinite" begin={`${i*0.1}s`} />
                  <animate attributeName="y2" values="0;280" dur="0.7s" repeatCount="indefinite" begin={`${i*0.1}s`} />
                </line>
              ))}
            </g>
          )}

          {showSnow && (
            <g opacity="0.8">
              {[...Array(10)].map((_, i) => (
                <circle key={i} cx={25+i*18} cy="-10" r="3" fill="white">
                  <animate attributeName="cy" values="-10;260" dur="3s" repeatCount="indefinite" begin={`${i*0.3}s`} />
                </circle>
              ))}
            </g>
          )}

          {/* ── 캐릭터 레이어 ── */}
          <g filter="url(#softShadow)">
            {/* 몸체 */}
            <path d="M 75 160 Q 100 150 125 160 L 138 215 Q 100 225 62 215 Z" fill="url(#dressGrad)" />
            
            {/* 팔/다리 */}
            <ellipse cx="68" cy="180" rx="7" ry="14" fill={skinColor} transform="rotate(15, 68, 180)" />
            <ellipse cx="132" cy="180" rx="7" ry="14" fill={skinColor} transform="rotate(-15, 132, 180)" />
            <rect x="84" y="215" width="10" height="18" rx="5" fill={skinColor} />
            <rect x="106" y="215" width="10" height="18" rx="5" fill={skinColor} />
            <ellipse cx="89" cy="233" rx="11" ry="6" fill="#5D4037" />
            <ellipse cx="111" cy="233" rx="11" ry="6" fill="#5D4037" />

            {/* 머리 */}
            <circle cx="100" cy="95" r="52" fill="url(#headGrad)" />
            <path d="M 45 95 Q 40 35 100 30 Q 160 35 155 95 Q 165 145 140 155 Q 100 145 60 155 Q 35 145 45 95 Z" fill={hairColor} />
            <path d="M 55 75 Q 75 55 100 55 Q 125 55 145 75" fill="none" stroke={hairColor} strokeWidth="12" strokeLinecap="round" />

            {/* 얼굴 */}
            <g>
              <ellipse cx="82" cy="105" rx="5" ry="8" fill="#333" />
              <ellipse cx="118" cy="105" rx="5" ry="8" fill="#333" />
              <circle cx="80" cy="102" r="1.5" fill="white" opacity="0.8" />
              <circle cx="116" cy="102" r="1.5" fill="white" opacity="0.8" />
              <path d="M 98 114 L 100 110 L 102 114 Z" fill="#E67E22" />
              <path d="M 92 128 Q 100 134 108 128" stroke="#C0392B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="70" cy="122" r="8" fill="#FFB6C1" opacity="0.4" />
              <circle cx="130" cy="122" r="8" fill="#FFB6C1" opacity="0.4" />
            </g>

            {/* 소품 */}
            {isWinter && (
              <g transform="translate(100, 45)">
                <path d="M -40 0 Q -35 -25 0 -25 Q 35 -25 40 0 Z" fill={hatColor} />
                <circle cx="0" cy="-28" r="12" fill="white" />
              </g>
            )}
            {isSummer && (
              <g transform="translate(100, 40)">
                <ellipse cx="0" cy="0" rx="55" ry="12" fill="#F4A460" />
                <path d="M -35 0 Q -30 -30 0 -30 Q 30 -30 35 0 Z" fill="#F4A460" />
              </g>
            )}
            {hasUmbrella && (
              <g transform="translate(140, 100) rotate(10)">
                <path d="M -45 0 Q 0 -60 45 0 Q 25 -45 -45 0" fill="#E74C3C" />
                <rect x="-2" y="0" width="4" height="90" rx="2" fill="#8B4513" />
                <path d="M -2 90 Q -2 102 -15 102" fill="none" stroke="#8B4513" strokeWidth="4" strokeLinecap="round" />
              </g>
            )}
          </g>
        </svg>
      </div>
    </div>
  );
}
