function latLonToGrid(lat, lon) {
  const RE = 6371.00877, GRID = 5.0;
  const SLAT1 = 30.0, SLAT2 = 60.0;
  const OLON = 126.0, OLAT = 38.0;
  const XO = 43, YO = 136;
  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD, olat = OLAT * DEGRAD;

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

function getBaseTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = baseTimes[0];
  for (const h of baseTimes) {
    if (hours > h || (hours === h && minutes >= 10)) baseHour = h;
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

export default async function handler(req, res) {
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
    res.status(500).json({ error: '날씨 데이터를 불러올 수 없습니다.' });
  }
}
