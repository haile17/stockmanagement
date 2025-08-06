import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatNumberWithCommas } from '../../components/utils/formatters';
import LinearGradient from 'react-native-linear-gradient';

const DashboardSummary = ({ inventoryCount, todaysSales, recentPurchases, creditSales, styles }) => {
  return (
    <View style={styles.summary}>
      <LinearGradient
        colors={['#353a5f', '#9ebaf3']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0.5}}
        style={[styles.card, {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 4,
            borderRadius: 12,
          }]}
      >
        <View style={{ padding: 8 }}>
          <View style={[styles.cardTitleRow, { marginBottom: 12, alignItems: 'center' }]}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 8,
              padding: 4,
              marginRight: 8
            }}>
              <Ionicons name="cube-outline" size={20} color="#fff" />
            </View>
            <Text style={[styles.cardTitle, { 
              fontSize: 14, 
              fontWeight: '600',
              color: '#fff',
            }]}>Total Inventory</Text>
          </View>
          <Text style={[styles.cardText, { 
            fontSize: 20, 
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: 0.5
          }]}>{formatNumberWithCommas(inventoryCount)} items</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['#353a5f', '#9ebaf3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
          borderRadius: 16,
        }]}
      >
        <View style={{ padding: 8 }}>
          <View style={[styles.cardTitleRow, { marginBottom: 8, alignItems: 'center' }]}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 6,
              marginRight: 8
            }}>
              <Ionicons name="cash-outline" size={20} color="#fff" />
            </View>
            <Text style={[styles.cardTitle, { 
              fontSize: 14, 
              fontWeight: '600',
              color: '#fff',
              opacity: 0.9
            }]}>Today's Sales</Text>
          </View>
          <Text style={[styles.cardText, { 
            fontSize: 20, 
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: 0.5
          }]}>{formatNumberWithCommas(todaysSales)} Birr</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['#353a5f', '#9ebaf3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
          borderRadius: 16,
        }]}
      >
        <View style={{ padding: 8 }}>
          <View style={[styles.cardTitleRow, { marginBottom: 12, alignItems: 'center' }]}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 6,
              marginRight: 8
            }}>
              <Ionicons name="cart-outline" size={20} color="#fff" />
            </View>
            <Text style={[styles.cardTitle, { 
              fontSize: 14, 
              fontWeight: '600',
              color: '#fff',
              opacity: 0.9
            }]}>Recent Purchases</Text>
          </View>
          <Text style={[styles.cardText, { 
            fontSize: 20, 
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: 0.5
          }]}>{formatNumberWithCommas(recentPurchases)} orders</Text>
        </View>
      </LinearGradient>

      <LinearGradient
        colors={['#353a5f', '#9ebaf3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 6,
          borderRadius: 16,
        }]}
      >
        <View style={{ padding: 8 }}>
          <View style={[styles.cardTitleRow, { marginBottom: 12, alignItems: 'center' }]}>
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 8,
              padding: 6,
              marginRight: 8
            }}>
              <Ionicons name="receipt-outline" size={20} color="#fff" />
            </View>
            <Text style={[styles.cardTitle, { 
              fontSize: 14, 
              fontWeight: '600',
              color: '#fff',
              opacity: 0.9
            }]}>Credit Sales</Text>
          </View>
          <Text style={[styles.cardText, { 
            fontSize: 20, 
            fontWeight: 'bold',
            color: '#ffffffff',
          }]}>{formatNumberWithCommas(creditSales)} Birr</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export default DashboardSummary;