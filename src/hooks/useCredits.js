import { useState, useEffect } from 'react';
import DataService from '../services/DataService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCredits = (showError, showSuccess) => {
  const [credits, setCredits] = useState([]);
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Statistics
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [todaysAmount, setTodaysAmount] = useState(0);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

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
    const totalAmt = creditsData.reduce((sum, credit) => {
      const amount = parseFloat(credit.totalAmount) || 
                    (parseInt(credit.cartonQuantity || 0) * parseFloat(credit.pricePerCarton || 0)) ||
                    (parseInt(credit.totalQuantity || 0) * parseFloat(credit.pricePerPiece || 0));
      return sum + amount;
    }, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAmt = creditsData
      .filter(credit => credit.creditDate && credit.creditDate.split('T')[0] === today)
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

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(credit => 
        (credit.itemName && credit.itemName.toLowerCase().includes(query)) ||
        (credit.name && credit.name.toLowerCase().includes(query)) ||
        (credit.itemCode && credit.itemCode.toLowerCase().includes(query)) ||
        (credit.partNumber && credit.partNumber.toLowerCase().includes(query)) ||
        (credit.customerName && credit.customerName.toLowerCase().includes(query)) ||
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

    // Apply sorting
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

  const handleMarkAsPaid = async (credit) => {
    try {
      await DataService.transferCreditToSale(credit.id);
      showSuccess('Success', 'Credit sale marked as paid and moved to sales records.');
      await loadCredits();
    } catch (error) {
      showError('Error', 'Failed to mark credit as paid: ' + error.message);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  return {
    // State
    filteredCredits,
    refreshing,
    totalCredits,
    totalAmount,
    todaysAmount,
    searchQuery,
    dateFilter,
    sortBy,
    sortOrder,
    
    // Actions
    setSearchQuery,
    setDateFilter,
    setSortBy,
    setSortOrder,
    onRefresh,
    handleMarkAsPaid,
    clearFilters,
    loadCredits
  };
};