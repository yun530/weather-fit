import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 기상청 격자 좌표 변환 (위경도 → 격자 X/Y)
function latLonToGrid(lat, lon) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0, SLAT2 = 60.0;
  const OLON = 126.0, OLAT = 38.0;
  const XO = 43, YO = 136;
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  return { x, y };
}

// 기상청 API 기준시간 계산
function getBaseTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // 기상청 단기예보 발표 시간: 02, 05, 08, 11, 14, 17, 20, 23시
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = baseTimes[0];

  for (const h of baseTimes) {
    if (hours > h || (hours === h && minutes >= 10)) {
      baseHour = h;
    }
  }

  const baseDate = new Date(now);
  if (baseHour > hours) {
    baseDate.setDate(baseDate.getDate() - 1);
    baseHour = 23;
  }

  const dateStr = baseDate.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = String(baseHour).padStart(2, '0') + '00';
  return { baseDate: dateStr, baseTime: timeStr };
}

// 날씨 API
app.get('/api/weather', async (req, res) => {
  const { lat = 37.5665, lon = 126.9780 } = req.query;
  const { x, y } = latLonToGrid(parseFloat(lat), parseFloat(lon));
  const { baseDate, baseTime } = getBaseTime();

  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${x}&ny=${y}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('기상청 API 오류:', err.message);
    res.status(500).json({ error: '날씨 데이터를 불러올 수 없습니다.' });
  }
});

// Claude AI 스타일 제안 API
app.post('/api/style', async (req, res) => {
  const { weather, outfit } = req.body;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `오늘 날씨와 옷차림 정보입니다:
- 현재 기온: ${weather.tmp}°C
- 체감온도: ${weather.wct || weather.tmp}°C
- 날씨: ${weather.skyDesc}
- 강수: ${weather.ptyDesc}
- 습도: ${weather.reh}%
- 풍속: ${weather.wsd}m/s
- 추천 옷: ${outfit.join(', ')}

위 날씨를 바탕으로 친근한 한국어로 2-3문장의 짧고 실용적인 스타일 팁을 알려주세요. 이모지 사용, 구체적이고 따뜻한 톤으로.`
        }
      ]
    });

    res.json({ tip: message.content[0].text });
  } catch (err) {
    console.error('Claude API 오류:', err.message);
    res.status(500).json({ error: 'AI 스타일 제안을 불러올 수 없습니다.' });
  }
});

// 프로덕션: 빌드된 프론트 정적 파일 서빙
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
