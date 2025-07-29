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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate, formatNumberWithCommas } from '../components/utils/formatters';
import { useAlert } from '../context/AlertContext';

function SalesScreen() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [saleToReturn, setSaleToReturn] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { showError, showSuccess } = useAlert();
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('date'); // date, customer, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  
  // Statistics
  const [totalSales, setTotalSales] = useState(0);
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
    loadSales();
  }, [selectedDatabase]);

  useEffect(() => {
    filterAndSortSales();
  }, [sales, searchQuery, dateFilter, sortBy, sortOrder]);

  const loadSales = async () => {
    try {
      let salesData = await DataService.getSales() || [];

      if (selectedDatabase) {
        salesData = salesData.filter(sale => sale.databaseId === selectedDatabase.id);
      }
      setSales(salesData);
      calculateStatistics(salesData);
    } catch (error) {
      console.error('Error loading sales:', error);
      showError('Error', 'Failed to load sales data');
    }
  };

  const calculateStatistics = (salesData) => {
    const total = salesData.length;
    const totalAmt = salesData.reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAmt = salesData
      .filter(sale => sale.date && sale.date.split('T')[0] === today)
      .reduce((sum, sale) => sum + (sale.quantity * sale.price), 0);
    setTotalSales(total);
    setTotalAmount(totalAmt);
    setTodaysAmount(todayAmt);
  };

  const filterAndSortSales = () => {
    let filtered = [...sales];
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sale => 
        (sale.name && sale.name.toLowerCase().includes(query)) ||
        (sale.partNumber && sale.partNumber.toLowerCase().includes(query)) ||
        (sale.customer && sale.customer.toLowerCase().includes(query))
      );
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= today;
        });
        break;
      case 'week':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.date);
          return saleDate >= monthAgo;
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
    setFilteredSales(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSales();
    setRefreshing(false);
  };

  const handleReturn = (sale) => {
    setSaleToReturn(sale);
    setModalMessage(
      `Are you sure you want to return this sale?\n\n` +
      `Item: ${sale.name}\n` +
      `Quantity: ${sale.quantity}\n` +
      `Amount: ${formatNumberWithCommas(sale.quantity * sale.price)} Birr\n\n` +
      `This will add the items back to inventory.`
    );
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (saleToReturn) {
      try {
        await DataService.returnSale(saleToReturn.id);
        showSuccess('Success', 'Sale returned successfully. Items added back to inventory.');
        await loadSales();
        setSaleToReturn(null);
      } catch (error) {
        showError('Error', 'Failed to return sale: ' + error.message);
      }
    }
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setSaleToReturn(null);
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

  const renderSaleItem = ({ item, index }) => (
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
        </View>
        
        <View style={styles.saleActions}>
          <Button
            type="gradient"
            size="small"
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
      <Text style={styles.emptyText}>No sales records found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery || dateFilter !== 'all' 
          ? 'Try adjusting your filters'
          : 'Sales will appear here once recorded'
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
      source={require('../components/images/judas.jpg')} // or use a URI
      style={styles.container}
      imageStyle={{ opacity: 0.2 }}
    >
    <View style={styles.containerTwo}>
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalSales}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{formatNumberWithCommas(todaysAmount)}</Text>
          <Text style={styles.statLabel}>Today's Sales</Text>
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
          {renderFilterButton('Customer', 'customer', sortBy, setSortBy)}
          {renderFilterButton('Amount', 'amount', sortBy, setSortBy)}
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupTitle}>Order:</Text>
          {renderFilterButton('↓', 'desc', sortOrder, setSortOrder)}
          {renderFilterButton('↑', 'asc', sortOrder, setSortOrder)}
        </View>
      </ScrollView>

      {/* Sales List */}      
      <FlatList
        data={filteredSales}
        renderItem={renderSaleItem}
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
        confirmText="Return Sale"
        cancelText="Cancel"
        type="warning"
        title="Return Sale"
        />
    </View>
    </ImageBackground>
  );
}

export default SalesScreen;