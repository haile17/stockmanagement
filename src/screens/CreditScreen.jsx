import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
  ImageBackground
} from 'react-native';
import Button from '../components/Button';
import { CustomModal } from '../components/CustomModal';
import DataService from '../services/DataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/Sales'; // Reusing the same styles
import { useAlert } from '../context/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CreditScreen() {
  const [credits, setCredits] = useState([]);
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [creditToReturn, setCreditToReturn] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showError, showSuccess } = useAlert();
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date'); // date, customer, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  
  // Statistics
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [todaysAmount, setTodaysAmount] = useState(0);

   const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadSelectedDatabase = async () => {
      try {
        const storedDatabase = await AsyncStorage.getItem('selectedInventoryDatabase');
        if (storedDatabase) {
          setSelectedDatabase(JSON.parse(storedDatabase));
        }
      } catch (error) {
        console.error('Error loading database:', error);
      }
    };
    loadSelectedDatabase();
  }, []);

  useEffect(() => {
    loadCredits();
  }, [selectedDatabase]);

  useEffect(() => {
    filterAndSortCredits();
  }, [credits, searchQuery, dateFilter, sortBy, sortOrder]);

  const loadCredits = async () => {
    try {
      let creditsData = await DataService.getCredits() || [];

      if (selectedDatabase) {
        creditsData = creditsData.filter(credit => credit.databaseId === selectedDatabase.id);
      }

      setCredits(creditsData);
      calculateStatistics(creditsData);
    } catch (error) {
      console.error('Error loading credits:', error);
      showError('Error', 'Failed to load credit sales data');
    }
  };

 const calculateStatistics = (creditsData) => {
  const total = creditsData.length;
  // Updated to use correct field names and calculation method
  const totalAmt = creditsData.reduce((sum, credit) => {
    const amount = parseFloat(credit.totalAmount) || 
                  (parseInt(credit.cartonQuantity || 0) * parseFloat(credit.pricePerCarton || 0)) ||
                  (parseInt(credit.totalQuantity || 0) * parseFloat(credit.pricePerPiece || 0));
    return sum + amount;
  }, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayAmt = creditsData
    .filter(credit => credit.creditDate && credit.creditDate.split('T')[0] === today) // Updated field name
    .reduce((sum, credit) => {
      const amount = parseFloat(credit.totalAmount) || 
                    (parseInt(credit.cartonQuantity || 0) * parseFloat(credit.pricePerCarton || 0)) ||
                    (parseInt(credit.totalQuantity || 0) * parseFloat(credit.pricePerPiece || 0));
      return sum + amount;
    }, 0);

  setTotalCredits(total);
  setTotalAmount(totalAmt);
  setTodaysAmount(todayAmt);
};

  const filterAndSortCredits = () => {
  let filtered = [...credits];

  // Apply search filter - Handle both old and new field names
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(credit => 
      (credit.itemName && credit.itemName.toLowerCase().includes(query)) ||
      (credit.name && credit.name.toLowerCase().includes(query)) || // Fallback for old data
      (credit.itemCode && credit.itemCode.toLowerCase().includes(query)) ||
      (credit.partNumber && credit.partNumber.toLowerCase().includes(query)) || // Fallback for old data
      (credit.customerName && credit.customerName.toLowerCase().includes(query)) ||
      (credit.customer && credit.customer.toLowerCase().includes(query)) // Fallback for old data
    );
  }

  // Apply date filter - Handle both old and new field names
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  switch (dateFilter) {
    case 'today':
      filtered = filtered.filter(credit => {
        const creditDate = new Date(credit.creditDate || credit.date);
        return creditDate >= today;
      });
      break;
    case 'week':
      filtered = filtered.filter(credit => {
        const creditDate = new Date(credit.creditDate || credit.date);
        return creditDate >= weekAgo;
      });
      break;
    case 'month':
      filtered = filtered.filter(credit => {
        const creditDate = new Date(credit.creditDate || credit.date);
        return creditDate >= monthAgo;
      });
      break;
  }

  // Apply sorting - Handle both old and new field names
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'customer':
        aValue = (a.customerName || a.customer || '').toLowerCase();
        bValue = (b.customerName || b.customer || '').toLowerCase();
        break;
      case 'amount':
        aValue = parseFloat(a.totalAmount) || 
                (parseInt(a.cartonQuantity || a.quantity || 0) * parseFloat(a.pricePerCarton || a.price || 0)) ||
                (parseInt(a.totalQuantity || 0) * parseFloat(a.pricePerPiece || 0));
        bValue = parseFloat(b.totalAmount) || 
                (parseInt(b.cartonQuantity || b.quantity || 0) * parseFloat(b.pricePerCarton || b.price || 0)) ||
                (parseInt(b.totalQuantity || 0) * parseFloat(b.pricePerPiece || 0));
        break;
      case 'date':
      default:
        aValue = new Date(a.creditDate || a.date);
        bValue = new Date(b.creditDate || b.date);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  setFilteredCredits(filtered);
};
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCredits();
    setRefreshing(false);
  };

  const formatNumberWithCommas = (num) => {
    if (num == null || isNaN(num)) return '0';
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Add this new function after handleConfirm
const handleMarkAsPaid = async (credit) => {
  try {
    await DataService.transferCreditToSale(credit.id);
    showSuccess('Success', 'Credit sale marked as paid and moved to sales records.');
    await loadCredits();
  } catch (error) {
    showError('Error', 'Failed to mark credit as paid: ' + error.message);
  }
};
 const handleReturn = (credit) => {
  setCreditToReturn(credit);
  // Updated to use correct field names and calculation
  const creditAmount = parseFloat(credit.totalAmount) || 
                      (parseInt(credit.cartonQuantity || 0) * parseFloat(credit.pricePerCarton || 0)) ||
                      (parseInt(credit.totalQuantity || 0) * parseFloat(credit.pricePerPiece || 0));
  
  setModalMessage(
    `Are you sure you want to return this credit sale?\n\n` +
    `Item: ${credit.itemName || 'N/A'}\n` + // Changed from 'name'
    `Quantity: ${credit.cartonQuantity || credit.totalQuantity || 0}\n` + // Updated quantity field
    `Amount: ${formatNumberWithCommas(creditAmount)} Birr\n` +
    `Customer: ${credit.customerName || 'N/A'}\n\n` + // Changed from 'customer'
    `This will add the items back to inventory.`
  );
  setIsModalOpen(true);
};

  const handleConfirm = async () => {
    if (creditToReturn) {
      try {
        await DataService.returnCreditSale(creditToReturn.id);
        showSuccess('Success', 'Credit sale returned successfully. Items added back to inventory.');
        await loadCredits();
        setCreditToReturn(null);
      } catch (error) {
        showError('Error', 'Failed to return credit sale: ' + error.message);
      }
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCreditToReturn(null);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const renderFilterButton = (label, value, currentValue, onPress) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentValue === value && styles.filterButtonActive
      ]}
      onPress={() => onPress(value)}
    >
      <Text style={[
        styles.filterButtonText,
        currentValue === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCreditItem = ({ item, index }) => {
  // Updated to calculate amount correctly and use proper field names
  const creditAmount = parseFloat(item.totalAmount) || 
                      (parseInt(item.cartonQuantity || 0) * parseFloat(item.pricePerCarton || 0)) ||
                      (parseInt(item.totalQuantity || 0) * parseFloat(item.pricePerPiece || 0));
  
  return (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleDate}>{formatDate(item.creditDate || item.date) || 'No Date'}</Text>
        <Text style={styles.saleAmount}>
          {formatNumberWithCommas(creditAmount) || '0'} Birr
        </Text>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Text style={styles.itemName}>{item.itemName || 'N/A'}</Text>
          <Text style={styles.itemDetails}>
            Code: {item.itemCode || 'N/A'} | Qty: {formatNumberWithCommas(item.cartonQuantity || item.totalQuantity || 0)}
          </Text>
          <Text style={styles.itemPrice}>
            Price: {formatNumberWithCommas(item.pricePerPiece || item.pricePerCarton || 0)} Birr
          </Text>
          {(item.customerName || item.customer) && (
            <Text style={styles.customerName}>Customer: {item.customerName || item.customer}</Text>
          )}
          <Text style={[styles.customerName, { color: '#FF9500' }]}>
            Status: {item.paymentStatus || item.status || 'Pending'}
          </Text>
          {item.remainingBalance && parseFloat(item.remainingBalance) > 0 && (
            <Text style={[styles.customerName, { color: '#FF3B30' }]}>
              Balance: {formatNumberWithCommas(item.remainingBalance)} Birr
            </Text>
          )}
        </View>
        
        <View style={styles.saleActions}>
          <Button
            type="primary"
            size="xs"
            title="Mark Paid"
            onPress={() => handleMarkAsPaid(item)}
            style={[styles.returnButton, { marginRight: 8 }]}
          />
          <Button
            type="danger"
            size="xs"
            title="Return"
            onPress={() => handleReturn(item)}
            style={styles.returnButton}
          />
        </View>
      </View>
    </View>
  );
};

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No credit sales found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery || dateFilter !== 'all' 
          ? 'Try adjusting your filters'
          : 'Credit sales will appear here once recorded'
        }
      </Text>
      {(searchQuery || dateFilter !== 'all') && (
        <Button
          type="outline"
          size="small"
          title="Clear Filters"
          onPress={clearFilters}
          style={styles.clearFiltersButton}
        />
      )}
    </View>
  );

  return (
    <ImageBackground
          source={require('../components/images/moa.jpg')} // or use a URI
          style={styles.container}
          imageStyle={{ opacity: 0.2 }}
        >
    <View style={styles.containerTwo}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCredits}</Text>
          <Text style={styles.statLabel}>Total Credits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumberWithCommas(todaysAmount)}</Text>
          <Text style={styles.statLabel}>Today's Credits</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumberWithCommas(totalAmount)}</Text>
          <Text style={styles.statLabel}>Total Amount</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by item name, part number, or customer..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Date:</Text>
          {renderFilterButton('All', 'all', dateFilter, setDateFilter)}
          {renderFilterButton('Today', 'today', dateFilter, setDateFilter)}
          {renderFilterButton('Week', 'week', dateFilter, setDateFilter)}
          {renderFilterButton('Month', 'month', dateFilter, setDateFilter)}
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Sort:</Text>
          {renderFilterButton('Date', 'date', sortBy, setSortBy)}
          {renderFilterButton('Customer', 'customer', sortBy, setSortBy)}
          {renderFilterButton('Amount', 'amount', sortBy, setSortBy)}
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Order:</Text>
          {renderFilterButton('↓', 'desc', sortOrder, setSortOrder)}
          {renderFilterButton('↑', 'asc', sortOrder, setSortOrder)}
        </View>
      </ScrollView>

      {/* Credits List */}
      <FlatList
        data={filteredCredits}
        renderItem={renderCreditItem}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        style={styles.salesList}
        contentContainerStyle={{ paddingBottom: insets.bottom + 500 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Return Confirmation Modal */}
      <CustomModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Return Credit"
        cancelText="Cancel"
        type="warning"
        title="Return Credit Sale"
      />
    </View>
    </ImageBackground>
  );
}

export default CreditScreen;