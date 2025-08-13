import React, { useState } from 'react';
import { 
  View, 
  FlatList, 
  ImageBackground,
  RefreshControl
} from 'react-native';
import { CustomModal } from '../components/CustomModal';
import { useAlert } from '../context/AlertContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import PurchaseStatistics from '../screens/purchase/PurchaseStatistics';
import PurchaseSearchBar from '../screens/purchase/PurchaseSearchBar';
import PurchaseFilters from '../screens/purchase/PurchaseFilters';
import PurchaseItem from '../screens/purchase/PurchaseItem';
import PurchaseEmptyState from '../screens/purchase/PurchaseEmptyState';
import { usePurchaseData } from '../hooks/usePurchaseData';
import { usePurchaseFilters } from '../hooks/usePurchaseFilters';
import { formatNumberWithCommas, formatDate } from '../components/utils/purchaseUtils';
import styles from '../styles/Sales';

function PurchaseScreen({ onToggleDrawer }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const { showError, showSuccess } = useAlert();
  const insets = useSafeAreaInsets();

  // Custom hooks for data and filtering
  const {
    purchases,
    refreshing,
    totalPurchases,
    totalAmount,
    todaysAmount,
    onRefresh,
    deletePurchase
  } = usePurchaseData(showError, showSuccess);

  const {
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
  } = usePurchaseFilters(purchases);

  const handleDelete = (purchase) => {
    setPurchaseToDelete(purchase);
    const purchaseAmount = parseFloat(purchase.totalAmount) || 
                          (parseInt(purchase.cartonQuantity || 0) * parseFloat(purchase.purchasePricePerCarton || 0)) ||
                          (parseInt(purchase.totalQuantity || 0) * parseFloat(purchase.purchasePricePerPiece || 0));
    
    setModalMessage(
      `Are you sure you want to delete this purchase?\n\n` +
      `Item: ${purchase.itemName || 'N/A'}\n` +
      `Quantity: ${purchase.cartonQuantity || purchase.totalQuantity || 0}\n` +
      `Amount: ${formatNumberWithCommas(purchaseAmount)} Birr\n` +
      `Source: ${purchase.source || 'N/A'}\n\n` +
      `This action cannot be undone.`
    );
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (purchaseToDelete) {
      await deletePurchase(purchaseToDelete);
      setPurchaseToDelete(null);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setPurchaseToDelete(null);
  };

  const renderPurchaseItem = ({ item, index }) => (
    <PurchaseItem
      item={item}
      index={index}
      onDelete={handleDelete}
      formatNumberWithCommas={formatNumberWithCommas}
      formatDate={formatDate}
    />
  );

  const renderEmptyList = () => (
    <PurchaseEmptyState
      searchQuery={searchQuery}
      dateFilter={dateFilter}
      onClearFilters={clearFilters}
    />
  );

  return (
    <ImageBackground
      source={require('../components/images/egl.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.4 }}
    >
      <Header 
        onToggleDrawer={onToggleDrawer} 
        iconColor="#ffffff"
        backgroundColor="transparent"
      />
      
      <View style={styles.containerTwo}>
        <PurchaseStatistics
          totalPurchases={totalPurchases}
          todaysAmount={todaysAmount}
          totalAmount={totalAmount}
          formatNumberWithCommas={formatNumberWithCommas}
        />

        <PurchaseSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <PurchaseFilters
          dateFilter={dateFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onDateFilterChange={setDateFilter}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
        />

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