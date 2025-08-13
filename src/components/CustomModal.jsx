// CustomModal.jsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
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
        return { ...styles.modalContent, borderLeftColor: '#dc2626', borderLeftWidth: 4 };
      case 'success':
        return { ...styles.modalContent, borderLeftColor: '#059669', borderLeftWidth: 4 };
      default:
        return { ...styles.modalContent, borderLeftColor: '#9ebaf3', borderLeftWidth: 4 };
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'danger': return 'danger';
      case 'success': return 'success';
      case 'warning': return 'primary'; // Changed from 'secondary' to 'primary'
      default: return 'primary';
    }
  };

  return (
    <Modal 
      transparent={true} 
      visible={isOpen} 
      animationType={animationType}
      onRequestClose={onCancel}
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
              <View style={styles.buttonWrapper}>
                <Button
                  title={cancelText}
                  onPress={onCancel}
                  color="secondary"
                  variant="outline"
                  size="medium"
                />
              </View>
            )}
            
            <View style={styles.buttonWrapper}>
              <Button
                title={confirmText}
                onPress={onConfirm}
                color={getConfirmButtonColor()}
                variant={type === 'warning' ? 'outline' : 'solid'}
                size="medium"
              />
            </View>
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
    borderRadius: 16,
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
    color: '#353a5f',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageContainer: {
    maxHeight: 200,
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
    maxWidth: 120, // Prevents buttons from becoming too wide
  },
});

export default useCustomModal;
export { CustomModal };