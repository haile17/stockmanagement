import { useState, useEffect } from 'react';

export const usePurchaseFilters = (purchases) => {
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    filterAndSortPurchases();
  }, [purchases, searchQuery, dateFilter, sortBy, sortOrder]);

  const filterAndSortPurchases = () => {
    let filtered = [...purchases];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(purchase => 
        (purchase.itemName && purchase.itemName.toLowerCase().includes(query)) ||
        (purchase.itemCode && purchase.itemCode.toLowerCase().includes(query)) ||
        (purchase.source && purchase.source.toLowerCase().includes(query))
      );
    }

    // Apply date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(purchase => {
          const purchaseDate = new Date(purchase.purchaseDate);
          return purchaseDate >= today;
        });
        break;
      case 'week':
        filtered = filtered.filter(purchase => {
          const purchaseDate = new Date(purchase.purchaseDate);
          return purchaseDate >= weekAgo;
        });
        break;
      case 'month':
        filtered = filtered.filter(purchase => {
          const purchaseDate = new Date(purchase.purchaseDate);
          return purchaseDate >= monthAgo;
        });
        break;
    }

    // Apply sorting
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
          aValue = new Date(a.purchaseDate);
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

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  return {
    filteredPurchases,
    searchQuery,
    dateFilter,
    sortBy,
    sortOrder,
    setSearchQuery,
    setDateFilter,
    setSortBy,
    setSortOrder,
    clearFilters
  };
};
