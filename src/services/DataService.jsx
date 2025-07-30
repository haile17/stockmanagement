import AsyncStorage from '@react-native-async-storage/async-storage';

const INVENTORY_KEY = 'inventory';
const SALES_KEY = 'sales';
const PURCHASES_KEY = 'purchases';
const CREDITS_KEY = 'credits';

export const DataService = {
  // Inventory functions
  saveInventoryItem: async (item) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    
    // Calculate total quantity
    const totalQuantity = (item.cartonQuantity || 0) * (item.quantityPerCarton || 0);
    
    const existingItemIndex = inventory.findIndex(
      (i) => i.itemName === item.itemName && i.source === item.source
    );

    if (existingItemIndex !== -1) {
      inventory[existingItemIndex] = {
        ...inventory[existingItemIndex],
        ...item,
        totalQuantity,
        databaseId: selectedDatabase ? selectedDatabase.id : inventory[existingItemIndex].databaseId,
      };
    } else {
      inventory.push({
        ...item,
        totalQuantity,
        databaseId: selectedDatabase ? selectedDatabase.id : null,
      });
    }

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    return inventory;
  },

  deleteInventoryItem: async (item) => {
    try {
      const inventory = await DataService.getInventory();
      const updatedInventory = inventory.filter(invItem => 
        invItem.itemName !== item.itemName || 
        invItem.source !== item.source
      );
      
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
      return updatedInventory;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  getInventory: async () => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventoryJson = await AsyncStorage.getItem(INVENTORY_KEY);
    const inventory = inventoryJson ? JSON.parse(inventoryJson) : [];

    return selectedDatabase
      ? inventory.filter((item) => item.databaseId === selectedDatabase.id)
      : inventory;
  },

  updateInventoryItem: async (itemName, updatedItem) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    const index = inventory.findIndex(
      (item) => item.itemName === itemName && 
      item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (index !== -1) {
      inventory[index] = {
        ...inventory[index],
        ...updatedItem,
        totalQuantity: (updatedItem.cartonQuantity || inventory[index].cartonQuantity) * 
                     (updatedItem.quantityPerCarton || inventory[index].quantityPerCarton)
      };
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    }
    return inventory;
  },

  updateInventoryItemQuantity: async (itemName, newQuantity) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    const updatedInventory = inventory
      .map((item) => {
        if (item.itemName === itemName && item.databaseId === (selectedDatabase ? selectedDatabase.id : null)) {
          const updatedQuantity = Math.max(0, parseInt(newQuantity) || 0);
          return updatedQuantity === 0 ? null : { 
            ...item, 
            cartonQuantity: updatedQuantity,
            totalQuantity: updatedQuantity * (item.quantityPerCarton || 1)
          };
        }
        return item;
      })
      .filter(Boolean);

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  },

  removeInventoryItem: async (itemName) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    const updatedInventory = inventory.filter(
      (item) => item.itemName !== itemName || item.databaseId !== (selectedDatabase ? selectedDatabase.id : null)
    );

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  },

  // Sales functions
  getSales: async () => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const salesJson = await AsyncStorage.getItem(SALES_KEY);
    const sales = salesJson ? JSON.parse(salesJson) : [];

    return selectedDatabase
      ? sales.filter((sale) => sale.databaseId === selectedDatabase.id)
      : sales;
  },

  saveSale: async (sale) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const sales = await DataService.getSales();

    const newSale = {
      ...sale,
      id: sale.id || Date.now().toString(),
      saleDate: sale.saleDate || new Date().toISOString(),
      databaseId: selectedDatabase ? selectedDatabase.id : null,
    };

    sales.push(newSale);
    await AsyncStorage.setItem(SALES_KEY, JSON.stringify(sales));

    // Update inventory quantities if not a converted credit
    if (!sale.isConvertedCredit) {
      const inventory = await DataService.getInventory();
      const itemIndex = inventory.findIndex(
        item => item.itemName === sale.itemName && 
        item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
      );

      if (itemIndex !== -1) {
        const item = inventory[itemIndex];
        const newCartonQuantity = item.cartonQuantity - (sale.cartonQuantity || 0);
        
        if (newCartonQuantity <= 0) {
          inventory.splice(itemIndex, 1);
        } else {
          inventory[itemIndex].cartonQuantity = newCartonQuantity;
          inventory[itemIndex].totalQuantity = newCartonQuantity * item.quantityPerCarton;
        }
        
        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      }
    }

    return newSale;
  },

  transferCreditToSale: async (creditId) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const credits = await DataService.getCredits();
    const creditIndex = credits.findIndex((credit) => credit.id === creditId);

    if (creditIndex === -1) {
      throw new Error('Credit not found');
    }

    const creditItem = credits[creditIndex];
    credits.splice(creditIndex, 1);
    await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(credits));

    const sale = {
      ...creditItem,
      id: Date.now().toString(),
      saleDate: new Date().toISOString(),
      paymentStatus: 'Paid',
      databaseId: selectedDatabase ? selectedDatabase.id : null,
      isConvertedCredit: true
    };

    const sales = await DataService.getSales();
    sales.push(sale);
    await AsyncStorage.setItem(SALES_KEY, JSON.stringify(sales));

    return { updatedCredits: credits, updatedSales: sales };
  },

  returnSale: async (saleId) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const sales = await DataService.getSales();
    const saleIndex = sales.findIndex((sale) => sale.id === saleId);

    if (saleIndex === -1) {
      throw new Error('Sale not found');
    }

    const returnedSale = sales[saleIndex];
    sales.splice(saleIndex, 1);
    await AsyncStorage.setItem(SALES_KEY, JSON.stringify(sales));

    // Add quantity back to inventory
    const inventory = await DataService.getInventory();
    const existingItem = inventory.find(
      item => item.itemName === returnedSale.itemName && 
      item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (existingItem) {
      const newCartonQuantity = existingItem.cartonQuantity + (returnedSale.cartonQuantity || 0);
      await DataService.updateInventoryItemQuantity(existingItem.itemName, newCartonQuantity);
    } else {
      await DataService.saveInventoryItem({
        itemName: returnedSale.itemName,
        cartonQuantity: returnedSale.cartonQuantity || 0,
        quantityPerCarton: returnedSale.quantityPerCarton || 0,
        totalQuantity: (returnedSale.cartonQuantity || 0) * (returnedSale.quantityPerCarton || 0),
        pricePerPiece: returnedSale.pricePerPiece || 0,
        pricePerCarton: returnedSale.pricePerCarton || 0,
        source: 'Returned Sale',
        databaseId: selectedDatabase ? selectedDatabase.id : null
      });
    }

    return { updatedSales: sales, updatedInventory: await DataService.getInventory() };
  },

  // Purchase functions
  getPurchases: async () => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const purchasesJson = await AsyncStorage.getItem(PURCHASES_KEY);
    const purchases = purchasesJson ? JSON.parse(purchasesJson) : [];

    return selectedDatabase
      ? purchases.filter((purchase) => purchase.databaseId === selectedDatabase.id)
      : purchases;
  },

  savePurchase: async (purchase) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const purchases = await DataService.getPurchases();

    const newPurchase = {
      ...purchase,
      id: purchase.id || Date.now().toString(),
      purchaseDate: purchase.purchaseDate || new Date().toISOString(),
      databaseId: selectedDatabase ? selectedDatabase.id : null,
    };

    purchases.push(newPurchase);
    await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));

    // Update inventory
    const inventoryItem = {
      itemName: purchase.itemName,
      cartonQuantity: purchase.cartonQuantity || 0,
      quantityPerCarton: purchase.quantityPerCarton || 0,
      totalQuantity: (purchase.cartonQuantity || 0) * (purchase.quantityPerCarton || 0),
      pricePerPiece: purchase.pricePerPiece || 0,
      pricePerCarton: purchase.pricePerCarton || 0,
      purchasePricePerPiece: purchase.purchasePricePerPiece || 0,
      purchasePricePerCarton: purchase.purchasePricePerCarton || 0,
      source: purchase.source || 'Purchase',
      lastPurchaseDate: new Date().toISOString(),
      databaseId: selectedDatabase ? selectedDatabase.id : null
    };

    await DataService.saveInventoryItem(inventoryItem);
    return newPurchase;
  },

  deletePurchase: async (purchaseId) => {
    try {
      const purchasesJson = await AsyncStorage.getItem(PURCHASES_KEY);
      const purchases = purchasesJson ? JSON.parse(purchasesJson) : [];
      
      const purchaseIndex = purchases.findIndex(purchase => purchase.id === purchaseId);
      
      if (purchaseIndex === -1) {
        throw new Error('Purchase not found');
      }
      
      const purchaseToDelete = purchases[purchaseIndex];
      
      purchases.splice(purchaseIndex, 1);
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
      
      // Remove quantity from inventory
      const allInventory = await DataService.getInventory();
      const itemIndex = allInventory.findIndex(
        (item) => item.itemName === purchaseToDelete.itemName && 
        item.databaseId === purchaseToDelete.databaseId
      );

      if (itemIndex !== -1) {
        const item = allInventory[itemIndex];
        const newCartonQuantity = Math.max(0, parseInt(item.cartonQuantity) - parseInt(purchaseToDelete.cartonQuantity || 0));

        if (newCartonQuantity === 0) {
          allInventory.splice(itemIndex, 1);
        } else {
          allInventory[itemIndex].cartonQuantity = newCartonQuantity;
          allInventory[itemIndex].totalQuantity = newCartonQuantity * item.quantityPerCarton;
        }

        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(allInventory));
      }
      
      return purchases;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  },

  // Credit functions
  getCredits: async () => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const creditsJson = await AsyncStorage.getItem(CREDITS_KEY);
    const credits = creditsJson ? JSON.parse(creditsJson) : [];

    return selectedDatabase
      ? credits.filter((credit) => credit.databaseId === selectedDatabase.id)
      : credits;
  },

  saveCreditSale: async (credit) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const credits = await DataService.getCredits();

    const newCredit = {
      ...credit,
      id: credit.id || Date.now().toString(),
      creditDate: credit.creditDate || new Date().toISOString(),
      paymentStatus: credit.paymentStatus || 'Unpaid',
      databaseId: selectedDatabase ? selectedDatabase.id : null,
    };

    credits.push(newCredit);
    await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(credits));

    // Update inventory quantities
    const inventory = await DataService.getInventory();
    const itemIndex = inventory.findIndex(
      item => item.itemName === credit.itemName && 
      item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (itemIndex !== -1) {
      const item = inventory[itemIndex];
      const newCartonQuantity = item.cartonQuantity - (credit.cartonQuantity || 0);
      
      if (newCartonQuantity <= 0) {
        inventory.splice(itemIndex, 1);
      } else {
        inventory[itemIndex].cartonQuantity = newCartonQuantity;
        inventory[itemIndex].totalQuantity = newCartonQuantity * item.quantityPerCarton;
      }
      
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    }

    return newCredit;
  },

  updateCreditStatus: async (creditId, newStatus) => {
    const credits = await DataService.getCredits();
    const updatedCredits = credits.map(credit => 
      credit.id === creditId ? { ...credit, paymentStatus: newStatus } : credit
    );
    await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(updatedCredits));
    return updatedCredits;
  },

  deleteCreditSale: async (creditId) => {
    try {
      const creditsJson = await AsyncStorage.getItem(CREDITS_KEY);
      const credits = creditsJson ? JSON.parse(creditsJson) : [];
      
      const creditIndex = credits.findIndex(credit => credit.id === creditId);
      
      if (creditIndex === -1) {
        throw new Error('Credit sale not found');
      }
      
      const creditToDelete = credits[creditIndex];
      
      credits.splice(creditIndex, 1);
      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(credits));
      
      // Add quantity back to inventory
      const inventory = await DataService.getInventory();
      const existingItem = inventory.find(
        item => item.itemName === creditToDelete.itemName && 
        item.databaseId === creditToDelete.databaseId
      );
      
      if (existingItem) {
        const newCartonQuantity = existingItem.cartonQuantity + (creditToDelete.cartonQuantity || 0);
        await DataService.updateInventoryItemQuantity(existingItem.itemName, newCartonQuantity);
      } else {
        await DataService.saveInventoryItem({
          itemName: creditToDelete.itemName,
          cartonQuantity: creditToDelete.cartonQuantity || 0,
          quantityPerCarton: creditToDelete.quantityPerCarton || 0,
          totalQuantity: (creditToDelete.cartonQuantity || 0) * (creditToDelete.quantityPerCarton || 0),
          pricePerPiece: creditToDelete.pricePerPiece || 0,
          pricePerCarton: creditToDelete.pricePerCarton || 0,
          source: 'Returned Credit',
          databaseId: creditToDelete.databaseId
        });
      }
      
      return credits;
    } catch (error) {
      console.error('Error deleting credit sale:', error);
      throw error;
    }
  },

  returnCreditSale: async (creditId) => {
    try {
      const credits = await DataService.getCredits();
      const creditIndex = credits.findIndex(credit => credit.id === creditId);
      
      if (creditIndex === -1) {
        throw new Error('Credit sale not found');
      }
      
      const creditToReturn = credits[creditIndex];
      
      // Remove from credits
      credits.splice(creditIndex, 1);
      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(credits));
      
      // Add quantity back to inventory
      const inventory = await DataService.getInventory();
      const existingItem = inventory.find(
        item => item.itemName === creditToReturn.itemName && 
        item.databaseId === creditToReturn.databaseId
      );
      
      if (existingItem) {
        const newCartonQuantity = existingItem.cartonQuantity + (creditToReturn.cartonQuantity || 0);
        await DataService.updateInventoryItemQuantity(existingItem.itemName, newCartonQuantity);
      } else {
        await DataService.saveInventoryItem({
          itemName: creditToReturn.itemName,
          cartonQuantity: creditToReturn.cartonQuantity || 0,
          quantityPerCarton: creditToReturn.quantityPerCarton || 0,
          totalQuantity: (creditToReturn.cartonQuantity || 0) * (creditToReturn.quantityPerCarton || 0),
          pricePerPiece: creditToReturn.pricePerPiece || 0,
          pricePerCarton: creditToReturn.pricePerCarton || 0,
          source: 'Returned Credit',
          databaseId: creditToReturn.databaseId
        });
      }
      
      return credits;
    } catch (error) {
      console.error('Error returning credit sale:', error);
      throw error;
    }
  },

  deleteInventoryByDatabaseId: async (databaseId) => {
    const inventory = await DataService.getInventory();
    const updatedInventory = inventory.filter((item) => item.databaseId !== databaseId);
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  }
};

export default DataService;