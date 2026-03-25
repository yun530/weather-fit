import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WeatherCharacter from './components/WeatherCharacter';
import WeatherIcon from './components/WeatherIcon';
import HourlyForecast from './components/HourlyForecast';
import { getOutfit, getSkyDesc, getStyleTip } from './utils/outfitEngine';
// getOutfit은 내일 코디 추천에 사용
import type { WeatherData } from './utils/outfitEngine';
import type { HourSlot } from './components/HourlyForecast';
import type { TomorrowData } from './components/TomorrowCard';
import './index.css';

const CITIES: Record<string, { lat: number; lon: number }> = {
  서울: { lat: 37.5665, lon: 126.9780 },
  부산: { lat: 35.1796, lon: 129.0756 },
  인천: { lat: 37.4563, lon: 126.7052 },
  대구: { lat: 35.8714, lon: 128.6014 },
  대전: { lat: 36.3504, lon: 127.3845 },
  광주: { lat: 35.1595, lon: 126.8526 },
  제주: { lat: 33.4996, lon: 126.5312 },
};

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

const ITEM_EMOJI: Record<string, string> = {
  '반팔 티셔츠': '👕', '반바지': '🩳', '샌들': '👡',
  '얇은 긴바지': '👖', '운동화': '👟',
  '긴팔 셔츠': '👔', '얇은 재킷': '🧥', '청바지': '👖', '스니커즈': '👟',
  '두꺼운 재킷': '🧥', '가디건': '🧶', '두꺼운 바지': '👖',
  '코트': '🧥', '니트': '🧶', '기모 바지': '👖', '목도리': '🧣',
  '패딩': '🧥', '터틀넥': '👕', '방한 부츠': '👢', '장갑': '🧤',
  '우산': '☂️', '방수 재킷': '🧥', '방수 부츠': '👢',
  '두꺼운 장갑': '🧤', '방풍 재킷': '🧥',
};
const getItemEmoji = (item: string) => ITEM_EMOJI[item] || '📦';

const MUSINSA_CATEGORY: Record<string, string> = {
  '반팔 티셔츠': '001', '긴팔 셔츠': '001', '니트': '001', '터틀넥': '001', '가디건': '001',
  '반바지': '003', '청바지': '003', '얇은 긴바지': '003', '두꺼운 바지': '003', '기모 바지': '003',
  '얇은 재킷': '002', '두꺼운 재킷': '002', '코트': '002', '패딩': '002',
  '방풍 재킷': '002', '방수 재킷': '002',
  '스니커즈': '005', '운동화': '005', '샌들': '005', '방한 부츠': '005', '방수 부츠': '005',
  '목도리': '011', '장갑': '011', '두꺼운 장갑': '011',
};

function getMusinsaUrl(item: string): string {
  const cat = MUSINSA_CATEGORY[item];
  if (cat) {
    return `https://www.musinsa.com/category/${cat}/goods?sortCode=TS&period=now&gender=female`;
  }
  return `https://www.musinsa.com/search/musinsa/goods?q=${encodeURIComponent(item)}`;
}


function parseCurrentWeather(items: any[]): WeatherData {
  const data: Record<string, string> = {};
  const now = new Date();
  const targetHour = String(now.getHours()).padStart(2, '0') + '00';
  for (const item of items) {
    if (item.fcstTime === targetHour || !data[item.category])
      data[item.category] = item.fcstValue;
  }
  const sky = parseInt(data['SKY'] || '1');
  const pty = parseInt(data['PTY'] || '0');
  return {
    tmp: parseFloat(data['TMP'] || '15'),
    reh: parseFloat(data['REH'] || '50'),
    wsd: parseFloat(data['WSD'] || '2'),
    pop: parseFloat(data['POP'] || '0'),
    pty, sky,
    skyDesc: getSkyDesc(sky, pty),
    ptyDesc: pty === 0 ? '강수 없음' : pty === 1 ? '비' : pty === 2 ? '비/눈' : pty === 3 ? '눈' : '소나기',
    wct: parseFloat(data['WCT'] || data['TMP'] || '15'),
  };
}

function parseHourly(items: any[]): HourSlot[] {
  const now = new Date();
  const currentHour = now.getHours();
  const pad = (n: number) => String(n).padStart(2, '0');
  const today = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const byTime: Record<string, Record<string, string>> = {};
  for (const item of items) {
    const key = item.fcstDate + item.fcstTime;
    if (!byTime[key]) byTime[key] = {};
    byTime[key][item.category] = item.fcstValue;
  }
  const result: HourSlot[] = [];
  for (const key of Object.keys(byTime).sort()) {
    const date = key.slice(0, 8);
    const time = key.slice(8);
    const hour = parseInt(time.slice(0, 2));
    if (date === today && hour <= currentHour) continue;
    const slot = byTime[key];
    if (!slot['TMP']) continue;
    result.push({
      time: `${hour}시`,
      tmp: parseFloat(slot['TMP']),
      sky: parseInt(slot['SKY'] || '1'),
      pty: parseInt(slot['PTY'] || '0'),
      pop: parseFloat(slot['POP'] || '0'),
    });
    if (result.length >= 12) break;
  }
  return result;
}

function parseTomorrow(items: any[]): TomorrowData | null {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  const tomorrowStr = `${tomorrow.getFullYear()}${pad(tomorrow.getMonth() + 1)}${pad(tomorrow.getDate())}`;
  const tItems = items.filter((i) => i.fcstDate === tomorrowStr);
  if (tItems.length === 0) return null;
  const temps = tItems.filter((i) => i.category === 'TMP').map((i) => parseFloat(i.fcstValue));
  const pops  = tItems.filter((i) => i.category === 'POP').map((i) => parseFloat(i.fcstValue));
  const pm    = tItems.filter((i) => i.fcstTime === '1500' || i.fcstTime === '1200');
  const skyItem = pm.find((i) => i.category === 'SKY') ?? tItems.find((i) => i.category === 'SKY');
  const ptyItem = pm.find((i) => i.category === 'PTY') ?? tItems.find((i) => i.category === 'PTY');
  return {
    tmpMin: Math.round(Math.min(...temps)),
    tmpMax: Math.round(Math.max(...temps)),
    sky: parseInt(skyItem?.fcstValue || '1'),
    pty: parseInt(ptyItem?.fcstValue || '0'),
    pop: Math.round(Math.max(...pops, 0)),
    dayLabel: DAY_NAMES[tomorrow.getDay()] + '요일',
  };
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState('서울');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourSlot[]>([]);
  const [tomorrow, setTomorrow] = useState<TomorrowData | null>(null);
  const [aiTip, setAiTip] = useState('');
  const [loading, setLoading] = useState(false);

  const activeLat = gpsCoords?.lat ?? CITIES[selectedCity].lat;
  const activeLon = gpsCoords?.lon ?? CITIES[selectedCity].lon;
  const displayCity = gpsCoords ? '내 위치' : selectedCity;

  const handleGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      () => { },
    );
  };

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setWeather(null);
    setAiTip('');
    try {
      const res = await axios.get('/api/weather', { params: { lat: activeLat, lon: activeLon } });
      const items = res.data?.response?.body?.items?.item;
      if (!items) throw new Error('날씨 데이터 없음');
      const parsed = parseCurrentWeather(items);
      setWeather(parsed);
      setHourly(parseHourly(items));
      setTomorrow(parseTomorrow(items));
      setAiTip(getStyleTip(parsed));
    } catch {
      // Error handling can be improved later
    } finally {
      setLoading(false);
    }
  }, [activeLat, activeLon]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  const tomorrowOutfit = tomorrow ? getOutfit({
    tmp: Math.round((tomorrow.tmpMax + tomorrow.tmpMin) / 2),
    reh: 50,
    wsd: 2,
    pop: tomorrow.pop,
    pty: tomorrow.pty,
    sky: tomorrow.sky,
    skyDesc: '',
    ptyDesc: '',
  }) : null;

  // Mock data for Fine Dust (representative values for design)
  const dustStatus = { pm10: '보통', pm25: '좋음' };

  return (
    <div className="weather-container">
      <div className="weather-card">
        
        {/* ── 헤더 바 ── */}
        <div className="header-bar">
          <div className="location-selector" onClick={handleGps}>
            <span>{displayCity}</span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>▼</span>
          </div>
          <div className="action-icons">
            <button onClick={() => {}} className="btn-modern">📤</button>
            <button onClick={() => setSelectedCity('서울')} className="btn-modern">＋</button>
          </div>
        </div>

        {/* ── 메인 날씨 정보 ── */}
        <div className="temp-display">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="temp-main">
              {weather ? Math.round(weather.tmp) : '--'}
              <span style={{ fontSize: '40px', marginTop: '10px', fontWeight: 300 }}>°</span>
            </div>
            {weather && (
              <div style={{ marginRight: '8px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))' }}>
                <WeatherIcon sky={weather.sky} pty={weather.pty} size={88} color="#5B8FCF" />
              </div>
            )}
          </div>
          
          <div className="temp-range">
            <span className="temp-min">{weather ? '-10' : '--'}</span>
            <span className="temp-max">{weather ? '3' : '--'}</span>
          </div>

          <div className="status-badges">
            <span className="badge orange">미세 {dustStatus.pm10}</span>
            <span className="badge blue">초미세 {dustStatus.pm25}</span>
          </div>
        </div>

        {/* ── 캐릭터 섹션 ── */}
        <div style={{ marginTop: '12px', padding: '0 16px' }}>
          {/* 카카오 스타일 위치+날씨 */}
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{ color: '#5B8FCF', fontSize: '13px' }}>◀</span>
              <span>{displayCity}</span>
              <span style={{ fontWeight: 400, color: '#555' }}>은(는)</span>
              <b style={{ color: '#222' }}>{weather?.skyDesc || '—'}</b>
            </div>
            <div style={{ fontSize: '11px', color: '#BBB', marginTop: '3px' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 업데이트됨
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
            {/* 캐릭터 */}
            <div style={{ flexShrink: 0 }}>
              {weather
                ? <WeatherCharacter tmp={weather.tmp} pty={weather.pty} sky={weather.sky} />
                : <WeatherCharacter tmp={0} pty={0} sky={1} />
              }
            </div>

            {/* 말풍선 */}
            {aiTip && (
              <div style={{ position: 'relative', flex: 1 }}>
                {/* 꼬리 (캐릭터 방향 = 왼쪽) */}
                <div style={{
                  position: 'absolute',
                  left: '-10px',
                  top: '18px',
                  width: 0, height: 0,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  borderRight: '10px solid #E8E8E8',
                }} />
                <div style={{
                  position: 'absolute',
                  left: '-7px',
                  top: '19px',
                  width: 0, height: 0,
                  borderTop: '7px solid transparent',
                  borderBottom: '7px solid transparent',
                  borderRight: '8px solid white',
                }} />
                <div style={{
                  background: 'white',
                  border: '2px solid #E8E8E8',
                  borderRadius: '16px',
                  padding: '10px 13px',
                  fontSize: '11px',
                  lineHeight: 1.7,
                  color: '#333',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                }}>
                  {aiTip}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 내일 코디 추천 ── */}
        {tomorrowOutfit && tomorrow && (
          <div style={{ padding: '4px 28px 24px' }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>
                👗 내일 이 옷은 어때요?
              </div>
              <div style={{ fontSize: '11px', color: '#AAA' }}>
                {tomorrow.dayLabel} · {tomorrow.tmpMin}°~{tomorrow.tmpMax}° · {tomorrowOutfit.tempRange}
                {tomorrow.pop > 0 && <span style={{ color: '#32A1FF', marginLeft: '6px' }}>☔ {tomorrow.pop}%</span>}
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto scroll-hide" style={{ paddingBottom: '4px' }}>
              {[...tomorrowOutfit.items, ...tomorrowOutfit.extras].map(item => (
                <div
                  key={item}
                  onClick={() => window.open(getMusinsaUrl(item), '_blank')}
                  style={{ flexShrink: 0, width: '68px', textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '30px', background: '#F7F7F7', borderRadius: '16px', padding: '10px 0', marginBottom: '6px' }}>
                    {getItemEmoji(item)}
                  </div>
                  <div style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '10px', color: '#CCC', marginTop: '8px' }}>
              👆 아이템 클릭 → 무신사 여성 실시간 1위
            </div>
          </div>
        )}

        {/* ── 하단 ── */}
        <div className="footer-info">
          <div style={{ fontSize: '18px', color: '#CCC' }}>〰</div>
          <div className="weather-more" onClick={fetchWeather}>
            날씨 새로고침 <span style={{ fontSize: '10px' }}>↺</span>
          </div>
          <div style={{ fontSize: '18px' }}>👤</div>
        </div>

      </div>

      {/* ── 시간대별 예보 ── */}
      <div style={{ marginTop: '16px', background: 'white', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', padding: '0 8px 8px' }}>
        <div style={{ padding: '18px 16px 8px', fontSize: '13px', fontWeight: 700, color: '#111' }}>⏰ 시간대별 예보</div>
        <HourlyForecast hourly={hourly} />
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.8)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
        }}>
          <div style={{ fontSize: '24px', animation: 'spin 2s linear infinite' }}>🔄</div>
        </div>
      )}
    </div>
  );
}
