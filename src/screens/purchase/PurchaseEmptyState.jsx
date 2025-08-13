import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/Sales';

const PurchaseEmptyState = ({ searchQuery, dateFilter, onClearFilters }) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No purchases found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery || dateFilter !== 'all' 
          ? 'Try adjusting your filters'
          : 'Purchases will appear here once recorded'
        }
      </Text>
      {(searchQuery || dateFilter !== 'all') && (
        <Button
          color="primary"
          variant="solid"
          size="small"
          title="Clear Filters"
          onPress={onClearFilters}
          style={styles.clearFiltersButton}
        />
      )}
    </View>
  );
};

export default PurchaseEmptyState;