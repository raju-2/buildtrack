/**
 * OCR Bill Scanning (Advanced Feature)
 *
 * Uses Tesseract.js to read text from an uploaded bill image and attempts to
 * extract a likely "total amount" using regex heuristics. Tesseract.js is an
 * optional dependency — if it's not installed, this endpoint returns a clear
 * error so the rest of the app keeps working.
 *
 * To enable: npm install tesseract.js
 *
 * @route POST /api/expenses/ocr  (multipart/form-data, field name: "bill")
 */
const path = require('path');

const extractAmountFromText = (text) => {
  // Look for currency-like patterns e.g. "Total: 4500", "₹4,500.00", "Amount Due 4500"
  const amountRegex = /(?:total|amount|grand total|net amount|payable)[^\d]{0,15}([\d,]+(?:\.\d{1,2})?)/i;
  const match = text.match(amountRegex);
  if (match) return parseFloat(match[1].replace(/,/g, ''));

  // Fallback: grab the largest number found in the text
  const numbers = (text.match(/[\d,]+(?:\.\d{1,2})?/g) || [])
    .map((n) => parseFloat(n.replace(/,/g, '')))
    .filter((n) => !Number.isNaN(n));

  return numbers.length ? Math.max(...numbers) : null;
};

const scanBill = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No bill image uploaded (field name: "bill")' });
    }

    let Tesseract;
    try {
      Tesseract = require('tesseract.js');
    } catch (e) {
      return res.status(501).json({
        success: false,
        message:
          'OCR is not enabled on this server. Run `npm install tesseract.js` in /server and restart to enable bill scanning.',
        billImage: `/uploads/${req.file.filename}`,
      });
    }

    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const result = await Tesseract.recognize(imagePath, 'eng');
    const extractedText = result.data.text;
    const extractedAmount = extractAmountFromText(extractedText);

    res.json({
      success: true,
      data: {
        billImage: `/uploads/${req.file.filename}`,
        extractedAmount,
        rawText: extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { scanBill };
