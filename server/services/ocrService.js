const { createWorker } = require("tesseract.js");
const { parseBillText } = require("./billParser");

const extractBillData = async (imagePath) => {
    const worker = await createWorker("eng");

    try {
        const result = await worker.recognize(imagePath);

        const text = result.data.text;

        console.log("OCR extracted text:");
        console.log(text);

        const parsedData = parseBillText(text);
        console.log("OCR PARSED DATA:");
        console.log(parsedData);
        return {
            ...parsedData,
            rawText: text,
        };
    } finally {
        await worker.terminate();
    }
};

module.exports = {
    extractBillData,
};