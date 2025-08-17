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
  
  // Calculate total amount based on report type
  let totalAmount = 0;
  if (selectedReportType === 'sales') {
    totalAmount = rawData.reduce((sum, item) => 
      sum + ((item.cartonQuantity || 0) * (item.pricePerCarton || 0)), 0
    );
  } else if (selectedReportType === 'purchases') {
    totalAmount = rawData.reduce((sum, item) => 
      sum + ((item.cartonQuantity || 0) * (item.purchasePricePerCarton || 0)), 0
    );
  } else if (selectedReportType === 'credits') {
    totalAmount = rawData.reduce((sum, item) => 
      sum + ((item.cartonQuantity || 0) * (item.pricePerCarton || 0)), 0
    );
  } else if (selectedReportType === 'inventory') {
    totalAmount = rawData.reduce((sum, item) => 
      sum + ((item.cartonQuantity || 0) * (item.purchasePricePerCarton || 0)), 0
    );
  }

   let tableRows = '';
  data.forEach(row => {
    tableRows += `
      <tr>
        ${row.map(cell => `<td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${cell}</td>`).join('')}
      </tr>
    `;
  });

   const summarySection = `
    <div class="summary">
      <h3>Summary</h3>
      <p><strong>Total Records:</strong> ${data.length}</p>
      <p><strong>Total Amount:</strong> ${formatNumberWithCommas(totalAmount)} Birr</p>
      ${selectedReportType === 'credits' ? `<p><strong>Outstanding Credits:</strong> ${rawData.filter(item => (item.paymentStatus || 'Unpaid') === 'Unpaid').length}</p>` : ''}
      ${selectedReportType === 'inventory' ? `<p><strong>Low Stock Items:</strong> ${rawData.filter(item => item.minStockAlert && (item.cartonQuantity || 0) <= (item.minStockAlert || 0)).length}</p>` : ''}
    </div>
  `;

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

        ${summarySection}

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
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('PDF file not found');
    }

    const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    
    try {
      // Copy to cache directory for better accessibility
      await RNFS.copyFile(filePath, cachePath);
      
      const shareOptions = {
        title: 'Share Report',
        message: 'Please find the attached report',
        url: `file://${cachePath}`,
        type: 'application/pdf',
        filename: fileName || 'report.pdf',
        subject: 'Report Document', // Add subject for better compatibility
      };

      const result = await Share.open(shareOptions);
      console.log('Share result:', result);
      
      // Clean up after share
      setTimeout(async () => {
        try {
          await RNFS.unlink(cachePath);
        } catch (cleanupError) {
          console.log('Cache cleanup error:', cleanupError.message);
        }
      }, 10000);
      
    } catch (fileShareError) {
      // Check if it's a user cancellation (not an actual error)
      if (fileShareError.message && 
          (fileShareError.message.includes('User did not share') || 
           fileShareError.message.includes('cancelled') ||
           fileShareError.message.includes('CANCELLED'))) {
        console.log('User cancelled sharing');
        return; // Don't treat as error
      }
      
      console.log('File sharing failed, trying base64:', fileShareError.message);
      
      // Fallback to base64
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const shareOptions = {
        title: 'Share Report',
        message: 'Please find the attached report',
        url: `data:application/pdf;base64,${base64Data}`,
        type: 'application/pdf',
        filename: fileName || 'report.pdf',
        subject: 'Report Document',
      };

      const result = await Share.open(shareOptions);
      console.log('Base64 share result:', result);
    }
    
  } catch (error) {
    console.error('Error sharing PDF:', error);
    
    // Don't throw error for user cancellations
    if (error.message && 
        (error.message.includes('User did not share') || 
         error.message.includes('cancelled') ||
         error.message.includes('CANCELLED') ||
         error.message.includes('getScheme'))) {
      console.log('Share operation cancelled or completed');
      return;
    }
    
    throw new Error('Failed to share PDF: ' + error.message);
  }
},

// Share via WhatsApp
shareViaWhatsApp: async (filePath) => {
  try {
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('PDF file not found');
    }

    const fileName = filePath.split('/').pop();
    const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    
    try {
      // Copy to cache directory
      await RNFS.copyFile(filePath, cachePath);
      
      const shareOptions = {
        message: 'Please find the attached report',
        url: `file://${cachePath}`,
        type: 'application/pdf',
        filename: fileName,
        social: Share.Social.WHATSAPP,
      };

      await Share.shareSingle(shareOptions);
      
      // Clean up after share
      setTimeout(async () => {
        try {
          await RNFS.unlink(cachePath);
        } catch (cleanupError) {
          console.log('Cache cleanup error:', cleanupError.message);
        }
      }, 10000);
      
    } catch (whatsappError) {
      console.log('WhatsApp file sharing failed, trying base64:', whatsappError.message);
      
      // Fallback to base64
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const shareOptions = {
        message: 'Please find the attached report',
        url: `data:application/pdf;base64,${base64Data}`,
        type: 'application/pdf',
        filename: fileName,
        social: Share.Social.WHATSAPP,
      };

      await Share.shareSingle(shareOptions);
    }
    
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    // Final fallback to general share
    await PDFService.sharePDF(filePath, filePath.split('/').pop());
  }
},

// Share via Telegram
shareViaTelegram: async (filePath) => {
  try {
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      throw new Error('PDF file not found');
    }

    const fileName = filePath.split('/').pop();
    
    // Use app's cache directory instead of public Downloads (no permissions needed)
    const cachePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
    
    try {
      // Copy to cache directory
      await RNFS.copyFile(filePath, cachePath);
      
      const shareOptions = {
        message: 'Please find the attached report',
        url: `file://${cachePath}`,
        type: 'application/pdf',
        filename: fileName,
        social: Share.Social.TELEGRAM,
      };

      await Share.shareSingle(shareOptions);
      
      // Clean up after successful share
      setTimeout(async () => {
        try {
          await RNFS.unlink(cachePath);
        } catch (cleanupError) {
          console.log('Cache cleanup error:', cleanupError.message);
        }
      }, 10000);
      
    } catch (telegramError) {
      console.log('Telegram file sharing failed, trying base64:', telegramError.message);
      
      // Fallback to base64 approach
      const base64Data = await RNFS.readFile(filePath, 'base64');
      const shareOptions = {
        message: 'Please find the attached report',
        url: `data:application/pdf;base64,${base64Data}`,
        type: 'application/pdf',
        filename: fileName,
        social: Share.Social.TELEGRAM,
      };
      
      await Share.shareSingle(shareOptions);
    }
    
  } catch (error) {
    console.error('Error sharing via Telegram:', error);
    // Final fallback to general share
    await PDFService.sharePDF(filePath, filePath.split('/').pop());
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
  // Format report data based on type - Updated for new data structure
formatReportData: (selectedReportType, salesData, purchasesData, creditsData, inventoryData, startDate, endDate) => {
  let data = [];
  let headers = [];
  let rawData = [];
  
  switch (selectedReportType) {
    case 'sales':
      rawData = PDFService.filterDataByDate(salesData.map(sale => ({
        ...sale,
        date: sale.saleDate // Map saleDate to date for filtering
      })), startDate, endDate);
      headers = ['Date', 'Item', 'Quantity', 'Price/Carton', 'Total', 'Customer', 'Status'];
      return {
        data: rawData.map(sale => [
          formatDateOnly(sale.saleDate || sale.date),
          sale.itemName || 'N/A',
          `${sale.cartonQuantity || 0} cartons`,
          `${formatNumberWithCommas(sale.pricePerCarton || 0)} Birr`,
          `${formatNumberWithCommas((sale.cartonQuantity || 0) * (sale.pricePerCarton || 0))} Birr`,
          sale.customerName || sale.customer || 'N/A',
          sale.paymentStatus || 'Completed'
        ]),
        headers,
        rawData,
        title: 'Sales Report'
      };
      
    case 'purchases':
      rawData = PDFService.filterDataByDate(purchasesData.map(purchase => ({
        ...purchase,
        date: purchase.purchaseDate // Map purchaseDate to date for filtering
      })), startDate, endDate);
      headers = ['Date', 'Item', 'Quantity', 'Purchase Price', 'Total', 'Supplier'];
      return {
        data: rawData.map(purchase => [
          formatDateOnly(purchase.purchaseDate || purchase.date),
          purchase.itemName || 'N/A',
          `${purchase.cartonQuantity || 0} cartons`,
          `${formatNumberWithCommas(purchase.purchasePricePerCarton || 0)} Birr`,
          `${formatNumberWithCommas((purchase.cartonQuantity || 0) * (purchase.purchasePricePerCarton || 0))} Birr`,
          purchase.supplierName || purchase.supplier || 'N/A'
        ]),
        headers,
        rawData,
        title: 'Purchases Report'
      };
      
    case 'credits':
      rawData = PDFService.filterDataByDate(creditsData.map(credit => ({
        ...credit,
        date: credit.creditDate // Map creditDate to date for filtering
      })), startDate, endDate);
      headers = ['Date', 'Item', 'Quantity', 'Price/Carton', 'Total', 'Customer', 'Status'];
      return {
        data: rawData.map(credit => [
          formatDateOnly(credit.creditDate || credit.date),
          credit.itemName || 'N/A',
          `${credit.cartonQuantity || 0} cartons`,
          `${formatNumberWithCommas(credit.pricePerCarton || 0)} Birr`,
          `${formatNumberWithCommas((credit.cartonQuantity || 0) * (credit.pricePerCarton || 0))} Birr`,
          credit.customerName || credit.customer || 'N/A',
          credit.paymentStatus || 'Unpaid'
        ]),
        headers,
        rawData,
        title: 'Credit Sales Report'
      };

    case 'inventory':
      headers = ['Item', 'Stock', 'Purchase Price', 'Sell Price', 'Total Value', 'Source'];
      return {
        data: inventoryData.map(item => [
          item.itemName || 'N/A',
          `${item.cartonQuantity || 0} cartons (${item.totalQuantity || 0} pieces)`,
          `${formatNumberWithCommas(item.purchasePricePerCarton || 0)} Birr`,
          `${formatNumberWithCommas(item.pricePerCarton || 0)} Birr`,
          `${formatNumberWithCommas((item.cartonQuantity || 0) * (item.purchasePricePerCarton || 0))} Birr`,
          item.source || 'N/A'
        ]),
        headers,
        rawData: inventoryData,
        title: 'Inventory Report'
      };
      
    default:
      return { data: [], headers: [], rawData: [], title: '' };
  }
}
};

export default PDFService;