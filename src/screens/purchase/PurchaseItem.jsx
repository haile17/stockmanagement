import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/Sales';

const PurchaseItem = ({ item, index, onDelete, formatNumberWithCommas, formatDate }) => {
  const purchaseAmount = parseFloat(item.totalAmount) || 
                        (parseInt(item.cartonQuantity || 0) * parseFloat(item.purchasePricePerCarton || 0)) ||
                        (parseInt(item.totalQuantity || 0) * parseFloat(item.purchasePricePerPiece || 0));
  
  return (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleDate}>{formatDate(item.purchaseDate || item.date) || 'No Date'}</Text>
        <Text style={styles.saleAmount}>
          {formatNumberWithCommas(purchaseAmount) || '0'} Birr
        </Text>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Text style={styles.itemName}>{item.itemName || item.name || 'N/A'}</Text>
          <Text style={styles.itemDetails}>
            Code: {item.itemCode || item.partNumber || 'N/A'} | Qty: {formatNumberWithCommas(item.cartonQuantity || item.totalQuantity || item.quantity || 0)}
          </Text>
          <Text style={styles.itemPrice}>
            Price: {formatNumberWithCommas(item.purchasePricePerPiece || item.purchasePricePerCarton || item.price || 0)} Birr
          </Text>
          {item.source && (
            <Text style={styles.customerName}>Source: {item.source}</Text>
          )}
        </View>
        
        <View style={styles.saleActions}>
          <Button
            color="secondary"
            variant="outline"
            size="small"
            title="Delete"
            onPress={() => onDelete(item)}
            style={styles.returnButton}
          />
        </View>
      </View>
    </View>
  );
};

export default PurchaseItem;