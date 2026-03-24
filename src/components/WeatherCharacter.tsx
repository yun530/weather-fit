interface Props {
  tmp: number;
  pty: number;
  sky: number;
}

export default function WeatherCharacter({ tmp, pty, sky }: Props) {
  const isRain  = pty === 1 || pty === 4;
  const isSleet = pty === 2;
  const isSnow  = pty === 3;

  const state =
    isRain || isSleet ? 'rain' :
    isSnow            ? 'snow' :
    tmp >= 28         ? 'veryhot' :
    tmp >= 23         ? 'warm' :
    tmp >= 17         ? 'mild' :
    tmp >= 9          ? 'cool' :
    tmp >= 4          ? 'cold' :
                        'verycold';

  const showSun   = pty === 0 && sky === 1;
  const showCloud = (sky === 3 || sky === 4) && !isRain && !isSleet && !isSnow;

  // 피부/머리 색상
  const skin     = '#F5C8A0';
  const skinShad = '#EAA87A';
  const hair     = '#C89840';
  const hairDark = '#A07828';

  // 날씨별 옷 색상
  const dress: Record<string, { d1: string; d2: string; collar: string; shoe: string; sock: string }> = {
    veryhot:  { d1: '#FFE566', d2: '#FFB830', collar: '#FFFACD', shoe: '#D2691E', sock: '#FFF8DC' },
    warm:     { d1: '#FFB0D0', d2: '#FF80B0', collar: '#FFE0EC', shoe: '#7A4030', sock: '#FFF0F5' },
    mild:     { d1: '#90D0F0', d2: '#50A8D8', collar: '#E0F4FF', shoe: '#5A4030', sock: '#F0F8FF' },
    cool:     { d1: '#D4A870', d2: '#A07840', collar: '#F5E8D8', shoe: '#4A2818', sock: '#F5EAD8' },
    cold:     { d1: '#9098D0', d2: '#6068A8', collar: '#E8EAF8', shoe: '#282840', sock: '#E8EAF8' },
    verycold: { d1: '#6878B8', d2: '#485898', collar: '#C8D0F0', shoe: '#181830', sock: '#D0D8F8' },
    rain:     { d1: '#58C858', d2: '#389838', collar: '#C8F0C8', shoe: '#181818', sock: '#202020' },
    snow:     { d1: '#A8C8F8', d2: '#7898D8', collar: '#D8EEFF', shoe: '#303858', sock: '#E8F0FF' },
  };
  const drs = dress[state];

  // 표정
  const face =
    ['veryhot', 'warm', 'snow'].includes(state) ? 'happy' :
    ['cold', 'verycold'].includes(state)         ? 'worried' :
    state === 'rain'                             ? 'surprised' :
                                                   'neutral';

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
      <svg viewBox="0 0 200 252" width="176" height="222">

        {/* ── 배경 효과 ── */}
        {showSun && (
          <g>
            <circle cx="166" cy="26" r="20" fill="#FFE840" opacity="0.9" />
            {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
              const rad = deg * Math.PI / 180;
              return <line key={i}
                x1={166 + 22 * Math.cos(rad)} y1={26 + 22 * Math.sin(rad)}
                x2={166 + 32 * Math.cos(rad)} y2={26 + 32 * Math.sin(rad)}
                stroke="#FFE840" strokeWidth="2.5" />;
            })}
          </g>
        )}
        {showCloud && (
          <g opacity="0.75">
            <ellipse cx="158" cy="30" rx="24" ry="14" fill="#E0E8F0" />
            <ellipse cx="142" cy="36" rx="14" ry="10" fill="#EEF4F8" />
            <ellipse cx="172" cy="38" rx="12" ry="9"  fill="#EEF4F8" />
          </g>
        )}
        {(isRain || isSleet) && (
          <g opacity="0.5">
            {[16,44,72,100,128,156,184,30,58,86,114,142,170].map((x, i) => (
              <line key={i} x1={x} y1={8+(i%5)*26} x2={x-7} y2={32+(i%5)*26}
                stroke="#74B9FF" strokeWidth="2" />
            ))}
          </g>
        )}
        {(isSnow || isSleet) && (
          <g opacity="0.85">
            {[18,52,88,124,160,192,35,70,106,142,178].map((x, i) => (
              <circle key={i} cx={x} cy={6+(i%5)*28} r="3.5" fill="white" />
            ))}
          </g>
        )}

        {/* ── 잔디 ── */}
        <rect x="0" y="235" width="200" height="17" fill="#3A7818" />
        <rect x="0" y="230" width="200" height="8"  fill="#50A028" />
        {[12,36,58,84,112,138,162,186].map((x, i) => (
          <path key={i} d={`M ${x} 231 Q ${x-4} 221 ${x} 218 Q ${x+4} 221 ${x} 231`} fill="#66C038" />
        ))}

        {/* ═══ 비 상태: 개구리 레인코트 ═══ */}
        {state === 'rain' && (
          <g>
            {/* 레인코트 몸통 */}
            <path d="M 68 138 L 52 210 L 148 210 L 132 138 Z" fill="#50C050" />
            <path d="M 68 138 L 52 210 L 68 210 L 76 138 Z" fill="#389030" />
            <path d="M 132 138 L 148 210 L 132 210 L 124 138 Z" fill="#389030" />
            {/* 밑단 노란 라인 */}
            <path d="M 54 205 L 146 205 L 148 210 L 52 210 Z" fill="#E8E030" />
            {/* 개구리 후드 */}
            <circle cx="100" cy="72" r="58" fill="#50C050" />
            <circle cx="100" cy="72" r="54" fill="#68D868" />
            {/* 개구리 눈 (후드 위) */}
            <circle cx="76" cy="22"  r="16" fill="#50C050" />
            <circle cx="124" cy="22" r="16" fill="#50C050" />
            <circle cx="76" cy="22"  r="9"  fill="#1A2A18" />
            <circle cx="124" cy="22" r="9"  fill="#1A2A18" />
            <circle cx="79" cy="19"  r="3.5" fill="white" />
            <circle cx="127" cy="19" r="3.5" fill="white" />
            {/* 후드 내부 얼굴 영역 */}
            <ellipse cx="100" cy="84" rx="42" ry="44" fill={skin} />
            {/* 팔 */}
            <ellipse cx="50"  cy="170" rx="13" ry="20" fill="#50C050" />
            <ellipse cx="48"  cy="190" rx="10" ry="10" fill={skin} />
            <ellipse cx="150" cy="170" rx="13" ry="20" fill="#50C050" />
            <ellipse cx="152" cy="190" rx="10" ry="10" fill={skin} />
            {/* 장화 */}
            <rect x="78"  y="208" width="18" height="22" rx="4" fill="#181818" />
            <rect x="104" y="208" width="18" height="22" rx="4" fill="#181818" />
            <ellipse cx="87"  cy="232" rx="18" ry="8" fill="#181818" />
            <ellipse cx="113" cy="232" rx="18" ry="8" fill="#181818" />
          </g>
        )}

        {/* ═══ 일반 상태: 몸통 ═══ */}
        {state !== 'rain' && (
          <g>
            {/* 넥라인/칼라 */}
            <ellipse cx="100" cy="136" rx="20" ry="10" fill={drs.collar} />

            {/* 드레스/옷 */}
            <path d="M 76 132 L 58 212 L 142 212 L 124 132 Q 100 142 76 132 Z" fill={drs.d1} />
            <path d="M 76 132 L 58 212 L 74 212 L 82 132 Z" fill={drs.d2} />
            <path d="M 124 132 L 142 212 L 126 212 L 118 132 Z" fill={drs.d2} />

            {/* 옷 장식 */}
            {state === 'veryhot' && (
              <g>
                <circle cx="100" cy="160" r="5" fill={drs.d2} />
                <circle cx="100" cy="175" r="5" fill={drs.d2} />
                <circle cx="100" cy="190" r="5" fill={drs.d2} />
              </g>
            )}
            {state === 'warm' && (
              <g>
                <path d="M 80 180 Q 100 170 120 180 Q 100 195 80 180 Z" fill={drs.d2} opacity="0.6" />
              </g>
            )}
            {state === 'mild' && (
              <g>
                {/* 칼라 디테일 */}
                <path d="M 84 136 L 100 148 L 116 136" stroke={drs.d2} strokeWidth="2" fill="none" />
              </g>
            )}
            {(state === 'cold' || state === 'verycold') && (
              <g>
                {/* 코트 버튼 */}
                <circle cx="100" cy="155" r="3.5" fill={drs.collar} />
                <circle cx="100" cy="172" r="3.5" fill={drs.collar} />
                <circle cx="100" cy="189" r="3.5" fill={drs.collar} />
                {/* 목도리 */}
                <ellipse cx="100" cy="134" rx="24" ry="10" fill={state === 'verycold' ? '#D03030' : '#E05050'} />
                <ellipse cx="100" cy="130" rx="16" ry="7"  fill={state === 'verycold' ? '#B02020' : '#C03030'} />
              </g>
            )}
            {state === 'snow' && (
              <g>
                {/* 눈 결정 패턴 */}
                <text x="100" y="178" textAnchor="middle" fontSize="18" fill={drs.d2} opacity="0.7">❄</text>
              </g>
            )}

            {/* 팔 */}
            <ellipse cx="56"  cy="162" rx="13" ry="22" fill={drs.d1} />
            <ellipse cx="54"  cy="184" rx="11" ry="11" fill={skin} />
            <ellipse cx="144" cy="162" rx="13" ry="22" fill={drs.d1} />
            <ellipse cx="146" cy="184" rx="11" ry="11" fill={skin} />

            {/* 장갑 (매우 추울 때) */}
            {state === 'verycold' && (
              <g>
                <ellipse cx="54"  cy="184" rx="12" ry="12" fill="#2050B8" />
                <ellipse cx="146" cy="184" rx="12" ry="12" fill="#2050B8" />
              </g>
            )}

            {/* 양말 */}
            <rect x="84"  y="210" width="14" height="14" fill={drs.sock} />
            <rect x="102" y="210" width="14" height="14" fill={drs.sock} />

            {/* 신발 */}
            <ellipse cx="89"  cy="228" rx="18" ry="9" fill={drs.shoe} />
            <ellipse cx="111" cy="228" rx="18" ry="9" fill={drs.shoe} />
            <ellipse cx="87"  cy="225" rx="10" ry="5" fill={drs.shoe === '#D2691E' ? '#E8894E' : drs.shoe} opacity="0.5" />
            <ellipse cx="109" cy="225" rx="10" ry="5" fill={drs.shoe === '#D2691E' ? '#E8894E' : drs.shoe} opacity="0.5" />
          </g>
        )}

        {/* ═══ 머리/얼굴 (공통) ═══ */}

        {/* 머리카락 (뒷부분) */}
        <ellipse cx="100" cy="73" rx="51" ry="53" fill={hair} />

        {/* 얼굴 */}
        <ellipse cx="100" cy="80" rx="44" ry="46" fill={skin} />

        {/* 귀 */}
        <ellipse cx="56"  cy="88" rx="8" ry="10" fill={skinShad} />
        <ellipse cx="144" cy="88" rx="8" ry="10" fill={skinShad} />
        <ellipse cx="56"  cy="88" rx="5" ry="7"  fill={skin} />
        <ellipse cx="144" cy="88" rx="5" ry="7"  fill={skin} />

        {/* 앞머리 */}
        <rect x="52" y="32" width="96" height="22" rx="5" fill={hair} />
        <path d="M 54 44 Q 100 36 146 44" stroke={hairDark} strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* 머리카락 양 옆 (단발) */}
        <ellipse cx="53"  cy="102" rx="11" ry="28" fill={hair} />
        <ellipse cx="147" cy="102" rx="11" ry="28" fill={hair} />

        {/* ── 눈 ── */}
        {/* 왼쪽 눈 */}
        <ellipse cx="84" cy="74" rx="13" ry="14" fill="white" />
        <ellipse cx="84" cy="76" rx="10" ry="11" fill="#4A8840" />
        <circle  cx="84" cy="76" r="6.5"  fill="#181818" />
        <circle  cx="87" cy="72" r="3.8"  fill="white" />
        <circle  cx="82" cy="79" r="1.8"  fill="white" opacity="0.7" />
        {/* 속눈썹 */}
        <path d="M 72 66 Q 84 60 96 66" stroke={hairDark} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* 오른쪽 눈 */}
        <ellipse cx="116" cy="74" rx="13" ry="14" fill="white" />
        <ellipse cx="116" cy="76" rx="10" ry="11" fill="#4A8840" />
        <circle  cx="116" cy="76" r="6.5"  fill="#181818" />
        <circle  cx="119" cy="72" r="3.8"  fill="white" />
        <circle  cx="114" cy="79" r="1.8"  fill="white" opacity="0.7" />
        {/* 속눈썹 */}
        <path d="M 104 66 Q 116 60 128 66" stroke={hairDark} strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* ── 코 ── */}
        <ellipse cx="100" cy="91" rx="5.5" ry="4" fill="#E89070" />

        {/* ── 입 ── */}
        {face === 'happy' && (
          <path d="M 91 100 Q 100 109 109 100" stroke="#C07060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {face === 'neutral' && (
          <path d="M 93 100 Q 100 105 107 100" stroke="#C07060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {face === 'worried' && (
          <>
            <path d="M 92 103 Q 100 99 108 103" stroke="#C07060" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 79 62 Q 85 58 91 62" stroke={hairDark} strokeWidth="2" fill="none" />
            <path d="M 109 62 Q 115 58 121 62" stroke={hairDark} strokeWidth="2" fill="none" />
          </>
        )}
        {face === 'surprised' && (
          <ellipse cx="100" cy="102" rx="6" ry="7" fill="#C07060" />
        )}

        {/* ── 볼터치 ── */}
        <ellipse cx="68"  cy="92" rx="16" ry="9" fill="#FFB0B0" opacity="0.6" />
        <ellipse cx="132" cy="92" rx="16" ry="9" fill="#FFB0B0" opacity="0.6" />

        {/* ── 모자 (날씨별) ── */}
        {state === 'veryhot' && (
          <g>
            {/* 밀짚모자 */}
            <ellipse cx="100" cy="30" rx="54" ry="10" fill="#D89030" />
            <rect x="68" y="10" width="64" height="22" rx="6" fill="#D89030" />
            <ellipse cx="100" cy="10" rx="32" ry="7"  fill="#E8A840" />
            <rect x="72" y="14" width="56" height="8"  rx="3" fill="#E8A840" />
            <path d="M 70 30 Q 100 24 130 30" stroke="#B87020" strokeWidth="1.5" fill="none" />
          </g>
        )}
        {state === 'verycold' && (
          <g>
            {/* 니트 모자 */}
            <ellipse cx="100" cy="30" rx="50" ry="10" fill="#C03030" />
            <rect x="52" y="12" width="96" height="20" fill="#C03030" />
            <ellipse cx="100" cy="12" rx="48" ry="12" fill="#C03030" />
            <ellipse cx="100" cy="12" rx="38" ry="9"  fill="#D04040" />
            <circle  cx="100" cy="5"  r="8"           fill="#E8C0C0" />
            {/* 줄무늬 */}
            {[18,24,30].map((y, i) => (
              <rect key={i} x="52" y={y} width="96" height="3" fill="#E04040" opacity="0.4" />
            ))}
          </g>
        )}
        {state === 'snow' && (
          <g>
            {/* 귀여운 비니 */}
            <ellipse cx="100" cy="32" rx="50" ry="10" fill="#E05050" />
            <rect x="52" y="14" width="96" height="20" fill="#E05050" />
            <ellipse cx="100" cy="14" rx="48" ry="14" fill="#E05050" />
            <circle  cx="100" cy="6"  r="9"            fill="#F8D0D0" />
          </g>
        )}

      </svg>
    </div>
  );
}
