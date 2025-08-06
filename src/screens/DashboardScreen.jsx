import React from 'react';
import { View, Text, ScrollView, ImageBackground } from 'react-native';
import { useAlert } from '../context/AlertContext';
import RecordPopup from '../components/RecordPopup';
import styles from '../styles/DashboardScreenStyles';
import Button from '../components/Button';
import DashboardSummary from '../screens/dashboard/DashboardSummary';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useFormState } from '../hooks/useFormState';

// Handlers and Config
import { createFormHandlers } from '../handlers/formHandlers';
import { saleFields, purchaseFields, creditFields } from '../config/formFields';
import Header from '../components/Header';
import CreditSalesCards from './dashboard/CreditSalesCards';

function DashboardScreen({ navigation, onToggleDrawer }) { // Add onToggleDrawer prop
  const { showSuccess, showError, showWarning } = useAlert();
  
  // Custom hooks for state management
  const {
    inventoryCount,
    todaysSales,
    recentPurchases,
    creditSales,
    recentCredits,
    inventory,
    loadDashboardData
  } = useDashboardData();

  const formState = useFormState();

  // Create form handlers
  const {
    handleNameSearch,
    selectInventoryItem,
    handleFieldChange,
    handleSaleSubmit,
    handlePurchaseSubmit,
    handleCreditSubmit
  } = createFormHandlers(
    formState,
    inventory,
    { showSuccess, showError, showWarning },
    loadDashboardData
  );

  return (

      <View style={styles.container}>
        {/* Header Component - Positioned absolutely over the background */}
        <Header 
          onToggleDrawer={onToggleDrawer} 
          iconColor="#ecedef"
          backgroundColor="transparent"
        />

        <ScrollView 
          style={styles.containerTwo} 
          contentContainerStyle={{ 
            paddingBottom: 100,
            paddingTop: 100 // Add top padding to account for the header
          }}
        >
          
          {/* Dashboard Summary Cards */}
          <DashboardSummary
            inventoryCount={inventoryCount}
            todaysSales={todaysSales}
            recentPurchases={recentPurchases}
            creditSales={creditSales}
            styles={styles}
          />

          {/* Recent Credit Sales */}
         <CreditSalesCards 
              recentCredits={recentCredits}
              styles={styles}
            />
        </ScrollView>

        {/* Fixed Bottom Action Buttons */}
        <View style={styles.fixedBottomActions}>
          <Button
            type="gradient"
            size="medium"
            title="New Sale"
            onPress={() => formState.setShowSalePopup(true)}
          />
          <Button
            type="gradient"
            size="medium"
            title="New Purchase"
            onPress={() => formState.setShowPurchasePopup(true)}
          />
          <Button
            type="gradient"
            size="medium"
            title="Credit Sale"
            onPress={() => formState.setShowCreditPopup(true)}
          />
        </View>

        {/* Sale Popup */}
        <RecordPopup
          visible={formState.showSalePopup}
          onClose={() => {
            formState.setShowSalePopup(false);
            formState.resetForm('sale');
          }}
          title="New Sale"
          fields={saleFields}
          formData={formState.saleItem}
          onFieldChange={(field, value) => handleFieldChange('sale', field, value)}
          onSubmit={handleSaleSubmit}
          submitButtonText="Record Sale"
          formType="sale"
          onNameSearch={handleNameSearch}
          onSelectItem={selectInventoryItem}
          onQuantityChange={(value) => handleFieldChange('sale', 'cartonQuantity', value)}
          filteredInventory={formState.filteredInventory}
          showNameDropdown={formState.showNameDropdown}
          selectedItem={formState.selectedItem}
        />

        {/* Purchase Popup */}
        <RecordPopup
          visible={formState.showPurchasePopup}
          onClose={() => {
            formState.setShowPurchasePopup(false);
            formState.resetForm('purchase');
          }}
          title="New Purchase"
          fields={purchaseFields}
          formData={formState.purchaseItem}
          onFieldChange={(field, value) => handleFieldChange('purchase', field, value)}
          onSubmit={handlePurchaseSubmit}
          submitButtonText="Record Purchase"
          formType="purchase"
        />

        {/* Credit Sale Popup */}
        <RecordPopup
          visible={formState.showCreditPopup}
          onClose={() => {
            formState.setShowCreditPopup(false);
            formState.resetForm('credit');
          }}
          title="New Credit Sale"
          fields={creditFields}
          formData={formState.creditItem}
          onFieldChange={(field, value) => handleFieldChange('credit', field, value)}
          onSubmit={handleCreditSubmit}
          submitButtonText="Record Credit Sale"
          formType="credit"
          onNameSearch={handleNameSearch}
          onSelectItem={selectInventoryItem}
          onQuantityChange={(value) => handleFieldChange('credit', 'cartonQuantity', value)}
          filteredInventory={formState.filteredCreditInventory}
          showNameDropdown={formState.showCreditNameDropdown}
          selectedItem={formState.selectedCreditItem}
        />
      </View>
  
  );
}

export default DashboardScreen;