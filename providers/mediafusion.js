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

// Aapka configured MediaFusion Token Base URL (Bina catalog ke direct streams)
var MEDIAFUSION_CONFIGURED_BASE = "https://mediafusion.elfhosted.com/D-dmBinDMfreB4xdUgbBHrUlHUqfaThFgzPrh3L9bVPdCVqYm6VZTQZohNUm_x85gRZE1oHcGcqOglEaVkmxu70gZ0HE6gxvd6kUaWuG5D_TDB9yUBiBWrZPrceUtYut7pXE3RwgV5O8Dlo4j4EuKfc4npf8OSWchs--9cV_2o8kbLTipH3YLJi0ny9Qz9GVWfmIe--QqREqAmGvZV7So3s0TFsoY9xDRp19P0wSxKXnF4Htu2O46vH2L-t0bLQixwi027l04sj6Dl69ilVV2D49bXTYKCyOw43KsWVaT-TlM5BfmAScOKeolsqzewYW4fgoa-ad3XzamYVCHZN8oMv3f7tJjN6l3Uu38Us0tZ6XTLoWJ95pY68hrZLu9KK74E9wX-ov9RRG2rJJnZcTMfOJhsN5rSGSdkJYF1e12hmOshNLdpXVkAfQsiuJx7CXSGkH6XaqghKs7CrMDjl6Du-i9m0ZaXTKJhFkWpPWbCVW7xqguE4JGs4mKooxUrjsXLxzcbt-FT6Y75hJS3O8m4ZppRSzyywh6Ag1bWYCg4qJ7INH6tYTGU4v9FmR40BRa6x10TqifMH_tkAOHZegmUM8pnLJou4q-EzUks1KYpkq3MdXuh2OyQsoJqlentHD3KbcRGWvA4I-KHo7f4yb3Cdesn2OPOGkAZJybbW4KNJz5gsfMZpQWQnrg-6MvTR7s0tCHiG0e9zh0GyoGler3PmlBSI15wygnkXVirhR1bumzb1rLfXocyYni762eaU8fOv19dl3L8iIwXrizxeQRswzedL0ePNW6rTTeUNdYWkLR8VP9C2ZdpA3bpVjErf92ShwMmvLkMpSA8iW5thiJent7BQX9XkBK7FI72CgMR4lsO9qkzCdWRXv9WqLDfeTYxmDcSsKTqgu_xtMtVqTnEE2Fc2seuS4gdivPGCf3UvuKxvLkzKQ3XG9nNu7BMQUBl-DKZBEGfkpmFsnNi7RtEq83_-K8y1YrfM95N6DbFCcP7S_18MK0NnWw7LqksRjNYPBUbvLytlC_MxJrHyKjpgQ";
var TRACKER_LIST_URL = "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

// Hindi Audio filter logic (Regional dubs drop karke pure Hindi ko priority)
function isRealHindiAudio(rawStr) {
  if (!rawStr) return false;

  if (/(?:🇮🇳|\uD83C\uDDEE\uD83C\uDDF3)\s*(TA|ta|TE|te|ML|ml|KN|kn)/i.test(rawStr)) {
    return false;
  }

  const lower = rawStr.toLowerCase();
  if ((lower.includes("sub") || lower.includes("esub")) && !lower.includes("audio") && !lower.includes("dub") && !lower.includes("dual")) {
    if (lower.includes("hindi sub") || lower.includes("hin sub")) return false;
  }

  return (
    rawStr.includes("🇮🇳") ||
    /\uD83C\uDDEE\uD83C\uDDF3/.test(rawStr) ||
    lower.includes("hindi") ||
    lower.includes("dubbed") ||
    lower.includes("dual audio") ||
    lower.includes("hin-eng") ||
    lower.includes("eng-hin") ||
    /\b(hin)\b/i.test(lower)
  );
}

function extractSize(str) {
  if (!str) return "";
  const match = str.match(/(?:💾\s*|SIZE\s*)?([0-9]+(?:\.[0-9]+)?\s*(?:GB|MB|GiB|MiB))\b/i);
  return match ? match[1].trim() : "";
}

function extractQuality(str) {
  const u = (str || "").toLowerCase();
  if (u.includes("2160p") || u.includes("4k")) return "4K";
  if (u.includes("1080p")) return "1080p";
  if (u.includes("720p")) return "720p";
  if (u.includes("480p")) return "480p";
  return "Unknown";
}

function getQualityWeight(q) {
  if (q === "1080p") return 30;
  if (q === "720p") return 20;
  return 10;
}

function getTrackers() {
  return __async(this, null, function* () {
    try {
      const text = yield (yield fetch(TRACKER_LIST_URL, { skipSizeCheck: true })).text();
      return text.split("\n").filter((l, i) => i % 2 === 0 && l.trim()).slice(0, 10);
    } catch (e) {
      return [];
    }
  });
}

function buildMagnet(infoHash, trackers, sources) {
  if (!infoHash) return "";
  const sourceTrackers = (sources || []).filter((s) => s.startsWith("tracker:")).map((s) => s.replace("tracker:", "")).filter(Boolean);
  const allTrackers = [...sourceTrackers, ...trackers];
  const trStr = allTrackers.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${infoHash}${trStr}`;
}

function invokeMediaFusion(imdbId, season, episode) {
  return __async(this, null, function* () {
    try {
      const path = season != null 
        ? `series/${imdbId}:${season}:${episode}.json` 
        : `movie/${imdbId}.json`;

      const url = `${MEDIAFUSION_CONFIGURED_BASE}/stream/${path}`;
      const response = yield fetch(url, { headers: HEADERS, skipSizeCheck: true });
      if (!response.ok) return [];

      const res = yield response.json();
      if (!res || !res.streams || !Array.isArray(res.streams)) return [];

      const trackers = yield getTrackers();

      return res.streams.map((stream) => {
        const rawContent = [
          stream.name || "",
          stream.title || "",
          stream.description || "",
          JSON.stringify(stream.behaviorHints || {})
        ].join(" ");

        const quality = extractQuality(rawContent);
        const seeder = rawContent.match(/(?:👤|👥|seeders?:?\s*)(\d+)/i)?.[1] || "0";
        const isHindi = isRealHindiAudio(rawContent);
        const fileSize = extractSize(rawContent);
        const sizeTag = fileSize ? ` | 💾 ${fileSize}` : "";

        let linkUrl = "";
        if (stream.url) {
          linkUrl = stream.url;
        } else if (stream.infoHash) {
          linkUrl = buildMagnet(stream.infoHash, trackers, stream.sources || []);
        }

        const title = `${isHindi ? "🇮🇳 HINDI | " : ""}MediaFusion | ${quality}${sizeTag} | Seeders: ${seeder}`;

        return {
          url: linkUrl,
          quality,
          title,
          isHindi,
          seeders: parseInt(seeder, 10) || 0,
          subtitles: []
        };
      }).filter((s) => s.url);
    } catch (e) {
      console.error("[MediaFusion Stream Error]", e);
      return [];
    }
  });
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

function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      const imdbId = yield getImdbId(tmdbId, mediaType);
      if (!imdbId) return [];

      const isTV = mediaType === "tv";
      const s = isTV ? season : null;
      const e = isTV ? episode : null;

      const streams = yield invokeMediaFusion(imdbId, s, e);

      // Sorting: Hindi sabse top, uske andar 1080p/720p weightage, fir seeders
      streams.sort((a, b) => {
        if (a.isHindi !== b.isHindi) {
          return b.isHindi ? 1 : -1;
        }
        if (a.isHindi && b.isHindi) {
          const qDiff = getQualityWeight(b.quality) - getQualityWeight(a.quality);
          if (qDiff !== 0) return qDiff;
        }
        return (b.seeders || 0) - (a.seeders || 0);
      });

      return streams.slice(0, 40);
    } catch (e) {
      console.error("[MediaFusion Provider]", e);
      return [];
    }
  });
}

module.exports = { getStreams };
