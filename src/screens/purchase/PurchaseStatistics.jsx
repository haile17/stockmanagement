import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/Sales';

const PurchaseStatistics = ({ totalPurchases, todaysAmount, totalAmount, formatNumberWithCommas }) => {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{totalPurchases}</Text>
        <Text style={styles.statLabel}>Total Purchases</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{formatNumberWithCommas(todaysAmount)}</Text>
        <Text style={styles.statLabel}>Today's Purchases</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{formatNumberWithCommas(totalAmount)}</Text>
        <Text style={styles.statLabel}>Total Amount</Text>
      </View>
    </View>
  );
};

export default PurchaseStatistics;