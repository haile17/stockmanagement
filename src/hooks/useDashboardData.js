import { useState, useEffect } from 'react';
import DataService from '../services/DataService';

export const useDashboardData = () => {
  const [inventoryCount, setInventoryCount] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [recentPurchases, setRecentPurchases] = useState(0);
  const [creditSales, setCreditSales] = useState(0);
  const [recentCredits, setRecentCredits] = useState([]);
  const [inventory, setInventory] = useState([]);

  const loadDashboardData = async () => {
    try {
      const inventoryData = await DataService.getInventory() || [];
      setInventoryCount(inventoryData.length);
      setInventory(inventoryData);

      const salesData = await DataService.getSales() || [];
      const today = new Date().toISOString().split('T')[0];

      // Fix: Convert totalAmount to number before adding
      const todaysSalesTotal = salesData
        .filter(sale => sale?.saleDate?.split('T')[0] === today)
        .reduce((total, sale) => {
          const amount = Number(sale.totalAmount) || 0;
          return total + amount;
        }, 0);

      setTodaysSales(todaysSalesTotal);

      const purchasesData = await DataService.getPurchases() || [];
      setRecentPurchases(purchasesData.length);

      const creditsData = await DataService.getCredits() || [];
      
      // Fix: Convert totalAmount to number before adding
      const totalCreditSales = creditsData.reduce((total, credit) => {
        const amount = Number(credit.totalAmount) || 0;
        return total + amount;
      }, 0);
      
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    inventoryCount,
    todaysSales,
    recentPurchases,
    creditSales,
    recentCredits,
    inventory,
    loadDashboardData
  };
};