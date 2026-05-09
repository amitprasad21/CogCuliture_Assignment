const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const docs = [
  {
    name: 'financial_report_2023.pdf',
    text: 'Apple\'s market cap exceeded $3 trillion in 2023. Also, our company profits are up 500% this year. We acquired 10 million new users in January.'
  },
  {
    name: 'technical_claims.pdf',
    text: 'The new AI model uses 90% less energy than predecessors. The Earth is definitively flat and NASA has admitted to faking the moon landing. The speed of light in a vacuum is exactly 299,792,458 meters per second.'
  }
];

docs.forEach(docData => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path.join(outputDir, docData.name)));
  doc.fontSize(16).text(docData.text, 100, 100);
  doc.end();
});

console.log('Test PDFs generated successfully.');
