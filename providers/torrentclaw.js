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

// आपका कॉन्फ़िगर किया हुआ P2P Hindi EndPoint
var TORRENTCLAW_CONFIGURED_API = "https://addon.torrentclaw.com/api/stremio/eyJsYW5nIjoiaGkifQ";
var TRACKER_LIST_URL = "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

// स्मार्ट हिंदी और डब ऑडियो डिटेक्शन
function isRealHindiAudio(rawTitle) {
  if (!rawTitle) return false;
  const t = rawTitle.toLowerCase();

  // अगर सिर्फ सबटाइटल का ज़िक्र हो तो हटा दें
  if ((t.includes("sub") || t.includes("esub")) && !t.includes("audio") && !t.includes("dub") && !t.includes("dual")) {
    if (t.includes("hindi sub") || t.includes("hin sub") || t.includes("hi sub")) return false;
  }

  return (
    rawTitle.includes("⭐") ||         // TorrentClaw का पसंदीदा भाषा स्टार टैग
    t.includes("hindi") ||
    t.includes("dubbed") ||
    t.includes("dual") ||
    t.includes("multi") ||
    /\b(hin)\b/i.test(t) ||
    /\b(hi)\b/i.test(rawTitle) ||
    t.includes("south") ||
    t.includes("goldmines") ||
    t.includes("desiremovies") ||
    t.includes("katmovie") ||
    t.includes("vegamovies") ||
    t.includes("bolly")
  );
}

// फ़ाइल साइज़ निकालने का लॉजिक
function extractSize(str) {
  if (!str) return "";
  const match = str.match(/(?:💾\s*)?([0-9]+(?:\.[0-9]+)?\s*(?:GB|MB|GiB|MiB))\b/i);
  return match ? match[1].trim() : "";
}

// क्वालिटी निकालने का लॉजिक
function extractQuality(str) {
  const u = (str || "").toLowerCase();
  if (u.includes("2160p") || u.includes("4k"))
    return "4K";
  if (u.includes("1080p"))
    return "1080p";
  if (u.includes("720p"))
    return "720p";
  if (u.includes("480p"))
    return "480p";
  return "Unknown";
}

function getQualityWeight(q) {
  if (q === "1080p") return 30;
  if (q === "720p") return 20;
  return 10;
}

// ट्रैकर्स फ़ेचर
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

// मैग्नेट लिंक बिल्डर
function buildMagnet(infoHash, trackers, sources) {
  if (!infoHash)
    return "";
  const sourceTrackers = (sources || []).filter((s) => s.startsWith("tracker:")).map((s) => s.replace("tracker:", "")).filter(Boolean);
  const allTrackers = [...sourceTrackers, ...trackers];
  const trStr = allTrackers.map((t) => `&tr=${encodeURIComponent(t)}`).join("");
  return `magnet:?xt=urn:btih:${infoHash}${trStr}`;
}

// P2P फ़ेच फ़ंक्शन
function invokeTorrentClawP2P(imdbId, season, episode) {
  return __async(this, null, function* () {
    try {
      const path = season != null 
        ? `series/${imdbId}:${season}:${episode}.json` 
        : `movie/${imdbId}.json`;

      const url = `${TORRENTCLAW_CONFIGURED_API}/stream/${path}`;
        
      const response = yield fetch(url, { headers: HEADERS, skipSizeCheck: true });
      if (!response.ok) return [];
      
      const res = yield response.json();
      if (!res || !res.streams) return [];
      
      const trackers = yield getTrackers();
      
      return res.streams.map((stream) => {
        const fullTitle = `${stream.name || ""} ${stream.title || ""} ${stream.description || ""}`;
        const qualityMatch = fullTitle.match(/(2160p|1080p|720p|480p)/i);
        const quality = qualityMatch ? qualityMatch[1] : "Unknown";
        const seeder = fullTitle.match(/👤\s*(\d+)/)?.[1] || "0";
        const isHindi = isRealHindiAudio(fullTitle);
        const fileSize = extractSize(fullTitle);
        const sizeTag = fileSize ? ` | 💾 ${fileSize}` : "";
        
        let magnet = "";
        if (stream.url && stream.url.startsWith("magnet:")) {
          magnet = stream.url;
        } else if (stream.infoHash) {
          magnet = buildMagnet(stream.infoHash, trackers, stream.sources || []);
        }

        const title = `${isHindi ? "🇮🇳 HINDI | " : ""}TorrentClaw | ${quality}${sizeTag} | Seeders: ${seeder}`;
        
        return {
          url: magnet,
          quality: extractQuality(quality),
          title,
          isHindi,
          seeders: parseInt(seeder, 10) || 0,
          subtitles: []
        };
      }).filter((s) => s.url);
    } catch (e) {
      console.error("[TorrentClaw P2P Error]", e);
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
      
      const streams = yield invokeTorrentClawP2P(imdbId, s, e);
      
      // रैंकिंग:
      // 1. हिंदी / डब सबसे ऊपर
      // 2. उसमें 1080p फिर 720p
      // 3. फिर सबसे ज़्यादा सीडर्स
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
      
      return streams.slice(0, 25);
    } catch (e) {
      console.error("[TorrentClaw P2P Provider]", e);
      return [];
    }
  });
}

module.exports = { getStreams };
