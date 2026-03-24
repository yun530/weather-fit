const CATEGORY_MAP = {
  '반팔 티셔츠': '001', '긴팔 셔츠': '001', '니트': '001', '터틀넥': '001', '가디건': '001',
  '반바지': '003', '청바지': '003', '얇은 긴바지': '003', '두꺼운 바지': '003', '기모 바지': '003',
  '얇은 재킷': '002', '두꺼운 재킷': '002', '코트': '002', '패딩': '002',
  '방풍 재킷': '002', '방수 재킷': '002',
  '스니커즈': '005', '운동화': '005', '샌들': '005', '방한 부츠': '005', '방수 부츠': '005',
  '목도리': '011', '장갑': '011', '두꺼운 장갑': '011', '우산': null,
};

export default async function handler(req, res) {
  const { item } = req.query;
  const categoryCode = CATEGORY_MAP[item];

  const searchFallback = `https://www.musinsa.com/search/musinsa/goods?q=${encodeURIComponent(item)}&sortCode=BEST_SELLING`;

  if (!categoryCode) {
    return res.json({ url: searchFallback });
  }

  try {
    const rankingUrl = `https://www.musinsa.com/ranking/best.json?categoryCode=${categoryCode}&period=daily&listType=list&page=1`;
    const response = await fetch(rankingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.musinsa.com/ranking/best',
        'Accept': 'application/json, text/plain, */*',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const products = data?.data?.list ?? data?.list ?? [];
      if (products.length > 0) {
        const pool = products.slice(0, 30);
        const pick = pool[Math.floor(Math.random() * pool.length)];
        const goodsNo = pick.goodsNo ?? pick.goods_no ?? pick.id;
        if (goodsNo) {
          return res.json({ url: `https://www.musinsa.com/products/${goodsNo}` });
        }
      }
    }
  } catch (_) { /* ignore */ }

  // fallback: 랭킹 페이지로 이동
  res.json({ url: `https://www.musinsa.com/ranking/best?categoryCode=${categoryCode}&period=daily` });
}
