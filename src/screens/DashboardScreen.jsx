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
  const [showPartNumberDropdown, setShowPartNumberDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreditNameDropdown, setShowCreditNameDropdown] = useState(false);
  const [showCreditPartNumberDropdown, setShowCreditPartNumberDropdown] = useState(false);
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
        .filter(sale => sale?.date?.split('T')[0] === today)
        .reduce((total, sale) => total + (sale.quantity * sale.price), 0);

      setTodaysSales(todaysSales);

      const purchasesData = await DataService.getPurchases() || [];
      setRecentPurchases(purchasesData.length);

      const creditsData = await DataService.getCredits() || [];
      const totalCreditSales = creditsData.reduce((total, credit) => total + (credit.quantity * credit.price), 0);
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
    handleFieldChange(formType, 'name', text);
    
    if (text.length > 0) {
      const filtered = inventory.filter(item => 
        item.name.toLowerCase().includes(text.toLowerCase())
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

  const handlePartNumberSearch = (text, formType) => {
    handleFieldChange(formType, 'partNumber', text);
    
    if (text.length > 0) {
      const filtered = inventory.filter(item => 
        item.partNumber.toLowerCase().includes(text.toLowerCase())
      );
      
      if (formType === 'sale') {
        setFilteredInventory(filtered);
        setShowPartNumberDropdown(true);
      } else if (formType === 'credit') {
        setFilteredCreditInventory(filtered);
        setShowCreditPartNumberDropdown(true);
      }
    } else {
      if (formType === 'sale') {
        setShowPartNumberDropdown(false);
        setSelectedItem(null);
      } else if (formType === 'credit') {
        setShowCreditPartNumberDropdown(false);
        setSelectedCreditItem(null);
      }
    }
  };

  const selectInventoryItem = (item, formType) => {
    if (formType === 'sale') {
      setSelectedItem(item);
      handleFieldChange(formType, 'name', item.name);
      handleFieldChange(formType, 'partNumber', item.partNumber);
      handleFieldChange(formType, 'price', item.price.toString());
      setShowNameDropdown(false);
      setShowPartNumberDropdown(false);
      setFilteredInventory([]);
    } else if (formType === 'credit') {
      setSelectedCreditItem(item);
      handleFieldChange(formType, 'name', item.name);
      handleFieldChange(formType, 'partNumber', item.partNumber);
      handleFieldChange(formType, 'price', item.price.toString());
      setShowCreditNameDropdown(false);
      setShowCreditPartNumberDropdown(false);
      setFilteredCreditInventory([]);
    }
  };

  const validateQuantity = (quantity, formType) => {
    const currentSelectedItem = formType === 'sale' ? selectedItem : selectedCreditItem;
    
    if (!currentSelectedItem) {
      showError('Error', 'Please select an item from inventory first');
      return false;
    }
    
    const requestedQty = parseInt(quantity);
    if (requestedQty > currentSelectedItem.quantity) {
      showWarning('Insufficient Stock', `Only ${currentSelectedItem.quantity} units available in inventory`);
      return false;
    }
    handleFieldChange(formType, 'quantity', quantity);
    return true;
  };

  // Generic form field change handler
  const handleFieldChange = (formType, field, value) => {
    switch (formType) {
      case 'sale':
        setSaleItem(prev => ({ ...prev, [field]: value }));
        break;
      case 'purchase':
        setPurchaseItem(prev => ({ ...prev, [field]: value }));
        break;
      case 'credit':
        setCreditItem(prev => ({ ...prev, [field]: value }));
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
        setShowPartNumberDropdown(false);
        setFilteredInventory([]);
        break;
      case 'purchase':
        setPurchaseItem({});
        break;
      case 'credit':
        setCreditItem({});
        setSelectedCreditItem(null);
        setShowCreditNameDropdown(false);
        setShowCreditPartNumberDropdown(false);
        setFilteredCreditInventory([]);
        break;
    }
  };

  const handleSaleSubmit = async () => {
    try {
      // Validate that item exists in inventory
      const inventoryItem = inventory.find(item => 
        item.name === saleItem.name && item.partNumber === saleItem.partNumber
      );
      
      if (!inventoryItem) {
        showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
        return;
      }
      
      // Validate quantity
      if (parseInt(saleItem.quantity) > inventoryItem.quantity) {
        showWarning('Insufficient Stock', `Only ${inventoryItem.quantity} units available`);
        return;
      }
      
      await DataService.saveSale(saleItem);
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
      DataService.savePurchase(purchaseItem);
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
      // Validate that item exists in inventory (similar to sale)
      const inventoryItem = inventory.find(item => 
        item.name === creditItem.name && item.partNumber === creditItem.partNumber
      );
      
      if (!inventoryItem) {
        showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
        return;
      } 
      // Validate quantity
      if (parseInt(creditItem.quantity) > inventoryItem.quantity) {
        showWarning('Insufficient Stock', `Only ${inventoryItem.quantity} units available`);
        return;
      }
      await DataService.saveCreditSale(creditItem);
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
    { key: 'name', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'partNumber', label: 'Part Number', placeholder: 'Enter part number', required: true },
    { key: 'quantity', label: 'Quantity', placeholder: 'Enter quantity', keyboardType: 'numeric', required: true },
    { key: 'price', label: 'Price', placeholder: 'Enter price', keyboardType: 'numeric', required: true },
    { key: 'customer', label: 'Customer Name', placeholder: 'Enter customer name' },
  ];

  const purchaseFields = [
    { key: 'name', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'partNumber', label: 'Part Number', placeholder: 'Enter part number', required: true },
    { key: 'quantity', label: 'Quantity', placeholder: 'Enter quantity', keyboardType: 'numeric', required: true },
    { key: 'price', label: 'Price', placeholder: 'Enter price', keyboardType: 'numeric', required: true },
    { key: 'source', label: 'Source', placeholder: 'Enter source/supplier' },
  ];

  const creditFields = [
    { key: 'name', label: 'Item Name', placeholder: 'Enter item name', required: true },
    { key: 'partNumber', label: 'Part Number', placeholder: 'Enter part number', required: true },
    { key: 'quantity', label: 'Quantity', placeholder: 'Enter quantity', keyboardType: 'numeric', required: true },
    { key: 'price', label: 'Price', placeholder: 'Enter price', keyboardType: 'numeric', required: true },
    { key: 'customer', label: 'Customer Name', placeholder: 'Enter customer name' },
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
             formatDateOnly(credit.date),
            credit.name,
            `${formatNumberWithCommas(credit.quantity * credit.price)} Birr`,
            credit.status,
            credit.customer,
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
        onPartNumberSearch={handlePartNumberSearch}
        onSelectItem={selectInventoryItem}
        onQuantityChange={validateQuantity}
        filteredInventory={filteredInventory}
        showNameDropdown={showNameDropdown}
        showPartNumberDropdown={showPartNumberDropdown}
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
        onPartNumberSearch={handlePartNumberSearch}
        onSelectItem={selectInventoryItem}
        onQuantityChange={validateQuantity}
        filteredInventory={filteredCreditInventory}
        showNameDropdown={showCreditNameDropdown}
        showPartNumberDropdown={showCreditPartNumberDropdown}
        selectedItem={selectedCreditItem}
      />
    </View>
    </ImageBackground>
  );
}

export default DashboardScreen;