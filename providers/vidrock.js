// Vidrock Embed Provider for Nuvio (Movies, TV Shows with TMDB/IMDb & JSON support)

function getStreams(tmdbId, mediaType, season, episode) {
    try {
        var url = "";
        var titleLabel = "Vidrock Web Player";

        if (mediaType === "movie") {
            // Supports TMDB ID (or IMDb ID if passed as string)
            url = "https://vidrock.net/movie/" + tmdbId;
            titleLabel = "Vidrock - Movie";
        } else if (mediaType === "tv") {
            if (!season || !episode) return [];
            url = "https://vidrock.net/tv/" + tmdbId + "/" + season + "/" + episode;
            titleLabel = "Vidrock - S" + season + "E" + episode;
        } else {
            return [];
        }

        console.log("[Vidrock] Generated URL: " + url);

        return [{
            name: "🎬 Vidrock",
            title: titleLabel,
            url: url,
            quality: "1080p",
            headers: {
                "Referer": "https://vidrock.net"
            }
        }];
    } catch (err) {
        console.error("[Vidrock] Error: " + err.message);
        return [];
    }
}

module.exports = { getStreams: getStreams };
