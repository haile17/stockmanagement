import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/Sales';
import { formatDate, formatNumberWithCommas } from '../../components/utils/formatters';

function SaleItem({ item, index, onReturn }) {
  const saleAmount = parseFloat(item.totalAmount) || 
                    (parseInt(item.cartonQuantity || 0) * parseFloat(item.pricePerCarton || 0)) ||
                    (parseInt(item.totalQuantity || 0) * parseFloat(item.pricePerPiece || 0));
  
  // Format time
  const saleTime = item.saleDate ? new Date(item.saleDate).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '';

  // Determine if it's carton or piece sale
  const isCartonSale = item.cartonQuantity && item.cartonQuantity > 0;
  const quantity = isCartonSale ? item.cartonQuantity : item.totalQuantity;
  const unitPrice = isCartonSale ? item.pricePerCarton : item.pricePerPiece;
  const unitType = isCartonSale ? 'carton' : 'piece';
  
  return (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      {/* Header Section */}
      <View style={styles.saleHeader}>
        <View style={styles.leftHeader}>
          <Text style={styles.itemName}>{item.itemName || 'Unknown Item'}</Text>
          {item.itemCode && (
            <Text style={styles.itemCode}>#{item.itemCode}</Text>
          )}
        </View>
        <View style={styles.rightHeader}>
          <Text style={styles.saleAmount}>
            {formatNumberWithCommas(saleAmount)} Birr
          </Text>
          {item.isConvertedCredit && (
            <Text style={styles.creditBadge}>From Credit</Text>
          )}
        </View>
      </View>
      
      {/* Main Details Section */}
      <View style={styles.saleDetails}>
        <View style={styles.leftDetails}>
          {/* Customer Information */}
          {item.customerName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{item.customerName}</Text>
            </View>
          )}
          
          {/* Plate Number */}
          {item.plateNumber && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Plate:</Text>
              <Text style={styles.infoValue}>{item.plateNumber}</Text>
            </View>
          )}
          
          {/* Quantity Information */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={styles.infoValue}>
              {formatNumberWithCommas(quantity || 0)} {unitType}s
            </Text>
          </View>
          
          {/* Unit Price */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Unit Price:</Text>
            <Text style={styles.infoValue}>
              {formatNumberWithCommas(unitPrice || 0)} Birr/{unitType}
            </Text>
          </View>
          
          {/* Additional quantity info for carton sales */}
          {isCartonSale && item.quantityPerCarton && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Per Carton:</Text>
              <Text style={styles.infoValue}>
                {formatNumberWithCommas(item.quantityPerCarton)} pieces
              </Text>
            </View>
          )}
          
          {/* Total pieces for carton sales */}
          {isCartonSale && item.totalQuantity && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Pieces:</Text>
              <Text style={styles.infoValue}>
                {formatNumberWithCommas(item.totalQuantity)} pieces
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.rightDetails}>
          {/* Date and Time */}
          <View style={styles.dateTimeSection}>
            <Text style={styles.saleDate}>
              {formatDate(item.saleDate) || 'No Date'}
            </Text>
            {saleTime && (
              <Text style={styles.saleTime}>{saleTime}</Text>
            )}
          </View>
          
          {/* Return Button */}
          <Button
            color="primary"
            variant="outline"
            size="small"
            title="Return"
            onPress={() => onReturn(item)}
            style={styles.returnButton}
          />
        </View>
      </View>
      
      {/* Additional Information Bar */}
      {(item.source || item.paymentStatus) && (
        <View style={styles.additionalInfo}>
          {item.source && (
            <Text style={styles.sourceText}>Source: {item.source}</Text>
          )}
          {item.paymentStatus && (
            <Text style={[
              styles.paymentStatus, 
              item.paymentStatus === 'Paid' ? styles.paidStatus : styles.unpaidStatus
            ]}>
              {item.paymentStatus}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

export default SaleItem;