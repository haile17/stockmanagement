import React, { createContext, useContext, useState } from 'react';
import CustomAlert from '../components/CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
    type: 'default',
  });

  const showAlert = (title, message, buttons = [], type = 'default') => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons,
      type,
    });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({
      ...prev,
      visible: false,
    }));
  };

  // Convenience methods
  const showSuccess = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'success');
  };

  const showError = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'error');
  };

  const showWarning = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'warning');
  };

  const showConfirmation = (title, message, buttons = []) => {
    showAlert(title, message, buttons, 'confirmation');
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showConfirmation,
        hideAlert,
      }}
    >
      {children}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};