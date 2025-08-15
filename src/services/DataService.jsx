import AsyncStorage from '@react-native-async-storage/async-storage';
import StockAlertManager from '../components/StockAlertManager'; // Fixed import path

const INVENTORY_KEY = 'inventory';
const SALES_KEY = 'sales';
const PURCHASES_KEY = 'purchases';
const CREDITS_KEY = 'credits';

export const DataService = {
  // Inventory functions
  saveInventoryItem: async (item) => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const inventory = await DataService.getInventory();
      
      // Validate the item first
      DataService.validateInventoryItem(item);
      
      // Calculate total quantity
      const totalQuantity = (item.cartonQuantity || 0) * (item.quantityPerCarton || 0);
      
      const existingItemIndex = inventory.findIndex(
        (i) => i.itemName === item.itemName && i.source === item.source
      );

      if (existingItemIndex !== -1) {
        inventory[existingItemIndex] = {
          ...inventory[existingItemIndex],
          ...item,
          // When updating existing items, add quantities instead of replacing for purchases
          cartonQuantity: item.source === 'Purchase' ? 
            (inventory[existingItemIndex].cartonQuantity || 0) + (item.cartonQuantity || 0) : 
            (item.cartonQuantity || inventory[existingItemIndex].cartonQuantity),
          totalQuantity: item.source === 'Purchase' ? 
            ((inventory[existingItemIndex].cartonQuantity || 0) + (item.cartonQuantity || 0)) * (item.quantityPerCarton || inventory[existingItemIndex].quantityPerCarton) :
            totalQuantity,
          databaseId: selectedDatabase ? selectedDatabase.id : inventory[existingItemIndex].databaseId,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        inventory.push({
          ...item,
          totalQuantity,
          databaseId: selectedDatabase ? selectedDatabase.id : null,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
      }

      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      
      // Trigger stock check after inventory update
      setTimeout(() => {
        StockAlertManager.triggerImmediateCheck();
      }, 1000);
      
      return inventory;
    } catch (error) {
      console.error('Error saving inventory item:', error);
      throw error;
    }
  },

  deleteInventoryItem: async (item) => {
    try {
      const inventory = await DataService.getInventory();
      const updatedInventory = inventory.filter(invItem => 
        invItem.itemName !== item.itemName || 
        invItem.source !== item.source
      );
      
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
      
      // Trigger stock check after deletion
      setTimeout(() => {
        StockAlertManager.triggerImmediateCheck();
      }, 1000);
      
      return updatedInventory;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  getInventory: async () => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const inventoryJson = await AsyncStorage.getItem(INVENTORY_KEY);
      const inventory = inventoryJson ? JSON.parse(inventoryJson) : [];

      const filteredInventory = selectedDatabase
        ? inventory.filter((item) => item.databaseId === selectedDatabase.id)
        : inventory;
      
      // Ensure all items have required properties with defaults
      return filteredInventory.map(item => ({
        ...item,
        itemName: item.itemName || '',
        cartonQuantity: item.cartonQuantity || 0,
        quantityPerCarton: item.quantityPerCarton || 0,
        totalQuantity: item.totalQuantity || (item.cartonQuantity || 0) * (item.quantityPerCarton || 0),
        pricePerPiece: item.pricePerPiece || 0,
        pricePerCarton: item.pricePerCarton || 0,
        purchasePricePerPiece: item.purchasePricePerPiece || 0,
        purchasePricePerCarton: item.purchasePricePerCarton || 0,
        source: item.source || 'Unknown',
        minStockAlert: item.minStockAlert || 0,
        createdAt: item.createdAt || new Date().toISOString(),
        lastUpdated: item.lastUpdated || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error getting inventory:', error);
      return [];
    }
  },

  updateInventoryItem: async (itemName, updatedItem) => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const inventory = await DataService.getInventory();
      const index = inventory.findIndex(
        (item) => item.itemName === itemName && 
        item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
      );

      if (index !== -1) {
        const updatedCartonQty = updatedItem.cartonQuantity || inventory[index].cartonQuantity;
        const updatedPricePerCarton = updatedItem.purchasePricePerCarton || inventory[index].purchasePricePerCarton;
        
        inventory[index] = {
          ...inventory[index],
          ...updatedItem,
          totalQuantity: updatedCartonQty * (updatedItem.quantityPerCarton || inventory[index].quantityPerCarton),
          // Auto-calculate totalAmount when carton quantity or price changes
          totalAmount: updatedCartonQty * updatedPricePerCarton,
          lastUpdated: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
        
        // Check for low stock after update
        setTimeout(() => {
          StockAlertManager.triggerImmediateCheck();
        }, 1000);
      }
      return inventory;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  updateInventoryItemQuantity: async (itemName, newQuantity) => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const inventory = await DataService.getInventory();
      const updatedInventory = inventory
        .map((item) => {
          if (item.itemName === itemName && item.databaseId === (selectedDatabase ? selectedDatabase.id : null)) {
            const updatedQuantity = Math.max(0, parseInt(newQuantity) || 0);
            return updatedQuantity === 0 ? null : { 
              ...item, 
              cartonQuantity: updatedQuantity,
              totalQuantity: updatedQuantity * (item.quantityPerCarton || 1),
              lastUpdated: new Date().toISOString(),
            };
          }
          return item;
        })
        .filter(Boolean);

      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
      
      // Check for low stock after quantity update
      setTimeout(() => {
        StockAlertManager.triggerImmediateCheck();
      }, 1000);
      
      return updatedInventory;
    } catch (error) {
      console.error('Error updating inventory item quantity:', error);
      throw error;
    }
  },

  removeInventoryItem: async (itemName) => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const inventory = await DataService.getInventory();
      const updatedInventory = inventory.filter(
        (item) => item.itemName !== itemName || item.databaseId !== (selectedDatabase ? selectedDatabase.id : null)
      );

      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
      return updatedInventory;
    } catch (error) {
      console.error('Error removing inventory item:', error);
      throw error;
    }
  },

  // Sales functions
  getSales: async () => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const salesJson = await AsyncStorage.getItem(SALES_KEY);
      const sales = salesJson ? JSON.parse(salesJson) : [];

      return selectedDatabase
        ? sales.filter((sale) => sale.databaseId === selectedDatabase.id)
        : sales;
    } catch (error) {
      console.error('Error getting sales:', error);
      return [];
    }
  },

  saveSale: async (sale) => {
    try {
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
            inventory[itemIndex].lastUpdated = new Date().toISOString();
          }
          
          await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
        }
      }

      // Send sale notification using StockAlertManager
      try {
        await StockAlertManager.sendSaleNotification(newSale);
      } catch (error) {
        console.error('Error sending sale notification:', error);
      }
      
      // Check for low stock after sale
      setTimeout(() => {
        StockAlertManager.triggerImmediateCheck();
      }, 1000);
      
      return newSale;
    } catch (error) {
      console.error('Error saving sale:', error);
      throw error;
    }
  },

  transferCreditToSale: async (creditId) => {
    try {
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

      // Send sale notification for converted credit
      try {
        await StockAlertManager.sendSaleNotification(sale);
      } catch (error) {
        console.error('Error sending converted credit sale notification:', error);
      }

      return { updatedCredits: credits, updatedSales: sales };
    } catch (error) {
      console.error('Error transferring credit to sale:', error);
      throw error;
    }
  },

  returnSale: async (saleId) => {
    try {
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
    } catch (error) {
      console.error('Error returning sale:', error);
      throw error;
    }
  },

  // Purchase functions
  getPurchases: async () => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const purchasesJson = await AsyncStorage.getItem(PURCHASES_KEY);
      const purchases = purchasesJson ? JSON.parse(purchasesJson) : [];

      return selectedDatabase
        ? purchases.filter((purchase) => purchase.databaseId === selectedDatabase.id)
        : purchases;
    } catch (error) {
      console.error('Error getting purchases:', error);
      return [];
    }
  },

  savePurchase: async (purchase) => {
    try {
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

      // Check if item already exists in inventory
      const existingInventory = await DataService.getInventory();
      const existingItem = existingInventory.find(item => 
        item.itemName.toLowerCase() === purchase.itemName.toLowerCase() && 
        item.databaseId === (selectedDatabase ? selectedDatabase.id : null)
      );

      const purchasedCartons = parseInt(purchase.cartonQuantity) || 0;
      const quantityPerCarton = parseInt(purchase.quantityPerCarton) || 0;

      if (existingItem) {
        // UPDATE existing inventory item (add to existing stock)
        const updatedInventoryItem = {
          // Add new purchase quantities to existing stock
          cartonQuantity: (existingItem.cartonQuantity || 0) + purchasedCartons,
          quantityPerCarton: quantityPerCarton, // Keep consistent
          
          // Update prices with latest purchase prices
          purchasePricePerPiece: parseFloat(purchase.purchasePricePerPiece) || 0,
          purchasePricePerCarton: parseFloat(purchase.purchasePricePerCarton) || 0,
          
          // Keep or update selling prices (from the purchase form)
          pricePerPiece: parseFloat(purchase.pricePerPiece) || existingItem.pricePerPiece || 0,
          pricePerCarton: parseFloat(purchase.pricePerCarton) || existingItem.pricePerCarton || 0,
          
          // Calculate total amount for this updated inventory
          totalAmount: ((existingItem.cartonQuantity || 0) + purchasedCartons) * (parseFloat(purchase.purchasePricePerCarton) || 0),
          
          // Update other fields
          source: purchase.source || existingItem.source || 'Purchase',
          lastPurchaseDate: purchase.purchaseDate || new Date().toISOString(),
          bulkUnit: purchase.bulkUnit || existingItem.bulkUnit || 'Carton',
          minStockAlert: purchase.minStockAlert ? parseInt(purchase.minStockAlert) : (existingItem.minStockAlert || null),
          itemCode: purchase.itemCode || existingItem.itemCode || '',
          lastUpdated: new Date().toISOString(),
        };

        // Use your existing updateInventoryItem method
        await DataService.updateInventoryItem(purchase.itemName, updatedInventoryItem);
        
      } else {
        // CREATE new inventory item
        const inventoryItem = {
          itemName: purchase.itemName,
          itemCode: purchase.itemCode || '',
          cartonQuantity: purchasedCartons,
          quantityPerCarton: quantityPerCarton,
          totalQuantity: purchasedCartons * quantityPerCarton,
          
          // Purchase prices (what you paid)
          purchasePricePerPiece: parseFloat(purchase.purchasePricePerPiece) || 0,
          purchasePricePerCarton: parseFloat(purchase.purchasePricePerCarton) || 0,
          totalAmount: parseFloat(purchase.totalAmount) || (purchasedCartons * (parseFloat(purchase.purchasePricePerCarton) || 0)),
          
          // Selling prices (what you'll sell for)
          pricePerPiece: parseFloat(purchase.pricePerPiece) || 0,
          pricePerCarton: parseFloat(purchase.pricePerCarton) || 0,
          
          // Additional fields
          bulkUnit: purchase.bulkUnit || 'Carton',
          source: purchase.source || 'Purchase',
          lastPurchaseDate: purchase.purchaseDate || new Date().toISOString(),
          minStockAlert: purchase.minStockAlert ? parseInt(purchase.minStockAlert) : null,
          databaseId: selectedDatabase ? selectedDatabase.id : null,
          id: Date.now().toString() + '_inv', // Unique ID for inventory item
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        };

        await DataService.saveInventoryItem(inventoryItem);
      }

      // Send purchase notification using StockAlertManager
      try {
        await StockAlertManager.sendPurchaseNotification(newPurchase);
      } catch (error) {
        console.error('Error sending purchase notification:', error);
      }
      
      // Check if any items are now above minimum stock (delayed to allow inventory update)
      setTimeout(() => {
        StockAlertManager.triggerImmediateCheck();
      }, 1500);

      return newPurchase;
    } catch (error) {
      console.error('Error saving purchase:', error);
      throw error;
    }
  },

  // Update credit function
  updateCredit: async (creditId, updatedCreditData) => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const creditsJson = await AsyncStorage.getItem(CREDITS_KEY);
      const allCredits = creditsJson ? JSON.parse(creditsJson) : [];
      
      const creditIndex = allCredits.findIndex(credit => 
        credit.id === creditId && 
        credit.databaseId === (selectedDatabase ? selectedDatabase.id : null)
      );
      
      if (creditIndex === -1) {
        throw new Error('Credit not found');
      }
      
      // Update the credit with new data
      allCredits[creditIndex] = {
        ...allCredits[creditIndex],
        ...updatedCreditData,
        lastUpdated: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(allCredits));
      
      // Check for credit reminders after update
      setTimeout(() => {
        StockAlertManager.checkCreditReminders();
      }, 1000);
      
      // Return only the credits for the current database
      return selectedDatabase
        ? allCredits.filter((credit) => credit.databaseId === selectedDatabase.id)
        : allCredits;
    } catch (error) {
      console.error('Error updating credit:', error);
      throw error;
    }
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
          allInventory[itemIndex].lastUpdated = new Date().toISOString();
        }

        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(allInventory));
        
        // Check for low stock after deletion
        setTimeout(() => {
          StockAlertManager.triggerImmediateCheck();
        }, 1000);
      }
      
      return purchases;
    } catch (error) {
      console.error('Error deleting purchase:', error);
      throw error;
    }
  },

  // Credit functions
  getCredits: async () => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const creditsJson = await AsyncStorage.getItem(CREDITS_KEY);
      const credits = creditsJson ? JSON.parse(creditsJson) : [];

      return selectedDatabase
        ? credits.filter((credit) => credit.databaseId === selectedDatabase.id)
        : credits;
    } catch (error) {
      console.error('Error getting credits:', error);
      return [];
    }
  },

  saveCreditSale: async (credit) => {
    try {
      const selectedDatabase = JSON.parse(await AsyncStorage.getItem('selectedInventoryDatabase'));
      const credits = await DataService.getCredits();

      const newCredit = {
        ...credit,
        id: credit.id || Date.now().toString(),
        creditDate: credit.creditDate || new Date().toISOString(),
        paymentStatus: credit.paymentStatus || 'Unpaid',
        databaseId: selectedDatabase ? selectedDatabase.id : null,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
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
          inventory[itemIndex].lastUpdated = new Date().toISOString();
        }
        
        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      }

      // Check for low stock and credit reminders
      setTimeout(() => {
        StockAlertManager.triggerImmediateCheck();
        StockAlertManager.checkCreditReminders();
      }, 1000);

      return newCredit;
    } catch (error) {
      console.error('Error saving credit sale:', error);
      throw error;
    }
  },

  updateCreditStatus: async (creditId, newStatus) => {
    try {
      const credits = await DataService.getCredits();
      const updatedCredits = credits.map(credit => 
        credit.id === creditId ? { 
          ...credit, 
          paymentStatus: newStatus,
          lastUpdated: new Date().toISOString(),
          ...(newStatus === 'Paid' ? { paidDate: new Date().toISOString() } : {})
        } : credit
      );
      await AsyncStorage.setItem(CREDITS_KEY, JSON.stringify(updatedCredits));
      
      // Check credit reminders after status update
      setTimeout(() => {
        StockAlertManager.checkCreditReminders();
      }, 1000);
      
      return updatedCredits;
    } catch (error) {
      console.error('Error updating credit status:', error);
      throw error;
    }
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
    try {
      const inventory = await DataService.getInventory();
      const updatedInventory = inventory.filter((item) => item.databaseId !== databaseId);
      await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(updatedInventory));
      return updatedInventory;
    } catch (error) {
      console.error('Error deleting inventory by database ID:', error);
      throw error;
    }
  },

validateInventoryItem: (item) => {
  const required = ['itemName', 'cartonQuantity', 'quantityPerCarton', 'pricePerPiece'];
  const missing = required.filter(field => !item[field] && item[field] !== 0);
  
   if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (item.cartonQuantity < 0 || item.quantityPerCarton < 0) {
    throw new Error('Quantities cannot be negative');
  }
  
  // Add price validation
  if (item.pricePerPiece < 0 || item.pricePerCarton < 0) {
    throw new Error('Prices cannot be negative');
  }
  
  return true;
},
}
export default DataService;