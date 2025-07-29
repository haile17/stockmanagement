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
    const existingItemIndex = inventory.findIndex(
      (i) =>
        i.partNumber === item.partNumber &&
        i.source === item.source &&
        (selectedDatabase ? i.databaseId === selectedDatabase.id : true)
    );

    if (existingItemIndex !== -1) {
      inventory[existingItemIndex] = {
        ...inventory[existingItemIndex],
        name: item.name,
        quantity: inventory[existingItemIndex].quantity + Math.max(1, parseInt(item.quantity)),
        price: parseFloat(item.price),
        databaseId: selectedDatabase ? selectedDatabase.id : inventory[existingItemIndex].databaseId,
      };
    } else {
      inventory.push({
        ...item,
        quantity: Math.max(1, parseInt(item.quantity)),
        price: parseFloat(item.price),
        databaseId: selectedDatabase ? selectedDatabase.id : null,
      });
    }

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    return inventory;
  },

  deletePurchase: async (purchaseId) => {
    try {
      const purchasesJson = await AsyncStorage.getItem(PURCHASES_KEY);
      const purchases = purchasesJson ? JSON.parse(purchasesJson) : [];
      
      // Find the purchase to delete
      const purchaseIndex = purchases.findIndex(purchase => purchase.id === purchaseId);
      
      if (purchaseIndex === -1) {
        throw new Error('Purchase not found');
      }
      
      const purchaseToDelete = purchases[purchaseIndex];
      
      // Remove from purchases
      purchases.splice(purchaseIndex, 1);
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
      
      // Remove quantity from inventory (since deleting a purchase means we didn't actually buy those items)
      const allInventoryJson = await AsyncStorage.getItem(INVENTORY_KEY);
      const allInventory = allInventoryJson ? JSON.parse(allInventoryJson) : [];
      
      const itemIndex = allInventory.findIndex(
        (item) => item.partNumber === purchaseToDelete.partNumber && 
        item.databaseId === purchaseToDelete.databaseId
      );

      if (itemIndex !== -1) {
        const item = allInventory[itemIndex];
        const newQuantity = Math.max(0, parseInt(item.quantity) - parseInt(purchaseToDelete.quantity));

        if (newQuantity === 0) {
          allInventory.splice(itemIndex, 1);
        } else {
          allInventory[itemIndex].quantity = newQuantity;
        }

        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(allInventory));
      }
      
      return purchases;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw new Error('Failed to delete purchase');
    }
  },

  deleteInventoryItem: async (item) => {
  try {
    const inventoryJson = await AsyncStorage.getItem(INVENTORY_KEY);
    const allInventory = inventoryJson ? JSON.parse(inventoryJson) : [];
    
    // Remove the specific item by matching all properties
    const updatedInventory = allInventory.filter(inventoryItem => 
      !(inventoryItem.partNumber === item.partNumber && 
        inventoryItem.name === item.name && 
        inventoryItem.source === item.source &&
        inventoryItem.databaseId === item.databaseId)
    );
    
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  } catch (error) {
    throw new Error('Failed to delete inventory item');
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

  updateInventoryItem: async (partNumber, updatedItem) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    const index = inventory.findIndex(
      (item) =>
        item.partNumber === partNumber &&
        item.source === updatedItem.source &&
        item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (index !== -1) {
      inventory[index] = updatedItem;
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    } else {
      throw new Error('Item not found');
    }

    return inventory;
  },

  updateInventoryItemQuantity: async (partNumber, newQuantity) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    const updatedInventory = inventory
      .map((item) => {
        if (item.partNumber === partNumber && item.databaseId === (selectedDatabase ? selectedDatabase.id : null)) {
          const updatedQuantity = Math.max(0, parseInt(newQuantity) || 0);
          return updatedQuantity === 0 ? null : { ...item, quantity: updatedQuantity };
        }
        return item;
      })
      .filter(Boolean);

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  },

  removeInventoryItem: async (partNumber) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const inventory = await DataService.getInventory();
    const updatedInventory = inventory.filter(
      (item) => item.partNumber !== partNumber || item.databaseId !== (selectedDatabase ? selectedDatabase.id : null)
    );

    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  },

  // Sales functions
  getSales: async () => {
  const salesJson = await AsyncStorage.getItem(SALES_KEY);
  return salesJson ? JSON.parse(salesJson) : [];
},

  saveSale: async (sale) => {
  const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
  const salesJson = await AsyncStorage.getItem(SALES_KEY);
  const sales = salesJson ? JSON.parse(salesJson) : [];

  const newSale = {
    ...sale,
    id: sale.id || Date.now() + Math.random(), // Handle both new sales and converted credits
    date: sale.date || new Date().toISOString(),
    databaseId: sale.databaseId || (selectedDatabase ? selectedDatabase.id : null),
  };

  sales.push(newSale);
  await AsyncStorage.setItem(SALES_KEY, JSON.stringify(sales));

  // Only update inventory if this is a new sale (not a converted credit)
  // Converted credits already reduced inventory when credit was created
  if (!sale.isConvertedCredit) {
    const allInventoryJson = await AsyncStorage.getItem(INVENTORY_KEY);
    const allInventory = allInventoryJson ? JSON.parse(allInventoryJson) : [];
    
    const itemIndex = allInventory.findIndex(
      (i) => i.partNumber === sale.partNumber && 
      i.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (itemIndex !== -1) {
      const item = allInventory[itemIndex];
      const newQuantity = Math.max(0, parseInt(item.quantity) - parseInt(sale.quantity));

      if (newQuantity === 0) {
        allInventory.splice(itemIndex, 1);
      } else {
        allInventory[itemIndex].quantity = newQuantity;
      }

      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(allInventory));
    } else {
      throw new Error('Item not found in inventory');
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
      id: Date.now(),
      date: new Date().toISOString(),
      status: 'Paid',
      databaseId: selectedDatabase ? selectedDatabase.id : null,
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

    const inventory = await DataService.getInventory();
    const existingItem = inventory.find((item) => item.partNumber === returnedSale.partNumber);

    if (existingItem) {
      const newQuantity = parseInt(existingItem.quantity) + parseInt(returnedSale.quantity);
      await DataService.updateInventoryItemQuantity(existingItem.partNumber, newQuantity);
    } else {
      await DataService.saveInventoryItem({
        name: returnedSale.name,
        partNumber: returnedSale.partNumber,
        quantity: returnedSale.quantity,
        price: returnedSale.price,
        source: 'Returned Item',
        databaseId: selectedDatabase ? selectedDatabase.id : null,
      });
    }

    return { updatedSales: sales, updatedInventory: await DataService.getInventory() };
  },

  deleteInventoryByDatabaseId: async (databaseId) => {
    const inventory = await DataService.getInventory();
    const updatedInventory = inventory.filter((item) => item.databaseId !== databaseId);
    await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
    return updatedInventory;
  },

  // Credit sales functions
  getCredits: async () => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const credits = await AsyncStorage.getItem(CREDITS_KEY);
    const allCredits = credits ? JSON.parse(credits) : [];

    return selectedDatabase ? allCredits.filter((credit) => credit.databaseId === selectedDatabase.id) : allCredits;
  },

  saveCreditSale: async (creditSale) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const credits = await DataService.getCredits();

    const existingCreditIndex = credits.findIndex(
      (c) =>
        c.partNumber === creditSale.partNumber &&
        c.date === creditSale.date &&
        c.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (existingCreditIndex === -1) {
      const newCredit = {
        ...creditSale,
        id: Date.now(),
        date: new Date().toISOString(),
        status: 'Unpaid',
        databaseId: selectedDatabase ? selectedDatabase.id : null,
      };
      credits.push(newCredit);
      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(credits));

      const inventory = await DataService.getInventory();
      const item = inventory.find((i) => i.partNumber === creditSale.partNumber);

      if (item) {
        const newQuantity = Math.max(0, parseInt(item.quantity) - parseInt(creditSale.quantity));
        await DataService.updateInventoryItemQuantity(item.partNumber, newQuantity);
      } else {
        throw new Error('Item not found in inventory');
      }

      return newCredit;
    } else {
      throw new Error('Duplicate credit sale record detected');
    }
  },

  updateCreditStatus: async (creditId, newStatus) => {
    const credits = await DataService.getCredits();
    const updatedCredits = credits.map((credit) =>
      credit.id === creditId ? { ...credit, status: newStatus } : credit
    );
    await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(updatedCredits));
    return updatedCredits;
  },

  // Purchase functions
  getPurchases: async () => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const purchases = await AsyncStorage.getItem(PURCHASES_KEY);
    const allPurchases = purchases ? JSON.parse(purchases) : [];

    return selectedDatabase ? allPurchases.filter((purchase) => purchase.databaseId === selectedDatabase.id) : allPurchases;
  },

  
  savePurchase: async (purchase) => {
    const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
    const purchases = await DataService.getPurchases();

    const existingPurchaseIndex = purchases.findIndex(
      (p) =>
        p.partNumber === purchase.partNumber &&
        p.date === purchase.date &&
        p.databaseId === (selectedDatabase ? selectedDatabase.id : null)
    );

    if (existingPurchaseIndex === -1) {
      const newPurchase = {
        ...purchase,
        id: Date.now(),
        date: new Date().toISOString(),
        databaseId: selectedDatabase ? selectedDatabase.id : null,
      };
      purchases.push(newPurchase);
      await AsyncStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));

      await DataService.saveInventoryItem({
        name: purchase.name,
        partNumber: purchase.partNumber,
        quantity: purchase.quantity,
        price: purchase.price,
        source: purchase.source,
        databaseId: selectedDatabase ? selectedDatabase.id : null,
      });

      return newPurchase;
    } else {
      throw new Error('Duplicate purchase record detected');
    }
  },
  deleteCreditSale: async (creditId) => {
  try {
    const creditsJson = await AsyncStorage.getItem(CREDITS_KEY);
    const credits = creditsJson ? JSON.parse(creditsJson) : [];
    const updatedCredits = credits.filter(credit => credit.id !== creditId);
    await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(updatedCredits));
    return updatedCredits;
  } catch (error) {
    console.error('Error deleting credit sale:', error);
    throw new Error('Failed to delete credit sale');
  }
},
returnCreditSale: async (creditId) => {
  try {
    const creditsJson = await AsyncStorage.getItem(CREDITS_KEY);
    const credits = creditsJson ? JSON.parse(creditsJson) : [];
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
    const existingItem = inventory.find(item => item.partNumber === creditToReturn.partNumber);
    
    if (existingItem) {
      const newQuantity = parseInt(existingItem.quantity) + parseInt(creditToReturn.quantity);
      await DataService.updateInventoryItemQuantity(existingItem.partNumber, newQuantity);
    } else {
      // If item doesn't exist in inventory, add it back
      await DataService.saveInventoryItem({
        name: creditToReturn.name,
        partNumber: creditToReturn.partNumber,
        quantity: creditToReturn.quantity,
        price: creditToReturn.price,
        source: 'Returned Credit',
        databaseId: creditToReturn.databaseId
      });
    }
    
    return credits;
  } catch (error) {
    console.error('Error returning credit sale:', error);
    throw new Error('Failed to return credit sale');
  }
},
};

export default DataService;