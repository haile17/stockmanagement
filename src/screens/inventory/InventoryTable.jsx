import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import Table from '../../components/Table';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatNumberWithCommas } from '../../components/utils/formatters';
import { CircleFade } from 'react-native-animated-spinkit';
import styles from '../../styles/InventoryScreenStyles';

const InventoryTable = ({ inventory, inventoryLoading, onDeleteItem, customConfirm }) => {
  const [tableAnimation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (inventory && inventory.length > 0) {
      tableAnimation.setValue(0);
      Animated.timing(tableAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [inventory]);

  const confirmDeleteItem = (index, item) => {
    customConfirm(
      `Are you sure you want to delete "${item.itemName}"?\n\nThis action cannot be undone.`,
      () => onDeleteItem(index),
      () => {}
    );
  };

  // Check for low stock items
  const checkLowStock = (item) => {
    if (item.minStockAlert && item.cartonQuantity <= item.minStockAlert) {
      return true;
    }
    return false;
  };

  // Get stock status indicator
  const getStockStatusIcon = (item) => {
    if (item.cartonQuantity === 0) {
      return <Icon name="alert-circle" size={16} color="#f44336" />;
    } else if (checkLowStock(item)) {
      return <Icon name="warning" size={16} color="#ff9800" />;
    } else {
      return <Icon name="checkmark-circle" size={16} color="#4CAF50" />;
    }
  };

  return (
    <View style={[styles.sectionHeader]}>
      <View style={styles.titleHeader}>
        <Text style={styles.sectionTitle}>🍽️ Kitchen Inventory Database</Text>
        <Text style={styles.itemCount}>
          {inventory.length} {inventory.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
      
      {inventoryLoading ? (
        <View style={styles.loadingContainer}>
          <CircleFade size={48} color="#393247" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      
      ) : inventory.length > 0 ? (
        <Animated.View 
          style={{ 
            opacity: tableAnimation,
            transform: [{ 
              translateY: tableAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0]
              })
            }]
          }}
        >
          <ScrollView style={{ minHeight: 450, marginHorizontal: 0 }}>
            <Table
                headers={[
                    "Status", 
                    "Item Name", 
                    "Item Code", 
                    "Cartons", 
                    "Per Carton", 
                    "Total Pcs", 
                    "Purchase Price/Pc", 
                    "Purchase Price/Carton", 
                    "Total Amount",  // New column
                    "Source", 
                    "Last Purchase", 
                    "Action"
                ]}
                data={inventory.map((item, index) => [
                    getStockStatusIcon(item),
                    item.itemName || '',
                    item.itemCode || 'N/A',
                    (item.cartonQuantity || 0).toString(), 
                    (item.quantityPerCarton || 0).toString(),
                    (item.totalQuantity || 0).toString(),
                    `ETB ${formatNumberWithCommas(item.purchasePricePerPiece || 0)}`, 
                    `ETB ${formatNumberWithCommas(item.purchasePricePerCarton || 0)}`,
                    `ETB ${formatNumberWithCommas(item.totalAmount || 0)}`, // New column
                    item.source || '',
                    item.lastPurchaseDate ? new Date(item.lastPurchaseDate).toLocaleDateString() : 'N/A',
                    <TouchableOpacity 
                    key={index}
                    onPress={() => confirmDeleteItem(index, item)}
                    style={styles.deleteButton}
                    >
                    <Icon name="trash" size={16} color="#f44336" />
                    </TouchableOpacity>
                ])}
                noDataMessage="No inventory data available"
                />
          </ScrollView>
        </Animated.View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="restaurant-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No Kitchen Inventory Data</Text>
          <Text style={styles.emptySubtitle}>
            Import your first Excel file to get started with kitchen inventory management
          </Text>
        </View>
      )}
    </View>
  );
};

export default InventoryTable;