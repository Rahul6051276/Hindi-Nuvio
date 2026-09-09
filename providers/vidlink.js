var PROVIDER_NAME = "VidLink";

function getStreams(tmdbId, mediaType, season, episode) {
  var baseUrl, streams = [];
  
  if (mediaType === "movie") {
    baseUrl = "https://vidlink.pro/movie/" + tmdbId + "?autoPlay=true";
  } else {
    var s = season || 1;
    var e = episode || 1;
    baseUrl = "https://vidlink.pro/tv/" + tmdbId + "/" + s + "/" + e + "?autoPlay=true";
  }

  streams.push({
    name: "VidLink Pro",
    title: "🔗 VidLink | 1080p | Fast Stream",
    url: baseUrl,
    quality: "1080p",
    isEmbed: true
  });

  return Promise.resolve(streams);
}

module.exports = { getStreams: getStreams };

