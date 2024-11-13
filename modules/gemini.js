const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

exports.summarizeBlog = async (data) => {
    const model = genAI.getGenerativeModel({ model: "gemini-pro", safetySettings: safetySettings });
    const prompt = `I have scrapped a blog data , help me to make this huge content short around 100 words , make sure that summarized data is easy to understand and the content I am giving is scrapped so that it maybe a scattered data so analyze doing your best, blog : ${data}`;

    try {
        let result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (e) {
        console.log("error", e.message);
        return 0;
    }
}