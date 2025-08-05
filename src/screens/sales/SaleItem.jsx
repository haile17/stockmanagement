import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/Sales';
import { formatDate, formatNumberWithCommas } from '../../components/utils/formatters';

function SaleItem({ item, index, onReturn }) {
  const saleAmount = parseFloat(item.totalAmount) || 
                    (parseInt(item.cartonQuantity || 0) * parseFloat(item.pricePerCarton || 0)) ||
                    (parseInt(item.totalQuantity || 0) * parseFloat(item.pricePerPiece || 0));
  
  return (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      <View style={styles.saleHeader}>
        <Text style={styles.saleDate}>{formatDate(item.saleDate) || 'No Date'}</Text>
        <Text style={styles.saleAmount}>
          {formatNumberWithCommas(saleAmount) || '0'} Birr
        </Text>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Text style={styles.itemName}>{item.itemName || 'N/A'}</Text>
          <Text style={styles.itemDetails}>
            Code: {item.itemCode || 'N/A'} | Qty: {formatNumberWithCommas(item.cartonQuantity || item.totalQuantity || 0)}
          </Text>
          <Text style={styles.itemPrice}>
            Price: {formatNumberWithCommas(item.pricePerPiece || item.pricePerCarton || 0)} Birr
          </Text>
          {item.customerName && (
            <Text style={styles.customerName}>Customer: {item.customerName}</Text>
          )}
          {item.plateNumber && (
            <Text style={styles.customerName}>Plate: {item.plateNumber}</Text>
          )}
        </View>
        
        <View style={styles.saleActions}>
          <Button
            type="gradient"
            size="small"
            title="Return"
            onPress={() => onReturn(item)}
            style={styles.returnButton}
          />
        </View>
      </View>
    </View>
  );
}

export default SaleItem;