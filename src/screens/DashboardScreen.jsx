// DashboardScreen.jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ImageBackground } from 'react-native';
import { useAlert } from '../context/AlertContext';
import DataService from '../services/DataService';
import RecordPopup from '../components/RecordPopup'; // Updated import
import styles from '../styles/DashboardScreenStyles';
import Table from '../components/Table';
import Button from '../components/Button';
import { formatDateOnly, formatNumberWithCommas } from '../components/utils/formatters';
import Ionicons from 'react-native-vector-icons/Ionicons';

function DashboardScreen({ navigation }) {
  const [showSalePopup, setShowSalePopup] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  // Simplified form state management
  const [saleItem, setSaleItem] = useState({});
  const [purchaseItem, setPurchaseItem] = useState({});
  const [creditItem, setCreditItem] = useState({});
  const [inventoryCount, setInventoryCount] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState(0);
  const [creditSales, setCreditSales] = useState(0);
  const [recentCredits, setRecentCredits] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreditNameDropdown, setShowCreditNameDropdown] = useState(false);
  const [selectedCreditItem, setSelectedCreditItem] = useState(null);
  const [filteredCreditInventory, setFilteredCreditInventory] = useState([]);
  const { showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const inventoryData = await DataService.getInventory() || [];
      setInventoryCount(inventoryData.length);
      setInventory(inventoryData);

      const salesData = await DataService.getSales() || [];
      const today = new Date().toISOString().split('T')[0];

      const todaysSales = salesData
        .filter(sale => sale?.saleDate?.split('T')[0] === today)
        .reduce((total, sale) => total + (sale.totalAmount || 0), 0);

      setTodaysSales(todaysSales);

      const purchasesData = await DataService.getPurchases() || [];
      setRecentPurchases(purchasesData.length);

      const creditsData = await DataService.getCredits() || [];
      const totalCreditSales = creditsData.reduce((total, credit) => total + (credit.totalAmount || 0), 0);
      setCreditSales(totalCreditSales);

      setRecentCredits(creditsData.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setTodaysSales(0);
      setRecentPurchases(0);
      setInventoryCount(0);
      setCreditSales(0);
      setRecentCredits([]);
      setInventory([]);
    }
  };

  const handleNameSearch = (text, formType) => {
    handleFieldChange(formType, 'itemName', text);
    
    if (text.length > 0) {
      const filtered = inventory.filter(item => 
       item.itemName && item.itemName.toLowerCase().includes(text.toLowerCase()) 
      );
      
      if (formType === 'sale') {
        setFilteredInventory(filtered);
        setShowNameDropdown(true);
      } else if (formType === 'credit') {
        setFilteredCreditInventory(filtered);
        setShowCreditNameDropdown(true);
      }
    } else {
      if (formType === 'sale') {
        setShowNameDropdown(false);
        setSelectedItem(null);
      } else if (formType === 'credit') {
        setShowCreditNameDropdown(false);
        setSelectedCreditItem(null);
      }
    }
  };

 const selectInventoryItem = (item, formType) => {
  if (formType === 'sale') {
    setSelectedItem(item);
    const updatedItem = {
      itemName: item.itemName,
      itemCode: item.itemCode || '',
      quantityPerCarton: item.quantityPerCarton?.toString() || '',
      pricePerPiece: item.pricePerPiece?.toString() || '',
      pricePerCarton: item.pricePerCarton?.toString() || '',
      cartonQuantity: '1'
    };
    setSaleItem(updatedItem);
    setShowNameDropdown(false);
    setFilteredInventory([]);
  } else if (formType === 'credit') {
    setSelectedCreditItem(item);
    const updatedItem = {
      itemName: item.itemName,
      itemCode: item.itemCode || '',
      quantityPerCarton: item.quantityPerCarton?.toString() || '',
      pricePerPiece: item.pricePerPiece?.toString() || '',
      cartonQuantity: '1'
    };
    setCreditItem(updatedItem);
    setShowCreditNameDropdown(false);
    setFilteredCreditInventory([]);
  }
};

  const calculateTotals = (formType, field, value) => {
  const currentItem = formType === 'sale' ? saleItem : (formType === 'credit' ? creditItem : purchaseItem);
  let updatedItem = { ...currentItem };

  // Update the changed field first
  updatedItem[field] = value;

  // Calculate totalQuantity when cartonQuantity or quantityPerCarton changes
  if (field === 'cartonQuantity' || field === 'quantityPerCarton') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    updatedItem.totalQuantity = (cartons * perCarton).toString();
  }

  // Calculate totalAmount for sales and credits
  if (formType === 'sale' || formType === 'credit') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    const pricePerCarton = parseFloat(updatedItem.pricePerCarton) || 0;
    const pricePerPiece = parseFloat(updatedItem.pricePerPiece) || 0;
    
    // Calculate based on which price is available
    if (pricePerCarton > 0) {
      updatedItem.totalAmount = (cartons * pricePerCarton).toString();
    } else if (pricePerPiece > 0 && perCarton > 0) {
      updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
      updatedItem.pricePerCarton = (perCarton * pricePerPiece).toString();
    }
  }

  // Calculate totalAmount for purchases
  if (formType === 'purchase') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const pricePerCarton = parseFloat(updatedItem.purchasePricePerCarton) || 0;
    const pricePerPiece = parseFloat(updatedItem.purchasePricePerPiece) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    
    if (pricePerCarton > 0) {
      updatedItem.totalAmount = (cartons * pricePerCarton).toString();
    } else if (pricePerPiece > 0 && perCarton > 0) {
      updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
      updatedItem.purchasePricePerCarton = (perCarton * pricePerPiece).toString();
    }
  }

  // Calculate remaining balance for credits
  if (formType === 'credit' && (field === 'totalAmount' || field === 'amountPaid')) {
    const total = parseFloat(updatedItem.totalAmount) || 0;
    const paid = parseFloat(updatedItem.amountPaid) || 0;
    updatedItem.remainingBalance = (total - paid).toString();
  }

  // Update the appropriate state
  switch (formType) {
    case 'sale':
      setSaleItem(updatedItem);
      break;
    case 'purchase':
      setPurchaseItem(updatedItem);
      break;
    case 'credit':
      setCreditItem(updatedItem);
      break;
  }
};

  const validateQuantity = (quantity, formType) => {
  // Get the correct selected item based on form type
  const currentSelectedItem = formType === 'sale' ? selectedItem : selectedCreditItem;
  
  // Get the current form data
  const currentFormData = formType === 'sale' ? saleItem : 
                         formType === 'credit' ? creditItem : 
                         purchaseItem;

  // Skip inventory validation for purchases
  if (formType === 'purchase') {
    // Just update the form data with calculations
    const updatedItem = calculateTotals(formType, 'cartonQuantity', quantity);
    setPurchaseItem(updatedItem);
    return true;
  }

  // Check if we have a selected item AND the item name matches (for sales and credits)
  const hasValidSelection = currentSelectedItem && 
                          currentFormData.itemName && 
                          currentSelectedItem.itemName === currentFormData.itemName;

  if ((formType === 'sale' || formType === 'credit') && !hasValidSelection) {
    showError('Error', 'Please select an item from inventory first');
    return false;
  }

  if (hasValidSelection) {
    const requestedCartons = parseInt(quantity) || 0;
    
    // Validate carton quantity doesn't exceed inventory
    if (requestedCartons > currentSelectedItem.cartonQuantity) {
      showWarning('Insufficient Stock', `Only ${currentSelectedItem.cartonQuantity} cartons available in inventory`);
      return false;
    }
    
    // Validate quantity per carton if it exists in form data
    if (formType === 'sale' && currentFormData.quantityPerCarton) {
      const requestedPerCarton = parseInt(currentFormData.quantityPerCarton) || 0;
      if (requestedPerCarton > currentSelectedItem.quantityPerCarton) {
        showWarning('Invalid Quantity', `This item has ${currentSelectedItem.quantityPerCarton} pieces per carton in inventory`);
        return false;
      }
    }
  }
  
  // Update the form data with calculations
  const updatedItem = calculateTotals(formType, 'cartonQuantity', quantity);
  
  switch (formType) {
    case 'sale':
      setSaleItem(updatedItem);
      break;
    case 'credit':
      setCreditItem(updatedItem);
      break;
    case 'purchase':
      setPurchaseItem(updatedItem);
      break;
  }
  
  return true;
};

const validateQuantityPerCarton = (quantity, formType) => {
  // Skip validation for purchases
  if (formType === 'purchase') {
    return true;
  }

  const currentSelectedItem = formType === 'sale' ? selectedItem : selectedCreditItem;
  const currentFormData = formType === 'sale' ? saleItem : creditItem;

  if (!currentSelectedItem || !currentFormData.itemName) {
    showError('Error', 'Please select an item from inventory first');
    return false;
  }

  const requestedPerCarton = parseInt(quantity) || 0;
  const inventoryPerCarton = currentSelectedItem.quantityPerCarton || 0;
  
  if (requestedPerCarton > inventoryPerCarton) {
    showWarning('Note', `Inventory has ${inventoryPerCarton} pieces per carton, but you can enter a different value`);
  }

  return true;
};
  // Generic form field change handler
 const handleFieldChange = (formType, field, value) => {
  // First update the field value
  let updatedItem;
  
  switch (formType) {
    case 'sale':
      updatedItem = {...saleItem, [field]: value};
      setSaleItem(updatedItem);
      break;
    case 'purchase':
      updatedItem = {...purchaseItem, [field]: value};
      setPurchaseItem(updatedItem);
      break;
    case 'credit':
      updatedItem = {...creditItem, [field]: value};
      setCreditItem(updatedItem);
      break;
  }

  // For purchase form, we don't need to validate against inventory
  if (formType === 'purchase') {
    // Calculate totals for any field change that might affect calculations
    if (['cartonQuantity', 'quantityPerCarton', 'purchasePricePerCarton'].includes(field)) {
      calculateTotals(formType, field, value);
    }
    return;
  }

  // For sale and credit forms, run the validations
  if (field === 'cartonQuantity') {
    validateQuantity(value, formType);
  } else if (field === 'quantityPerCarton') {
    validateQuantityPerCarton(value, formType);
    const cartonQty = formType === 'sale' ? saleItem.cartonQuantity : 
                     creditItem.cartonQuantity;
    validateQuantity(cartonQty || '0', formType);
  } else if (['pricePerCarton', 'pricePerPiece'].includes(field)) {
    // Calculate totals when price fields change
    calculateTotals(formType, field, value);
  }

  // Always calculate totals after changes for relevant fields
  if (['cartonQuantity', 'quantityPerCarton', 'pricePerCarton', 'pricePerPiece'].includes(field)) {
    calculateTotals(formType, field, value);
  }
};
  // Generic form reset
  const resetForm = (formType) => {
    switch (formType) {
      case 'sale':
        setSaleItem({});
        setSelectedItem(null);
        setShowNameDropdown(false);
        setFilteredInventory([]);
        break;
      case 'purchase':
        setPurchaseItem({});
        break;
      case 'credit':
        setCreditItem({});
        setSelectedCreditItem(null);
        setShowCreditNameDropdown(false);
        setFilteredCreditInventory([]);
        break;
    }
  };

const handleSaleSubmit = async () => {
  try {
    if (!selectedItem || !saleItem.itemName) {
      showError('Error', 'Please select an item from inventory first');
      return;
    }

    const inventoryItem = inventory.find(item => 
      item.itemName === saleItem.itemName
    );
    
    if (!inventoryItem) {
      showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
      return;
    }
    
    if (parseInt(saleItem.cartonQuantity) > inventoryItem.cartonQuantity) {
      showWarning('Insufficient Stock', `Only ${inventoryItem.cartonQuantity} cartons available`);
      return;
    }

    if (parseInt(saleItem.quantityPerCarton) > inventoryItem.quantityPerCarton) {
      showWarning('Invalid Quantity', `This item has ${inventoryItem.quantityPerCarton} pieces per carton in inventory`);
      return;
    }
    
    const saleData = {
      ...saleItem,
      saleDate: saleItem.saleDate || new Date().toISOString()
    };
    
    await DataService.saveSale(saleData);
    setShowSalePopup(false);
    resetForm('sale');
    loadDashboardData();
    showSuccess('Success', 'Sale recorded successfully');
  } catch (error) {
    showError('Error', error.message);
  }
};

  const handlePurchaseSubmit = async () => {
  try {
    const purchaseData = {
      ...purchaseItem,
      purchaseDate: purchaseItem.purchaseDate || new Date().toISOString()
    };
    
    // First save the purchase record
    await DataService.savePurchase(purchaseData);
    
    // Then update inventory
    const inventoryItem = {
      itemName: purchaseData.itemName,
      itemCode: purchaseData.itemCode || '', // Add this line
      cartonQuantity: parseInt(purchaseData.cartonQuantity) || 0,
      quantityPerCarton: parseInt(purchaseData.quantityPerCarton) || 0,
      totalQuantity: (parseInt(purchaseData.cartonQuantity) * parseInt(purchaseData.quantityPerCarton)) || 0,
      pricePerPiece: parseFloat(purchaseData.purchasePricePerPiece) || 0,
      pricePerCarton: parseFloat(purchaseData.purchasePricePerCarton) || 0,
      purchasePricePerPiece: parseFloat(purchaseData.purchasePricePerPiece) || 0,
      purchasePricePerCarton: parseFloat(purchaseData.purchasePricePerCarton) || 0,
      bulkUnit: 'Carton', // Add this line
      source: purchaseData.source || 'Manual Purchase',
      lastPurchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
      minStockAlert: null // Add this line
    };
    
    // Check if item already exists in inventory
    const existingItemIndex = inventory.findIndex(item => item.itemName === inventoryItem.itemName);
    
    if (existingItemIndex !== -1) {
      // Update existing item
      const existingItem = inventory[existingItemIndex];
      const updatedItem = {
        ...existingItem,
        cartonQuantity: existingItem.cartonQuantity + inventoryItem.cartonQuantity,
        totalQuantity: existingItem.totalQuantity + inventoryItem.totalQuantity,
        pricePerPiece: inventoryItem.pricePerPiece, // Update prices
        pricePerCarton: inventoryItem.pricePerCarton,
        purchasePricePerPiece: inventoryItem.purchasePricePerPiece,
        purchasePricePerCarton: inventoryItem.purchasePricePerCarton,
        lastPurchaseDate: inventoryItem.lastPurchaseDate
      };
      await DataService.saveInventoryItem(updatedItem);
    } else {
      // Add new item
      await DataService.saveInventoryItem(inventoryItem);
    }
    
    setShowPurchasePopup(false);
    resetForm('purchase');
    await loadDashboardData(); // Make this await to ensure data is loaded
    showSuccess('Success', 'Purchase recorded and inventory updated successfully');
  } catch (error) {
    console.error('Purchase submit error:', error); // Add error logging
    showError('Error', error.message);
  }
};

 const handleCreditSubmit = async () => {
  try {
    // Validate that item exists in inventory
    const inventoryItem = inventory.find(item => 
      item.itemName === creditItem.itemName  // Changed from item.name
    );
    
    if (!inventoryItem) {
      showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
      return;
    } 
    
    // Validate quantity
    if (parseInt(creditItem.cartonQuantity) > inventoryItem.cartonQuantity) {  // Changed from .quantity
      showWarning('Insufficient Stock', `Only ${inventoryItem.cartonQuantity} cartons available`);
      return;
    }
    
    // Set current date and payment status if not provided
    const creditData = {
      ...creditItem,
      creditDate: creditItem.creditDate || new Date().toISOString(),
      paymentStatus: creditItem.paymentStatus || 'Unpaid'
    };
    
    await DataService.saveCreditSale(creditData);
    setShowCreditPopup(false);
    resetForm('credit');
    loadDashboardData();
    showSuccess('Success', 'Credit sale recorded successfully');
  } catch (error) {
    showError('Error', error.message);
  }
};

  // Form field configurations
  const saleFields = [
    { key: 'itemName', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'itemCode', label: 'Item Code', placeholder: 'Auto-filled from inventory', editable: false },
    { key: 'cartonQuantity', label: 'Carton Quantity', placeholder: 'Enter number of cartons', keyboardType: 'numeric', required: true },
    { key: 'quantityPerCarton', label: 'Quantity Per Carton', placeholder: 'Items per carton', keyboardType: 'numeric', required: true },
    { key: 'totalQuantity', label: 'Total Quantity (Pieces)', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'pricePerPiece', label: 'Price Per Piece', placeholder: 'Enter price per piece', keyboardType: 'numeric', required: true },
    { key: 'pricePerCarton', label: 'Price Per Carton', placeholder: 'Enter price per carton', keyboardType: 'numeric', required: true },
    { key: 'totalAmount', label: 'Total Amount', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'plateNumber', label: 'Plate Number', placeholder: 'Vehicle plate number' },
    { key: 'place', label: 'Place', placeholder: 'Sale/delivery location' },
    { key: 'paymentMethod', label: 'Payment Method', placeholder: 'Cash/Credit/Transfer' },
  ];

  const purchaseFields = [
  // Basic Item Information
  { key: 'itemName', label: 'Item Name', placeholder: 'Enter item name', required: true },
  { key: 'itemCode', label: 'Item Code', placeholder: 'Enter item code (optional)' },
  
  // Quantity Information
  { key: 'cartonQuantity', label: 'Carton Quantity', placeholder: 'Enter number of cartons', keyboardType: 'numeric', required: true },
  { key: 'quantityPerCarton', label: 'Quantity Per Carton', placeholder: 'Items per carton', keyboardType: 'numeric', required: true },
  { key: 'totalQuantity', label: 'Total Quantity (Pieces)', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
  
  // Purchase Pricing (what you pay to supplier)
  { key: 'purchasePricePerPiece', label: 'Purchase Price Per Piece', placeholder: 'Enter purchase price per piece', keyboardType: 'numeric', required: true },
  { key: 'purchasePricePerCarton', label: 'Purchase Price Per Carton', placeholder: 'Enter purchase price per carton', keyboardType: 'numeric', required: true },
  { key: 'totalAmount', label: 'Total Purchase Amount', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
  
  // Additional Information
  { key: 'source', label: 'Source/Supplier', placeholder: 'Supplier name or origin', required: true },
  { key: 'bulkUnit', label: 'Bulk Unit', placeholder: 'e.g., Carton, Box, Pack', defaultValue: 'Carton' },
  { key: 'minStockAlert', label: 'Minimum Stock Alert', placeholder: 'Alert when cartons fall below this number', keyboardType: 'numeric' },
  ];

  const creditFields = [
    { key: 'itemName', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'itemCode', label: 'Item Code', placeholder: 'Auto-filled from inventory', editable: false },
    { key: 'cartonQuantity', label: 'Carton Quantity', placeholder: 'Enter number of cartons', keyboardType: 'numeric', required: true },
    { key: 'quantityPerCarton', label: 'Quantity Per Carton', placeholder: 'Items per carton', keyboardType: 'numeric', required: true },
    { key: 'totalQuantity', label: 'Total Quantity (Pieces)', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'pricePerPiece', label: 'Price Per Piece', placeholder: 'Enter price per piece', keyboardType: 'numeric', required: true },
    { key: 'totalAmount', label: 'Total Amount', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'amountPaid', label: 'Amount Paid', placeholder: 'Upfront payment', keyboardType: 'numeric' },
    { key: 'remainingBalance', label: 'Remaining Balance', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: true },
    { key: 'customerName', label: 'Customer Name', placeholder: 'Enter customer name', required: true },
    { key: 'phoneNumber', label: 'Phone Number', placeholder: 'Customer contact' },
    { key: 'plateNumber', label: 'Plate Number', placeholder: 'Vehicle plate number' },
    { key: 'place', label: 'Place', placeholder: 'Delivery/sale location' },
    { key: 'paymentStatus', label: 'Payment Status', placeholder: 'Unpaid/Partially Paid/Paid' },
    { key: 'dueDate', label: 'Due Date', placeholder: 'Expected payment date' },
    { key: 'notes', label: 'Notes', placeholder: 'Custom remarks' },
  ];

  return (
    <ImageBackground
      source={require('../components/images/judas.jpg')} // or use a URI
      style={styles.container}
      imageStyle={{ opacity: 0.3 }}
    >
    <View style = {{ flex: 1}}>
    <ScrollView style={styles.containerTwo} contentContainerStyle={{ paddingBottom : 100}}>
      <View style={styles.summary}>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cube-outline" size={18} color="#333" style={styles.icon} />
            <Text style={styles.cardTitle}>Total Inventory</Text>
          </View>
          <Text style={styles.cardText}>{formatNumberWithCommas(inventoryCount)} items</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cash-outline" size={18} color="#333" style={styles.icon} />
            <Text style={styles.cardTitle}>Today's Sales</Text>
          </View>
          <Text style={styles.cardText}>{formatNumberWithCommas(todaysSales)} Birr</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cart-outline" size={18} color="#333" style={styles.icon} />
            <Text style={styles.cardTitle}>Recent Purchases</Text>
          </View>
          <Text style={styles.cardText}>{formatNumberWithCommas(recentPurchases)} orders</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="receipt-outline" size={18} color="#333" style={styles.icon} />
            <Text style={styles.cardTitle}>Credit Sales</Text>
          </View>
          <Text style={styles.cardText}>{formatNumberWithCommas(creditSales)} Birr</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Credit Sales</Text>
        <Table
          headers={['Date', 'Item', 'Amount', 'Status', 'Customer',]}
          data={recentCredits.map((credit) => [
             formatDateOnly(credit.creditDate),
            credit.itemName,
            `${formatNumberWithCommas(credit.totalAmount)} Birr`,
            credit.paymentStatus,
            credit.customerName,
          ])}
          noDataMessage="No recent credit sales"
        />
      </View>
          </ScrollView>
      <View style={styles.fixedBottomActions}>
      
        <Button
          type="gradient"
          size="medium"
          title="New Sale"
          onPress={() => setShowSalePopup(true)}
        />
        <Button
          type="gradient"
          size="medium"
          title="New Purchase"
          
          onPress={() => setShowPurchasePopup(true)}
        />
        <Button
          type="gradient"
          size="medium"
          title="Credit Sale"
          onPress={() => setShowCreditPopup(true)}
         
        />
      </View>

      {/* Sale Popup */}
      <RecordPopup
        visible={showSalePopup}
        onClose={() => {
          setShowSalePopup(false);
          resetForm('sale');
        }}
        title="New Sale"
        fields={saleFields}
        formData={saleItem}
        onFieldChange={(field, value) => handleFieldChange('sale', field, value)}
        onSubmit={handleSaleSubmit}
        submitButtonText="Record Sale"
        formType="sale"
        onNameSearch={handleNameSearch}
        onSelectItem={selectInventoryItem}
        onQuantityChange={(value) => validateQuantity(value, 'sale')}
        filteredInventory={filteredInventory}
        showNameDropdown={showNameDropdown}
        selectedItem={selectedItem}
      />

      {/* Purchase Popup */}
      <RecordPopup
        visible={showPurchasePopup}
        onClose={() => {
          setShowPurchasePopup(false);
          resetForm('purchase');
        }}
        title="New Purchase"
        fields={purchaseFields}
        formData={purchaseItem}
        onFieldChange={(field, value) => handleFieldChange('purchase', field, value)}
        onSubmit={handlePurchaseSubmit}
        submitButtonText="Record Purchase"
        formType="purchase"
      />

      {/* Credit Sale Popup */}
      <RecordPopup
        visible={showCreditPopup}
        onClose={() => {
          setShowCreditPopup(false);
          resetForm('credit');
        }}
        title="New Credit Sale"
        fields={creditFields}
        formData={creditItem}
        onFieldChange={(field, value) => handleFieldChange('credit', field, value)}
        onSubmit={handleCreditSubmit}
        submitButtonText="Record Credit Sale"
        formType="credit"
        onNameSearch={handleNameSearch}
        onSelectItem={selectInventoryItem}
        onQuantityChange={validateQuantity}
        filteredInventory={filteredCreditInventory}
        showNameDropdown={showCreditNameDropdown}
        selectedItem={selectedCreditItem}
      />
    </View>
    </ImageBackground>
  );
}

export default DashboardScreen;