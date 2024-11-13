const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { scrapeBlog, getYoutubeDetails } = require('./index.js');
const { isValidImageUrl } = require('./utils/general.util.js');
const { summarizeBlog } = require('./modules/gemini.js');


const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/extract (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    try {
        const url = match[1];

        // bot.sendMessage(chatId, 'extracting data, please wait...');

        const data = await getYoutubeDetails(url);

        if (data) {
            const { title, thumbnailUrl } = data;

            let response = `*Title:* ${title}`;
            await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

            const isValid = await isValidImageUrl(thumbnailUrl);
            if (isValid) {
                await bot.sendPhoto(chatId, thumbnailUrl);
            }
        } else {
            bot.sendMessage(chatId, 'Failed to extract the Youtube URL. Please check the URL and try again.');
        }
    } catch (e) {
        console.log(e);
        bot.sendMessage(chatId, 'Failed to extract the Youtube URL. Please check the URL and try again.');
    }
});
bot.onText(/\/scrape (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    try {
        const url = match[1];

        bot.sendMessage(chatId, 'Scraping data, please wait...');

        const blogData = await scrapeBlog(url);

        if (blogData) {
            const { title, content, images } = blogData;

            let response = `*Title:* ${title}`;
            await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

            let summarizedBlog = await summarizeBlog(content);
            summarizedBlog = summarizedBlog.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '');
            summarizedBlog = `*Content:* ${summarizedBlog}`
            await bot.sendMessage(chatId, summarizedBlog, { parse_mode: 'Markdown' });

            if (images.length > 0) {
                for (const imageUrl of images) {
                    const isValid = await isValidImageUrl(imageUrl);
                    if (isValid) {
                        await bot.sendPhoto(chatId, imageUrl);
                    } else {
                        console.log(`Invalid image URL skipped: ${imageUrl}`);
                    }
                }
            } else {
                await bot.sendMessage(chatId, 'No images found.');
            }
        } else {
            bot.sendMessage(chatId, 'Failed to scrape the URL. Please check the URL and try again.');
        }
    } catch (e) {
        console.log(e);
        bot.sendMessage(chatId, 'Failed to scrape the URL. Please check the URL and try again.');
    }
});
