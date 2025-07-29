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
    const totalAmt = creditsData.reduce((sum, credit) => sum + (credit.quantity * credit.price), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAmt = creditsData
      .filter(credit => credit.date && credit.date.split('T')[0] === today)
      .reduce((sum, credit) => sum + (credit.quantity * credit.price), 0);

    setTotalCredits(total);
    setTotalAmount(totalAmt);
    setTodaysAmount(todayAmt);
  };

  const filterAndSortCredits = () => {
    let filtered = [...credits];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(credit => 
        (credit.name && credit.name.toLowerCase().includes(query)) ||
        (credit.partNumber && credit.partNumber.toLowerCase().includes(query)) ||
        (credit.customer && credit.customer.toLowerCase().includes(query))
      );
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(credit => {
          const creditDate = new Date(credit.date);
          return creditDate >= today;
        });
        break;
      case 'week':
        filtered = filtered.filter(credit => {
          const creditDate = new Date(credit.date);
          return creditDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(credit => {
          const creditDate = new Date(credit.date);
          return creditDate >= monthAgo;
        });
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'customer':
          aValue = (a.customer || '').toLowerCase();
          bValue = (b.customer || '').toLowerCase();
          break;
        case 'amount':
          aValue = a.quantity * a.price;
          bValue = b.quantity * b.price;
          break;
        case 'date':
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
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
    // Convert credit to sale
    const saleData = {
      name: credit.name,
      partNumber: credit.partNumber,
      quantity: credit.quantity,
      price: credit.price,
      customer: credit.customer,
      date: new Date().toISOString(),
      databaseId: credit.databaseId
    };
    
    // Save as sale
    await DataService.saveSale(saleData);
    
    // Remove from credits
    await DataService.deleteCreditSale(credit.id);
    
    showSuccess('Success', 'Credit sale marked as paid and moved to sales records.');
    await loadCredits();
  } catch (error) {
    showError('Error', 'Failed to mark credit as paid: ' + error.message);
  }
};

  const handleReturn = (credit) => {
    setCreditToReturn(credit);
    setModalMessage(
      `Are you sure you want to return this credit sale?\n\n` +
      `Item: ${credit.name}\n` +
      `Quantity: ${credit.quantity}\n` +
      `Amount: ${formatNumberWithCommas(credit.quantity * credit.price)} Birr\n` +
      `Customer: ${credit.customer || 'N/A'}\n\n` +
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

  const renderCreditItem = ({ item, index }) => (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleDate}>{formatDate(item.date)}</Text>
        <Text style={styles.saleAmount}>
          {formatNumberWithCommas(item.quantity * item.price)} Birr
        </Text>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Text style={styles.itemName}>{item.name || 'N/A'}</Text>
          <Text style={styles.itemDetails}>
            Part: {item.partNumber || 'N/A'} | Qty: {formatNumberWithCommas(item.quantity)} | 
           
          </Text>
          <Text style={styles.itemPrice} >
           Price: {formatNumberWithCommas(item.price)} Birr
           </Text>
          {item.customer && (
            <Text style={styles.customerName}>Customer: {item.customer}</Text>
          )}
          <Text style={[styles.customerName, { color: '#FF9500' }]}>
            Status: {item.status || 'Pending'}
          </Text>
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