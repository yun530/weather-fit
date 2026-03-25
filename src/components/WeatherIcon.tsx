interface Props {
  sky: number;
  pty: number;
  size?: number;
  color?: string;
}

export default function WeatherIcon({ sky, pty, size = 80, color = 'white' }: Props) {
  const s = size;
  const c = color;

  // 비
  if (pty === 1 || pty === 4) return (
    <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
      {/* 구름 */}
      <path d="M20 46 Q12 46 12 37 Q12 28 21 28 Q22 18 32 18 Q40 18 43 25 Q48 22 54 26 Q62 28 62 37 Q62 46 52 46 Z" fill={c} opacity="0.95"/>
      {/* 빗방울 */}
      <line x1="26" y1="53" x2="22" y2="63" stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
      <line x1="36" y1="53" x2="32" y2="63" stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
      <line x1="46" y1="53" x2="42" y2="63" stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
      <line x1="56" y1="53" x2="52" y2="63" stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
    </svg>
  );

  // 눈
  if (pty === 2 || pty === 3) return (
    <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
      <path d="M20 44 Q12 44 12 35 Q12 26 21 26 Q22 16 32 16 Q40 16 43 23 Q48 20 54 24 Q62 26 62 35 Q62 44 52 44 Z" fill={c} opacity="0.95"/>
      {/* 눈송이 */}
      <circle cx="26" cy="56" r="3" fill={c} opacity="0.8"/>
      <circle cx="40" cy="60" r="3" fill={c} opacity="0.8"/>
      <circle cx="54" cy="56" r="3" fill={c} opacity="0.8"/>
      <circle cx="33" cy="65" r="2.5" fill={c} opacity="0.6"/>
      <circle cx="47" cy="65" r="2.5" fill={c} opacity="0.6"/>
    </svg>
  );

  // 맑음
  if (sky === 1) return (
    <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
      {/* 태양 */}
      <circle cx="40" cy="40" r="16" fill={c}/>
      {/* 광선 */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <line
          key={angle}
          x1={40 + 20 * Math.cos(angle * Math.PI / 180)}
          y1={40 + 20 * Math.sin(angle * Math.PI / 180)}
          x2={40 + 28 * Math.cos(angle * Math.PI / 180)}
          y2={40 + 28 * Math.sin(angle * Math.PI / 180)}
          stroke={c} strokeWidth="3.5" strokeLinecap="round"
        />
      ))}
    </svg>
  );

  // 구름 조금 (sky=2,3)
  if (sky === 2 || sky === 3) return (
    <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
      {/* 태양 (뒤) */}
      <circle cx="52" cy="28" r="13" fill={c} opacity="0.85"/>
      {[0, 60, 120, 180, 240, 300].map(angle => (
        <line
          key={angle}
          x1={52 + 16 * Math.cos(angle * Math.PI / 180)}
          y1={28 + 16 * Math.sin(angle * Math.PI / 180)}
          x2={52 + 22 * Math.cos(angle * Math.PI / 180)}
          y2={28 + 22 * Math.sin(angle * Math.PI / 180)}
          stroke={c} strokeWidth="3" strokeLinecap="round" opacity="0.85"
        />
      ))}
      {/* 구름 (앞) */}
      <path d="M14 52 Q6 52 6 43 Q6 34 15 34 Q16 24 26 24 Q34 24 37 31 Q42 28 48 32 Q56 34 56 43 Q56 52 46 52 Z" fill={c}/>
      {/* 눈 */}
      <circle cx="26" cy="41" r="2.5" fill="#6B9ECC" opacity="0.5"/>
      <circle cx="36" cy="41" r="2.5" fill="#6B9ECC" opacity="0.5"/>
      {/* 입 */}
      <path d="M28 46 Q31 49 34 46" stroke="#6B9ECC" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );

  // 흐림 (sky=4)
  return (
    <svg width={s} height={s} viewBox="0 0 80 80" fill="none">
      {/* 뒤 구름 */}
      <path d="M28 48 Q20 48 20 40 Q20 33 28 32 Q32 24 42 25 Q50 25 52 32 Q60 32 60 40 Q60 48 52 48 Z" fill={c} opacity="0.5"/>
      {/* 앞 구름 */}
      <path d="M14 58 Q6 58 6 50 Q6 42 14 41 Q15 32 25 32 Q33 32 36 38 Q41 35 47 39 Q55 40 55 50 Q55 58 46 58 Z" fill={c} opacity="0.95"/>
      {/* 눈 */}
      <circle cx="24" cy="47" r="2.5" fill="#8AAABB" opacity="0.4"/>
      <circle cx="34" cy="47" r="2.5" fill="#8AAABB" opacity="0.4"/>
      {/* 입 */}
      <path d="M26 52 Q30 55 34 52" stroke="#8AAABB" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}
