const QUERIES = {
  veryhot:  'korean summer fashion outfit street style',
  warm:     'korean spring summer fashion outfit',
  mild:     'korean spring autumn fashion layering outfit',
  cool:     'korean fall fashion knit sweater outfit',
  cold:     'korean winter fashion coat outfit street',
  verycold:'korean winter puffer coat fashion outfit',
  rain:     'korean rainy day fashion raincoat outfit',
  snow:     'korean snow day winter fashion outfit',
};

export default async function handler(req, res) {
  const { state = 'mild' } = req.query;
  const query = QUERIES[state] ?? QUERIES.mild;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&page=1&orientation=portrait&content_filter=high`;
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
