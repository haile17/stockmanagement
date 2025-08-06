import React from 'react';
import { FlatList, RefreshControl } from 'react-native';
import CreditItem from './CreditItem';
import CreditEmptyState from './CreditEmptyState';
import styles from '../../styles/Sales';

const CreditList = ({ 
  filteredCredits, 
  refreshing, 
  onRefresh, 
  onMarkAsPaid, 
  onReturn, 
  formatNumberWithCommas, 
  formatDate,
  insets,
  searchQuery,
  dateFilter,
  onClearFilters
}) => {
  const renderCreditItem = ({ item, index }) => (
    <CreditItem
      item={item}
      index={index}
      onMarkAsPaid={onMarkAsPaid}
      onReturn={onReturn}
      formatNumberWithCommas={formatNumberWithCommas}
      formatDate={formatDate}
    />
  );

  return (
    <FlatList
      data={filteredCredits}
      renderItem={renderCreditItem}
      keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
      ListEmptyComponent={() => (
        <CreditEmptyState 
          searchQuery={searchQuery}
          dateFilter={dateFilter}
          onClearFilters={onClearFilters}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#007AFF']}
        />
      }
      style={styles.salesList}
      contentContainerStyle={{ paddingBottom: insets.bottom + 500 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default CreditList;