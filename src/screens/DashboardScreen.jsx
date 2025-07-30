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
    handleFieldChange(formType, 'itemName', item.itemName);  // Changed from item.name
    handleFieldChange(formType, 'quantityPerCarton', item.quantityPerCarton?.toString() || '');
    handleFieldChange(formType, 'pricePerPiece', item.pricePerPiece?.toString() || '');
    handleFieldChange(formType, 'pricePerCarton', item.pricePerCarton?.toString() || '');
    setShowNameDropdown(false);
    setFilteredInventory([]);
  } else if (formType === 'credit') {
    setSelectedCreditItem(item);
    handleFieldChange(formType, 'itemName', item.itemName);  // Changed from item.name
    handleFieldChange(formType, 'quantityPerCarton', item.quantityPerCarton?.toString() || '');
    handleFieldChange(formType, 'pricePerPiece', item.pricePerPiece?.toString() || '');
    setShowCreditNameDropdown(false);
    setFilteredCreditInventory([]);
  }
};

  const calculateTotals = (formType, field, value) => {
    const currentItem = formType === 'sale' ? saleItem : (formType === 'credit' ? creditItem : purchaseItem);
    let updatedItem = { ...currentItem, [field]: value };

    // Calculate totalQuantity when cartonQuantity or quantityPerCarton changes
    if (field === 'cartonQuantity' || field === 'quantityPerCarton') {
      const cartons = parseInt(updatedItem.cartonQuantity) || 0;
      const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
      updatedItem.totalQuantity = (cartons * perCarton).toString();
    }

    // Calculate totalAmount for sales and credits
    if (formType === 'sale' || formType === 'credit') {
      if (field === 'cartonQuantity' || field === 'pricePerCarton') {
        const cartons = parseInt(updatedItem.cartonQuantity) || 0;
        const pricePerCarton = parseFloat(updatedItem.pricePerCarton) || 0;
        updatedItem.totalAmount = (cartons * pricePerCarton).toString();
      }
    }

    // Calculate totalAmount for purchases
    if (formType === 'purchase') {
      if (field === 'cartonQuantity' || field === 'purchasePricePerCarton') {
        const cartons = parseInt(updatedItem.cartonQuantity) || 0;
        const pricePerCarton = parseFloat(updatedItem.purchasePricePerCarton) || 0;
        updatedItem.totalAmount = (cartons * pricePerCarton).toString();
      }
    }

    // Calculate remaining balance for credits
    if (formType === 'credit' && (field === 'totalAmount' || field === 'amountPaid')) {
      const total = parseFloat(updatedItem.totalAmount) || 0;
      const paid = parseFloat(updatedItem.amountPaid) || 0;
      updatedItem.remainingBalance = (total - paid).toString();
    }

    return updatedItem;
  };

  const validateQuantity = (quantity, formType) => {
  const currentSelectedItem = formType === 'sale' ? selectedItem : selectedCreditItem;
  
  if (!currentSelectedItem && (formType === 'sale' || formType === 'credit')) {
    showError('Error', 'Please select an item from inventory first');
    return false;
  }
  
  if (currentSelectedItem) {
    const requestedQty = parseInt(quantity);
    if (requestedQty > currentSelectedItem.cartonQuantity) {  // Changed from .quantity
      showWarning('Insufficient Stock', `Only ${currentSelectedItem.cartonQuantity} cartons available in inventory`);
      return false;
    }
  }
  
  const updatedItem = calculateTotals(formType, 'cartonQuantity', quantity);
  
  switch (formType) {
    case 'sale':
      setSaleItem(updatedItem);
      break;
    case 'credit':
      setCreditItem(updatedItem);
      break;
  }
  
  return true;
};

  // Generic form field change handler
  const handleFieldChange = (formType, field, value) => {
    const updatedItem = calculateTotals(formType, field, value);
    
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
    const inventoryItem = inventory.find(item => 
      item.itemName === saleItem.itemName  // Changed from item.name
    );
    
    if (!inventoryItem) {
      showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
      return;
    }
    
    if (parseInt(saleItem.cartonQuantity) > inventoryItem.cartonQuantity) {  // Changed from .quantity
      showWarning('Insufficient Stock', `Only ${inventoryItem.cartonQuantity} cartons available`);
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

  const handlePurchaseSubmit = () => {
    try {
      // Set current date if not provided
      const purchaseData = {
        ...purchaseItem,
        purchaseDate: purchaseItem.purchaseDate || new Date().toISOString()
      };
      
      DataService.savePurchase(purchaseData);
      setShowPurchasePopup(false);
      resetForm('purchase');
      loadDashboardData();
      showSuccess('Success', 'Purchase recorded successfully');
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const handleCreditSubmit = async () => {
    try {
      // Validate that item exists in inventory
      const inventoryItem = inventory.find(item => 
        item.name === creditItem.itemName
      );
      
      if (!inventoryItem) {
        showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
        return;
      } 
      
      // Validate quantity
      if (parseInt(creditItem.cartonQuantity) > inventoryItem.quantity) {
        showWarning('Insufficient Stock', `Only ${inventoryItem.quantity} cartons available`);
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
    { key: 'itemName', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'cartonQuantity', label: 'Carton Quantity', placeholder: 'Enter number of cartons', keyboardType: 'numeric', required: true },
    { key: 'quantityPerCarton', label: 'Quantity Per Carton', placeholder: 'Items per carton', keyboardType: 'numeric', required: true },
    { key: 'totalQuantity', label: 'Total Quantity (Pieces)', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'purchasePricePerPiece', label: 'Purchase Price Per Piece', placeholder: 'Enter purchase price per piece', keyboardType: 'numeric', required: true },
    { key: 'purchasePricePerCarton', label: 'Purchase Price Per Carton', placeholder: 'Enter purchase price per carton', keyboardType: 'numeric', required: true },
    { key: 'totalAmount', label: 'Total Amount', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'source', label: 'Source', placeholder: 'Supplier/origin' },
  ];

  const creditFields = [
    { key: 'itemName', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'cartonQuantity', label: 'Carton Quantity', placeholder: 'Enter number of cartons', keyboardType: 'numeric', required: true },
    { key: 'quantityPerCarton', label: 'Quantity Per Carton', placeholder: 'Items per carton', keyboardType: 'numeric', required: true },
    { key: 'totalQuantity', label: 'Total Quantity (Pieces)', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'pricePerPiece', label: 'Price Per Piece', placeholder: 'Enter price per piece', keyboardType: 'numeric', required: true },
    { key: 'totalAmount', label: 'Total Amount', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
    { key: 'amountPaid', label: 'Amount Paid', placeholder: 'Upfront payment', keyboardType: 'numeric' },
    { key: 'remainingBalance', label: 'Remaining Balance', placeholder: 'Auto-calculated', keyboardType: 'numeric', editable: false },
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
        onQuantityChange={validateQuantity}
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