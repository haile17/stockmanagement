import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.configure();
    this.createDefaultChannels();
  }

  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          // User tapped on notification
          this.handleNotificationTap(notification);
        }
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  createDefaultChannels = () => {
    PushNotification.createChannel(
      {
        channelId: 'stock-alerts',
        channelName: 'Stock Alerts',
        channelDescription: 'Notifications for low stock items',
        playSound: true,
        soundName: 'default',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'stock-alerts' returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'purchases',
        channelName: 'Purchase Notifications',
        channelDescription: 'Notifications for purchase-related activities',
        playSound: true,
        soundName: 'default',
        importance: 3,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'purchases' returned '${created}'`)
    );

    PushNotification.createChannel(
      {
        channelId: 'sales',
        channelName: 'Sales Notifications',
        channelDescription: 'Notifications for sales-related activities',
        playSound: true,
        soundName: 'default',
        importance: 3,
        vibrate: true,
      },
      (created) => console.log(`createChannel 'sales' returned '${created}'`)
    );
  };

  // Show immediate notification
  showNotification = (title, message, data = {}, channelId = 'default') => {
    PushNotification.localNotification({
      channelId,
      title,
      message,
      playSound: true,
      soundName: 'default',
      actions: ['View', 'Dismiss'],
      userInfo: data,
    });
  };

  // Schedule notification for later
  scheduleNotification = (title, message, date, data = {}, channelId = 'default') => {
    PushNotification.localNotificationSchedule({
      channelId,
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
      actions: ['View', 'Dismiss'],
      userInfo: data,
    });
  };

  // Cancel all notifications
  cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
  };

  // Cancel specific notification
  cancelNotification = (notificationId) => {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  };

  // Handle notification tap
  handleNotificationTap = (notification) => {
    const { type, itemName, screen } = notification.userInfo || {};
    
    // You can navigate to specific screens based on notification type
    switch (type) {
      case 'low_stock':
        // Navigate to inventory screen
        break;
      case 'purchase_reminder':
        // Navigate to purchase screen
        break;
      case 'credit_due':
        // Navigate to credits screen
        break;
      default:
        break;
    }
  };
}

export default new NotificationService();