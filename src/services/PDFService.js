// services/PDFService.js
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { Linking, Platform } from 'react-native';
import Share from 'react-native-share';
import { formatCurrentDateTime, formatDateOnly, formatNumberWithCommas } from '../components/utils/formatters';


export const PDFService = {
  // Generate HTML content for PDF
  generateHTMLContent: (reportData, startDate, endDate, selectedReportType) => {
    const { title, headers, data, rawData } = reportData;
    const totalAmount = rawData.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) * parseFloat(item.price)), 0
    );

    let tableRows = '';
    data.forEach(row => {
      tableRows += `
        <tr>
          ${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${cell}</td>`).join('')}
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #007bff;
              padding-bottom: 20px;
            }
            .company-info {
              text-align: right;
            }
            .report-info {
              margin-bottom: 20px;
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
            }
            th { 
              background-color: #007bff; 
              color: white; 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: left;
              font-weight: bold;
            }
            td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            tr:nth-child(even) { 
              background-color: #f2f2f2; 
            }
            .summary {
              margin-top: 30px;
              padding: 20px;
              background-color: #e9ecef;
              border-radius: 5px;
            }
            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #444;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }

            .footer-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              flex-wrap: wrap;
            }

            .footer-left {
              max-width: 60%;
            }

            .footer-right {
              text-align: right;
              max-width: 38%;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
          </div>

            <div class="report-info">
            <p><strong>Report Generated:</strong> ${formatCurrentDateTime()}</p>
            <p><strong>Period:</strong> ${startDate ? formatDateOnly(startDate) : 'All time'}${endDate ? ` to ${formatDateOnly(endDate)}` : ''}</p>
            <p><strong>Total Records:</strong> ${formatNumberWithCommas(data.length)}</p>
          </div>

          <table>
            <thead>
              <tr>
                ${headers.map(header => `<th>${header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="summary">
            <h3>Summary</h3>
            <p><strong>Total Records:</strong> ${data.length}</p>
            <p><strong>Total Amount:</strong> ${formatNumberWithCommas(totalAmount)} Birr</p>
            ${selectedReportType === 'credits' ? `<p><strong>Outstanding Credits:</strong> ${rawData.filter(item => item.status === 'Unpaid').length}</p>` : ''}
          </div>

          <div class="footer">
            <div class="footer-section">
              <div class="footer-left">
                <p>This report was generated automatically by inventory management system.</p>
                <p>Generated on ${formatCurrentDateTime()}</p>
              </div>
              <div class="footer-right">
                <h4 style="margin: 0;">APP Owner</h4>
                <h4 style="margin: 0;">IZZY SUZUKI SPAREPARTS</h4>
                <p style="margin: 2px 0;">LIDETA, Smart Plaza - 1st floor</p>
                <p style="margin: 2px 0;">Phone: +251-933-81-49-97 | +251-972-72-72-87</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  },

  // Generate PDF from report data
  generatePDF: async (reportData, startDate, endDate, selectedReportType) => {
  try {
    if (reportData.data.length === 0) {
      throw new Error('No data available for the selected report type and date range.');
    }

    const htmlContent = PDFService.generateHTMLContent(reportData, startDate, endDate, selectedReportType);
    const timestamp = new Date().getTime();
    const fileName = `report_${selectedReportType}_${timestamp}`;

    const options = {
      html: htmlContent,
      fileName: fileName,
      directory: 'Documents', // This might not work as expected
      base64: false,
      width: 612,
      height: 792,
      padding: 40,
    };

    console.log('PDF generation options:', options);
    const pdf = await RNHTMLtoPDF.convert(options);
    console.log('PDF generated at:', pdf.filePath);
    
    // Check if file exists at the returned path
    const fileExists = await RNFS.exists(pdf.filePath);
    console.log('File exists at returned path:', fileExists);
    
    // If the file was created but not in our expected directory, copy it
    if (fileExists && !pdf.filePath.includes(RNFS.DocumentDirectoryPath)) {
      const newPath = `${RNFS.DocumentDirectoryPath}/${fileName}.pdf`;
      await RNFS.copyFile(pdf.filePath, newPath);
      console.log('File copied to:', newPath);
      
      // Update the PDF object to reflect the new location
      pdf.filePath = newPath;
    }
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
},

  // Load saved PDFs from documents directory
  loadSavedPDFs: async () => {
  try {
    const documentsPath = RNFS.DocumentDirectoryPath;
    console.log('Documents path:', documentsPath);
    
    // Check if documents directory exists, if not create it
    const dirExists = await RNFS.exists(documentsPath);
    if (!dirExists) {
      await RNFS.mkdir(documentsPath);
    }
    const files = await RNFS.readDir(documentsPath);
    console.log('All files in documents:', files.map(f => f.name));
    
    const pdfFiles = files.filter(file => 
      file.name.endsWith('.pdf') && file.name.startsWith('report_')
    );
    
    console.log('Filtered PDF files:', pdfFiles.map(f => f.name));
    
    // Also check other common directories where PDFs might be saved
    const possiblePaths = [
      RNFS.DownloadDirectoryPath,
      RNFS.ExternalStorageDirectoryPath,
      RNFS.CachesDirectoryPath
    ];
    
    for (const path of possiblePaths) {
      try {
        if (path && await RNFS.exists(path)) {
          const pathFiles = await RNFS.readDir(path);
          const pathPDFs = pathFiles.filter(file => 
            file.name.endsWith('.pdf') && file.name.startsWith('report_')
          );
          console.log(`PDFs found in ${path}:`, pathPDFs.map(f => f.name));
          
          // Copy any PDFs found in other locations to Documents
          for (const pdfFile of pathPDFs) {
            const newPath = `${documentsPath}/${pdfFile.name}`;
            const exists = await RNFS.exists(newPath);
            if (!exists) {
              await RNFS.copyFile(pdfFile.path, newPath);
              console.log(`Copied ${pdfFile.name} to Documents`);
            }
          }
        }
      } catch (error) {
        console.log(`Could not check path ${path}:`, error.message);
      }
    }
    
    // Re-read the documents directory after potential copies
    const finalFiles = await RNFS.readDir(documentsPath);
    const finalPDFs = finalFiles.filter(file => 
      file.name.endsWith('.pdf') && file.name.startsWith('report_')
    );
    
    // Sort by modification time (newest first)
    finalPDFs.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
    
    return finalPDFs;
  } catch (error) {
    console.error('Error loading saved PDFs:', error);
    return [];
  }
},

 // Share PDF using system share dialog
sharePDF: async (filePath, fileName) => {
  try {
    // Ensure file exists
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('PDF file not found');
    }

    const shareOptions = {
      title: 'Share Report',
      message: 'Please find the attached report',
      url: `file://${filePath}`,
      type: 'application/pdf',
      filename: fileName,
    };

    await Share.open(shareOptions);
  } catch (error) {
    console.error('Error sharing PDF:', error);
    if (error.message !== 'User did not share') {
      throw new Error('Failed to share PDF: ' + error.message);
    }
  }
},

// Share via WhatsApp
shareViaWhatsApp: async (filePath) => {
  try {
    // Ensure file exists
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('PDF file not found');
    }

    const fileName = filePath.split('/').pop();
    
    // Use direct file sharing instead of deep linking
    const fileUri = Platform.OS === 'android' 
      ? `file://${filePath}` 
      : filePath;

    const shareOptions = {
      title: 'Share Report via WhatsApp',
      message: 'Please find the attached report',
      url: fileUri,
      type: 'application/pdf',
      social: Share.Social.WHATSAPP,
    };

    try {
      await Share.shareSingle(shareOptions);
    } catch (whatsappError) {
      // If WhatsApp-specific sharing fails, use general share
      console.log('WhatsApp specific sharing failed, using general share');
      await PDFService.sharePDF(filePath, fileName);
    }
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    // Fallback to regular share
    await PDFService.sharePDF(filePath, fileName);
  }
},

// Share via Telegram
shareViaTelegram: async (filePath) => {
  try {
    // Ensure file exists
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('PDF file not found');
    }

    const fileName = filePath.split('/').pop();
    
    // Use direct file sharing instead of deep linking
    const fileUri = Platform.OS === 'android' 
      ? `file://${filePath}` 
      : filePath;

    const shareOptions = {
      title: 'Share Report via Telegram',
      message: 'Please find the attached report',
      url: fileUri,
      type: 'application/pdf',
      social: Share.Social.TELEGRAM,
    };

    try {
      await Share.shareSingle(shareOptions);
    } catch (telegramError) {
      // If Telegram-specific sharing fails, use general share
      console.log('Telegram specific sharing failed, using general share');
      await PDFService.sharePDF(filePath, fileName);
    }
  } catch (error) {
    console.error('Error sharing via Telegram:', error);
    // Fallback to regular share
    await PDFService.sharePDF(filePath, fileName);
  }
},

  // Delete PDF file
  deletePDF: async (filePath) => {
    try {
      await RNFS.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting PDF:', error);
      throw new Error('Failed to delete PDF');
    }
  },

  // Filter data by date range
  filterDataByDate: (data, startDate, endDate) => {
    if (!startDate && !endDate) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date();
      
      return itemDate >= start && itemDate <= end;
    });
  },

  // Format report data based on type
  formatReportData: (selectedReportType, salesData, purchasesData, creditsData, startDate, endDate) => {
    let data = [];
    let headers = [];
    
    switch (selectedReportType) {
      case 'sales':
        data = PDFService.filterDataByDate(salesData, startDate, endDate);
        headers = ['Date', 'Item', 'Part Number', 'Quantity', 'Price', 'Total', 'Customer', 'Status'];
        return {
          data: data.map(sale => [
            formatDateOnly(sale.date),
            sale.name,
            sale.partNumber,
            sale.quantity,
            `${formatNumberWithCommas(sale.price)} Birr`,
            `${formatNumberWithCommas(sale.quantity * sale.price)} Birr`,
            sale.customer || 'N/A',
            sale.status || 'Completed'
          ]),
          headers,
          rawData: data,
          title: 'Sales Report'
        };
        
      case 'purchases':
        data = PDFService.filterDataByDate(purchasesData, startDate, endDate);
        headers = ['Date', 'Item', 'Part Number', 'Quantity', 'Price', 'Total', 'Source'];
        return {
          data: data.map(purchase => [
            formatDateOnly(purchase.date),
            purchase.name,
            purchase.partNumber,
            purchase.quantity,
            `${formatNumberWithCommas(purchase.price)} Birr`,
            `${formatNumberWithCommas(purchase.quantity * purchase.price)} Birr`,
            purchase.source || 'N/A'
          ]),
          headers,
          rawData: data,
          title: 'Purchases Report'
        };
        
      case 'credits':
        data = PDFService.filterDataByDate(creditsData, startDate, endDate);
        headers = ['Date', 'Item', 'Part Number', 'Quantity', 'Price', 'Total', 'Customer', 'Status'];
        return {
          data: data.map(credit => [
            formatDateOnly(credit.date),
            credit.name,
            credit.partNumber,
            credit.quantity,
            `${formatNumberWithCommas(credit.price)} Birr`,
            `${formatNumberWithCommas(credit.quantity * credit.price)} Birr`,
            credit.customer || 'N/A',
            credit.status || 'Unpaid'
          ]),
          headers,
          rawData: data,
          title: 'Credit Sales Report'
        };
        
      default:
        return { data: [], headers: [], rawData: [], title: '' };
    }
  }
};

export default PDFService;