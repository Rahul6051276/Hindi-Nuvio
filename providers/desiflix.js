var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

var TMDB_API_KEY = "1865f43a0549ca50d341dd9ab8b29f49";
// DesiFlix Stream Endpoint (Bina Catalog ke seedha stream fetch karega)
var DESIFLIX_BASE_URL = "http://manifest.desitvhub.eu.org";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

function extractQuality(str) {
  const u = (str || "").toLowerCase();
  if (u.includes("2160p") || u.includes("4k")) return "4K";
  if (u.includes("1080p")) return "1080p";
  if (u.includes("720p")) return "720p";
  if (u.includes("480p") || u.includes("360p")) return "480p";
  return "Auto";
}

function getImdbId(tmdbId, mediaType) {
  return __async(this, null, function* () {
    try {
      const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
      const res = yield (yield fetch(url, { skipSizeCheck: true })).json();
      return res.external_ids?.imdb_id || res.imdb_id || null;
    } catch (e) {
      return null;
    }
  });
}

function invokeDesiFlix(imdbId, season, episode) {
  return __async(this, null, function* () {
    try {
      const isSeries = season != null;
      const type = isSeries ? "series" : "movie";
      const idParam = isSeries ? `${imdbId}:${season}:${episode}` : imdbId;

      const streamUrl = `${DESIFLIX_BASE_URL}/stream/${type}/${idParam}.json`;
      const response = yield fetch(streamUrl, { headers: HEADERS, skipSizeCheck: true });
      
      if (!response.ok) return [];
      const data = yield response.json();
      if (!data || !data.streams || !Array.isArray(data.streams)) return [];

      return data.streams.map((stream) => {
        const titleText = stream.title || stream.name || stream.description || "DesiFlix Server";
        const quality = extractQuality(titleText);
        
        // DesiFlix mostly direct HTTP/m3u8 ya external streaming links deta hai
        const directUrl = stream.url || "";
        if (!directUrl) return null;

        return {
          url: directUrl,
          quality: quality,
          title: `🇮🇳 DesiFlix | ${quality} | ${titleText.split("\n")[0]}`,
          headers: stream.behaviorHints?.proxyHeaders?.request || {},
          subtitles: []
        };
      }).filter(Boolean);
    } catch (e) {
      console.error("[DesiFlix Stream Error]", e);
      return [];
    }
  });
}

function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId) return [];

      const isTV = mediaType === "tv";
      const s = isTV ? season : null;
      const e = isTV ? episode : null;

      const streams = yield invokeDesiFlix(imdbId, s, e);
      return streams;
    } catch (e) {
      console.error("[DesiFlix Provider]", e);
      return [];
    }
  });
}

module.exports = { getStreams };
