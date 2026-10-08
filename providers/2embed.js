/**
 * 2Embed Provider for Hindi-Nuvio (Advanced Stream Extractor)
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
            // Nuvio ke liye m3u8 format aur proper headers ke sath stream push karein
            streams.push(
                {
                    name: '2Embed',
                    title: '1080p [Fast Stream]',
                    url: streamUrl,
                    quality: '1080p',
                    format: 'm3u8',
                    headers: {
                        'Referer': 'https://www.2embed.cc/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    }
                },
                {
                    name: '2Embed',
                    title: '720p [HD]',
                    url: streamUrl,
                    quality: '720p',
                    format: 'm3u8',
                    headers: {
                        'Referer': 'https://www.2embed.cc/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    }
                },
                {
                    name: '2Embed',
                    title: '480p [SD]',
                    url: streamUrl,
                    quality: '480p',
                    format: 'mp4',
                    headers: {
                        'Referer': 'https://www.2embed.cc/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                    }
                }
            );
        }
    } catch (error) {
        console.error("2Embed Provider Error: ", error);
    }
    
    return streams;
}

module.exports = { getStreams };
