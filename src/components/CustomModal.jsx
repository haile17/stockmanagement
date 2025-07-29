// CustomModal.jsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  ScrollView 
} from 'react-native';
import Button from './Button';

const { width: screenWidth } = Dimensions.get('window');

const CustomModal = ({ 
  isOpen, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  title = 'Confirmation',
  type = 'default', // default, warning, danger, success
  showCancel = true,
  animationType = 'fade'
}) => {
  if (!isOpen) return null;

  const getModalStyle = () => {
    switch (type) {
      case 'warning':
        return { ...styles.modalContent, borderLeftColor: '#ff9800', borderLeftWidth: 4 };
      case 'danger':
        return { ...styles.modalContent, borderLeftColor: '#f44336', borderLeftWidth: 4 };
      case 'success':
        return { ...styles.modalContent, borderLeftColor: '#4caf50', borderLeftWidth: 4 };
      default:
        return styles.modalContent;
    }
  };

  return (
    <Modal 
      transparent={true} 
      visible={isOpen} 
      animationType={animationType}
      onRequestClose={onCancel} // Handle Android back button
    >
      <View style={styles.overlay}>
        <View style={getModalStyle()}>
          {/* Title */}
          <Text style={styles.title}>{title}</Text>
          
          {/* Message */}
          <ScrollView style={styles.messageContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>
          
          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {showCancel && (
              <Button
                title={cancelText}
                onPress={onCancel}
                type="secondary"
                variant="outline"
                size="medium"
                style={{ flex: 1 }}
              />
            )}
            
           <Button
              title={confirmText}
              onPress={onConfirm}
              type={type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'primary'}
              size="medium"
              style={{ flex: !showCancel ? 1 : 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Hook for programmatic modal usage
const useCustomModal = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    message: '',
    title: 'Confirmation',
    type: 'default',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    showCancel: true,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showModal = ({
    message,
    title = 'Confirmation',
    type = 'default',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    showCancel = true,
    onConfirm = () => {},
    onCancel = () => {}
  }) => {
    setModalState({
      isOpen: true,
      message,
      title,
      type,
      confirmText,
      cancelText,
      showCancel,
      onConfirm: () => {
        onConfirm();
        hideModal();
      },
      onCancel: () => {
        onCancel();
        hideModal();
      }
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Confirm dialog shortcut
  const confirm = (message, onConfirm, onCancel) => {
    showModal({
      message,
      title: 'Confirm Action',
      type: 'warning',
      onConfirm,
      onCancel
    });
  };

  // Alert dialog shortcut
  const alert = (message, title = 'Alert') => {
    showModal({
      message,
      title,
      type: 'default',
      showCancel: false,
      confirmText: 'OK'
    });
  };

  // Success dialog shortcut
  const success = (message, title = 'Success') => {
    showModal({
      message,
      title,
      type: 'success',
      showCancel: false,
      confirmText: 'OK'
    });
  };

  // Error dialog shortcut
  const error = (message, title = 'Error') => {
    showModal({
      message,
      title,
      type: 'danger',
      showCancel: false,
      confirmText: 'OK'
    });
  };

  const ModalComponent = () => (
    <CustomModal
      isOpen={modalState.isOpen}
      message={modalState.message}
      title={modalState.title}
      type={modalState.type}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
      showCancel={modalState.showCancel}
      onConfirm={modalState.onConfirm}
      onCancel={modalState.onCancel}
    />
  );

  return { 
    showModal, 
    hideModal, 
    confirm, 
    alert, 
    success, 
    error, 
    ModalComponent 
  };
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    maxWidth: Math.min(screenWidth * 0.9, 400),
    width: '100%',
    maxHeight: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    maxHeight: 200,
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#555',
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    },
});

export default useCustomModal;
export { CustomModal };