import DataService from '../services/DataService';
import { calculateTotals } from '../components/utils/formCalculations';
import { validateQuantity, validateQuantityPerCarton } from '../components/utils/formValidation';

export const createFormHandlers = (
  formState,
  inventory,
  { showSuccess, showError, showWarning },
  loadDashboardData
) => {
  const {
    saleItem, setSaleItem,
    purchaseItem, setPurchaseItem,
    creditItem, setCreditItem,
    selectedItem, setSelectedItem,
    selectedCreditItem, setSelectedCreditItem,
    setFilteredInventory, setShowNameDropdown,
    setFilteredCreditInventory, setShowCreditNameDropdown,
    resetForm
  } = formState;

  const handleNameSearch = (text, formType) => {
    handleFieldChange(formType, 'itemName', text);
    
    if (text.length > 0) {
      const filtered = inventory.filter(item => 
       item.itemName && item.itemName.toLowerCase().includes(text.toLowerCase()) 
      );
      
      if (formType === 'sale') {
        setFilteredInventory(filtered);
        setShowNameDropdown(true);
      } else if (formType === 'credit') {
        setFilteredCreditInventory(filtered);
        setShowCreditNameDropdown(true);
      }
    } else {
      if (formType === 'sale') {
        setShowNameDropdown(false);
        setSelectedItem(null);
      } else if (formType === 'credit') {
        setShowCreditNameDropdown(false);
        setSelectedCreditItem(null);
      }
    }
  };

  const selectInventoryItem = (item, formType) => {
    if (formType === 'sale') {
      setSelectedItem(item);
      const updatedItem = {
        itemName: item.itemName,
        itemCode: item.itemCode || '',
        quantityPerCarton: item.quantityPerCarton?.toString() || '',
        pricePerPiece: item.pricePerPiece?.toString() || '',
        pricePerCarton: item.pricePerCarton?.toString() || '',
        cartonQuantity: '1'
      };
      setSaleItem(updatedItem);
      setShowNameDropdown(false);
      setFilteredInventory([]);
    } else if (formType === 'credit') {
      setSelectedCreditItem(item);
      const updatedItem = {
        itemName: item.itemName,
        itemCode: item.itemCode || '',
        quantityPerCarton: item.quantityPerCarton?.toString() || '',
        pricePerPiece: item.pricePerPiece?.toString() || '',
        cartonQuantity: '1'
      };
      setCreditItem(updatedItem);
      setShowCreditNameDropdown(false);
      setFilteredCreditInventory([]);
    }
  };

  const handleFieldChange = (formType, field, value) => {
  const currentItem = formType === 'sale' ? saleItem : 
                     formType === 'credit' ? creditItem : purchaseItem;
  
  const updatedItem = { ...currentItem, [field]: value };
  
  // Update state first
  switch (formType) {
    case 'sale':
      setSaleItem(updatedItem);
      break;
    case 'purchase':
      setPurchaseItem(updatedItem);
      break;
    case 'credit':
      setCreditItem(updatedItem);
      break;
  }

  // Handle calculations and validations
  if (formType === 'purchase') {
    if (['cartonQuantity', 'quantityPerCarton', 'purchasePricePerCarton', 'purchasePricePerPiece'].includes(field)) {
      const calculated = calculateTotals(formType, field, value, updatedItem);
      setPurchaseItem(calculated);
    }
    return;
  }

  // For sale and credit forms
  const selectedItems = { sale: selectedItem, credit: selectedCreditItem };
  
  if (field === 'cartonQuantity') {
    if (validateQuantity(value, formType, selectedItems, updatedItem, showError, showWarning)) {
      const calculated = calculateTotals(formType, field, value, updatedItem);
      formType === 'sale' ? setSaleItem(calculated) : setCreditItem(calculated);
    }
  } else if (field === 'quantityPerCarton') {
    if (validateQuantityPerCarton(value, formType, selectedItems, updatedItem, showError, showWarning)) {
      const calculated = calculateTotals(formType, field, value, updatedItem);
      formType === 'sale' ? setSaleItem(calculated) : setCreditItem(calculated);
    }
  } else if (['pricePerCarton', 'pricePerPiece', 'amountPaid'].includes(field)) {
    // Added 'amountPaid' to trigger calculations for credit forms
    const calculated = calculateTotals(formType, field, value, updatedItem);
    formType === 'sale' ? setSaleItem(calculated) : setCreditItem(calculated);
  }
};

  const handleSaleSubmit = async () => {
    try {
      if (!selectedItem || !saleItem.itemName) {
        showError('Error', 'Please select an item from inventory first');
        return;
      }

      const inventoryItem = inventory.find(item => 
        item.itemName === saleItem.itemName
      );
      
      if (!inventoryItem) {
        showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
        return;
      }
      
      if (parseInt(saleItem.cartonQuantity) > inventoryItem.cartonQuantity) {
        showWarning('Insufficient Stock', `Only ${inventoryItem.cartonQuantity} cartons available`);
        return;
      }

      if (parseInt(saleItem.quantityPerCarton) > inventoryItem.quantityPerCarton) {
        showWarning('Invalid Quantity', `This item has ${inventoryItem.quantityPerCarton} pieces per carton in inventory`);
        return;
      }
      
      const saleData = {
        ...saleItem,
        saleDate: saleItem.saleDate || new Date().toISOString()
      };
      
      await DataService.saveSale(saleData);
      resetForm('sale');
      loadDashboardData();
      showSuccess('Success', 'Sale recorded successfully');
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const handlePurchaseSubmit = async () => {
    try {
      const purchaseData = {
        ...purchaseItem,
        purchaseDate: purchaseItem.purchaseDate || new Date().toISOString()
      };
      
      await DataService.savePurchase(purchaseData);
      
      const inventoryItem = {
        itemName: purchaseData.itemName,
        itemCode: purchaseData.itemCode || '',
        cartonQuantity: parseInt(purchaseData.cartonQuantity) || 0,
        quantityPerCarton: parseInt(purchaseData.quantityPerCarton) || 0,
        totalQuantity: (parseInt(purchaseData.cartonQuantity) * parseInt(purchaseData.quantityPerCarton)) || 0,
        pricePerPiece: parseFloat(purchaseData.purchasePricePerPiece) || 0,
        pricePerCarton: parseFloat(purchaseData.purchasePricePerCarton) || 0,
        purchasePricePerPiece: parseFloat(purchaseData.purchasePricePerPiece) || 0,
        purchasePricePerCarton: parseFloat(purchaseData.purchasePricePerCarton) || 0,
        bulkUnit: 'Carton',
        source: purchaseData.source || 'Manual Purchase',
        lastPurchaseDate: purchaseData.purchaseDate || new Date().toISOString(),
        minStockAlert: null
      };
      
      const existingItemIndex = inventory.findIndex(item => item.itemName === inventoryItem.itemName);
      
      if (existingItemIndex !== -1) {
        const existingItem = inventory[existingItemIndex];
        const updatedItem = {
          ...existingItem,
          cartonQuantity: existingItem.cartonQuantity + inventoryItem.cartonQuantity,
          totalQuantity: existingItem.totalQuantity + inventoryItem.totalQuantity,
          pricePerPiece: inventoryItem.pricePerPiece,
          pricePerCarton: inventoryItem.pricePerCarton,
          purchasePricePerPiece: inventoryItem.purchasePricePerPiece,
          purchasePricePerCarton: inventoryItem.purchasePricePerCarton,
          lastPurchaseDate: inventoryItem.lastPurchaseDate
        };
        await DataService.saveInventoryItem(updatedItem);
      } else {
        await DataService.saveInventoryItem(inventoryItem);
      }
      
      resetForm('purchase');
      await loadDashboardData();
      showSuccess('Success', 'Purchase recorded and inventory updated successfully');
    } catch (error) {
      console.error('Purchase submit error:', error);
      showError('Error', error.message);
    }
  };

  const handleCreditSubmit = async () => {
    try {
      const inventoryItem = inventory.find(item => 
        item.itemName === creditItem.itemName
      );
      
      if (!inventoryItem) {
        showError('Item Not Found', 'This item is not in your inventory. Please add it to inventory first.');
        return;
      } 
      
      if (parseInt(creditItem.cartonQuantity) > inventoryItem.cartonQuantity) {
        showWarning('Insufficient Stock', `Only ${inventoryItem.cartonQuantity} cartons available`);
        return;
      }
      
      const creditData = {
        ...creditItem,
        creditDate: creditItem.creditDate || new Date().toISOString(),
        paymentStatus: creditItem.paymentStatus || 'Unpaid'
      };
      
      await DataService.saveCreditSale(creditData);
      resetForm('credit');
      loadDashboardData();
      showSuccess('Success', 'Credit sale recorded successfully');
    } catch (error) {
      showError('Error', error.message);
    }
  };

  return {
    handleNameSearch,
    selectInventoryItem,
    handleFieldChange,
    handleSaleSubmit,
    handlePurchaseSubmit,
    handleCreditSubmit
  };
};