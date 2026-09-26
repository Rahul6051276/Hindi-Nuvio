// Vidlink Embed Provider for Nuvio (Movies, TV Shows & Anime)

function getStreams(tmdbId, mediaType, season, episode) {
    try {
        var url = "";
        var titleLabel = "VidLink Web Player";

        if (mediaType === "movie") {
            url = "https://vidlink.pro/movie/" + tmdbId;
            titleLabel = "VidLink - Movie";
        } else if (mediaType === "tv") {
            if (!season || !episode) return [];
            url = "https://vidlink.pro/tv/" + tmdbId + "/" + season + "/" + episode;
            titleLabel = "VidLink - S" + season + "E" + episode;
        } else if (mediaType === "anime") {
            var malId = tmdbId;
            var epNum = episode || 1;
            var subOrDub = "sub";
            url = "https://vidlink.pro/anime/" + malId + "/" + epNum + "/" + subOrDub;
            titleLabel = "VidLink - Anime Ep " + epNum;
        } else {
            return [];
        }

        console.log("[Vidlink] Generated URL: " + url);

        return [{
            name: "🎬 VidLink",
            title: titleLabel,
            url: url,
            quality: "1080p",
            headers: {
                "Referer": "https://vidlink.pro"
            }
        }];
    } catch (err) {
        console.error("[Vidlink] Error: " + err.message);
        return [];
    }
}

module.exports = { getStreams: getStreams };
