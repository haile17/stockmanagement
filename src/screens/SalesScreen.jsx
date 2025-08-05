import React, { useEffect, useState } from 'react';
import { 
  View, 
  ImageBackground,
  RefreshControl,
  FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SalesHeader from '../screens/sales/SalesHeader';
import SalesFilters from '../screens/sales/SalesFilters';
import SaleItem from '../screens/sales/SaleItem';
import EmptyList from '../screens/sales/EmptyList';
import { CustomModal } from '../components/CustomModal';
import DataService from '../services/DataService';
import styles from '../styles/Sales';
import { formatNumberWithCommas } from '../components/utils/formatters';
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
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
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
    const totalAmt = salesData.reduce((sum, sale) => {
      const amount = parseFloat(sale.totalAmount) || 
                    (parseInt(sale.cartonQuantity || 0) * parseFloat(sale.pricePerCarton || 0)) ||
                    (parseInt(sale.totalQuantity || 0) * parseFloat(sale.pricePerPiece || 0));
      return sum + amount;
    }, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAmt = salesData
      .filter(sale => sale.saleDate && sale.saleDate.split('T')[0] === today)
      .reduce((sum, sale) => {
        const amount = parseFloat(sale.totalAmount) || 
                      (parseInt(sale.cartonQuantity || 0) * parseFloat(sale.pricePerCarton || 0)) ||
                      (parseInt(sale.totalQuantity || 0) * parseFloat(sale.pricePerPiece || 0));
        return sum + amount;
      }, 0);
    
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
        (sale.itemName && sale.itemName.toLowerCase().includes(query)) ||
        (sale.itemCode && sale.itemCode.toLowerCase().includes(query)) ||
        (sale.customerName && sale.customerName.toLowerCase().includes(query))
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
          const saleDate = new Date(sale.saleDate);
          return saleDate >= today;
        });
        break;
      case 'week':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= monthAgo;
        });
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'customer':
          aValue = (a.customerName || '').toLowerCase();
          bValue = (b.customerName || '').toLowerCase();
          break;
        case 'amount':
          aValue = parseFloat(a.totalAmount) || 
                  (parseInt(a.cartonQuantity || 0) * parseFloat(a.pricePerCarton || 0)) ||
                  (parseInt(a.totalQuantity || 0) * parseFloat(a.pricePerPiece || 0));
          bValue = parseFloat(b.totalAmount) || 
                  (parseInt(b.cartonQuantity || 0) * parseFloat(b.pricePerCarton || 0)) ||
                  (parseInt(b.totalQuantity || 0) * parseFloat(b.pricePerPiece || 0));
          break;
        case 'date':
        default:
          aValue = new Date(a.saleDate);
          bValue = new Date(b.saleDate);
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
    const saleAmount = parseFloat(sale.totalAmount) || 
                      (parseInt(sale.cartonQuantity || 0) * parseFloat(sale.pricePerCarton || 0)) ||
                      (parseInt(sale.totalQuantity || 0) * parseFloat(sale.pricePerPiece || 0));
  
    setModalMessage(
      `Are you sure you want to return this sale?\n\n` +
      `Item: ${sale.itemName}\n` +
      `Quantity: ${sale.cartonQuantity || sale.totalQuantity}\n` +
      `Amount: ${formatNumberWithCommas(saleAmount)} Birr\n\n` +
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

  const renderSaleItem = ({ item, index }) => (
    <SaleItem 
      item={item} 
      index={index} 
      onReturn={handleReturn}
    />
  );

  const renderEmptyList = () => (
    <EmptyList
      searchQuery={searchQuery}
      dateFilter={dateFilter}
      onClearFilters={clearFilters}
    />
  );

  return (
    <ImageBackground
      source={require('../components/images/judas.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.2 }}
    >
      <View style={styles.containerTwo}>
        <SalesHeader
          totalSales={totalSales}
          todaysAmount={todaysAmount}
          totalAmount={totalAmount}
        />

        <SalesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

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