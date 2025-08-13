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
        <View style={styles.dateTimeContainer}>
          <Text style={styles.saleDate}>
            {formatDate(item.purchaseDate || item.date) || 'No Date'}
          </Text>
          {item.purchaseDate && (
            <Text style={styles.saleTime}>
              {new Date(item.purchaseDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          )}
        </View>
        <Text style={styles.saleAmount}>
          {formatNumberWithCommas(purchaseAmount) || '0'} Birr
        </Text>
      </View>
      
      <View style={styles.saleDetails}>
        <View style={styles.saleInfo}>
          <Text style={styles.itemName}>{item.itemName || item.name || 'N/A'}</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Item Code</Text>
              <Text style={styles.infoCardValue}>{item.itemCode || item.partNumber || 'N/A'}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Bulk Unit</Text>
              <Text style={styles.infoCardValue}>{item.bulkUnit || 'Carton'}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Carton Qty</Text>
              <Text style={styles.infoCardValue}>
                {formatNumberWithCommas(item.cartonQuantity || 0)}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardLabel}>Qty per Carton</Text>
              <Text style={styles.infoCardValue}>
                {formatNumberWithCommas(item.quantityPerCarton || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Pieces:</Text>
            <Text style={styles.infoValue}>
              {formatNumberWithCommas(item.totalQuantity || 
                ((item.cartonQuantity || 0) * (item.quantityPerCarton || 0))
              )}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Purchase Prices</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Per Piece:</Text>
              <Text style={styles.infoValue}>
                {formatNumberWithCommas(item.purchasePricePerPiece || 0)} Birr
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Per Carton:</Text>
              <Text style={styles.infoValue}>
                {formatNumberWithCommas(item.purchasePricePerCarton || 0)} Birr
              </Text>
            </View>
          </View>

          {(item.pricePerPiece || item.pricePerCarton) && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Selling Prices</Text>
              {item.pricePerPiece && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Per Piece:</Text>
                  <Text style={styles.infoValue}>
                    {formatNumberWithCommas(item.pricePerPiece)} Birr
                  </Text>
                </View>
              )}
              {item.pricePerCarton && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Per Carton:</Text>
                  <Text style={styles.infoValue}>
                    {formatNumberWithCommas(item.pricePerCarton)} Birr
                  </Text>
                </View>
              )}
            </View>
          )}

          {item.source && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Source:</Text>
              <Text style={[styles.infoValue, styles.sourceText]}>{item.source}</Text>
            </View>
          )}

          {item.minStockAlert && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Min Stock Alert:</Text>
              <Text style={styles.infoValue}>
                {formatNumberWithCommas(item.minStockAlert)} cartons
              </Text>
            </View>
          )}

          {/* Profit Margin Calculation */}
          {item.pricePerCarton && item.purchasePricePerCarton && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Profit per Carton:</Text>
              <Text style={[styles.infoValue, { 
                color: (item.pricePerCarton - item.purchasePricePerCarton) >= 0 ? '#27ae60' : '#e74c3c' 
              }]}>
                {formatNumberWithCommas(item.pricePerCarton - item.purchasePricePerCarton)} Birr
              </Text>
            </View>
          )}

          {/* Total Investment Value */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { fontWeight: 'bold' }]}>Total Investment:</Text>
            <Text style={[styles.infoValue, { fontWeight: 'bold', color: '#005b96' }]}>
              {formatNumberWithCommas(purchaseAmount)} Birr
            </Text>
          </View>
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