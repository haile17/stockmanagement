export const validateQuantity = (quantity, formType, selectedItem, currentFormData, showError, showWarning) => {
  const currentSelectedItem = formType === 'sale' ? selectedItem.sale : selectedItem.credit;
  
  // Skip inventory validation for purchases
  if (formType === 'purchase') {
    return true;
  }

  // Check if we have a valid selection
  const hasValidSelection = currentSelectedItem && 
                          currentFormData.itemName && 
                          currentSelectedItem.itemName === currentFormData.itemName;

  if ((formType === 'sale' || formType === 'credit') && !hasValidSelection) {
    showError('Error', 'Please select an item from inventory first');
    return false;
  }

  if (hasValidSelection) {
    const requestedCartons = parseInt(quantity) || 0;
    
    if (requestedCartons > currentSelectedItem.cartonQuantity) {
      showWarning('Insufficient Stock', `Only ${currentSelectedItem.cartonQuantity} cartons available in inventory`);
      return false;
    }
    
    if (formType === 'sale' && currentFormData.quantityPerCarton) {
      const requestedPerCarton = parseInt(currentFormData.quantityPerCarton) || 0;
      if (requestedPerCarton > currentSelectedItem.quantityPerCarton) {
        showWarning('Invalid Quantity', `This item has ${currentSelectedItem.quantityPerCarton} pieces per carton in inventory`);
        return false;
      }
    }
  }
  
  return true;
};

export const validateQuantityPerCarton = (quantity, formType, selectedItem, currentFormData, showError, showWarning) => {
  if (formType === 'purchase') {
    return true;
  }

  const currentSelectedItem = formType === 'sale' ? selectedItem.sale : selectedItem.credit;

  if (!currentSelectedItem || !currentFormData.itemName) {
    showError('Error', 'Please select an item from inventory first');
    return false;
  }

  const requestedPerCarton = parseInt(quantity) || 0;
  const inventoryPerCarton = currentSelectedItem.quantityPerCarton || 0;
  
  if (requestedPerCarton > inventoryPerCarton) {
    showWarning('Note', `Inventory has ${inventoryPerCarton} pieces per carton, but you can enter a different value`);
  }

  return true;
};