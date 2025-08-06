// ReportScreen.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  Animated,
  ImageBackground
} from 'react-native';
import DataService from '../services/DataService';
import PDFService from '../services/PDFService';
import Table from '../components/Table';
import { reportScreenStyles } from '../styles/ReportScreenStyles';
import DatePicker from 'react-native-date-picker';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate, formatDateOnly } from '../components/utils/formatters';
import { useAlert } from '../context/AlertContext';
import Button from '../components/Button';
import ScrollingText from '../components/utils/ScrollingText';
import Header from '../components/Header';

const ReportScreen = ({ navigation, onToggleDrawer }) => {
  // State management
  const [salesData, setSalesData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [creditsData, setCreditsData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]); // Added inventory data
  const [generatedPDFs, setGeneratedPDFs] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());
  const { showError, showSuccess, showWarning, showConfirmation } = useAlert();
  const [expandedItems, setExpandedItems] = useState({});

  const [autoCollapseTimer, setAutoCollapseTimer] = useState(null);
  const animationRefs = useRef({});
  
  const getAnimationValue = (itemId) => {
    if (!animationRefs.current[itemId]) {
      animationRefs.current[itemId] = new Animated.Value(0);
    }
    return animationRefs.current[itemId];
  };

  useEffect(() => {
    loadReportsData();
    loadSavedPDFs();
  }, []);

  useEffect(() => {
    return () => {
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
      }
    };
  }, [autoCollapseTimer]);

  // Load all reports data - Updated to include inventory
  const loadReportsData = async () => {
    try {
      const [sales, purchases, credits, inventory] = await Promise.all([
        DataService.getSales(),
        DataService.getPurchases(),
        DataService.getCredits(),
        DataService.getInventory() // Added inventory loading
      ]);

      setSalesData(sales || []);
      setPurchasesData(purchases || []);
      setCreditsData(credits || []);
      setInventoryData(inventory || []); // Set inventory data
    } catch (error) {
      console.error('Error loading reports data:', error);
      showError('Error', 'Failed to load reports data');
    }
  };

  // Load saved PDFs
  const loadSavedPDFs = async () => {
    try {
      console.log('Loading saved PDFs...');
      const pdfFiles = await PDFService.loadSavedPDFs();
      console.log('Found PDF files:', pdfFiles.length);
      console.log('PDF files:', pdfFiles.map(f => f.name));
      
      // Force a state update by creating a new array
      setGeneratedPDFs([...pdfFiles]);
    } catch (error) {
      console.error('Error loading saved PDFs:', error);
      setGeneratedPDFs([]); // Ensure state is updated even on error
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadReportsData(); // Reload all data when screen comes into focus
      loadSavedPDFs();
    }, [])
  );

  // Get current report data based on selected type and filters - Updated
  const getCurrentReportData = () => {
    return PDFService.formatReportData(
      selectedReportType,
      salesData,
      purchasesData,
      creditsData,
      inventoryData, // Pass inventory data
      startDate,
      endDate
    );
  };

  // Generate PDF report - Enhanced error handling
  const generatePDF = async () => {
    if (loading) return;
    
    // Check if dates are selected (except for inventory reports)
    if (selectedReportType !== 'inventory' && (!startDate || !endDate)) {
      showWarning(
        'Date Range Required', 
        'Please select both start and end dates before generating the report'
      );
      return;
    }

    setLoading(true);
    try {
      const reportData = getCurrentReportData();

      console.log(`Report Type: ${selectedReportType}`);
      console.log(`Report Data:`, reportData);
      console.log(`Data Length: ${reportData?.data?.length || 0}`);
      
      if (!reportData || !reportData.data || reportData.data.length === 0) {
        showWarning(
          'No Data', 
          `No data available for the selected ${selectedReportType} report${
            selectedReportType !== 'inventory' ? ' and date range' : ''
          }.`
        );
        return;
      }

      const pdf = await PDFService.generatePDF(
        reportData, 
        startDate, 
        endDate, 
        selectedReportType
      );
      
      if (pdf && pdf.filePath) {
        // Add a small delay to ensure file is written
        setTimeout(async () => {
          await loadSavedPDFs();
        }, 500);
        
        showSuccess(
          'Success',
          'PDF report generated successfully!',
          [
            { 
              text: 'OK', 
              onPress: async () => {
                await loadSavedPDFs();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      showError('Error', error.message || 'Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF sharing
  const handleSharePDF = async (filePath, fileName) => {
    try {
      await PDFService.sharePDF(filePath, fileName);
    } catch (error) {
      showError('Error', error.message);
    }
  };

  // Handle WhatsApp sharing
  const handleWhatsAppShare = async (filePath) => {
    try {
      await PDFService.shareViaWhatsApp(filePath);
    } catch (error) {
      showError('Error', error.message);
    }
  };

  // Handle Telegram sharing
  const handleTelegramShare = async (filePath) => {
    try {
      await PDFService.shareViaTelegram(filePath);
    } catch (error) {
      showError('Error', error.message);
    }
  };

  // Handle PDF deletion
  const handleDeletePDF = async (filePath, fileName) => {
    try {
      await PDFService.deletePDF(filePath);
      loadSavedPDFs();
      showSuccess('Success', 'PDF deleted successfully');
    } catch (error) {
      showError('Error', error.message);
    }
  };

  // Render report type selection buttons - Updated to include inventory
  const renderReportTypeButtons = () => {
    const reportTypes = [
      { key: 'sales', label: 'Sales' },
      { key: 'purchases', label: 'Purchases' },
      { key: 'credits', label: 'Credits' },
      { key: 'inventory', label: 'Inventory' } // Added inventory option
    ];

    return (
      <View style={reportScreenStyles.reportTypeContainer}>
        {reportTypes.map(type => (
          <Button
            key={type.key}
            title={type.label}
            type={selectedReportType === type.key ? 'primary' : 'outline'}
            size="small"
            onPress={() => setSelectedReportType(type.key)}
            style={[
              reportScreenStyles.reportTypeButton,
              selectedReportType === type.key && reportScreenStyles.reportTypeButtonActive
            ]}
            textStyle={[
              reportScreenStyles.reportTypeText,
              selectedReportType === type.key && reportScreenStyles.reportTypeTextActive
            ]}
          />
        ))}
      </View>
    );
  };

  // Render date filter inputs - Updated to show/hide based on report type
  const renderDateFilters = () => {
    // Don't show date filters for inventory reports since they show current stock
    if (selectedReportType === 'inventory') {
      return (
        <View style={reportScreenStyles.dateFilterContainer}>
          <Text style={reportScreenStyles.dateFilterNote}>
            * Inventory report shows current stock levels
          </Text>
        </View>
      );
    }

    return (
      <View style={reportScreenStyles.dateFilterContainer}>
        <View style={reportScreenStyles.datePickersRow}>
          <TouchableOpacity
            style={reportScreenStyles.datePickerButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <ScrollingText
              text={`Start Date: ${formatDateOnly(startDate || 'Select Date')}`}
              style={reportScreenStyles.datePickerText}
              containerStyle={reportScreenStyles.scrollingTextContainer}
              speed={40}
              pauseDuration={1500}
              enableScrolling={true}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={reportScreenStyles.datePickerButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <ScrollingText
              text={`End Date: ${formatDateOnly(endDate || 'Select Date')}`}
              style={reportScreenStyles.datePickerText}
              containerStyle={reportScreenStyles.scrollingTextContainer}
              speed={40}
              pauseDuration={1500}
              enableScrolling={true}
            />
          </TouchableOpacity>

          <Button
            title="Clear"
            type="outline"
            size="small"
            onPress={() => {
              setStartDate('');
              setEndDate('');
            }}
            style={reportScreenStyles.clearDatesButton}
            textStyle={reportScreenStyles.clearDatesText}
          />
        </View>

        {/* Date Picker Modals */}
        <DatePicker
          modal
          open={showStartDatePicker}
          date={startDateObj}
          mode="date"
          onConfirm={(date) => {
            setShowStartDatePicker(false);
            setStartDateObj(date);
            setStartDate(date.toISOString().split('T')[0]);
          }}
          onCancel={() => {
            setShowStartDatePicker(false);
          }}
        />

        <DatePicker
          modal
          open={showEndDatePicker}
          date={endDateObj}
          mode="date"
          onConfirm={(date) => {
            setShowEndDatePicker(false);
            setEndDateObj(date);
            setEndDate(date.toISOString().split('T')[0]);
          }}
          onCancel={() => {
            setShowEndDatePicker(false);
          }}
        />
      </View>
    );
  };

  const toggleItemExpansion = (itemId) => {
    // Clear existing timer
    if (autoCollapseTimer) {
      clearTimeout(autoCollapseTimer);
    }

    // Close all other expanded items with faster animation
    Object.keys(expandedItems).forEach(id => {
      if (id !== itemId && expandedItems[id]) {
        const animValue = getAnimationValue(id);
        Animated.timing(animValue, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
    });

    const isCurrentlyExpanded = expandedItems[itemId];
    const animValue = getAnimationValue(itemId);

    if (isCurrentlyExpanded) {
      // Collapse with spring animation
      Animated.spring(animValue, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      setExpandedItems(prev => ({ ...prev, [itemId]: false }));
    } else {
      // Expand with bouncy spring animation
      setExpandedItems(prev => ({ [itemId]: true }));
      Animated.spring(animValue, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }).start();

      // Set auto-collapse timer with spring animation
      const timer = setTimeout(() => {
        Animated.spring(animValue, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
        setExpandedItems(prev => ({ ...prev, [itemId]: false }));
      }, 6000); // Increased to 6 seconds for better UX

      setAutoCollapseTimer(timer);
    }
  };

  // Render PDF item in the list
  const renderPDFItem = ({ item }) => {
    const isExpanded = expandedItems[item.name] || false;
    const animValue = getAnimationValue(item.name);

    // Create staggered animations for buttons
    const buttons = [
      { title: "Share", type: "secondary", onPress: () => handleSharePDF(item.path, item.name) },
      { title: "WhatsApp", type: "success", onPress: () => handleWhatsAppShare(item.path) },
      { title: "Telegram", type: "primary", onPress: () => handleTelegramShare(item.path) },
      { 
        title: "×", 
        type: "danger", 
        onPress: () => {
          showConfirmation(
            'Delete PDF',
            'Are you sure you want to delete this PDF?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: () => handleDeletePDF(item.path, item.name) }
            ]
          );
        }
      }
    ];

    return (
      <View style={reportScreenStyles.pdfItem}>
        <View style={reportScreenStyles.pdfItemInfo}>
          <Text style={reportScreenStyles.pdfItemTitle} numberOfLines={2}>
            {item.name.replace('report_', '').replace('.pdf', '')}
          </Text>
          <Text style={reportScreenStyles.pdfItemDate} numberOfLines={1}>
            {formatDateOnly(item.mtime)}
          </Text>
        </View>
        
        <View style={reportScreenStyles.pdfItemActions}>
          {!isExpanded ? (
            <Button
              title="⋮"
              type="secondary"
              size="xs"
              onPress={() => toggleItemExpansion(item.name)}
              style={[reportScreenStyles.actionButton, reportScreenStyles.menuButton]}
            />
          ) : (
            <View style={reportScreenStyles.expandedButtonsContainer}>
              {buttons.map((button, index) => {
                // Fixed calculation to ensure monotonic increasing values
                const delay = Math.min(index * 0.1, 0.3); // Cap at 0.3 to stay within 0-1 range
                
                // Wave motion - each button has a different phase
                const translateX = animValue.interpolate({
                  inputRange: [0, 0.2 + delay, 0.5 + delay, Math.min(0.8 + delay, 1)],
                  outputRange: [80, -10, 5, 0], // Overshoot and settle
                  extrapolate: 'clamp',
                });

                // Bouncy scale animation
                const scale = animValue.interpolate({
                  inputRange: [0, 0.1 + delay, 0.3 + delay, 0.6 + delay, Math.min(0.9 + delay, 1)],
                  outputRange: [0, 0.3, 1.2, 0.9, 1], // Bounce effect
                  extrapolate: 'clamp',
                });

                // Wave-like opacity with overlap
                const opacity = animValue.interpolate({
                  inputRange: [0, 0.05 + delay, Math.min(0.25 + delay, 0.9), 1],
                  outputRange: [0, 0.3, 1, 1],
                  extrapolate: 'clamp',
                });

                // Rotation for extra flair
                const rotate = animValue.interpolate({
                  inputRange: [0, 0.2 + delay, 0.5 + delay, Math.min(0.8 + delay, 1)],
                  outputRange: ['15deg', '-5deg', '2deg', '0deg'],
                  extrapolate: 'clamp',
                });

                // Vertical wave motion
                const translateY = animValue.interpolate({
                  inputRange: [0, 0.15 + delay, 0.4 + delay, 0.7 + delay, Math.min(0.95 + delay, 1)],
                  outputRange: [20, -8, 4, -2, 0],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={button.title}
                    style={[
                      reportScreenStyles.animatedButtonContainer,
                      {
                        opacity,
                        transform: [
                          { translateX },
                          { translateY },
                          { scale },
                          { rotate }
                        ],
                      }
                    ]}
                  >
                    <Button
                      title={button.title}
                      type={button.type}
                      size="xs"
                      onPress={button.onPress}
                      style={reportScreenStyles.actionButton}
                    />
                  </Animated.View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  const reportData = getCurrentReportData();

  return (
    <View style={reportScreenStyles.container}>
      <Header
        onToggleDrawer={onToggleDrawer}
        iconColor="#ffffff" // White icon for dark background
        backgroundColor="transparent"
      />
      <FlatList
        data={generatedPDFs}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        ListHeaderComponent={
          <>
            {/* Reports Section */}
            <View style={reportScreenStyles.section}>
              <Text style={reportScreenStyles.sectionTitle}>Reports</Text>
              
              {renderReportTypeButtons()}
              {renderDateFilters()}

              <Table
                headers={reportData.headers}
                data={reportData.data}
                noDataMessage={`No ${selectedReportType} records found${
                  selectedReportType !== 'inventory' ? ' for the selected date range' : ''
                }`}
              />

              {/* Show summary for inventory reports */}
              {selectedReportType === 'inventory' && reportData.data.length > 0 && (
                <View style={reportScreenStyles.inventorySummary}>
                  <Text style={reportScreenStyles.summaryTitle}>Inventory Summary</Text>
                  <Text style={reportScreenStyles.summaryText}>
                    Total Items: {reportData.data.length}
                  </Text>
                  <Text style={reportScreenStyles.summaryText}>
                    Total Stock Value: ${reportData.data.reduce((sum, item) => 
                      sum + (parseFloat(item.totalAmount) || 0), 0
                    ).toFixed(2)}
                  </Text>
                  <Text style={reportScreenStyles.summaryText}>
                    Low Stock Items: {reportData.data.filter(item => 
                      item.minStockAlert && parseInt(item.cartonQuantity) <= parseInt(item.minStockAlert)
                    ).length}
                  </Text>
                </View>
              )}
            </View>

            {/* PDF Generation Section */}
            <View style={reportScreenStyles.section}>
              <Text style={reportScreenStyles.sectionTitle}>Convert to PDF</Text>
              
              <Button
                title={loading ? 'Generating PDF...' : 'Generate PDF Report'}
                type="gradient"
                size="large"
                onPress={generatePDF}
                disabled={loading}
                loading={loading}
                style={reportScreenStyles.generateButton}
                textStyle={reportScreenStyles.generateButtonText}
                fullWidth
              />
            </View>

            {/* Generated PDFs Section Header */}
            <View style={reportScreenStyles.section}>
              <View style={reportScreenStyles.sectionHeader}>
                <Text style={reportScreenStyles.sectionTitle}>
                  Generated PDF Reports ({generatedPDFs.length})
                </Text>
                <Button
                  title="Refresh"
                  type="outline"
                  size="small"
                  onPress={async () => {
                    await loadSavedPDFs();
                    showSuccess('Refreshed', `Found ${generatedPDFs.length} PDF files`);
                  }}
                  style={reportScreenStyles.refreshButton}
                  textStyle={reportScreenStyles.refreshButtonText}
                />
              </View>
              
              {generatedPDFs.length === 0 && (
                <View style={reportScreenStyles.noDataContainer}>
                  <Text style={reportScreenStyles.noDataText}>No PDF reports generated yet</Text>
                  <Button
                    title="Debug: Check PDFs"
                    type="ghost"
                    size="small"
                    onPress={async () => {
                      await loadSavedPDFs();
                      console.log('Current PDFs state:', generatedPDFs);
                    }}
                    style={reportScreenStyles.debugButton}
                    textStyle={reportScreenStyles.debugButtonText}
                  />
                </View>
              )}
            </View>
          </>
        }
        renderItem={renderPDFItem}
        ListEmptyComponent={null}
        extraData={generatedPDFs.length}
        removeClippedSubviews={false}
        initialNumToRender={10}
      />
    </View>
  );
};

export default ReportScreen;