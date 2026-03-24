export interface WeatherData {
  tmp: number;
  reh: number;
  wsd: number;
  pop: number;
  pty: number; // 0: 없음, 1: 비, 2: 비/눈, 3: 눈, 4: 소나기
  sky: number; // 1: 맑음, 3: 구름많음, 4: 흐림
  skyDesc: string;
  ptyDesc: string;
  wct?: number;
}

export interface OutfitResult {
  items: string[];
  category: string;
  tempRange: string;
  extras: string[];
}

export function getOutfit(weather: WeatherData): OutfitResult {
  const { tmp, pty, wsd } = weather;
  let items: string[] = [];
  let category = '';
  let tempRange = '';
  let extras: string[] = [];

  // 기온별 기본 아이템
  if (tmp >= 28) {
    items = ['반팔 티셔츠', '반바지', '샌들'];
    category = '한여름 코디';
    tempRange = '28°C 이상';
  } else if (tmp >= 23) {
    items = ['반팔 티셔츠', '얇은 긴바지', '운동화'];
    category = '여름 코디';
    tempRange = '23~27°C';
  } else if (tmp >= 17) {
    items = ['긴팔 셔츠', '얇은 재킷', '청바지', '스니커즈'];
    category = '봄/가을 코디';
    tempRange = '17~22°C';
  } else if (tmp >= 9) {
    items = ['두꺼운 재킷', '가디건', '두꺼운 바지', '스니커즈'];
    category = '쌀쌀한 날 코디';
    tempRange = '9~16°C';
  } else if (tmp >= 4) {
    items = ['코트', '니트', '기모 바지', '목도리'];
    category = '추운 날 코디';
    tempRange = '4~8°C';
  } else {
    items = ['패딩', '터틀넥', '기모 바지', '방한 부츠', '장갑'];
    category = '한겨울 코디';
    tempRange = '3°C 이하';
  }

  // 강수 여부
  if (pty === 1 || pty === 4) {
    extras.push('우산');
    extras.push('방수 재킷');
  } else if (pty === 2) {
    extras.push('우산');
    extras.push('방수 부츠');
  } else if (pty === 3) {
    extras.push('방수 부츠');
    extras.push('두꺼운 장갑');
  }

  // 강한 바람
  if (wsd >= 7) {
    extras.push('방풍 재킷');
  }

  return { items, category, tempRange, extras };
}

export function getSkyDesc(sky: number, pty: number): string {
  if (pty === 1) return '비';
  if (pty === 2) return '비/눈';
  if (pty === 3) return '눈';
  if (pty === 4) return '소나기';
  if (sky === 1) return '맑음';
  if (sky === 3) return '구름많음';
  if (sky === 4) return '흐림';
  return '맑음';
}

export function getSkyEmoji(sky: number, pty: number): string {
  if (pty === 1 || pty === 4) return '🌧';
  if (pty === 2) return '🌨';
  if (pty === 3) return '❄️';
  if (sky === 1) return '☀️';
  if (sky === 3) return '⛅';
  if (sky === 4) return '☁️';
  return '☀️';
}

export function getStyleTip(weather: WeatherData): string {
  const { tmp, pty, wsd, reh } = weather;

  if (pty === 1 || pty === 4) {
    if (tmp >= 20) return '☔ 비 오는 날엔 방수 재킷이 필수예요! 밝은 색 우산으로 포인트를 줘보세요.';
    if (tmp >= 10) return '🌧 우산 챙기고, 방수 소재 아우터가 실용적이에요. 신발은 방수 운동화나 첼시 부츠 추천!';
    return '🌧 비에 추위까지, 방수 패딩이나 레인 재킷 위에 두꺼운 레이어링이 좋아요. 방수 부츠 필수!';
  }

  if (pty === 2) return '🌨 비와 눈이 섞인 날씨예요. 방수 처리된 따뜻한 아우터와 방수 부츠로 완전 무장하세요!';

  if (pty === 3) {
    if (tmp <= 0) return '❄️ 눈 오는 날! 패딩에 방한 부츠, 장갑까지 챙기세요. 미끄럼 주의 밑창 신발이 좋아요.';
    return '❄️ 눈이 와요! 방수 부츠와 두꺼운 코트로 따뜻하게 입고, 목도리로 마무리해보세요.';
  }

  if (wsd >= 7) {
    return '💨 바람이 강해요! 방풍 재킷이나 바람막이를 꼭 챙기세요. 스카프로 목을 감싸면 훨씬 따뜻해요.';
  }

  if (tmp >= 28) {
    if (reh >= 70) return '🥵 덥고 습해요! 통기성 좋은 린넨이나 면 소재로 최대한 시원하게 입으세요. 선크림 필수!';
    return '☀️ 한여름 날씨! 가벼운 반팔에 선글라스, 모자로 자외선을 차단하세요. 물 자주 마시기!';
  }

  if (tmp >= 23) {
    return '🌤 초여름 날씨예요. 반팔에 얇은 카디건 하나 들고 다니면 실내 냉방 대비도 완벽해요!';
  }

  if (tmp >= 17) {
    if (reh >= 60) return '🌥 선선하고 습한 날이에요. 얇은 재킷에 반팔 레이어링이 딱 좋아요. 데님 재킷 추천!';
    return '🌸 가장 옷 입기 좋은 날씨예요! 얇은 재킷에 청바지 조합으로 가볍고 세련되게 입어보세요.';
  }

  if (tmp >= 9) {
    return '🍂 쌀쌀한 날씨예요. 두꺼운 재킷이나 가디건에 레이어링이 핵심! 니트+청바지 조합을 추천해요.';
  }

  if (tmp >= 4) {
    return '🧣 꽤 추운 날이에요. 코트에 두꺼운 니트, 목도리까지 챙기세요. 히트텍 레이어링도 잊지 마세요!';
  }

  return '🧊 매우 추운 날이에요! 패딩에 기모 이너, 장갑, 귀마개까지 완전 방한 채비를 하세요.';
}

export function getBgGradient(_sky: number, pty: number, tmp: number): string {
  if (pty >= 1) return 'from-slate-400 to-slate-600';
  if (tmp >= 28) return 'from-amber-400 to-orange-500';
  if (tmp >= 23) return 'from-sky-400 to-cyan-500';
  if (tmp >= 17) return 'from-sky-300 to-blue-400';
  if (tmp >= 9)  return 'from-blue-400 to-blue-600';
  if (tmp >= 4)  return 'from-indigo-400 to-indigo-600';
  return 'from-slate-500 to-indigo-700';
}
