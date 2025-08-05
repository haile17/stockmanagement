import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Platform, StatusBar, ImageBackground } from 'react-native';
import DataService from '../services/DataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useCustomModal from '../components/CustomModal';
import styles from '../styles/InventoryScreenStyles';
import { useFocusEffect } from '@react-navigation/native';
import { CircleFade } from 'react-native-animated-spinkit';
import InventoryImporter from './inventory/InventoryImporter';
import InventoryTable from './inventory/InventoryTable';
import Header from '../components/Header';

const InventoryScreen = ({ onToggleDrawer }) => {
  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [screenReady, setScreenReady] = useState(false);

  // Initialize custom modal
  const { confirm: customConfirm, ModalComponent } = useCustomModal();

  useEffect(() => {
    setScreenReady(true);
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setInventoryLoading(true);
    try {
      const items = await DataService.getInventory();
      setInventory(Array.isArray(items) ? items : []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      customConfirm(
        'Failed to load inventory data. Please try again.',
        () => {},
        null
      );
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleImportSuccess = async () => {
    await loadInventory();
  };

  const handleDeleteItem = async (index) => {
    try {
      // Remove item from local state
      const updatedInventory = inventory.filter((_, i) => i !== index);
      setInventory(updatedInventory);
      
      // Delete from storage using DataService
      await DataService.deleteInventoryItem(inventory[index]);
      
      customConfirm(
        'Item deleted successfully!',
        () => {},
        null
      );
    } catch (error) {
      console.error('Error deleting item:', error);
      customConfirm(
        'Failed to delete item. Please try again.',
        () => {},
        null
      );
      // Reload inventory to restore state if delete failed
      loadInventory();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setHidden(true, 'fade');
      loadInventory();
    }, [])
  );

  return (
    <ImageBackground
      source={require('../components/images/judas.jpg')}
      style={styles.container}
      imageStyle={{ opacity: 0.2 }}
      resizeMode='cover'
    >
      <Header 
        onToggleDrawer={onToggleDrawer} 
        iconColor="#ffffff" // White icon for dark background
        backgroundColor="transparent"
      />
      {screenReady ? (  
        <ScrollView
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: 20,
            paddingTop: 50
          }}
          keyboardShouldPersistTaps="handled"  
        >
          <View style={[styles.container, { padding: 20 }]}>
            {/* Custom Modal Component */}
            <ModalComponent />

            {/* Import Section */}
            <InventoryImporter 
              onImportSuccess={handleImportSuccess}
              customConfirm={customConfirm}
            />

            {/* Inventory Display Section */}
            <InventoryTable 
              inventory={inventory}
              inventoryLoading={inventoryLoading}
              onDeleteItem={handleDeleteItem}
              customConfirm={customConfirm}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <CircleFade size={48} color="#393247" />
        </View>
      )}
    </ImageBackground>
  );
};

export default InventoryScreen;