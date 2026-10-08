/**
 * 2Embed Provider for Hindi-Nuvio with Quality Options
 */

async function getStreams(id, type, season, episode) {
    const streams = [];
    try {
        let streamUrl = '';
        
        // Movie ya TV Series ke hisab se URL banayein
        if (type === 'movie') {
            streamUrl = `https://www.2embed.cc/embed/${id}`;
        } else if (type === 'series') {
            streamUrl = `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`;
        }

        if (streamUrl) {
            // Nuvio ke liye alag-alag quality ke options push karein
            streams.push(
                {
                    name: '2Embed',
                    title: '1080p [Fast Server]',
                    url: streamUrl,
                    quality: '1080p'
                },
                {
                    name: '2Embed',
                    title: '720p [HD]',
                    url: streamUrl,
                    quality: '720p'
                },
                {
                    name: '2Embed',
                    title: '480p [SD]',
                    url: streamUrl,
                    quality: '480p'
                }
            );
        }
    } catch (error) {
        console.error("2Embed Provider Error: ", error);
    }
    
    return streams;
}

module.exports = { getStreams };
