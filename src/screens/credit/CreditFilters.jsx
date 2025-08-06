import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styles from '../../styles/Sales';

const CreditFilters = ({ 
  dateFilter, 
  setDateFilter, 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder 
}) => {
  const renderFilterButton = (label, value, currentValue, onPress) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        currentValue === value && styles.filterButtonActive
      ]}
      onPress={() => onPress(value)}
    >
      <Text style={[
        styles.filterButtonText,
        currentValue === value && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterGroupTitle}>Date:</Text>
        {renderFilterButton('All', 'all', dateFilter, setDateFilter)}
        {renderFilterButton('Today', 'today', dateFilter, setDateFilter)}
        {renderFilterButton('Week', 'week', dateFilter, setDateFilter)}
        {renderFilterButton('Month', 'month', dateFilter, setDateFilter)}
      </View>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterGroupTitle}>Sort:</Text>
        {renderFilterButton('Date', 'date', sortBy, setSortBy)}
        {renderFilterButton('Customer', 'customer', sortBy, setSortBy)}
        {renderFilterButton('Amount', 'amount', sortBy, setSortBy)}
      </View>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterGroupTitle}>Order:</Text>
        {renderFilterButton('↓', 'desc', sortOrder, setSortOrder)}
        {renderFilterButton('↑', 'asc', sortOrder, setSortOrder)}
      </View>
    </ScrollView>
  );
};

export default CreditFilters;