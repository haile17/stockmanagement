import notifee, { 
  TriggerType, 
  AndroidImportance,
  AndroidVisibility,
  EventType 
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from '../App';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
    this.setupEventListeners();
  }

  configure = async () => {
    // Request permissions
    const settings = await notifee.requestPermission();
    console.log('Permission settings:', settings);
  };

  createDefaultChannels = async () => {
    // Create stock alerts channel
    await notifee.createChannel({
      id: 'stock-alerts',
      name: 'Stock Alerts',
      description: 'Notifications for low stock items',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'default',
      vibration: true,
    });

    await notifee.createChannel({
      id: 'purchases',
      name: 'Purchase Notifications',
      description: 'Notifications for purchase-related activities',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
      vibration: true,
    });

    await notifee.createChannel({
      id: 'sales',
      name: 'Sales Notifications',
      description: 'Notifications for sales-related activities',
      importance: AndroidImportance.DEFAULT,
      sound: 'default',
      vibration: true,
    });
  };

  // Show immediate notification
  showNotification = async (title, message, data = {}, channelId = 'stock-alerts') => {
    const notificationId = await notifee.displayNotification({
      title,
      body: message,
      data,
      android: {
        channelId,
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
        smallIcon: 'ic_dialog_info',
      },
      ios: {
        categoryId: 'default',
        sound: 'default',
        badge: 1,
      },
    });
    
    return notificationId;
  };

  // Schedule notification for specific date/time
  scheduleNotification = async (title, message, date, data = {}, channelId = 'stock-alerts') => {
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        title,
        body: message,
        data,
        android: {
          channelId,
          importance: AndroidImportance.DEFAULT,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      },
      trigger
    );

    // Store notification ID for future reference
    await this.storeNotificationId(notificationId, { title, message, date, data });
    return notificationId;
  };

  // Schedule repeating notification
  scheduleRepeatingNotification = async (title, message, repeatFrequency, data = {}, channelId = 'stock-alerts') => {
    const trigger = {
      type: TriggerType.INTERVAL,
      interval: repeatFrequency, // in milliseconds
      repeatFrequency: RepeatFrequency.DAILY, // or WEEKLY, MONTHLY
    };

    const notificationId = await notifee.createTriggerNotification(
      {
        title,
        body: message,
        data,
        android: {
          channelId,
        },
      },
      trigger
    );

    return notificationId;
  };

  // Convenience methods for different notification types
  showStockAlert = async (itemName, quantity) => {
    return await this.showNotification(
      'Low Stock Alert',
      `${itemName} is running low (${quantity} remaining)`,
      { 
        type: 'low_stock', 
        itemName, 
        quantity,
        screen: 'Inventory'
      },
      'stock-alerts'
    );
  };

  showPurchaseNotification = async (message, purchaseData = {}) => {
    return await this.showNotification(
      'Purchase Update',
      message,
      { 
        type: 'purchase_reminder', 
        ...purchaseData,
        screen: 'Purchases'
      },
      'purchases'
    );
  };

  showSalesNotification = async (message, salesData = {}) => {
    return await this.showNotification(
      'Sales Update',
      message,
      { 
        type: 'sales', 
        ...salesData,
        screen: 'Sales'
      },
      'sales'
    );
  };

  // Schedule low stock reminder
  scheduleStockReminder = async (itemName, checkDate) => {
    return await this.scheduleNotification(
      'Stock Check Reminder',
      `Time to check stock levels for ${itemName}`,
      checkDate,
      { 
        type: 'stock_reminder', 
        itemName,
        screen: 'Inventory'
      },
      'stock-alerts'
    );
  };

  // Cancel all notifications
  cancelAllNotifications = async () => {
    await notifee.cancelAllNotifications();
    await AsyncStorage.removeItem('notificationIds');
  };

  // Cancel specific notification
  cancelNotification = async (notificationId) => {
    await notifee.cancelNotification(notificationId);
    await this.removeStoredNotificationId(notificationId);
  };

  // Get all pending notifications
  getPendingNotifications = async () => {
    const notifications = await notifee.getTriggerNotifications();
    return notifications;
  };

  // Store notification ID for management
  storeNotificationId = async (notificationId, notificationData) => {
    try {
      const stored = await AsyncStorage.getItem('notificationIds') || '{}';
      const notifications = JSON.parse(stored);
      notifications[notificationId] = {
        ...notificationData,
        createdAt: new Date().toISOString()
      };
      await AsyncStorage.setItem('notificationIds', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error storing notification ID:', error);
    }
  };

  // Remove stored notification ID
  removeStoredNotificationId = async (notificationId) => {
    try {
      const stored = await AsyncStorage.getItem('notificationIds') || '{}';
      const notifications = JSON.parse(stored);
      delete notifications[notificationId];
      await AsyncStorage.setItem('notificationIds', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error removing notification ID:', error);
    }
  };

  // Handle notification interactions
  handleNotificationTap = (notification) => {
  const { type, itemName, screen } = notification.data || {};
  
  console.log('Notification tapped:', { type, itemName, screen });
  
  // Navigate using the navigation reference
  if (navigationRef.current?.isReady()) {
    switch (type) {
      case 'low_stock':
      case 'stock_reminder':
        navigationRef.current.navigate('Inventory', { 
          highlightItem: itemName,
          showLowStock: true 
        });
        break;
      case 'purchase_reminder':
        navigationRef.current.navigate('Purchase');
        break;
      case 'sales':
        navigationRef.current.navigate('Sales');
        break;
      case 'credit_due':
        navigationRef.current.navigate('Credit', { showOverdue: true });
        break;
      default:
        navigationRef.current.navigate('Dashboard');
        break;
    }
  }
};

  // Setup notification event listeners
  setupEventListeners = () => {
    // Handle foreground events
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('Foreground event:', type, detail);
      
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          this.handleNotificationTap(detail.notification);
          break;
        case EventType.ACTION_PRESS:
          console.log('User pressed an action', detail.pressAction.id, detail.notification);
          if (detail.pressAction.id === 'view') {
            this.handleNotificationTap(detail.notification);
          }
          break;
      }
    });

    // Handle background events (when app is closed/backgrounded)
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background event:', type, detail);
      
      if (type === EventType.PRESS) {
        console.log('User pressed notification in background');
        // You can perform background tasks here
        this.handleNotificationTap(detail.notification);
      }
    });
  };

  // Check notification permissions
  checkPermissions = async () => {
    const settings = await notifee.getNotificationSettings();
    console.log('Notification settings:', settings);
    return settings;
  };
}

export default new NotificationService();