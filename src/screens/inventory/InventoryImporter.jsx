import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import DataService from '../../services/DataService';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import TutorialModal from '../../components/TutorialModal';
import FilePicker from 'react-native-file-picker';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import styles from '../../styles/InventoryScreenStyles';

const InventoryImporter = ({ onImportSuccess, customConfirm }) => {
  const [excelFile, setExcelFile] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  const validateExcelFile = (file) => {
    if (!file || !file.name) {
      customConfirm('Invalid file selected.', () => {}, null);
      return false;
    }
    
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      customConfirm('Invalid file type. Please upload an Excel file (.xlsx or .xls).', () => {}, null);
      return false;
    }
    
    // Check file size (10MB limit)
    if (file.size && file.size > 10 * 1024 * 1024) {
      customConfirm('File too large. Please select a file smaller than 10MB.', () => {}, null);
      return false;
    }
    
    return true;
  };

  const handleFilePick = async () => {
    setShowTutorial(true);
  };

  const handleFileSelection = async () => {
    try {
      FilePicker.showFilePicker({
        title: 'Select Excel File',
        chooseFromLibraryButtonTitle: 'Choose from Files',
        mediaType: 'mixed',
        allowsEditing: false,
      }, (response) => {
        if (response.didCancel) {
          console.log('User cancelled file selection');
        } else if (response.error) {
          console.error('FilePicker Error:', response.error);
          customConfirm('Failed to select file from device storage', () => {}, null);
        } else {
          const file = {
            name: response.fileName,
            uri: response.uri,
            size: response.fileSize,
            type: response.type
          };
          
          if (validateExcelFile(file)) {
            setExcelFile(file);
            setFileSelected(true);
            customConfirm(
              `File Selected Successfully!\n\nFile: ${file.name}\nSize: ${file.size ? (file.size / 1024).toFixed(2) + ' KB' : 'Unknown'}\n\nYou can now click the Import button to process your data.`,
              () => {},
              null
            );
          }
        }
      });
    } catch (err) {
      console.log('FilePicker error:', err);
      customConfirm('Failed to select file from device storage', () => {}, null);
    }
  };

  const proceedWithFileSelection = () => {
    setShowTutorial(false);
    setTimeout(() => {
      handleFileSelection();
    }, 300);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const confirmImport = () => {
    if (!excelFile) {
      customConfirm('Please select an Excel file first', () => {}, null);
      return;
    }

    customConfirm(
      `Are you sure you want to import data from "${excelFile.name}"?\n\nThis will add new items to your inventory.`,
      () => performImport(),
      () => {}
    );
  };

  const performImport = async () => {
    if (!RNFS || !XLSX) {
      customConfirm('Required libraries for file processing are not available', () => {}, null);
      return;
    }

    setImportLoading(true);
    try {
      // Read the file content
      const fileContent = await RNFS.readFile(excelFile.uri, 'base64');
      
      // Parse Excel file
      const workbook = XLSX.read(fileContent, { type: 'base64' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert worksheet to JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      if (data.length === 0) {
        customConfirm('No data found in Excel file. Please check if your file contains data.', () => {}, null);
        setImportLoading(false);
        return;
      }
      
      // Validate required columns for kitchen retailer
      const requiredColumns = ['Item Name', 'Carton Quantity', 'Quantity Per Carton', 'Price Per Piece', 'Price Per Carton', 'Purchase Price Per Piece', 'Purchase Price Per Carton', 'Total Amount', 'Source'];
      const firstRow = data[0];
      
      // Check if all required columns exist (case-insensitive)
      const missingColumns = [];
      const hasAllColumns = requiredColumns.every(col => {
        const hasColumn = Object.keys(firstRow).some(key => 
          key.toLowerCase().trim().replace(/\s+/g, ' ') === col.toLowerCase()
        );
        if (!hasColumn) {
          missingColumns.push(col);
        }
        return hasColumn;
      });
      
      if (!hasAllColumns) {
        customConfirm(
          `Excel file is missing required columns: ${missingColumns.join(', ')}\n\nRequired columns:\n• Item Name\n• Carton Quantity\n• Quantity Per Carton\n• Price Per Piece\n• Price Per Carton\n• Purchase Price Per Piece\n• Purchase Price Per Carton\n• Source\n\nOptional columns:\n• Item Code\n• Bulk Unit\n• Min Stock Alert\n• Last Purchase Date`,
          () => {},
          null
        );
        setImportLoading(false);
        return;
      }
      
      // Process and save each row to inventory
      let successCount = 0;
      let errorCount = 0;
      const errorDetails = [];
      
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          const processedItem = await processInventoryRow(row, i);
          if (processedItem) {
            await DataService.saveInventoryItem(processedItem);
            successCount++;
          } else {
            errorCount++;
          }
        } catch (err) {
          console.error('Error processing row:', err);
          errorDetails.push(`Row ${i + 2}: Processing error`);
          errorCount++;
        }
      }
      
      // Call success callback to reload inventory
      await onImportSuccess();
      
      // Show detailed results
      let message = `Successfully imported ${successCount} items.`;
      if (errorCount > 0) {
        message += `\n\n${errorCount} items had errors and were skipped.`;
        if (errorDetails.length > 0 && errorDetails.length <= 10) {
          message += `\n\nErrors:\n${errorDetails.join('\n')}`;
        } else if (errorDetails.length > 10) {
          message += `\n\nFirst 10 errors:\n${errorDetails.slice(0, 10).join('\n')}`;
        }
      }
      
      customConfirm(message, () => {}, null);
      
      // Clear the selected file after successful import
      setExcelFile(null);
      setFileSelected(false);
      
    } catch (error) {
      console.error('Import error:', error);
      customConfirm(`Error processing file: ${error.message}`, () => {}, null);
    } finally {
      setImportLoading(false);
    }
  };

  // Helper function to process a single row
  const processInventoryRow = (row, index) => {
    const getColumn = (colName) => {
      const col = Object.keys(row).find(key => 
        key.toLowerCase().trim().replace(/\s+/g, ' ') === colName.toLowerCase()
      );
      return row[col];
    };
    
    const cartonQuantity = parseInt(getColumn('carton quantity')) || 0;
    const quantityPerCarton = parseInt(getColumn('quantity per carton')) || 0;
    const totalQuantity = cartonQuantity * quantityPerCarton;
    
    const item = {
      itemName: String(getColumn('item name') || '').trim(),
      itemCode: String(getColumn('item code') || '').trim(),
      cartonQuantity: cartonQuantity,
      quantityPerCarton: quantityPerCarton,
      totalQuantity: totalQuantity,
      pricePerPiece: parseFloat(getColumn('price per piece')) || 0,
      pricePerCarton: parseFloat(getColumn('price per carton')) || 0,
      purchasePricePerPiece: parseFloat(getColumn('purchase price per piece')) || 0,
      purchasePricePerCarton: parseFloat(getColumn('purchase price per carton')) || 0,
      bulkUnit: String(getColumn('bulk unit') || 'Carton').trim(),
      source: String(getColumn('source') || 'Excel Import').trim(),
      lastPurchaseDate: getColumn('last purchase date') ? new Date(getColumn('last purchase date')).toISOString() : new Date().toISOString(),
      minStockAlert: parseInt(getColumn('min stock alert')) || null
    };
    
    // Validation
    if (!item.itemName) return null;
    if (isNaN(item.cartonQuantity) || item.cartonQuantity <= 0) return null;
    if (isNaN(item.quantityPerCarton) || item.quantityPerCarton <= 0) return null;
    if (isNaN(item.pricePerPiece) || item.pricePerPiece <= 0) return null;
    if (isNaN(item.pricePerCarton) || item.pricePerCarton <= 0) return null;
    if (isNaN(item.purchasePricePerPiece) || item.purchasePricePerPiece <= 0) return null;
    if (isNaN(item.purchasePricePerCarton) || item.purchasePricePerCarton <= 0) return null;
    
    return item;
  };

  const confirmClearFile = () => {
    customConfirm(
      'Are you sure you want to remove the selected file?',
      () => clearSelectedFile(),
      () => {}
    );
  };

  const clearSelectedFile = () => {
    setExcelFile(null);
    setFileSelected(false);
  };

  return (
    <>
      {/* Tutorial Modal */}
      <TutorialModal
        visible={showTutorial}
        onClose={closeTutorial}
        onProceed={proceedWithFileSelection}
      />

      {/* Import Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📥 Import Kitchen Inventory Data</Text>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button 
            onPress={handleFilePick} 
            ariaLabel="Choose File" 
            disabled={importLoading}
            title="Choose Excel File"
            icon={<Icon name="document-attach" size={20} color="white" />}
            iconPosition="left"
          />
          <Button 
            onPress={confirmImport} 
            disabled={!fileSelected || importLoading} 
            ariaLabel="Import"
            style={[(!fileSelected) && styles.disabledButton]}
            title={importLoading ? 'Importing...' : 'Import Data'}
            icon={<Icon name="cloud-upload" size={20} color="white" />}
            iconPosition="left"
          />
        </View>
        
        {excelFile && (
          <View style={styles.fileInfo}>
            <View style={styles.fileDetails}>
              <Icon name="document" size={16} color="#4CAF50" />
              <Text style={styles.fileName}>{excelFile.name}</Text>
              {excelFile.size && (
                <Text style={styles.fileSize}>({(excelFile.size / 1024).toFixed(2)} KB)</Text>
              )}
            </View>
            <TouchableOpacity onPress={confirmClearFile} style={styles.clearButton}>
              <Icon name="close-circle" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
        
        {!fileSelected && (
          <Text style={styles.helpText}>
            💡 Click "Choose Excel File" to see formatting guidelines and select your kitchen inventory file
          </Text>
        )}
      </View>
    </>
  );
};

export default InventoryImporter;