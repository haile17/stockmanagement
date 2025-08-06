export const calculateTotals = (formType, field, value, currentItem) => {
  let updatedItem = { ...currentItem };
  updatedItem[field] = value;

  // Calculate totalQuantity when cartonQuantity or quantityPerCarton changes
  if (field === 'cartonQuantity' || field === 'quantityPerCarton') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    updatedItem.totalQuantity = (cartons * perCarton).toString();
  }

  // Calculate totalAmount for sales and credits
  if (formType === 'sale' || formType === 'credit') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    const pricePerCarton = parseFloat(updatedItem.pricePerCarton) || 0;
    const pricePerPiece = parseFloat(updatedItem.pricePerPiece) || 0;
    
    if (field === 'pricePerCarton' && pricePerCarton > 0) {
      // When pricePerCarton changes, update pricePerPiece and totalAmount
      updatedItem.totalAmount = (cartons * pricePerCarton).toString();
      if (perCarton > 0) {
        updatedItem.pricePerPiece = (pricePerCarton / perCarton).toString();
      }
    } else if (field === 'pricePerPiece' && pricePerPiece > 0) {
      // When pricePerPiece changes, update pricePerCarton and totalAmount
      if (perCarton > 0) {
        updatedItem.pricePerCarton = (perCarton * pricePerPiece).toString();
        updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
      }
    } else if (['cartonQuantity', 'quantityPerCarton'].includes(field)) {
      // When quantities change, recalculate totalAmount based on existing prices
      if (pricePerCarton > 0) {
        updatedItem.totalAmount = (cartons * pricePerCarton).toString();
      } else if (pricePerPiece > 0 && perCarton > 0) {
        updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
        updatedItem.pricePerCarton = (perCarton * pricePerPiece).toString();
      }
    }
  }

  // Calculate totalAmount for purchases
  if (formType === 'purchase') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const pricePerCarton = parseFloat(updatedItem.purchasePricePerCarton) || 0;
    const pricePerPiece = parseFloat(updatedItem.purchasePricePerPiece) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    
    if (field === 'purchasePricePerCarton' && pricePerCarton > 0) {
      updatedItem.totalAmount = (cartons * pricePerCarton).toString();
      if (perCarton > 0) {
        updatedItem.purchasePricePerPiece = (pricePerCarton / perCarton).toString();
      }
    } else if (field === 'purchasePricePerPiece' && pricePerPiece > 0) {
      if (perCarton > 0) {
        updatedItem.purchasePricePerCarton = (perCarton * pricePerPiece).toString();
        updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
      }
    } else if (['cartonQuantity', 'quantityPerCarton'].includes(field)) {
      if (pricePerCarton > 0) {
        updatedItem.totalAmount = (cartons * pricePerCarton).toString();
      } else if (pricePerPiece > 0 && perCarton > 0) {
        updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
        updatedItem.purchasePricePerCarton = (perCarton * pricePerPiece).toString();
      }
    }
  }

  // Calculate remaining balance for credits - THIS IS THE KEY FIX
  if (formType === 'credit') {
    // Always recalculate remaining balance when totalAmount, amountPaid, or any field that affects totalAmount changes
    if (['totalAmount', 'amountPaid', 'pricePerPiece', 'pricePerCarton', 'cartonQuantity', 'quantityPerCarton'].includes(field)) {
      const total = parseFloat(updatedItem.totalAmount) || 0;
      const paid = parseFloat(updatedItem.amountPaid) || 0;
      updatedItem.remainingBalance = Math.max(0, total - paid).toString();
    }
  }

  return updatedItem;
};