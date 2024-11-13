const axios = require('axios');
const cheerio = require('cheerio');
const { getYoutubeVideoID, getThumbnailUrl, getVideoTitle } = require('./utils/general.util');

exports.scrapeBlog = async (url) => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('head > title').text() || $('h1').first().text();

        let content = '';
        const contentContainer = $('article, .content, .post, .entry-content, .blog-post');
        if (contentContainer.length > 0) {
            contentContainer.each((i, elem) => {
                content += $(elem).text();
            });
        } else {
            content = $('p').map((i, el) => $(el).text()).get().join('\n');
        }
        const imageContainer = $('img');

        const images = [];

        imageContainer.each((i, img) => {
            const src = $(img).attr('srcset');
            if (src && !images.includes(src)) {
                images.push(src);
            }
        });
        return {
            title,
            content,
            images,
        };
    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return null;
    }
}

exports.getYoutubeDetails = async (url) => {
    const videoId = getYoutubeVideoID(url);
    if (!videoId) {
        return {
            error: "Invalid YouTube URL"
        };
    }
    const thumbnailUrl = getThumbnailUrl(videoId);
    const title = await getVideoTitle(videoId, process.env.YOUTUBE_API_KEY);

    return {
        thumbnailUrl,
        title
    }
}