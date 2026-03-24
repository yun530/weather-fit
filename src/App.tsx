import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import WeatherCharacter from './components/WeatherCharacter';
import HourlyForecast from './components/HourlyForecast';
import TomorrowCard from './components/TomorrowCard';
import { getOutfit, getSkyDesc, getSkyEmoji, getBgGradient, getStyleTip } from './utils/outfitEngine';
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

function MusinsaSlot({ item, className, textColor }: { item: string; className: string; textColor: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/musinsa', { params: { item } });
      window.open(res.data.url, '_blank');
    } catch {
      window.open(`https://www.musinsa.com/search/musinsa/goods?q=${encodeURIComponent(item)}`, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={className}
      onClick={handleClick}
      style={{ cursor: loading ? 'wait' : 'pointer', position: 'relative' }}
      title={`무신사에서 ${item} 보기`}
    >
      <span style={{ fontSize: '26px', lineHeight: 1 }}>{loading ? '⟳' : getItemEmoji(item)}</span>
      <span style={{ fontSize: '10px', color: textColor, textAlign: 'center', lineHeight: 1.4, fontFamily: 'DotGothic16' }}>
        {item}
      </span>
      <span style={{ fontSize: '8px', color: '#E07020', fontFamily: 'DotGothic16', lineHeight: 1 }}>무신사↗</span>
    </div>
  );
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
  const [gpsLoading, setGpsLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [hourly, setHourly] = useState<HourSlot[]>([]);
  const [tomorrow, setTomorrow] = useState<TomorrowData | null>(null);
  const [aiTip, setAiTip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeLat = gpsCoords?.lat ?? CITIES[selectedCity].lat;
  const activeLon = gpsCoords?.lon ?? CITIES[selectedCity].lon;
  const displayCity = gpsCoords ? '내 위치' : selectedCity;

  const handleGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }); setGpsLoading(false); },
      () => { setGpsLoading(false); },
      { timeout: 10000 }
    );
  };

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError('');
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
      setError('날씨 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeLat, activeLon]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  const outfit = weather ? getOutfit(weather) : null;
  const bgGradient = weather ? getBgGradient(weather.sky, weather.pty, weather.tmp) : 'from-sky-400 to-blue-500';
  const emoji = weather ? getSkyEmoji(weather.sky, weather.pty) : '☀️';

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm">

        {/* 타이틀 */}
        <div className="text-center mb-5">
          <div className="pixel-num" style={{ fontSize: '11px', color: '#A8E060', letterSpacing: '0.15em', marginBottom: '6px' }}>
            ◆ WEATHER-FIT ◆
          </div>
          <div style={{ color: '#78B840', fontSize: '12px', fontFamily: 'DotGothic16' }}>
            오늘의 날씨와 코디 🍃
          </div>
        </div>

        <div className="game-card">

          {/* ── 컨트롤 바 ── */}
          <div className="control-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={gpsCoords ? '' : selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setGpsCoords(null); }}
                className="pixel-select"
              >
                {gpsCoords && <option value="">📍 내 위치</option>}
                {Object.keys(CITIES).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <button onClick={handleGps} disabled={gpsLoading} className="pixel-btn" style={{ width: '36px', height: '36px' }}>
                {gpsLoading ? '⟳' : '🎯'}
              </button>
            </div>
            <button onClick={fetchWeather} disabled={loading} className="pixel-btn" style={{ width: '36px', height: '36px' }}>
              {loading ? '⟳' : '🔄'}
            </button>
          </div>

          {/* ── 날씨 메인 ── */}
          <div className={`bg-gradient-to-b ${bgGradient}`} style={{ padding: '28px 20px 24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍃</div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontFamily: 'DotGothic16' }}>날씨 확인 중...</div>
              </div>
            ) : error ? (
              <div className="parchment" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: '#5A2A00', marginBottom: '10px' }}>{error}</div>
                <button onClick={fetchWeather} className="pixel-btn" style={{ padding: '6px 16px', fontSize: '12px' }}>
                  다시 시도
                </button>
              </div>
            ) : weather ? (
              <>
                {/* 날씨 메인 디스플레이 */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '8px' }}>{emoji}</div>
                  <div className="pixel-num" style={{
                    fontSize: '52px', lineHeight: 1, color: 'white',
                    textShadow: '3px 3px 0 rgba(0,0,0,0.25)', marginBottom: '10px'
                  }}>
                    {Math.round(weather.tmp)}°
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: '14px', fontFamily: 'DotGothic16' }}>
                    {displayCity} · {weather.skyDesc}
                  </div>
                </div>

                {/* 통계 뱃지 */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  {[
                    { icon: '💧', label: '습도', value: `${weather.reh}%` },
                    { icon: '💨', label: '바람', value: `${weather.wsd}m` },
                    { icon: '☔', label: '강수', value: `${weather.pop}%` },
                  ].map(s => (
                    <div key={s.label} className="stat-badge">
                      <div style={{ fontSize: '18px', lineHeight: 1 }}>{s.icon}</div>
                      <div className="pixel-num" style={{ fontSize: '10px', color: 'white', marginTop: '2px' }}>{s.value}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'DotGothic16' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* ── 시간대별 예보 ── */}
          {hourly.length > 0 && (
            <>
              <div className="section-strip">
                <span style={{ color: '#78E038' }}>◆</span> ⏰ 시간대별 예보
              </div>
              <HourlyForecast hourly={hourly} />
            </>
          )}

          {/* ── 캐릭터 + 말풍선 ── */}
          {(weather || loading) && (
            <div style={{ background: '#3E8822', borderTop: '3px solid #0A1A05', borderBottom: '3px solid #0A1A05', padding: '12px 16px 0', position: 'relative' }}>
              {weather ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  {/* 캐릭터 */}
                  <div style={{ flexShrink: 0 }}>
                    <WeatherCharacter tmp={weather.tmp} pty={weather.pty} sky={weather.sky} />
                  </div>
                  {/* 말풍선 */}
                  {aiTip && (
                    <div style={{ flex: 1, marginBottom: '32px', position: 'relative' }}>
                      {/* 말풍선 본체 */}
                      <div style={{
                        background: 'white',
                        border: '2.5px solid #222',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        boxShadow: '3px 3px 0 #222',
                      }}>
                        <p style={{ fontSize: '11px', color: '#1A1A1A', lineHeight: 2, fontFamily: 'DotGothic16', margin: 0 }}>
                          {aiTip}
                        </p>
                      </div>
                      {/* 말풍선 꼬리 - 테두리 */}
                      <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '-14px',
                        width: 0,
                        height: 0,
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent',
                        borderRight: '14px solid #222',
                      }} />
                      {/* 말풍선 꼬리 - 흰색 */}
                      <div style={{
                        position: 'absolute',
                        bottom: '17px',
                        left: '-11px',
                        width: 0,
                        height: 0,
                        borderTop: '7px solid transparent',
                        borderBottom: '7px solid transparent',
                        borderRight: '11px solid white',
                      }} />
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ height: '220px' }} />
              )}
            </div>
          )}

          {/* ── 오늘의 코디 ── */}
          {outfit && (
            <>
              <div className="section-strip">
                <span style={{ color: '#78E038' }}>◆</span> 👗 오늘의 코디
                <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#88D050' }}>{outfit.tempRange}</span>
              </div>

              <div style={{ background: '#356818', padding: '14px 16px 16px' }}>
                {/* 아이템 슬롯 */}
                <div className="flex gap-2 overflow-x-auto scroll-hide" style={{ paddingBottom: '4px' }}>
                  {outfit.items.map(item => (
                    <MusinsaSlot key={item} item={item} className="item-slot" textColor="#1A0A00" />
                  ))}
                  {outfit.extras.map(item => (
                    <MusinsaSlot key={item} item={item} className="item-slot item-slot-alt" textColor="#2A1000" />
                  ))}
                </div>
                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: 'rgba(200,240,140,0.7)', fontFamily: 'DotGothic16' }}>
                  👆 아이템을 눌러서 무신사에서 구경해봐요!
                </div>
              </div>
            </>
          )}

          {/* ── 내일 날씨 ── */}
          {tomorrow && (
            <>
              <div className="section-strip">
                <span style={{ color: '#78E038' }}>◆</span> 🌅 내일 날씨
              </div>
              <div style={{ background: '#356818', padding: '14px 16px 18px' }}>
                <TomorrowCard data={tomorrow} />
              </div>
            </>
          )}

        </div>

        {/* 하단 크레딧 */}
        <div style={{ textAlign: 'center', marginTop: '16px', color: 'rgba(140,210,80,0.6)', fontSize: '10px', fontFamily: 'DotGothic16', letterSpacing: '0.05em' }}>
          ◆ 기상청 데이터 기반 · Weather-Fit ◆
        </div>

      </div>
    </div>
  );
}
