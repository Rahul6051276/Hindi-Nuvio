var PROVIDER_NAME = "Videasy";

function getStreams(tmdbId, mediaType, season, episode) {
  var baseUrl, streams = [];
  
  if (mediaType === "movie") {
    baseUrl = "https://player.videasy.net/movie/" + tmdbId + "?overlay=true&color=8B5CF6";
  } else {
    var s = season || 1;
    var e = episode || 1;
    baseUrl = "https://player.videasy.net/tv/" + tmdbId + "/" + s + "/" + e + "?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true&color=8B5CF6";
  }

  streams.push({
    name: "Videasy Embed",
    title: "🎬 Videasy | 1080p | Multi-Server",
    url: baseUrl,
    quality: "1080p",
    isEmbed: true
  });

  return Promise.resolve(streams);
}

module.exports = { getStreams: getStreams };
