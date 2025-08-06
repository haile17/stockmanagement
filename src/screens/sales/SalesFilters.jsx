import React from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import styles from '../../styles/Sales';

function SalesFilters({
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}) {
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
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          // placeholder="Search by item name, item code, or customer..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#011f4b"
        />
        {!searchQuery ? (
            <Text
              style={{
                position: 'absolute',
                left: 40,
                top: 0,
                bottom: 0,
                color: '#011f4b',
                fontSize: 12, // Smaller font size for placeholder
                textAlignVertical: 'center',
                lineHeight: 40, // Adjust to match your input height
                zIndex: 1,
                opacity: 0.7,
              }}
              pointerEvents="none"
            >
              Search by item name, item code, or customer...
            </Text>
          ) : null}
      </View>

      {/* Filters */}
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
    </>
  );
}

export default SalesFilters;