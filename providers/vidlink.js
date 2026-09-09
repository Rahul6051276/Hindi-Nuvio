/*
 * VidLink Provider for Nuvio
 * Professional Standard Format
 */

var PROVIDER = "VidLink";
var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function log(msg) {
  console.log("[" + PROVIDER + "] " + msg);
}

function getStreams(tmdbId, mediaType, season, episode) {
  return new Promise((resolve) => {
    try {
      log("request: id=" + tmdbId + " type=" + mediaType + " s=" + season + " e=" + episode);
      var streams = [];
      var isTv = mediaType === "tv" || mediaType === "series";
      var url = "";
      var titleLabel = "";

      if (isTv) {
        var s = season || 1;
        var e = episode || 1;
        url = "https://vidlink.pro/tv/" + tmdbId + "/" + s + "/" + e + "?autoPlay=true";
        titleLabel = "S" + s + "E" + e + " | VidLink Pro";
      } else {
        url = "https://vidlink.pro/movie/" + tmdbId + "?autoPlay=true";
        titleLabel = "Movie | VidLink Pro";
      }

      streams.push({
        name: "VidLink | 1080p",
        title: titleLabel,
        url: url,
        quality: "1080p",
        behaviorHints: {
          notWebReady: true,
          proxyHeaders: {
            request: {
              "User-Agent": UA,
              "Referer": "https://vidlink.pro/"
            }
          }
        }
      });

      log("returning " + streams.length + " streams");
      resolve(streams);
    } catch (e) {
      log("fatal: " + (e.message || e));
      resolve([]);
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { getStreams };
} else {
  global.getStreams = getStreams;
}
