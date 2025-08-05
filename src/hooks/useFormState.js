import { useState } from 'react';

export const useFormState = () => {
  const [showSalePopup, setShowSalePopup] = useState(false);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  
  const [saleItem, setSaleItem] = useState({});
  const [purchaseItem, setPurchaseItem] = useState({});
  const [creditItem, setCreditItem] = useState({});
  
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [showCreditNameDropdown, setShowCreditNameDropdown] = useState(false);
  const [selectedCreditItem, setSelectedCreditItem] = useState(null);
  const [filteredCreditInventory, setFilteredCreditInventory] = useState([]);

  const resetForm = (formType) => {
    switch (formType) {
      case 'sale':
        setSaleItem({});
        setSelectedItem(null);
        setShowNameDropdown(false);
        setFilteredInventory([]);
        break;
      case 'purchase':
        setPurchaseItem({});
        break;
      case 'credit':
        setCreditItem({});
        setSelectedCreditItem(null);
        setShowCreditNameDropdown(false);
        setFilteredCreditInventory([]);
        break;
    }
  };

  return {
    showSalePopup, setShowSalePopup,
    showPurchasePopup, setShowPurchasePopup,
    showCreditPopup, setShowCreditPopup,
    saleItem, setSaleItem,
    purchaseItem, setPurchaseItem,
    creditItem, setCreditItem,
    filteredInventory, setFilteredInventory,
    showNameDropdown, setShowNameDropdown,
    selectedItem, setSelectedItem,
    showCreditNameDropdown, setShowCreditNameDropdown,
    selectedCreditItem, setSelectedCreditItem,
    filteredCreditInventory, setFilteredCreditInventory,
    resetForm
  };
};