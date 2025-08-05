import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatNumberWithCommas } from '../../components/utils/formatters';
import LinearGradient from 'react-native-linear-gradient';

const DashboardSummary = ({ inventoryCount, todaysSales, recentPurchases, creditSales, styles }) => {
  return (
    <View style={styles.summary}>
      <LinearGradient
        colors={['#373b4d', '#bdbebeff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View>
          <View style={styles.cardTitleRow}>
            <Ionicons name="cube-outline" size={18} color="#fff" style={styles.icon} />
            <Text style={styles.cardTitle}>Total Inventory</Text>
          </View>
          <Text style={styles.cardText}>{formatNumberWithCommas(inventoryCount)} items</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['#373b4d', '#bdbebeff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View>
        <View style={styles.cardTitleRow}>
          <Ionicons name="cash-outline" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.cardTitle}>Today's Sales</Text>
        </View>
        <Text style={styles.cardText}>{formatNumberWithCommas(todaysSales)} Birr</Text>
      </View>
      </LinearGradient>

      <LinearGradient
        colors={['#373b4d', '#bdbebeff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View>
        <View style={styles.cardTitleRow}>
          <Ionicons name="cart-outline" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.cardTitle}>Recent Purchases</Text>
        </View>
        <Text style={styles.cardText}>{formatNumberWithCommas(recentPurchases)} orders</Text>
      </View>
      </LinearGradient>

      <LinearGradient
        colors={['#373b4d', '#bdbebeff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View>
        <View style={styles.cardTitleRow}>
          <Ionicons name="receipt-outline" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.cardTitle}>Credit Sales</Text>
        </View>
        <Text style={styles.cardText}>{formatNumberWithCommas(creditSales)} Birr</Text>
      </View>
      </LinearGradient>
    </View>
  );
};

export default DashboardSummary;