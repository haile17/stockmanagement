import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import styles from '../../styles/Sales';

const PurchaseFilters = ({
  dateFilter,
  sortBy,
  sortOrder,
  onDateFilterChange,
  onSortByChange,
  onSortOrderChange
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
        {renderFilterButton('All', 'all', dateFilter, onDateFilterChange)}
        {renderFilterButton('Today', 'today', dateFilter, onDateFilterChange)}
        {renderFilterButton('Week', 'week', dateFilter, onDateFilterChange)}
        {renderFilterButton('Month', 'month', dateFilter, onDateFilterChange)}
      </View>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterGroupTitle}>Sort:</Text>
        {renderFilterButton('Date', 'date', sortBy, onSortByChange)}
        {renderFilterButton('Source', 'source', sortBy, onSortByChange)}
        {renderFilterButton('Amount', 'amount', sortBy, onSortByChange)}
      </View>
      
      <View style={styles.filterGroup}>
        <Text style={styles.filterGroupTitle}>Order:</Text>
        {renderFilterButton('↓', 'desc', sortOrder, onSortOrderChange)}
        {renderFilterButton('↑', 'asc', sortOrder, onSortOrderChange)}
      </View>
    </ScrollView>
  );
};

export default PurchaseFilters;