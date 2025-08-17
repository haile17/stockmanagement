import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, Platform, PermissionsAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from './Button';
import styles from '../styles/TutorialModalStyles';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';


const TutorialModal = ({ visible, onClose, onProceed }) => {
  const [downloadLoading, setDownloadLoading] = useState(false);

const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const apiLevel = Platform.constants.Release;
        
        // Check if permissions are already granted
        const readPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
        const writePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        
        if (readPermission && writePermission) {
          return true;
        }
        
        // Request permissions
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const generateSampleExcelFile = async () => {
    setDownloadLoading(true);
    
    try {
      // Check storage permission
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        alert(
          'Storage permission is required to save files to Downloads folder.\n\n' +
          'Please grant storage permission in your device settings:\n' +
          'Settings > Apps > [Your App] > Permissions > Storage'
        );
        setDownloadLoading(false);
        return;
      }

      // Sample data for kitchen inventory
      const sampleData = [
        {
          'Item Name': 'Basmati Rice 5kg',
          'Item Code': 'RICE-BSM-5K',
          'Carton Quantity': 10,
          'Quantity Per Carton': 6,
          'Price Per Piece': 15.50,
          'Price Per Carton': 93.00,
          'Purchase Price Per Piece': 12.00,
          'Purchase Price Per Carton': 72.00,
          'Bulk Unit': 'Carton',
          'Source': 'ABC Food Suppliers',
          'Min Stock Alert': 20,
          'Last Purchase Date': '2024-08-01'
        },
        {
          'Item Name': 'Cooking Oil 1L',
          'Item Code': 'OIL-CK-1L',
          'Carton Quantity': 5,
          'Quantity Per Carton': 12,
          'Price Per Piece': 8.75,
          'Price Per Carton': 105.00,
          'Purchase Price Per Piece': 7.00,
          'Purchase Price Per Carton': 84.00,
          'Bulk Unit': 'Carton',
          'Source': 'Golden Oil Co.',
          'Min Stock Alert': 15,
          'Last Purchase Date': '2024-08-05'
        },
        {
          'Item Name': 'Sugar 2kg',
          'Item Code': 'SGR-WHT-2K',
          'Carton Quantity': 8,
          'Quantity Per Carton': 10,
          'Price Per Piece': 4.25,
          'Price Per Carton': 42.50,
          'Purchase Price Per Piece': 3.50,
          'Purchase Price Per Carton': 35.00,
          'Bulk Unit': 'Carton',
          'Source': 'Sweet Supply Ltd',
          'Min Stock Alert': 25,
          'Last Purchase Date': '2024-07-28'
        },
        {
          'Item Name': 'Flour 10kg',
          'Item Code': 'FLR-WHT-10K',
          'Carton Quantity': 6,
          'Quantity Per Carton': 4,
          'Price Per Piece': 22.00,
          'Price Per Carton': 88.00,
          'Purchase Price Per Piece': 18.00,
          'Purchase Price Per Carton': 72.00,
          'Bulk Unit': 'Carton',
          'Source': 'Miller Foods',
          'Min Stock Alert': 10,
          'Last Purchase Date': '2024-08-10'
        },
        {
          'Item Name': 'Tomato Sauce 500g',
          'Item Code': 'SAU-TOM-500G',
          'Carton Quantity': 12,
          'Quantity Per Carton': 24,
          'Price Per Piece': 3.50,
          'Price Per Carton': 84.00,
          'Purchase Price Per Piece': 2.75,
          'Purchase Price Per Carton': 66.00,
          'Bulk Unit': 'Carton',
          'Source': 'Fresh Foods Inc',
          'Min Stock Alert': 50,
          'Last Purchase Date': '2024-08-07'
        }
      ];

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(sampleData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 20 }, // Item Name
        { wch: 15 }, // Item Code
        { wch: 12 }, // Carton Quantity
        { wch: 15 }, // Quantity Per Carton
        { wch: 12 }, // Price Per Piece
        { wch: 12 }, // Price Per Carton
        { wch: 18 }, // Purchase Price Per Piece
        { wch: 18 }, // Purchase Price Per Carton
        { wch: 10 }, // Bulk Unit
        { wch: 20 }, // Source
        { wch: 12 }, // Min Stock Alert
        { wch: 15 }  // Last Purchase Date
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kitchen Inventory Sample');

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

      // Define file path with multiple fallback options
      const fileName = 'Kitchen_Inventory_Sample.xlsx';
      let downloadPath;
      let saveLocation = '';
      
      if (Platform.OS === 'ios') {
        downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        saveLocation = 'Files app > On My iPhone > [App Name]';
      } else {
        // Android: Try multiple locations in order of preference
        const possiblePaths = [
          { path: `${RNFS.DownloadDirectoryPath}/${fileName}`, location: 'Downloads folder' },
          { path: `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`, location: 'Downloads folder' },
          { path: `${RNFS.DocumentDirectoryPath}/${fileName}`, location: 'App files (accessible via file manager)' },
          { path: `${RNFS.ExternalDirectoryPath}/${fileName}`, location: 'App external storage' }
        ];
        
        let fileSaved = false;
        
        for (let i = 0; i < possiblePaths.length; i++) {
          try {
            downloadPath = possiblePaths[i].path;
            saveLocation = possiblePaths[i].location;
            
            // Try to write to this location
            await RNFS.writeFile(downloadPath, excelBuffer, 'base64');
            fileSaved = true;
            console.log(`File saved successfully to: ${downloadPath}`);
            break;
          } catch (error) {
            console.log(`Failed to save to ${possiblePaths[i].path}:`, error.message);
            if (i === possiblePaths.length - 1) {
              throw error; // If all paths fail, throw the last error
            }
          }
        }
        
        if (!fileSaved) {
          throw new Error('Unable to save file to any accessible location');
        }
      }
      
      // If we reach here for iOS or if Android didn't save yet, save now
      if (Platform.OS === 'ios') {
        await RNFS.writeFile(downloadPath, excelBuffer, 'base64');
      }

      // Determine file location message
      alert(
        `✅ Sample Excel file downloaded successfully!\n\n` +
        `📁 File saved to: ${saveLocation}\n` +
        `📄 Filename: ${fileName}\n\n` +
        `You can now edit this file with your own data and import it back into the app.`
      );

    } catch (error) {
      console.error('Error generating sample file:', error);
      alert(
        `❌ Unable to save file.\n\n` +
        `This might be due to:\n` +
        `• Storage permission restrictions\n` +
        `• Insufficient storage space\n` +
        `• Device security settings\n\n` +
        `Please try:\n` +
        `1. Grant storage permissions in Settings\n` +
        `2. Free up storage space\n` +
        `3. Restart the app and try again`
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tutorialContainer}>
          <View style={styles.tutorialHeader}>
            <Text style={styles.tutorialTitle}>🍽️ Inventory Excel Import Guidelines</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#4237a5ff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.tutorialContent}>
            {/* Download Sample Section */}
            <View style={[styles.guidelineSection, { backgroundColor: '#e8f5e8', padding: 15, borderRadius: 8, marginBottom: 15 }]}>
              <Text style={styles.sectionTitle}>📥 Download Sample Excel File:</Text>
              <Text style={styles.bulletPoint}>• Get a pre-formatted Excel file with sample kitchen inventory data</Text>
              <Text style={styles.bulletPoint}>• Replace sample data with your actual inventory</Text>
              <Text style={styles.bulletPoint}>• Use this file as a template for future imports</Text>
              
              <View style={{ marginTop: 10 }}>
                <Button
                  onPress={generateSampleExcelFile}
                  disabled={downloadLoading}
                  title={downloadLoading ? 'Downloading...' : 'Download Sample Excel File'}
                  icon={<Icon name="download" size={18} color="white" />}
                  iconPosition="left"
                  style={{ backgroundColor: '#4CAF50' }}
                />
              </View>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>📋 File Requirements:</Text>
              <Text style={styles.bulletPoint}>• File must be .xlsx or .xls format</Text>
              <Text style={styles.bulletPoint}>• Maximum file size: 10MB</Text>
              <Text style={styles.bulletPoint}>• Data should start from the first row (headers)</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>📑 Required Columns (exact names):</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Item Name</Text> - Kitchen item/product name</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Carton Quantity</Text> - Number of cartons (positive integer)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Quantity Per Carton</Text> - Items per carton (positive integer)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Price Per Piece</Text> - Selling price per item (positive number)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Price Per Carton</Text> - Selling price per carton (positive number)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Purchase Price Per Piece</Text> - Cost per item (positive number)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Purchase Price Per Carton</Text> - Cost per carton (positive number)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Source</Text> - Supplier/source name</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>🔧 Optional Columns:</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Item Code</Text> - Unique product identifier</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Bulk Unit</Text> - Unit of measurement (default: "Carton")</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Min Stock Alert</Text> - Minimum stock threshold</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Last Purchase Date</Text> - Date format: MM/DD/YYYY</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>✅ Data Validation:</Text>
              <Text style={styles.bulletPoint}>• All required columns must be filled</Text>
              <Text style={styles.bulletPoint}>• Quantities must be positive whole numbers</Text>
              <Text style={styles.bulletPoint}>• All prices must be positive decimal numbers</Text>
              <Text style={styles.bulletPoint}>• No empty rows between data</Text>
              <Text style={styles.bulletPoint}>• Item names must not be empty</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>⚠️ Important Notes:</Text>
              <Text style={styles.bulletPoint}>• Column names are case-insensitive but must match exactly</Text>
              <Text style={styles.bulletPoint}>• Total quantity will be calculated automatically (Carton Qty × Qty Per Carton)</Text>
              <Text style={styles.bulletPoint}>• Invalid rows will be skipped with error details</Text>
              <Text style={styles.bulletPoint}>• Existing items with same name may be duplicated</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>📱 How to Use:</Text>
              <Text style={styles.bulletPoint}>1. Download the sample Excel file above</Text>
              <Text style={styles.bulletPoint}>2. Open it in Excel, Google Sheets, or similar app</Text>
              <Text style={styles.bulletPoint}>3. Replace sample data with your inventory</Text>
              <Text style={styles.bulletPoint}>4. Save the file and import it back to this app</Text>
            </View>
          </ScrollView>

          <View style={styles.tutorialActions}>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Button
                color="secondary"
                variant="outline"
                size="medium"
                onPress={onClose}
                title="Cancel"
                style={{ flex: 1 }}
              />
              <Button
                color="primary"
                variant="solid"
                size="medium"
                onPress={onProceed}
                title="Proceed to Select File"
                icon={<Icon name="folder-open" size={18} color="white" />}
                iconPosition="left"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TutorialModal;