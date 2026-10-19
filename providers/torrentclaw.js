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
// Exact Stremio Addon Configured URL
var TORRENTCLAW_CONFIGURED_API = "https://addon.torrentclaw.com/api/stremio/eyJsYW5nIjoiaGkiLCJxdWFsaXR5IjoiNzIwcCIsIm1pblNlZWRlcnMiOjUsIm1heFF1YWxpdHkiOiIxMDgwcCIsIm1heFNlZWRlcnMiOjUwLCJtYXhTaXplR2IiOjV9";
var TRACKER_LIST_URL = "https://raw.githubusercontent.com/ngosang/trackerslist/master/trackers_best.txt";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

function isRealHindiAudio(rawStr) {
  if (!rawStr) return false;

  // Tamil (TA), Telugu (TE), Malayalam (ML), Kannada (KN) regional dubs ko drop karein
  if (/🇮🇳\s*(TA|ta|TE|te|ML|ml|KN|kn)/i.test(rawStr)) {
    return false;
  }

  const lower = rawStr.toLowerCase();
  // Pure subtitles ko reject karein
  if ((lower.includes("sub") || lower.includes("esub")) && !lower.includes("audio") && !lower.includes("dub") && !lower.includes("dual")) {
    if (lower.includes("hindi sub") || lower.includes("hin sub") || lower.includes("hi sub")) return false;
  }

  // TorrentClaw ka Indian Flag (🇮🇳) ya standard Hindi markers
  return (
    rawStr.includes("🇮🇳") ||
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
      if (!res || !res.streams || !Array.isArray(res.streams)) return [];
      
      const trackers = yield getTrackers();
      
      return res.streams.map((stream) => {
        const rawContent = [
          stream.name || "",
          stream.title || "",
          stream.description || "",
          JSON.stringify(stream.behaviorHints || {})
        ].join("\n");

        const quality = extractQuality(rawContent);
        const seeder = rawContent.match(/(?:👤|👥)\s*(\d+)/)?.[1] || "0";
        const isHindi = isRealHindiAudio(rawContent);
        const fileSize = extractSize(rawContent);
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
          quality,
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
      
      streams.sort((a, b) => {
        if (a.isHindi !== b.isHindi) {
          return b.isHindi ? 1 : -1;
        }
        return (b.seeders || 0) - (a.seeders || 0);
      });
      
      return streams.slice(0, 40);
    } catch (e) {
      console.error("[TorrentClaw P2P Provider]", e);
      return [];
    }
  });
}

module.exports = { getStreams };
