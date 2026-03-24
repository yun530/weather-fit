const QUERIES = {
  veryhot:  'summer fashion outfit women street style',
  warm:     'spring summer dress fashion outfit women',
  mild:     'spring autumn layering fashion outfit',
  cool:     'fall sweater knit fashion outfit women',
  cold:     'winter coat fashion outfit women street',
  verycold: 'heavy winter puffer coat fashion outfit',
  rain:     'rainy day fashion raincoat outfit',
  snow:     'snow winter fashion outfit women',
};

export default async function handler(req, res) {
  const { state = 'mild' } = req.query;
  const query = QUERIES[state] ?? QUERIES.mild;

  try {
    const page = Math.floor(Math.random() * 5) + 1;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&page=${page}&orientation=portrait&content_filter=high`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    });
    const data = await response.json();
    const photos = data.results ?? [];
    if (photos.length === 0) return res.status(404).json({ error: 'no photos' });

    const pick = photos[Math.floor(Math.random() * photos.length)];
    res.json({
      imageUrl: pick.urls.regular,
      thumbUrl: pick.urls.small,
      link: pick.links.html,
      author: pick.user.name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
