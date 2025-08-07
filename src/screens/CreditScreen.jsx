import React, { useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../context/AlertContext';

import Header from '../components/Header';
import CreditStatistics from '../screens/credit/CreditStatistics';
import CreditSearch from '../screens/credit/CreditSearch';
import CreditFilters from '../screens/credit/CreditFilters';
import CreditList from '../screens/credit/CreditList';
import { CustomModal } from '../components/CustomModal';

import { useCredits } from '../hooks/useCredits';
import DataService from '../services/DataService';
import styles from '../styles/Sales';

function CreditScreen({ onToggleDrawer }) {
  const insets = useSafeAreaInsets();
  const { showError, showSuccess } = useAlert();
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [creditToReturn, setCreditToReturn] = useState(null);

  // Use custom hook for credit logic
  const {
    filteredCredits,
    refreshing,
    totalCredits,
    totalAmount,
    todaysAmount,
    searchQuery,
    dateFilter,
    sortBy,
    sortOrder,
    setSearchQuery,
    setDateFilter,
    setSortBy,
    setSortOrder,
    onRefresh,
    handleMarkAsPaid,
    clearFilters,
    loadCredits
  } = useCredits(showError, showSuccess);

  // Utility functions
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

  // ADD THIS NEW FUNCTION
  const handleEditCredit = async (updatedCredit) => {
    try {
      // Update the credit in storage
      await DataService.updateCredit(updatedCredit.id, updatedCredit);
      
      // Reload the credits to reflect changes
      await loadCredits();
      
      // Show success message
      showSuccess('Success', 'Credit information updated successfully');
      
    } catch (error) {
      console.error('Error updating credit:', error);
      showError('Error', 'Failed to update credit information: ' + error.message);
    }
  };

  const handleReturn = (credit) => {
    setCreditToReturn(credit);
    const creditAmount = parseFloat(credit.totalAmount) || 
                        (parseInt(credit.cartonQuantity || 0) * parseFloat(credit.pricePerCarton || 0)) ||
                        (parseInt(credit.totalQuantity || 0) * parseFloat(credit.pricePerPiece || 0));
    
    setModalMessage(
      `Are you sure you want to return this credit sale?\n\n` +
      `Item: ${credit.itemName || 'N/A'}\n` +
      `Quantity: ${credit.cartonQuantity || credit.totalQuantity || 0}\n` +
      `Amount: ${formatNumberWithCommas(creditAmount)} Birr\n` +
      `Customer: ${credit.customerName || 'N/A'}\n\n` +
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

  return (
    <ImageBackground
      source={require('../components/images/lion.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.5 }}
    >
      <Header
        onToggleDrawer={onToggleDrawer} 
        iconColor="#ffffff"
        backgroundColor="transparent"
      />
      
      <View style={styles.containerTwo}>
        <CreditStatistics 
          totalCredits={totalCredits}
          todaysAmount={todaysAmount}
          totalAmount={totalAmount}
          formatNumberWithCommas={formatNumberWithCommas}
        />

        <CreditSearch 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <CreditFilters 
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <CreditList 
          filteredCredits={filteredCredits}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onMarkAsPaid={handleMarkAsPaid}
          onReturn={handleReturn}
          onEdit={handleEditCredit} // ADD THIS LINE
          formatNumberWithCommas={formatNumberWithCommas}
          formatDate={formatDate}
          insets={insets}
          searchQuery={searchQuery}
          dateFilter={dateFilter}
          onClearFilters={clearFilters}
        />

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