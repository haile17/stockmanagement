import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatNumberWithCommas } from '../../components/utils/formatters';
import LinearGradient from 'react-native-linear-gradient';

const DashboardSummary = ({ inventoryCount, todaysSales, recentPurchases, creditSales, styles }) => {
  // No need for cumulative state since the parent already calculates totals
  // Just ensure the values are properly converted to numbers
  const displayTodaysSales = Number(todaysSales) || 0;
  const displayCreditSales = Number(creditSales) || 0;

  // Animation refs for each card
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;
  
  const slideAnim1 = useRef(new Animated.Value(50)).current;
  const slideAnim2 = useRef(new Animated.Value(50)).current;
  const slideAnim3 = useRef(new Animated.Value(50)).current;
  const slideAnim4 = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Staggered animation for each card
    const animateCard = (fadeAnim, slideAnim, delay) => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay: delay,
          useNativeDriver: true,
        }),
      ]).start();
    };

    animateCard(fadeAnim1, slideAnim1, 0);
    animateCard(fadeAnim2, slideAnim2, 150);
    animateCard(fadeAnim3, slideAnim3, 300);
    animateCard(fadeAnim4, slideAnim4, 450);
  }, []);

  return (
    <View style={styles.summary}>
      <Animated.View
        style={{
          width: '48%',
          marginBottom: 10,
          opacity: fadeAnim1,
          transform: [{ translateY: slideAnim1 }],
        }}
      >
        <LinearGradient
          colors={['#353a5f', '#9ebaf3']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0.5}}
          style={{
              flex: 1,
              minHeight: 120,
              borderRadius: 12,
              overflow: 'hidden',
            }}
        >
          <View style={{ padding: 15 }}>
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
      </Animated.View>

      <Animated.View
        style={{
          width: '48%',
          marginBottom: 10,
          opacity: fadeAnim2,
          transform: [{ translateY: slideAnim2 }],
        }}
      >
        <LinearGradient
          colors={['#353a5f', '#9ebaf3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            minHeight: 120,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <View style={{ padding: 15 }}>
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
            }]}>{formatNumberWithCommas(displayTodaysSales)} Birr</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={{
          width: '48%',
          marginBottom: 10,
          opacity: fadeAnim3,
          transform: [{ translateY: slideAnim3 }],
        }}
      >
        <LinearGradient
          colors={['#353a5f', '#9ebaf3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            minHeight: 120,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <View style={{ padding: 15 }}>
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
      </Animated.View>

      <Animated.View
        style={{
          width: '48%',
          marginBottom: 10,
          opacity: fadeAnim4,
          transform: [{ translateY: slideAnim4 }],
        }}
      >
        <LinearGradient
          colors={['#353a5f', '#9ebaf3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            minHeight: 120,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <View style={{ padding: 15 }}>
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
              color: '#fff',
              letterSpacing: 0.5
            }]}>{formatNumberWithCommas(displayCreditSales)} Birr</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

export default DashboardSummary;