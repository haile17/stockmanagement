import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/Sales';
import Icon from 'react-native-vector-icons/Ionicons';

const CreditItem = ({ 
  item, 
  index, 
  onMarkAsPaid, 
  onReturn, 
  formatNumberWithCommas, 
  formatDate 
}) => {
  // Calculate credit amount
  const creditAmount = parseFloat(item.totalAmount) || 
                      (parseInt(item.cartonQuantity || 0) * parseFloat(item.pricePerCarton || 0)) ||
                      (parseInt(item.totalQuantity || 0) * parseFloat(item.pricePerPiece || 0));
  
  // Payment status colors
  const statusColors = {
    'Paid': '#34C759',
    'Partially Paid': '#FF9500',
    'Unpaid': '#FF3B30',
    'Pending': '#FF9500'
  };

  const [expanded, setExpanded] = React.useState(false);
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;
  const rotationValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (expanded) {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
        Animated.timing(rotationValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(rotationValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [expanded]);

  const rotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 900], // Adjust based on your content height
  });

  return (
    <View style={[styles.saleItem, index % 2 === 0 && styles.saleItemEven]}>
      <TouchableOpacity 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.saleHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.saleDate}>{formatDate(item.creditDate || item.date) || 'No Date'}</Text>
            <Text style={[styles.statusBadge, { 
              backgroundColor: statusColors[item.paymentStatus] || '#FF9500',
            }]}>
              {item.paymentStatus || 'Pending'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.saleAmount}>
              {formatNumberWithCommas(creditAmount) || '0'} Birr
            </Text>
            <Animated.View style={{ transform: [{ rotate: rotation }] }}>
              <Icon 
                name="chevron-down" 
                size={20} 
                color="#64748b" 
              />
            </Animated.View>
          </View>
        </View>
        
        <View style={styles.saleDetails}>
          <View style={styles.saleInfo}>
            <Text style={styles.itemName}>{item.itemName || 'N/A'}</Text>
            <Text style={styles.itemDetails}>
              Code: {item.itemCode || 'N/A'} | Qty: {formatNumberWithCommas(item.cartonQuantity || item.totalQuantity || 0)}
            </Text>
            <Text style={styles.customerName}>
              Customer: {item.customerName || 'N/A'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.expandedContainer,
          {
            maxHeight: maxHeight,
            opacity: animatedOpacity,
          }
        ]}
      >
        <View style={styles.expandedDetails}>
          {/* Product Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>Price Per Piece</Text>
                <Text style={styles.infoCardValue}>
                  {formatNumberWithCommas(item.pricePerPiece || 0)} Birr
                </Text>
              </View>
              <View style={styles.infoCard}>
                <Text style={styles.infoCardLabel}>Qty Per Carton</Text>
                <Text style={styles.infoCardValue}>
                  {formatNumberWithCommas(item.quantityPerCarton || 0)}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.detailLabel}>Total Quantity:</Text>
              <Text style={styles.detailValue}>
                {formatNumberWithCommas(item.totalQuantity || 0)} pieces
              </Text>
            </View>
          </View>

          {/* Customer Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            {item.phoneNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{item.phoneNumber}</Text>
              </View>
            )}
            {item.place && (
              <View style={styles.infoRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>{item.place}</Text>
              </View>
            )}
          </View>

          {/* Payment Information Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.paymentGrid}>
              <View style={[styles.paymentCard, styles.paidCard]}>
                <Text style={styles.paymentCardLabel}>Amount Paid</Text>
                <Text style={styles.paymentCardValue}>
                  {formatNumberWithCommas(item.amountPaid || 0)} Birr
                </Text>
              </View>
              <View style={[styles.paymentCard, styles.remainingCard]}>
                <Text style={styles.paymentCardLabel}>Remaining</Text>
                <Text style={styles.paymentCardValue}>
                  {formatNumberWithCommas(item.remainingBalance || 0)} Birr
                </Text>
              </View>
            </View>
            {item.dueDate && (
              <View style={styles.dueDateContainer}>
                <Icon name="time-outline" size={16} color="#FF9500" />
                <Text style={styles.dueDateText}>
                  Due: {formatDate(item.dueDate)}
                </Text>
              </View>
            )}
          </View>

          {/* Additional Information */}
          {item.plateNumber && (
            <View style={styles.additionalInfo}>
              <Icon name="car-outline" size={16} color="#64748b" />
              <Text style={styles.additionalInfoText}>
                Plate: {item.plateNumber}
              </Text>
            </View>
          )}

          {/* Notes Section */}
          {item.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesContent}>
                <Icon name="document-text-outline" size={16} color="#64748b" />
                <Text style={styles.notesText}>{item.notes}</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <Button
              type="primary"
              size="sm"
              title="Mark as Paid"
              onPress={() => onMarkAsPaid(item)}
              style={styles.actionButton}
            />
            <Button
              type="danger"
              size="sm"
              title="Return Item"
              onPress={() => onReturn(item)}
              style={styles.actionButton}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default CreditItem;