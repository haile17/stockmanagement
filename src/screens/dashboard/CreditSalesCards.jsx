import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { formatDateOnly, formatNumberWithCommas } from '../../components/utils/formatters';

const CreditSalesCards = ({ recentCredits, styles }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#4CAF50'; // Green
      case 'partially paid':
        return '#FF9800'; // Orange
      case 'unpaid':
        return '#f44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#E8F5E8';
      case 'partially paid':
        return '#FFF3E0';
      case 'unpaid':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  };

  const handlePhonePress = async (phoneNumber) => {
    try {
      // Clean the phone number (remove any spaces, dashes, or special characters except +)
      const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
      const phoneUrl = `tel:${cleanNumber}`;
      
      // Check if the device can handle the phone URL
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert(
          'Unable to make call',
          'Your device does not support phone calls or the phone app is not available.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to open phone dialer. Please try again.',
        [{ text: 'OK' }]
      );
      console.error('Error opening phone dialer:', error);
    }
  };

  if (!recentCredits || recentCredits.length === 0) {
    return (
      <View style={[styles.section, cardStyles.container]}>
        <Text style={styles.sectionTitle}>Recent Credit Sales</Text>
        <View style={cardStyles.noDataContainer}>
          <Text style={cardStyles.noDataText}>No recent credit sales</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.section, cardStyles.container]}>
      <Text style={styles.sectionTitle}>Recent Credit Sales</Text>
      <ScrollView 
        style={cardStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {recentCredits.map((credit, index) => (
          <TouchableOpacity 
            key={index} 
            style={cardStyles.card}
            activeOpacity={0.7}
          >
            {/* Header Row */}
            <View style={cardStyles.cardHeader}>
              <View style={cardStyles.headerLeft}>
                <Text style={cardStyles.itemName}>{credit.itemName}</Text>
                <Text style={cardStyles.customerName}>{credit.customerName}</Text>
              </View>
              <View style={[
                cardStyles.statusBadge, 
                { backgroundColor: getStatusBackgroundColor(credit.paymentStatus) }
              ]}>
                <Text style={[
                  cardStyles.statusText,
                  { color: getStatusColor(credit.paymentStatus) }
                ]}>
                  {credit.paymentStatus || 'Unknown'}
                </Text>
              </View>
            </View>

            {/* Details Row */}
            <View style={cardStyles.cardDetails}>
              <View style={cardStyles.detailItem}>
                <Text style={cardStyles.detailLabel}>Date</Text>
                <Text style={cardStyles.detailValue}>
                  {formatDateOnly(credit.creditDate)}
                </Text>
              </View>
              <View style={cardStyles.detailItem}>
                <Text style={cardStyles.detailLabel}>Amount</Text>
                <Text style={cardStyles.detailValue}>
                  {formatNumberWithCommas(credit.totalAmount)} Birr
                </Text>
              </View>
            </View>

            {/* Additional Info Row (if available) */}
            {(credit.phoneNumber || credit.place || credit.plateNumber) && (
              <View style={cardStyles.additionalInfo}>
                {credit.phoneNumber && (
                  <TouchableOpacity 
                    style={cardStyles.phoneContainer}
                    onPress={() => handlePhonePress(credit.phoneNumber)}
                    activeOpacity={0.7}
                  >
                    <Text style={cardStyles.phoneText}>📞 {credit.phoneNumber}</Text>
                  </TouchableOpacity>
                )}
                {credit.place && (
                  <Text style={cardStyles.additionalText}>📍 {credit.place}</Text>
                )}
                {credit.plateNumber && (
                  <Text style={cardStyles.additionalText}>🚛 {credit.plateNumber}</Text>
                )}
              </View>
            )}

            {/* Balance Info (if partially paid or unpaid) */}
            {credit.paymentStatus !== 'paid' && credit.remainingBalance && (
              <View style={cardStyles.balanceInfo}>
                <Text style={cardStyles.balanceLabel}>Remaining Balance:</Text>
                <Text style={cardStyles.balanceAmount}>
                  {formatNumberWithCommas(credit.remainingBalance)} Birr
                </Text>
              </View>
            )}

            {/* Due Date (if available) */}
            {credit.dueDate && (
              <View style={cardStyles.dueDateContainer}>
                <Text style={cardStyles.dueDateLabel}>Due Date:</Text>
                <Text style={cardStyles.dueDateValue}>
                  {formatDateOnly(credit.dueDate)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export const cardStyles = {
  container: {
    marginBottom: 20,
  },  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6973beff',
    marginLeft: 10,
  },
  scrollContainer: {
    maxHeight: 300, // Limit height so it doesn't interfere with bottom buttons
    marginTop: 10,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 10,
  },
  noDataText: {
    color: '#6c757d',
    fontSize: 14,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#fafafaff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#353a5f',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#353a5f',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },
  additionalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 12,
  },
  additionalText: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#9ebaf3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  phoneContainer: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  phoneText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '700',
  },
  dueDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.7,
    borderTopColor: '#353a5f',
  },
  dueDateLabel: {
    fontSize: 12,
    color: '#353a5f',
    fontWeight: '600',
  },
  dueDateValue: {
    fontSize: 12,
    color: '#353a5f',
    fontWeight: '600',
  },
};

export default CreditSalesCards;