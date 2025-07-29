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
    }catch (error) {
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
      
      // Validate required columns
      const requiredColumns = ['Name', 'Part Number', 'Quantity', 'Price', 'Source'];
      const firstRow = data[0];
      
      // Check if all required columns exist (case-insensitive)
      const missingColumns = [];
      const hasAllColumns = requiredColumns.every(col => {
        const hasColumn = Object.keys(firstRow).some(key => 
          key.toLowerCase().trim() === col.toLowerCase()
        );
        if (!hasColumn) {
          missingColumns.push(col);
        }
        return hasColumn;
      });
      
      if (!hasAllColumns) {
        customConfirm(
          `Excel file is missing required columns: ${missingColumns.join(', ')}\n\nPlease ensure your file has these exact columns:\n• Name\n• Part Number\n• Quantity\n• Price\n• Source`,
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
              key.toLowerCase().trim() === colName.toLowerCase()
            );
            return row[col];
          };
          
          const item = {
            name: String(getColumn('name') || '').trim(),
            partNumber: String(getColumn('part number') || '').trim(),
            quantity: parseInt(getColumn('quantity')) || 0,
            price: parseFloat(getColumn('price')) || 0,
            source: String(getColumn('source') || 'Excel Import').trim()
          };
          
          // Validate item data
          if (!item.name) {
            errorDetails.push(`Row ${i + 2}: Missing name`);
            errorCount++;
            continue;
          }
          if (!item.partNumber) {
            errorDetails.push(`Row ${i + 2}: Missing part number`);
            errorCount++;
            continue;
          }
          if (isNaN(item.quantity) || item.quantity <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid quantity (${getColumn('quantity')})`);
            errorCount++;
            continue;
          }
          if (isNaN(item.price) || item.price <= 0) {
            errorDetails.push(`Row ${i + 2}: Invalid price (${getColumn('price')})`);
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
    `Are you sure you want to delete "${item.name}"?\n\nThis action cannot be undone.`,
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

  useFocusEffect(
  React.useCallback(() => {
    StatusBar.setHidden(true, 'fade');
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
    contentContainerStyle={{  flexGrow: 1  }}
    keyboardShouldPersistTaps="handled"
  >
    <View style={[styles.container, { padding: 20 }]}>
      {/* Custom Modal Component */}
      <ModalComponent />

      {/* Tutorial Modal */}
      <Modal
        visible={showTutorial}
        transparent={true}
        animationType="fade"
        onRequestClose={closeTutorial}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tutorialContainer}>
            <View style={styles.tutorialHeader}>
              <Text style={styles.tutorialTitle}>📊 Excel Import Guidelines</Text>
              <TouchableOpacity onPress={closeTutorial} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.tutorialContent}>
              <View style={styles.guidelineSection}>
                <Text style={styles.sectionTitle}>📋 File Requirements:</Text>
                <Text style={styles.bulletPoint}>• File must be .xlsx or .xls format</Text>
                <Text style={styles.bulletPoint}>• Maximum file size: 10MB</Text>
              </View>

              <View style={styles.guidelineSection}>
                <Text style={styles.sectionTitle}>📑 Required Columns (exact names):</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Name</Text> - Product/Item name</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Part Number</Text> - Unique identifier</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Quantity</Text> - Number of items (positive integer)</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Price</Text> - Unit price (positive number)</Text>
                <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Source</Text> - Where item was obtained</Text>
              </View>

              <View style={styles.guidelineSection}>
                <Text style={styles.sectionTitle}>✅ Data Validation:</Text>
                <Text style={styles.bulletPoint}>• All columns must be filled</Text>
                <Text style={styles.bulletPoint}>• Quantity must be a positive whole number</Text>
                <Text style={styles.bulletPoint}>• Price must be a positive decimal number</Text>
                <Text style={styles.bulletPoint}>• No empty rows between data</Text>
              </View>

              <View style={styles.exampleSection}>
                <Text style={styles.sectionTitle}>📝 Example Format:</Text>
                <View style={styles.exampleTable}>
                  <View style={styles.exampleRow}>
                    <Text style={styles.exampleHeader}>Name</Text>
                    <Text style={styles.exampleHeader}>Part Number</Text>
                    <Text style={styles.exampleHeader}>Quantity</Text>
                    <Text style={styles.exampleHeader}>Price</Text>
                    <Text style={styles.exampleHeader}>Source</Text>
                  </View>
                  <View style={styles.exampleRow}>
                    <Text style={styles.exampleCell}>Screw M8</Text>
                    <Text style={styles.exampleCell}>SCR-M8-001</Text>
                    <Text style={styles.exampleCell}>100</Text>
                    <Text style={styles.exampleCell}>2.50</Text>
                    <Text style={styles.exampleCell}>Hardware Store</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.tutorialActions}>
             <ButtonGroup direction="row" spacing={12} fullWidth>
                <Button
                  type="secondary"
                  variant="outline"
                  size="medium"
                  onPress={closeTutorial}
                  title="Cancel"
                  style={{ flex: 1 }}
                />
                <Button
                  type="gradient"
                  size="medium"
                  onPress={proceedWithFileSelection}
                  title="Proceed to Select File"
                  icon={<Icon name="folder-open" size={18} color="white" />}
                  iconPosition="left"
                  style={{ flex: 1 }}
                />
              </ButtonGroup>
            </View>
          </View>
        </View>
      </Modal>

      {/* Import Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📥 Import Inventory Data</Text>
        
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
              disabled={!fileSelected || importLoading } 
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
            💡 Click "Choose Excel File" to see formatting guidelines and select your inventory file
          </Text>
        )}
      </View>

      {/* Inventory Display Section */}
      <View style={[styles.sectionHeader]}>
        <View style={styles.titleHeader}>
          <Text style={styles.sectionTitle}>📦 Inventory Database</Text>
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
              headers={["Name", "Part Number", "Quantity", "Price", "Source", "Action"]}
              data={inventory.map((item, index) => [
                item.name || '', 
                item.partNumber || '', 
                (item.quantity || 0).toString(), 
                `ETB ${formatNumberWithCommas(item.price || 0)}`, 
                item.source || '',
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
            <Icon name="archive-outline" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No Inventory Data</Text>
            <Text style={styles.emptySubtitle}>
              Import your first Excel file to get started with inventory management
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