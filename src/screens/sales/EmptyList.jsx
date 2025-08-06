import React from 'react';
import { View, Text } from 'react-native';
import Button from '../../components/Button';
import styles from '../../styles/Sales';

function EmptyList({ searchQuery, dateFilter, onClearFilters }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No sales records found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery || dateFilter !== 'all' 
          ? 'Try adjusting your filters'
          : 'Sales will appear here once recorded'
        }
      </Text>
      {(searchQuery || dateFilter !== 'all') && (
        <Button
          color="secondary"
          variant="solid"
          size="small"
          title="Clear Filters"
          onPress={onClearFilters}
          style={styles.clearFiltersButton}
        />
      )}
    </View>
  );
}

export default EmptyList;