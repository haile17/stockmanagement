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
    
    if (pricePerCarton > 0) {
      updatedItem.totalAmount = (cartons * pricePerCarton).toString();
    } else if (pricePerPiece > 0 && perCarton > 0) {
      updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
      updatedItem.pricePerCarton = (perCarton * pricePerPiece).toString();
    }
  }

  // Calculate totalAmount for purchases
  if (formType === 'purchase') {
    const cartons = parseInt(updatedItem.cartonQuantity) || 0;
    const pricePerCarton = parseFloat(updatedItem.purchasePricePerCarton) || 0;
    const pricePerPiece = parseFloat(updatedItem.purchasePricePerPiece) || 0;
    const perCarton = parseInt(updatedItem.quantityPerCarton) || 0;
    
    if (pricePerCarton > 0) {
      updatedItem.totalAmount = (cartons * pricePerCarton).toString();
    } else if (pricePerPiece > 0 && perCarton > 0) {
      updatedItem.totalAmount = (cartons * perCarton * pricePerPiece).toString();
      updatedItem.purchasePricePerCarton = (perCarton * pricePerPiece).toString();
    }
  }

  // Calculate remaining balance for credits
  if (formType === 'credit' && (field === 'totalAmount' || field === 'amountPaid')) {
    const total = parseFloat(updatedItem.totalAmount) || 0;
    const paid = parseFloat(updatedItem.amountPaid) || 0;
    updatedItem.remainingBalance = (total - paid).toString();
  }

  return updatedItem;
};