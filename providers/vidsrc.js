// providers/vidsrc.js

function getStreams(tmdbId, mediaType, season, episode) {
  console.log(`[Vidsrc] Fetching ${mediaType} ID: ${tmdbId}`);
  
  let streamUrl = "";

  // मूवी और टीवी शो के लिए Vidsrc का सही URL पाथ बनाना
  if (mediaType === 'movie') {
    streamUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;
  } else if (mediaType === 'tv') {
    streamUrl = `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  if (!streamUrl) {
    return Promise.resolve([]);
  }

  // रिजल्ट रिटर्न करना
  return Promise.resolve([
    {
      name: "Vidsrc Pro",
      title: mediaType === 'movie' ? "Vidsrc 1080p [Movie]" : `Vidsrc 1080p [S${season} E${episode}]`,
      url: streamUrl,
      quality: "1080p",
      headers: {
        "Referer": "https://vidsrc.to/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    }
  ]);
}

module.exports = { getStreams };
