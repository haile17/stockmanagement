import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from './NotificationService';
import { DataService } from '../services/DataService';
import notifee, { AndroidImportance } from '@notifee/react-native';

const ALERT_SETTINGS_KEY = 'alert_settings';
const LAST_ALERT_KEY = 'last_alert_times';

class StockAlertManager {
  constructor() {
    this.defaultSettings = {
      enableStockAlerts: true,
      enablePurchaseReminders: true,
      enableCreditReminders: true,
      enableSaleNotifications: true,
      stockAlertFrequency: 'daily', // 'immediate', 'daily', 'weekly'
      creditReminderDays: 7, // Remind 7 days before due date
      businessHours: {
        start: '09:00',
        end: '18:00',
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00',
      },
    };
    
    // Initialize when created
    this.initializeSettings();
    this.startPeriodicChecks();
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
        console.log('Default alert settings initialized');
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
      console.log('Alert settings updated:', updatedSettings);
      
      // If stock alerts were enabled, schedule a check
      if (updatedSettings.enableStockAlerts && !currentSettings.enableStockAlerts) {
        setTimeout(() => this.checkLowStockItems(), 1000);
      }
    } catch (error) {
      console.error('Error updating alert settings:', error);
    }
  };

  // Check if current time is within business/quiet hours
  isWithinAllowedHours = async () => {
    const settings = await this.getSettings();
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert to HHMM format
    
    // Check quiet hours first
    if (settings.quietHours?.enabled) {
      const quietStart = this.timeStringToMinutes(settings.quietHours.start);
      const quietEnd = this.timeStringToMinutes(settings.quietHours.end);
      
      if (this.isTimeInRange(currentTime, quietStart, quietEnd)) {
        return false; // Don't send notifications during quiet hours
      }
    }
    
    // Check business hours
    const businessStart = this.timeStringToMinutes(settings.businessHours.start);
    const businessEnd = this.timeStringToMinutes(settings.businessHours.end);
    
    return this.isTimeInRange(currentTime, businessStart, businessEnd);
  };

  // Helper function to convert time string to minutes
  timeStringToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 100 + minutes;
  };

  // Helper function to check if current time is in range
  isTimeInRange = (currentTime, startTime, endTime) => {
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Handle overnight range (e.g., 22:00 to 07:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  };

  // Check for low stock items
  checkLowStockItems = async () => {
    try {
      const settings = await this.getSettings();
      if (!settings.enableStockAlerts) return;

      const inventory = await DataService.getInventory();
      if (!inventory || inventory.length === 0) return;

      const lowStockItems = inventory.filter(item => {
        const minStock = item.minStockAlert || 0;
        return minStock > 0 && item.cartonQuantity <= minStock;
      });

      console.log(`Found ${lowStockItems.length} low stock items`);

      if (lowStockItems.length > 0) {
        const allowedTime = await this.isWithinAllowedHours();
        if (allowedTime) {
          await this.sendLowStockNotifications(lowStockItems);
        } else {
          console.log('Outside allowed hours, scheduling for later');
          this.scheduleNextBusinessHourCheck();
        }
      }
    } catch (error) {
      console.error('Error checking low stock items:', error);
    }
  };

  // Send low stock notifications
  sendLowStockNotifications = async (lowStockItems) => {
    try {
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
          // Use the NotificationService method instead of direct call
          await NotificationService.showStockAlert(item.itemName, item.cartonQuantity);

          // Update last alert time
          lastAlerts[alertKey] = now;
          await this.setLastAlertTimes(lastAlerts);
          
          console.log(`Low stock alert sent for ${item.itemName}`);
        }
      }
    } catch (error) {
      console.error('Error sending low stock notifications:', error);
    }
  };

  // Check for credit payment reminders
  checkCreditReminders = async () => {
    try {
      const settings = await this.getSettings();
      if (!settings.enableCreditReminders) return;

      const credits = await DataService.getCredits();
      if (!credits || credits.length === 0) return;

      const upcomingDues = credits.filter(credit => {
        if (credit.paymentStatus === 'Paid' || !credit.dueDate) return false;
        
        const dueDate = new Date(credit.dueDate).getTime();
        const now = new Date().getTime();
        const daysUntilDue = (dueDate - now) / (1000 * 60 * 60 * 24);
        
        return daysUntilDue <= settings.creditReminderDays && daysUntilDue > 0;
      });

      console.log(`Found ${upcomingDues.length} upcoming credit dues`);

      if (upcomingDues.length > 0) {
        const allowedTime = await this.isWithinAllowedHours();
        if (allowedTime) {
          await this.sendCreditReminders(upcomingDues);
        }
      }
    } catch (error) {
      console.error('Error checking credit reminders:', error);
    }
  };

  // Send credit reminders
  sendCreditReminders = async (credits) => {
  try {
    for (const credit of credits) {
      const dueDate = new Date(credit.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      // Use notifee directly instead of NotificationService.showNotification
      const notificationId = await notifee.displayNotification({
        title: '💳 Credit Payment Reminder',
        body: `Payment due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''} for ${credit.customerName}: ${credit.totalAmount} Birr`,
        data: {
          type: 'credit_due',
          creditId: credit.id,
          customerName: credit.customerName,
          amount: credit.totalAmount,
          dueDate: credit.dueDate,
          screen: 'Credit'
        },
        android: {
          channelId: 'sales',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          actions: [
            {
              title: 'View',
              pressAction: { id: 'view' },
            },
            {
              title: 'Dismiss',
              pressAction: { id: 'dismiss' },
            },
          ],
          // No icon properties - use system default
        },
        ios: {
          categoryId: 'default',
          sound: 'default',
          badge: 1,
        },
      });
      
      console.log(`Credit reminder sent for ${credit.customerName}`);
    }
  } catch (error) {
    console.error('Error sending credit reminders:', error);
  }
};

  // Send purchase success notification
  sendPurchaseNotification = async (purchase) => {
  try {
    const settings = await this.getSettings();
    if (!settings.enablePurchaseReminders) return;

    // Use notifee directly instead of NotificationService
    const notificationId = await notifee.displayNotification({
      title: 'Purchase Successful',
      body: `Successfully purchased ${purchase.cartonQuantity} cartons of ${purchase.itemName}`,
      data: {
        type: 'purchase_success',
        purchaseId: purchase.id,
        itemName: purchase.itemName,
        quantity: purchase.cartonQuantity,
        amount: purchase.totalAmount,
        screen: 'Purchase'
      },
      android: {
        channelId: 'purchases',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'View',
            pressAction: { id: 'view' },
          },
          {
            title: 'Dismiss',
            pressAction: { id: 'dismiss' },
          },
        ],
        // No icon properties - use system default
      },
      ios: {
        categoryId: 'default',
        sound: 'default',
        badge: 1,
      },
    });
    
    console.log(`Purchase notification sent for ${purchase.itemName}`);
  } catch (error) {
    console.error('Error sending purchase notification:', error);
  }
};

  // Send sale notification
  sendSaleNotification = async (sale) => {
  try {
    const settings = await this.getSettings();
    if (!settings.enableSaleNotifications) return;

    // Use notifee directly instead of NotificationService
    const notificationId = await notifee.displayNotification({
      title: 'Sale Completed',
      body: `Sold ${sale.cartonQuantity} cartons of ${sale.itemName} for ${sale.totalAmount} Birr`,
      data: {
        type: 'sale_success',
        salesId: sale.id,
        itemName: sale.itemName,
        quantity: sale.cartonQuantity,
        amount: sale.totalAmount,
        screen: 'Sales'
      },
      android: {
        channelId: 'sales',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: 'View',
            pressAction: { id: 'view' },
          },
          {
            title: 'Dismiss',
            pressAction: { id: 'dismiss' },
          },
        ],
        // No icon properties - use system default
      },
      ios: {
        categoryId: 'default',
        sound: 'default',
        badge: 1,
      },
    });
    
    console.log(`Sale notification sent for ${sale.itemName}`);
  } catch (error) {
    console.error('Error sending sale notification:', error);
  }
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

  // Schedule next business hour check
  scheduleNextBusinessHourCheck = async () => {
    try {
      const settings = await this.getSettings();
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Set to business start time
      const [hours, minutes] = settings.businessHours.start.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);

      await NotificationService.scheduleNotification(
        'Stock Check Reminder',
        'Time for your daily inventory check',
        tomorrow,
        { 
          type: 'daily_check',
          automated: true 
        },
        'stock-alerts'
      );
      
      console.log('Next business hour check scheduled for:', tomorrow);
    } catch (error) {
      console.error('Error scheduling next business hour check:', error);
    }
  };

  // Schedule daily stock check
  scheduleDailyStockCheck = async () => {
    try {
      const settings = await this.getSettings();
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Set to business start time
      const [hours, minutes] = settings.businessHours.start.split(':').map(Number);
      tomorrow.setHours(hours, minutes, 0, 0);

      await NotificationService.scheduleNotification(
        '📊 Daily Stock Check',
        'Time for your daily inventory review',
        tomorrow,
        { 
          type: 'daily_check',
          screen: 'Inventory'
        },
        'stock-alerts'
      );
      
      console.log('Daily stock check scheduled for:', tomorrow);
    } catch (error) {
      console.error('Error scheduling daily stock check:', error);
    }
  };

  // Start periodic checks (every 30 minutes)
  startPeriodicChecks = () => {
    // Initial check after 5 seconds
    setTimeout(() => {
      this.checkLowStockItems();
      this.checkCreditReminders();
    }, 5000);

    // Set up periodic checks every 30 minutes
    setInterval(() => {
      this.checkLowStockItems();
      this.checkCreditReminders();
    }, 30 * 60 * 1000); // 30 minutes

    console.log('Periodic stock and credit checks started');
  };

  // Manual trigger for immediate checks (useful for testing or manual refresh)
  triggerImmediateCheck = async () => {
    console.log('Triggering immediate stock and credit checks...');
    await this.checkLowStockItems();
    await this.checkCreditReminders();
  };

  // Get statistics for dashboard
  getAlertStatistics = async () => {
    try {
      const inventory = await DataService.getInventory();
      const credits = await DataService.getCredits();
      
      const lowStockCount = inventory ? inventory.filter(item => {
        const minStock = item.minStockAlert || 0;
        return minStock > 0 && item.cartonQuantity <= minStock;
      }).length : 0;

      const overdueCreditsCount = credits ? credits.filter(credit => {
        if (credit.paymentStatus === 'Paid' || !credit.dueDate) return false;
        return new Date(credit.dueDate) < new Date();
      }).length : 0;

      return {
        lowStockItems: lowStockCount,
        overdueCredits: overdueCreditsCount,
        lastCheck: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting alert statistics:', error);
      return {
        lowStockItems: 0,
        overdueCredits: 0,
        lastCheck: new Date().toISOString(),
      };
    }
  };
}

export default new StockAlertManager();