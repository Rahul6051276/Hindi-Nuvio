/*
 * VidLink Provider for Nuvio
 * Single-File Format compatible with Nuvio Engine
 */

function getVisualTitle(mediaType, season, episode) {
  if (mediaType === "tv" || mediaType === "series") {
    var s = season || 1;
    var e = episode || 1;
    return "📺 S" + s + "E" + e + " | VidLink Pro";
  }
  return "🎬 Movie | VidLink Pro";
}

function getStreams(tmdbId, mediaType, season, episode) {
  console.log("[VidLink] Fetching for ID: " + tmdbId + " type: " + mediaType);
  
  try {
    var url = "";
    if (mediaType === "tv" || mediaType === "series") {
      var s = season || 1;
      var e = episode || 1;
      url = "https://vidlink.pro/tv/" + tmdbId + "/" + s + "/" + e + "?autoPlay=true";
    } else {
      url = "https://vidlink.pro/movie/" + tmdbId + "?autoPlay=true";
    }

    var streamItem = {
      name: "VidLink",
      title: getVisualTitle(mediaType, season, episode),
      url: url,
      quality: "1080p",
      behaviorHints: {
        notWebReady: false
      }
    };

    return Promise.resolve([streamItem]);
  } catch (error) {
    console.error("[VidLink] Error:", error.message || error);
    return Promise.resolve([]);
  }
}

module.exports = { getStreams: getStreams };
