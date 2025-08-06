import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../styles/Sales';
import { formatNumberWithCommas } from '../../components/utils/formatters';

function SalesHeader({ totalSales, todaysAmount, totalAmount }) {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{formatNumberWithCommas(totalSales || 0)}</Text>
        <Text style={styles.statLabel}>Total Sales</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{formatNumberWithCommas(todaysAmount || 0)} Birr</Text>
        <Text style={styles.statLabel}>Today's Sales</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{formatNumberWithCommas(totalAmount || 0)} Birr</Text>
        <Text style={styles.statLabel}>Total Amount</Text>
      </View>
    </View>
  );
}

export default SalesHeader;