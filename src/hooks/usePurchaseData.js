import { useState, useEffect } from 'react';
import DataService from '../services/DataService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const usePurchaseData = (showError, showSuccess) => {
  const [purchases, setPurchases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Statistics
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [todaysAmount, setTodaysAmount] = useState(0);

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
    const totalAmt = purchasesData.reduce((sum, purchase) => {
      const amount = parseFloat(purchase.totalAmount) || 
                    (parseInt(purchase.cartonQuantity || 0) * parseFloat(purchase.purchasePricePerCarton || 0)) ||
                    (parseInt(purchase.totalQuantity || 0) * parseFloat(purchase.purchasePricePerPiece || 0));
      return sum + amount;
    }, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAmt = purchasesData
      .filter(purchase => purchase.purchaseDate && purchase.purchaseDate.split('T')[0] === today)
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const deletePurchase = async (purchase) => {
    try {
      await DataService.deletePurchase(purchase.id);
      showSuccess('Success', 'Purchase deleted successfully.');
      await loadPurchases();
    } catch (error) {
      showError('Error', 'Failed to delete purchase: ' + error.message);
    }
  };

  return {
    purchases,
    selectedDatabase,
    refreshing,
    totalPurchases,
    totalAmount,
    todaysAmount,
    loadPurchases,
    onRefresh,
    deletePurchase
  };
};