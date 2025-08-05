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
import styles from '../styles/Sales';
import { useAlert } from '../context/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function PurchaseScreen() {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showError, showSuccess } = useAlert();
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date'); // date, source, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  
  // Statistics
  const [totalPurchases, setTotalPurchases] = useState(0);
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
    loadPurchases();
  }, [selectedDatabase]);

  useEffect(() => {
    filterAndSortPurchases();
  }, [purchases, searchQuery, dateFilter, sortBy, sortOrder]);

  const loadPurchases = async () => {
    try {
      let purchasesData = await DataService.getPurchases() || [];

      if (selectedDatabase) {
        purchasesData = purchasesData.filter(purchase => purchase.databaseId === selectedDatabase.id);
      }

      setPurchases(purchasesData);
      calculateStatistics(purchasesData);
    } catch (error) {
      console.error('Error loading purchases:', error);
      showError('Error', 'Failed to load purchases data');
    }
  };

  const calculateStatistics = (purchasesData) => {
  const total = purchasesData.length;
  // Updated to use correct field names and calculation method
  const totalAmt = purchasesData.reduce((sum, purchase) => {
    const amount = parseFloat(purchase.totalAmount) || 
                  (parseInt(purchase.cartonQuantity || 0) * parseFloat(purchase.purchasePricePerCarton || 0)) ||
                  (parseInt(purchase.totalQuantity || 0) * parseFloat(purchase.purchasePricePerPiece || 0));
    return sum + amount;
  }, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayAmt = purchasesData
    .filter(purchase => purchase.purchaseDate && purchase.purchaseDate.split('T')[0] === today) // Updated field name
    .reduce((sum, purchase) => {
      const amount = parseFloat(purchase.totalAmount) || 
                    (parseInt(purchase.cartonQuantity || 0) * parseFloat(purchase.purchasePricePerCarton || 0)) ||
                    (parseInt(purchase.totalQuantity || 0) * parseFloat(purchase.purchasePricePerPiece || 0));
      return sum + amount;
    }, 0);

  setTotalPurchases(total);
  setTotalAmount(totalAmt);
  setTodaysAmount(todayAmt);
};

  const filterAndSortPurchases = () => {
  let filtered = [...purchases];

  // Apply search filter - Updated field names
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(purchase => 
      (purchase.itemName && purchase.itemName.toLowerCase().includes(query)) || // Changed from 'name'
      (purchase.itemCode && purchase.itemCode.toLowerCase().includes(query)) || // Changed from 'partNumber'
      (purchase.source && purchase.source.toLowerCase().includes(query))
    );
  }

  // Apply date filter - Updated field name
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  switch (dateFilter) {
    case 'today':
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate); // Changed from 'date'
        return purchaseDate >= today;
      });
      break;
    case 'week':
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate); // Changed from 'date'
        return purchaseDate >= weekAgo;
      });
      break;
    case 'month':
      filtered = filtered.filter(purchase => {
        const purchaseDate = new Date(purchase.purchaseDate); // Changed from 'date'
        return purchaseDate >= monthAgo;
      });
      break;
  }

  // Apply sorting - Updated field names and calculation
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'source':
        aValue = (a.source || '').toLowerCase();
        bValue = (b.source || '').toLowerCase();
        break;
      case 'amount':
        aValue = parseFloat(a.totalAmount) || 
                (parseInt(a.cartonQuantity || 0) * parseFloat(a.purchasePricePerCarton || 0)) ||
                (parseInt(a.totalQuantity || 0) * parseFloat(a.purchasePricePerPiece || 0));
        bValue = parseFloat(b.totalAmount) || 
                (parseInt(b.cartonQuantity || 0) * parseFloat(b.purchasePricePerCarton || 0)) ||
                (parseInt(b.totalQuantity || 0) * parseFloat(b.purchasePricePerPiece || 0));
        break;
      case 'date':
      default:
        aValue = new Date(a.purchaseDate); // Changed from 'date'
        bValue = new Date(b.purchaseDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  setFilteredPurchases(filtered);
};

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
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

  const handleDelete = (purchase) => {
  setPurchaseToDelete(purchase);
  // Updated to use correct field names and calculation
  const purchaseAmount = parseFloat(purchase.totalAmount) || 
                        (parseInt(purchase.cartonQuantity || 0) * parseFloat(purchase.purchasePricePerCarton || 0)) ||
                        (parseInt(purchase.totalQuantity || 0) * parseFloat(purchase.purchasePricePerPiece || 0));
  
  setModalMessage(
    `Are you sure you want to delete this purchase?\n\n` +
    `Item: ${purchase.itemName || 'N/A'}\n` + // Changed from 'name'
    `Quantity: ${purchase.cartonQuantity || purchase.totalQuantity || 0}\n` + // Updated quantity field
    `Amount: ${formatNumberWithCommas(purchaseAmount)} Birr\n` +
    `Source: ${purchase.source || 'N/A'}\n\n` +
    `This action cannot be undone.`
  );
  setIsModalOpen(true);
};

  const handleConfirm = async () => {
    if (purchaseToDelete) {
      try {
        await DataService.deletePurchase(purchaseToDelete.id);
        showSuccess('Success', 'Purchase deleted successfully.');
        await loadPurchases();
        setPurchaseToDelete(null);
      } catch (error) {
        showError('Error', 'Failed to delete purchase: ' + error.message);
      }
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPurchaseToDelete(null);
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

  const renderPurchaseItem = ({ item, index }) => {
  // Updated to calculate amount correctly and use proper field names
  const purchaseAmount = parseFloat(item.totalAmount) || 
                        (parseInt(item.cartonQuantity || 0) * parseFloat(item.purchasePricePerCarton || 0)) ||
                        (parseInt(item.totalQuantity || 0) * parseFloat(item.purchasePricePerPiece || 0));
  
  return (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleDate}>{formatDate(item.purchaseDate || item.date) || 'No Date'}</Text>
        <Text style={styles.saleAmount}>
          {formatNumberWithCommas(purchaseAmount) || '0'} Birr
        </Text>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Text style={styles.itemName}>{item.itemName || item.name || 'N/A'}</Text>
          <Text style={styles.itemDetails}>
            Code: {item.itemCode || item.partNumber || 'N/A'} | Qty: {formatNumberWithCommas(item.cartonQuantity || item.totalQuantity || item.quantity || 0)}
          </Text>
          <Text style={styles.itemPrice}>
            Price: {formatNumberWithCommas(item.purchasePricePerPiece || item.purchasePricePerCarton || item.price || 0)} Birr
          </Text>
          {item.source && (
            <Text style={styles.customerName}>Source: {item.source}</Text>
          )}
        </View>
        
        <View style={styles.saleActions}>
          <Button
            type="danger"
            size="xs"
            title="Delete"
            onPress={() => handleDelete(item)}
            style={styles.returnButton}
          />
        </View>
      </View>
    </View>
  );
};

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No purchases found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery || dateFilter !== 'all' 
          ? 'Try adjusting your filters'
          : 'Purchases will appear here once recorded'
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
      source={require('../components/images/adwa.jpg')} // or use a URI
      style={styles.container}
      imageStyle={{ opacity: 0.3 }}
    >
    <View style={styles.containerTwo}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPurchases}</Text>
          <Text style={styles.statLabel}>Total Purchases</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumberWithCommas(todaysAmount)}</Text>
          <Text style={styles.statLabel}>Today's Purchases</Text>
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
          placeholder="Search by item name, item code, or source..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#8DA9A4"
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
          {renderFilterButton('Source', 'source', sortBy, setSortBy)}
          {renderFilterButton('Amount', 'amount', sortBy, setSortBy)}
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Order:</Text>
          {renderFilterButton('↓', 'desc', sortOrder, setSortOrder)}
          {renderFilterButton('↑', 'asc', sortOrder, setSortOrder)}
        </View>
      </ScrollView>

      {/* Purchases List */}
      <FlatList
        data={filteredPurchases}
        renderItem={renderPurchaseItem}
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

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Delete Purchase"
        cancelText="Cancel"
        type="warning"
        title="Delete Purchase"
      />
    </View>
    </ImageBackground>
  );
}

export default PurchaseScreen;