const extractDate = (text) => {
    const dateMatch = text.match(
        /(\d{1,2})\s*[\/\-]\s*(\d{1,2})\s*[\/\-]\s*(\d{2,4})/
    );

    if (!dateMatch) {
        return null;
    }

    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;

    let year = Number(dateMatch[3]);

    if (year < 100) {
        year += 2000;
    }

    const parsedDate = new Date(year, month, day);

    if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month ||
        parsedDate.getDate() !== day
    ) {
        return null;
    }

    return parsedDate;
};


const extractItems = (lines) => {
    const items = [];

    for (const line of lines) {
        const itemMatch = line.match(
            /^(.+?)\s+(\d+)\s+(\d+(?:\.\d{1,2})?)\s+(\d+(?:\.\d{1,2})?)$/
        );

        if (!itemMatch) {
            continue;
        }

        const name = itemMatch[1].trim();
        const quantity = Number(itemMatch[2]);
        const amount = Number(itemMatch[4]);

        if (
            /total|subtotal|sub total|tax|gst|cgst|sgst|igst|amount/i.test(
                name
            )
        ) {
            continue;
        }

        items.push({
            name,
            quantity,
            price: amount,
        });
    }

    return items;
};


const parseBillText = (text) => {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    let merchant = "";
    let total = 0;
    let tax = 0;
    let subtotal = 0;

    // Merchant
    if (lines.length > 0) {
        merchant = lines[0];
    }

    // Total
    for (const line of lines) {
        const totalMatch = line.match(
            /(?:^|\s)(?:total|grand total|amount payable|net amount)\s*[:\-]?\s*₹?\s*(\d+(?:\.\d{1,2})?)/i
        );

        if (totalMatch) {
            total = Number(totalMatch[1]);
            break;
        }
    }

    // Tax / GST
    for (const line of lines) {
        const taxMatch = line.match(
            /(?:gst|tax|cgst|sgst|igst)(?:\s*\([^)]*\))?\s*[:\-]?\s*₹?\s*(\d+(?:\.\d{1,2})?)/i
        );

        if (taxMatch) {
            tax = Number(taxMatch[1]);
            break;
        }
    }

    // Subtotal
    for (const line of lines) {
        const subtotalMatch = line.match(
            /(?:subtotal|sub total)\s*[:\-]?\s*₹?\s*(\d+(?:\.\d{1,2})?)/i
        );

        if (subtotalMatch) {
            subtotal = Number(subtotalMatch[1]);
            break;
        }
    }

    // Date
    const date = extractDate(text);

    // Items
    const extractedItems = extractItems(lines);

    return {
        merchant,
        date,
        subtotal,
        tax,
        total,
        extractedItems,
    };
};


module.exports = {
    parseBillText,
};