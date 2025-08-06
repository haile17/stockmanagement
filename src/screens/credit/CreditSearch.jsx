import React from 'react';
import { View, TextInput } from 'react-native';
import styles from '../../styles/Sales';

const CreditSearch = ({ searchQuery, onSearchChange }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by item name, part number, or customer..."
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#999"
      />
    </View>
  );
};

export default CreditSearch;