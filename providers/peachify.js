var PROVIDER_NAME = "Peachify";

function getStreams(tmdbId, mediaType, season, episode) {
  var baseUrl, streams = [];
  
  if (mediaType === "movie") {
    baseUrl = "https://peachify.top/embed/movie/" + tmdbId + "?sub=English";
  } else {
    var s = season || 1;
    var e = episode || 1;
    baseUrl = "https://peachify.top/embed/tv/" + tmdbId + "/" + s + "/" + e + "?sub=English&autoNext=30";
  }

  streams.push({
    name: "Peachify",
    title: "🍑 Peachify | HD | Multi-Server",
    url: baseUrl,
    quality: "1080p",
    isEmbed: true
  });

  return Promise.resolve(streams);
}

module.exports = { getStreams: getStreams };
