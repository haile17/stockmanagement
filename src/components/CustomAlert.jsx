// components/CustomAlert.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Button from './Button';

const { width } = Dimensions.get('window');

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  buttons = [], 
  onClose,
  type = 'default' // 'success', 'error', 'warning', 'confirmation'
}) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return styles.successAlert;
      case 'error':
        return styles.errorAlert;
      case 'warning':
        return styles.warningAlert;
      case 'confirmation':
        return styles.confirmationAlert;
      default:
        return styles.defaultAlert;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'primary'; // You could add a 'warning' color to Button if needed
      case 'confirmation':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'confirmation':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const renderButtons = () => {
    if (buttons.length === 0) {
      return (
        <Button
          title="OK"
          onPress={onClose}
          color="primary"
          size="medium"
          variant="solid"
          fullWidth={false}
        />
      );
    }

    return (
      <View style={styles.buttonContainer}>
        {buttons.map((button, index) => (
          <Button
            key={index}
            title={button.text}
            onPress={() => {
              if (button.onPress) {
                button.onPress();
              }
              onClose();
            }}
            color={button.style === 'cancel' ? 'secondary' : getButtonColor()}
            variant={button.style === 'cancel' ? 'outline' : 'solid'}
            size="medium"
            fullWidth={buttons.length === 1}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, getAlertStyle()]}>
          {/* Icon based on type */}
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '20' }]}>
            <Text style={[styles.icon, { color: getIconColor() }]}>
              {type === 'success' && '✓'}
              {type === 'error' && '✕'}
              {type === 'warning' && '⚠'}
              {type === 'confirmation' && '?'}
              {type === 'default' && 'ℹ'}
            </Text>
          </View>

          {/* Title */}
          {title && <Text style={styles.title}>{title}</Text>}
          
          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}
          
          {/* Buttons */}
          {renderButtons()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  defaultAlert: {
    borderTopWidth: 4,
    borderTopColor: '#666',
  },
  successAlert: {
    borderTopWidth: 4,
    borderTopColor: '#4CAF50',
  },
  errorAlert: {
    borderTopWidth: 4,
    borderTopColor: '#F44336',
  },
  warningAlert: {
    borderTopWidth: 4,
    borderTopColor: '#FF9800',
  },
  confirmationAlert: {
    borderTopWidth: 4,
    borderTopColor: '#2196F3',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'stretch',
  },
});

export default CustomAlert;