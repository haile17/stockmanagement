import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { DataService } from '../services/DataService';

const ALERT_SETTINGS_KEY = 'alert_settings';
const LAST_ALERT_KEY = 'last_alert_times';

class StockAlertManager {
  constructor() {
    this.defaultSettings = {
      enableStockAlerts: true,
      enablePurchaseReminders: true,
      enableCreditReminders: true,
      stockAlertFrequency: 'daily', // 'immediate', 'daily', 'weekly'
      creditReminderDays: 7, // Remind 7 days before due date
      businessHours: {
        start: '09:00',
        end: '18:00',
      },
    };
  }

  // Initialize alert settings
  initializeSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(ALERT_SETTINGS_KEY);
      if (!settings) {
        await AsyncStorage.setItem(
          ALERT_SETTINGS_KEY,
          JSON.stringify(this.defaultSettings)
        );
      }
    } catch (error) {
      console.error('Error initializing alert settings:', error);
    }
  };

  // Get alert settings
  getSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(ALERT_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : this.defaultSettings;
    } catch (error) {
      console.error('Error getting alert settings:', error);
      return this.defaultSettings;
    }
  };

  // Update alert settings
  updateSettings = async (newSettings) => {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem(
        ALERT_SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error('Error updating alert settings:', error);
    }
  };

  // Check for low stock items
  checkLowStockItems = async () => {
    try {
      const settings = await this.getSettings();
      if (!settings.enableStockAlerts) return;

      const inventory = await DataService.getInventory();
      const lowStockItems = inventory.filter(item => {
        const minStock = item.minStockAlert || 0;
        return minStock > 0 && item.cartonQuantity <= minStock;
      });

      if (lowStockItems.length > 0) {
        await this.sendLowStockNotifications(lowStockItems);
      }
    } catch (error) {
      console.error('Error checking low stock items:', error);
    }
  };

  // Send low stock notifications
  sendLowStockNotifications = async (lowStockItems) => {
    const settings = await this.getSettings();
    const lastAlerts = await this.getLastAlertTimes();
    const now = new Date().getTime();

    for (const item of lowStockItems) {
      const alertKey = `low_stock_${item.itemName}`;
      const lastAlertTime = lastAlerts[alertKey] || 0;
      const timeSinceLastAlert = now - lastAlertTime;

      // Check if enough time has passed based on frequency setting
      let shouldAlert = false;
      switch (settings.stockAlertFrequency) {
        case 'immediate':
          shouldAlert = true;
          break;
        case 'daily':
          shouldAlert = timeSinceLastAlert > 24 * 60 * 60 * 1000; // 24 hours
          break;
        case 'weekly':
          shouldAlert = timeSinceLastAlert > 7 * 24 * 60 * 60 * 1000; // 7 days
          break;
      }

      if (shouldAlert) {
        NotificationService.showNotification(
          '⚠️ Low Stock Alert',
          `${item.itemName} is running low! Only ${item.cartonQuantity} cartons remaining.`,
          {
            type: 'low_stock',
            itemName: item.itemName,
            currentStock: item.cartonQuantity,
            minStock: item.minStockAlert,
            screen: 'Inventory'
          },
          'stock-alerts'
        );

        // Update last alert time
        lastAlerts[alertKey] = now;
        await this.setLastAlertTimes(lastAlerts);
      }
    }
  };

  // Check for credit payment reminders
  checkCreditReminders = async () => {
    try {
      const settings = await this.getSettings();
      if (!settings.enableCreditReminders) return;

      const credits = await DataService.getCredits();
      const upcomingDues = credits.filter(credit => {
        if (credit.paymentStatus === 'Paid' || !credit.dueDate) return false;
        
        const dueDate = new Date(credit.dueDate).getTime();
        const now = new Date().getTime();
        const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
        
        return daysUntilDue <= settings.creditReminderDays && daysUntilDue > 0;
      });

      if (upcomingDues.length > 0) {
        await this.sendCreditReminders(upcomingDues);
      }
    } catch (error) {
      console.error('Error checking credit reminders:', error);
    }
  };

  // Send credit reminders
  sendCreditReminders = async (credits) => {
    for (const credit of credits) {
      const dueDate = new Date(credit.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      NotificationService.showNotification(
        '💳 Credit Payment Reminder',
        `Payment due in ${daysUntilDue} days for ${credit.customerName}: ${credit.totalAmount} Birr`,
        {
          type: 'credit_due',
          creditId: credit.id,
          customerName: credit.customerName,
          amount: credit.totalAmount,
          dueDate: credit.dueDate,
          screen: 'Credits'
        },
        'sales'
      );
    }
  };

  // Send purchase success notification
  sendPurchaseNotification = async (purchase) => {
    const settings = await this.getSettings();
    if (!settings.enablePurchaseReminders) return;

    NotificationService.showNotification(
      '✅ Purchase Recorded',
      `Successfully purchased ${purchase.cartonQuantity} cartons of ${purchase.itemName}`,
      {
        type: 'purchase_success',
        itemName: purchase.itemName,
        quantity: purchase.cartonQuantity,
        amount: purchase.totalAmount,
        screen: 'Purchases'
      },
      'purchases'
    );
  };

  // Send sale notification
  sendSaleNotification = async (sale) => {
    NotificationService.showNotification(
      '💰 Sale Completed',
      `Sold ${sale.cartonQuantity} cartons of ${sale.itemName} for ${sale.totalAmount} Birr`,
      {
        type: 'sale_success',
        itemName: sale.itemName,
        quantity: sale.cartonQuantity,
        amount: sale.totalAmount,
        screen: 'Sales'
      },
      'sales'
    );
  };

  // Get last alert times
  getLastAlertTimes = async () => {
    try {
      const times = await AsyncStorage.getItem(LAST_ALERT_KEY);
      return times ? JSON.parse(times) : {};
    } catch (error) {
      console.error('Error getting last alert times:', error);
      return {};
    }
  };

  // Set last alert times
  setLastAlertTimes = async (times) => {
    try {
      await AsyncStorage.setItem(LAST_ALERT_KEY, JSON.stringify(times));
    } catch (error) {
      console.error('Error setting last alert times:', error);
    }
  };

  // Schedule daily stock check
  scheduleDailyStockCheck = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9:00 AM next day

    NotificationService.scheduleNotification(
      'Daily Stock Check',
      'Checking inventory levels...',
      tomorrow,
      { type: 'daily_check' },
      'stock-alerts'
    );
  };
}

export default new StockAlertManager();