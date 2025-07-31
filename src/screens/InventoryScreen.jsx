import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Modal, Platform, StatusBar, ImageBackground, Animated } from 'react-native';
import DataService from '../services/DataService';
import Button, { ButtonGroup } from '../components/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Table from '../components/Table';
import Icon from 'react-native-vector-icons/Ionicons';
import useCustomModal from '../components/CustomModal';
import styles from '../styles/InventoryScreenStyles';
import FilePicker from 'react-native-file-picker';
import TutorialModal from '../components/TutorialModal';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import { formatNumberWithCommas } from '../components/utils/formatters';
import { useFocusEffect } from '@react-navigation/native';
import { CircleFade } from 'react-native-animated-spinkit';

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [screenReady, setScreenReady] = useState(false);

  const [tableAnimation] = useState(new Animated.Value(0)); 

  // Initialize custom modal
  const { confirm: customConfirm, ModalComponent } = useCustomModal();

  useEffect(() => {
    setScreenReady(true);
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setInventoryLoading(true);
    tableAnimation.setValue(0);
    try {
      const items = await DataService.getInventory();
      setInventory(Array.isArray(items) ? items : []); // Ensure it's always an array
      if (items && items.length > 0) { // Add this block
        Animated.timing(tableAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      customConfirm(
        'Failed to load inventory data. Please try again.',
        () => {},
        null
      );
    } finally {
      setInventoryLoading(false);
    }
  };

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
    console.log('handleFileSelection called');
    try {
      console.log('About to call FilePicker.showFilePicker');
      
      FilePicker.showFilePicker({
        title: 'Select Excel File',
        chooseFromLibraryButtonTitle: 'Choose from Files',
        mediaType: 'mixed',
        allowsEditing: false,
      }, (response) => {
        console.log('File selected:', response);
        
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
    console.log('proceedWithFileSelection called'); // Debug log
    setShowTutorial(false);
    // Increase delay to ensure modal is fully closed
    setTimeout(() => {
      console.log('About to call handleFileSelection'); // Debug log
      handleFileSelection();
    }, 300); // Increased from 100ms to 300ms
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
      () => performImport(), // Confirm callback
      () => {} // Cancel callback
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
      const requiredColumns = ['Item Name', 'Carton Quantity', 'Quantity Per Carton', 'Price Per Piece', 'Price Per Carton', 'Purchase Price Per Piece', 'Purchase Price Per Carton', 'Source'];
      const optionalColumns = ['Item Code', 'Bulk Unit', 'Min Stock Alert', 'Last Purchase Date'];
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
          // Map Excel columns to inventory item properties (case-insensitive)
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
          
          // Validate item data
          if (!item.itemName) {
            errorDetails.push(`Row ${i + 2}: Missing item name`);
            errorCount++;
            continue;
          }
          if (isNaN(item.cartonQuantity) || item.cartonQuantity <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid carton quantity (${getColumn('carton quantity')})`);
            errorCount++;
            continue;
          }
          if (isNaN(item.quantityPerCarton) || item.quantityPerCarton <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid quantity per carton (${getColumn('quantity per carton')})`);
            errorCount++;
            continue;
          }
          if (isNaN(item.pricePerPiece) || item.pricePerPiece <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid price per piece (${getColumn('price per piece')})`);
            errorCount++;
            continue;
          }
          if (isNaN(item.pricePerCarton) || item.pricePerCarton <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid price per carton (${getColumn('price per carton')})`);
            errorCount++;
            continue;
          }
          if (isNaN(item.purchasePricePerPiece) || item.purchasePricePerPiece <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid purchase price per piece (${getColumn('purchase price per piece')})`);
            errorCount++;
            continue;
          }
          if (isNaN(item.purchasePricePerCarton) || item.purchasePricePerCarton <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid purchase price per carton (${getColumn('purchase price per carton')})`);
            errorCount++;
            continue;
          }
          
          // Save to inventory
          await DataService.saveInventoryItem(item);
          successCount++;
        } catch (err) {
          console.error('Error processing row:', err);
          errorDetails.push(`Row ${i + 2}: Processing error`);
          errorCount++;
        }
      }
      
      // Reload inventory to show the new items
      await loadInventory();
      
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

  const confirmDeleteItem = (index, item) => {
    customConfirm(
      `Are you sure you want to delete "${item.itemName}"?\n\nThis action cannot be undone.`,
      () => deleteItem(index),
      () => {}
    );
  };

  const deleteItem = async (index) => {
    try {
      // Remove item from local state
      const updatedInventory = inventory.filter((_, i) => i !== index);
      setInventory(updatedInventory);
      
      // Delete from storage using DataService
      await DataService.deleteInventoryItem(inventory[index]);
      
      customConfirm(
        'Item deleted successfully!',
        () => {},
        null
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      customConfirm(
        'Failed to delete item. Please try again.',
        () => {},
        null
      );
      // Reload inventory to restore state if delete failed
      loadInventory();
    }
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

  // Check for low stock items
  const checkLowStock = (item) => {
    if (item.minStockAlert && item.cartonQuantity <= item.minStockAlert) {
      return true;
    }
    return false;
  };

  // Get stock status indicator
  const getStockStatusIcon = (item) => {
    if (item.cartonQuantity === 0) {
      return <Icon name="alert-circle" size={16} color="#f44336" />;
    } else if (checkLowStock(item)) {
      return <Icon name="warning" size={16} color="#ff9800" />;
    } else {
      return <Icon name="checkmark-circle" size={16} color="#4CAF50" />;
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setHidden(true, 'fade');
      loadInventory();
    }, [])
  );

  return (
    <ImageBackground
      source={require('../components/images/judas.jpg')} // or use a URI
      style={styles.container}
      imageStyle={{ opacity: 0.2 }}
      resizeMode='cover'
    >
      {screenReady ? (  
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.container, { padding: 20 }]}>
            {/* Custom Modal Component */}
            <ModalComponent />

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

            {/* Inventory Display Section */}
            <View style={[styles.sectionHeader]}>
              <View style={styles.titleHeader}>
                <Text style={styles.sectionTitle}>🍽️ Kitchen Inventory Database</Text>
                <Text style={styles.itemCount}>
                  {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              
              {inventoryLoading ? (
                <View style={styles.loadingContainer}>
                  <CircleFade size={48} color="#393247" />
                  <Text style={styles.loadingText}>Loading inventory...</Text>
                </View>
              
              ) : inventory.length > 0 ? (
                <Animated.View 
                  style={{ 
                    opacity: tableAnimation,
                    transform: [{ 
                      translateY: tableAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0]
                      })
                    }]
                  }}
                >
                  <ScrollView style={{ minHeight: 450, marginHorizontal: 0 }}>
                    <Table
                        headers={["Status", "Item Name", "Item Code", "Cartons", "Per Carton", "Total Pcs", "Sell Price/Pc", "Sell Price/Carton", "Buy Price/Pc", "Buy Price/Carton", "Source", "Last Purchase", "Action"]}
                        data={inventory.map((item, index) => [
                          getStockStatusIcon(item),
                          item.itemName || '',
                          item.itemCode || 'N/A',
                          (item.cartonQuantity || 0).toString(), 
                          (item.quantityPerCarton || 0).toString(),
                          (item.totalQuantity || 0).toString(),
                          `ETB ${formatNumberWithCommas(item.pricePerPiece || 0)}`, 
                          `ETB ${formatNumberWithCommas(item.pricePerCarton || 0)}`,
                          `ETB ${formatNumberWithCommas(item.purchasePricePerPiece || 0)}`, 
                          `ETB ${formatNumberWithCommas(item.purchasePricePerCarton || 0)}`,
                          item.source || '',
                          item.lastPurchaseDate ? new Date(item.lastPurchaseDate).toLocaleDateString() : 'N/A',
                          <TouchableOpacity 
                            key={index}
                            onPress={() => confirmDeleteItem(index, item)}
                            style={styles.deleteButton}
                          >
                            <Icon name="trash" size={16} color="#f44336" />
                          </TouchableOpacity>
                        ])}
                        noDataMessage="No inventory data available"
                      />
                  </ScrollView>
                </Animated.View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="restaurant-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Kitchen Inventory Data</Text>
                  <Text style={styles.emptySubtitle}>
                    Import your first Excel file to get started with kitchen inventory management
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <CircleFade size={48} color="#393247" />
        </View>
      )}
    </ImageBackground>
  );
};

export default InventoryScreen;