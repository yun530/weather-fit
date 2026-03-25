interface Props {
  tmp: number;
  pty: number;
  sky: number;
}

export default function WeatherCharacter({ tmp, pty, sky }: Props) {
  const hasUmbrella = pty === 1 || pty === 4 || pty === 2;
  const showRain = pty === 1 || pty === 4;
  const showSnow = pty === 2 || pty === 3;
  const showSun = pty === 0 && sky === 1;

  // 피부/머리
  const skin = '#FFCBA4';
  const hair = '#3B2314';

  // 온도별 옷 단계
  const getOutfitStage = () => {
    if (tmp >= 28) return 'veryhot';   // 반팔 + 반바지
    if (tmp >= 23) return 'hot';        // 반팔 + 긴바지
    if (tmp >= 17) return 'warm';       // 긴팔 셔츠
    if (tmp >= 12) return 'mild';       // 얇은 재킷
    if (tmp >= 9)  return 'cool';       // 후드 재킷
    if (tmp >= 4)  return 'cold';       // 코트 + 목도리
    if (tmp >= 0)  return 'verycold';   // 패딩
    return 'freeze';                    // 두꺼운 패딩 + 장갑
  };
  const stage = getOutfitStage();

  // 색상
  const topColors: Record<string, string> = {
    veryhot:  '#FFB3C1', // 연핑크 반팔
    hot:      '#AED6F1', // 하늘색 반팔
    warm:     '#A9DFBF', // 민트 긴팔
    mild:     '#5DADE2', // 블루 재킷
    cool:     '#5D6D7E', // 그레이 후드
    cold:     '#784212', // 브라운 코트
    verycold: '#1A252F', // 다크 패딩
    freeze:   '#1A252F', // 다크 패딩
  };
  const bottomColors: Record<string, string> = {
    veryhot:  '#FFD580', // 노랑 반바지
    hot:      '#85929E', // 그레이 바지
    warm:     '#2E86C1', // 청바지
    mild:     '#2E86C1',
    cool:     '#2E86C1',
    cold:     '#4A4A4A', // 어두운 바지
    verycold: '#2C3E50',
    freeze:   '#2C3E50',
  };
  const topColor = topColors[stage];
  const bottomColor = bottomColors[stage];
  const hasScarfOrHood = stage === 'cold' || stage === 'verycold' || stage === 'freeze';
  const hasGloves = stage === 'freeze' || (pty === 3 && tmp < 2);

  // 코트/패딩 여부
  const isCoat = stage === 'cold';
  const isPadding = stage === 'verycold' || stage === 'freeze';
  const isJacket = stage === 'mild' || stage === 'cool';
  const isShortBottom = stage === 'veryhot';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0' }}>
      <svg viewBox="0 0 200 280" width="180" height="252" shapeRendering="geometricPrecision">
        <defs>
          <radialGradient id="skinGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFE0C8" />
            <stop offset="100%" stopColor={skin} />
          </radialGradient>
          <filter id="shadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
            <feOffset dx="0" dy="2" />
            <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── 날씨 배경 ── */}
        {showSun && (
          <g opacity="0.7">
            <circle cx="162" cy="38" r="18" fill="#FFE566">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
            {[0,45,90,135,180,225,270,315].map(a => (
              <line key={a}
                x1={162 + 22*Math.cos(a*Math.PI/180)} y1={38 + 22*Math.sin(a*Math.PI/180)}
                x2={162 + 30*Math.cos(a*Math.PI/180)} y2={38 + 30*Math.sin(a*Math.PI/180)}
                stroke="#FFE566" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
              />
            ))}
          </g>
        )}
        {showRain && (
          <g opacity="0.55">
            {[...Array(7)].map((_, i) => (
              <line key={i} x1={30+i*22} y1="-10" x2={25+i*22} y2="10"
                stroke="#74B9FF" strokeWidth="2" strokeLinecap="round">
                <animate attributeName="y1" values="-10;270" dur="0.75s" repeatCount="indefinite" begin={`${i*0.1}s`} />
                <animate attributeName="y2" values="10;290" dur="0.75s" repeatCount="indefinite" begin={`${i*0.1}s`} />
              </line>
            ))}
          </g>
        )}
        {showSnow && (
          <g opacity="0.7">
            {[...Array(8)].map((_, i) => (
              <circle key={i} cx={20+i*22} cy="-8" r="3.5" fill="white">
                <animate attributeName="cy" values="-8;270" dur={`${2.5+i*0.2}s`} repeatCount="indefinite" begin={`${i*0.3}s`} />
              </circle>
            ))}
          </g>
        )}

        {/* ── 몸 (아우터) ── */}
        <g filter="url(#shadow)">

          {/* ─ 바지/하의 ─ */}
          {isShortBottom ? (
            // 반바지
            <path d="M 72 175 L 68 218 L 88 218 L 100 195 L 112 218 L 132 218 L 128 175 Z"
              fill={bottomColor} rx="4" />
          ) : (
            // 긴바지
            <path d="M 72 175 L 66 248 L 90 248 L 100 210 L 110 248 L 134 248 L 128 175 Z"
              fill={bottomColor} />
          )}

          {/* ─ 신발 ─ */}
          {isShortBottom ? (
            // 샌들
            <g fill="#C8A882">
              <ellipse cx="78" cy="222" rx="12" ry="5" />
              <ellipse cx="122" cy="222" rx="12" ry="5" />
            </g>
          ) : isPadding || isCoat ? (
            // 부츠
            <g>
              <rect x="66" y="244" width="22" height="18" rx="6" fill="#2C2C2C" />
              <rect x="112" y="244" width="22" height="18" rx="6" fill="#2C2C2C" />
              <rect x="64" y="254" width="26" height="8" rx="3" fill="#1A1A1A" />
              <rect x="110" y="254" width="26" height="8" rx="3" fill="#1A1A1A" />
            </g>
          ) : (
            // 운동화
            <g>
              <ellipse cx="78" cy="252" rx="14" ry="7" fill="#F0F0F0" />
              <ellipse cx="122" cy="252" rx="14" ry="7" fill="#F0F0F0" />
              <ellipse cx="80" cy="249" rx="9" ry="4" fill="white" />
              <ellipse cx="124" cy="249" rx="9" ry="4" fill="white" />
            </g>
          )}

          {/* ─ 상의 몸통 ─ */}
          {isPadding ? (
            // 패딩 (가로 줄무늬로 퀼팅 표현)
            <g>
              <path d="M 68 155 Q 100 148 132 155 L 135 200 Q 100 208 65 200 Z" fill={topColor} />
              {/* 퀼팅 선 */}
              <path d="M 67 165 Q 100 160 133 165" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" />
              <path d="M 66 177 Q 100 172 134 177" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" />
              <path d="M 66 189 Q 100 184 134 189" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" />
              {/* 지퍼 */}
              <line x1="100" y1="152" x2="100" y2="205" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            </g>
          ) : isCoat ? (
            // 코트 (길고 단정한 라인)
            <g>
              <path d="M 66 155 Q 100 147 134 155 L 138 215 Q 100 224 62 215 Z" fill={topColor} />
              {/* 코트 칼라 */}
              <path d="M 85 155 L 100 175 L 115 155 L 108 152 L 100 168 L 92 152 Z" fill="#5D3A1A" />
              {/* 버튼 */}
              <circle cx="100" cy="180" r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle cx="100" cy="193" r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle cx="100" cy="206" r="2.5" fill="rgba(255,255,255,0.5)" />
            </g>
          ) : isJacket ? (
            // 재킷/후드
            <g>
              <path d="M 70 157 Q 100 150 130 157 L 133 200 Q 100 208 67 200 Z" fill={topColor} />
              {/* 재킷 지퍼선 */}
              <line x1="100" y1="154" x2="100" y2="202" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              {/* 후드 (cool일 때) */}
              {stage === 'cool' && (
                <path d="M 78 145 Q 78 130 100 128 Q 122 130 122 145 L 118 157 L 82 157 Z"
                  fill={topColor} opacity="0.8" />
              )}
            </g>
          ) : (
            // 반팔/긴팔 셔츠
            <path d="M 74 158 Q 100 152 126 158 L 128 198 Q 100 205 72 198 Z" fill={topColor} />
          )}

          {/* ─ 팔 ─ */}
          {isPadding ? (
            <g>
              {/* 패딩 소매 (두꺼운) */}
              <ellipse cx="60" cy="178" rx="10" ry="18" fill={topColor} transform="rotate(12,60,178)" />
              <ellipse cx="140" cy="178" rx="10" ry="18" fill={topColor} transform="rotate(-12,140,178)" />
              {/* 퀼팅 */}
              <path d="M 52 173 Q 60 170 68 173" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" transform="rotate(12,60,178)" />
              <path d="M 132 173 Q 140 170 148 173" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" transform="rotate(-12,140,178)" />
            </g>
          ) : isCoat ? (
            <g>
              <ellipse cx="59" cy="178" rx="9" ry="20" fill={topColor} transform="rotate(14,59,178)" />
              <ellipse cx="141" cy="178" rx="9" ry="20" fill={topColor} transform="rotate(-14,141,178)" />
            </g>
          ) : stage === 'veryhot' || stage === 'hot' ? (
            // 반팔 - 짧은 팔
            <g fill={skin}>
              <ellipse cx="63" cy="170" rx="8" ry="12" transform="rotate(14,63,170)" />
              <ellipse cx="137" cy="170" rx="8" ry="12" transform="rotate(-14,137,170)" />
            </g>
          ) : (
            // 긴팔
            <g>
              <ellipse cx="61" cy="178" rx="8" ry="18" fill={topColor} transform="rotate(14,61,178)" />
              <ellipse cx="139" cy="178" rx="8" ry="18" fill={topColor} transform="rotate(-14,139,178)" />
              {/* 손목 피부 */}
              <ellipse cx="56" cy="191" rx="7" ry="6" fill={skin} transform="rotate(14,56,191)" />
              <ellipse cx="144" cy="191" rx="7" ry="6" fill={skin} transform="rotate(-14,144,191)" />
            </g>
          )}

          {/* ─ 장갑 ─ */}
          {hasGloves && (
            <g fill="#C0392B">
              <ellipse cx="54" cy="192" rx="9" ry="7" transform="rotate(14,54,192)" />
              <ellipse cx="146" cy="192" rx="9" ry="7" transform="rotate(-14,146,192)" />
            </g>
          )}

          {/* ─ 목도리 ─ */}
          {hasScarfOrHood && (
            <g>
              <path d="M 80 148 Q 100 143 120 148 Q 122 158 118 162 Q 100 158 82 162 Q 78 158 80 148 Z"
                fill="#C0392B" />
              <path d="M 82 160 Q 100 156 118 160 L 120 170 Q 100 167 80 170 Z"
                fill="#E74C3C" />
            </g>
          )}

          {/* ─ 머리 / 얼굴 ─ */}
          {/* 뒷머리 */}
          <ellipse cx="100" cy="98" rx="38" ry="40" fill={hair} />
          {/* 얼굴 */}
          <ellipse cx="100" cy="102" rx="32" ry="34" fill="url(#skinGrad)" />
          {/* 앞머리 */}
          <path d="M 66 90 Q 68 68 100 66 Q 132 68 134 90 Q 116 78 100 80 Q 84 78 66 90 Z" fill={hair} />

          {/* 눈 */}
          <ellipse cx="88" cy="104" rx="4.5" ry="5.5" fill="#2C1810" />
          <ellipse cx="112" cy="104" rx="4.5" ry="5.5" fill="#2C1810" />
          <circle cx="86" cy="101" r="1.5" fill="white" opacity="0.8" />
          <circle cx="110" cy="101" r="1.5" fill="white" opacity="0.8" />

          {/* 코 */}
          <path d="M 97 112 L 100 108 L 103 112 Z" fill="#D4956A" opacity="0.7" />

          {/* 입 - 기온별 표정 */}
          {tmp >= 23 ? (
            // 더울 때 - 웃는 입
            <path d="M 92 120 Q 100 127 108 120" stroke="#C47A5A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : tmp >= 9 ? (
            // 보통 - 살짝 웃음
            <path d="M 93 121 Q 100 125 107 121" stroke="#C47A5A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          ) : (
            // 추울 때 - 살짝 찡그림
            <path d="M 93 122 Q 100 120 107 122" stroke="#C47A5A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          )}

          {/* 볼터치 */}
          <ellipse cx="80" cy="115" rx="8" ry="5" fill="#FFB6A0" opacity="0.35" />
          <ellipse cx="120" cy="115" rx="8" ry="5" fill="#FFB6A0" opacity="0.35" />
        </g>

        {/* ─ 우산 ─ */}
        {hasUmbrella && (
          <g transform="translate(140, 105) rotate(8)">
            <path d="M -38 0 Q 0 -52 38 0 Q 22 -38 0 -38 Q -22 -38 -38 0 Z" fill="#E74C3C" />
            <path d="M -38 0 L -12 0" stroke="#C0392B" strokeWidth="1.5" />
            <path d="M 12 0 L 38 0" stroke="#C0392B" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="0" y2="75" stroke="#7F5436" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 0 75 Q 0 88 -12 88" fill="none" stroke="#7F5436" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
