import React from 'react';
import { View, TextInput } from 'react-native';
import styles from '../../styles/Sales';

const PurchaseSearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by item name, item code, or source..."
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#011f4b"
      />
    </View>
  );
};

export default PurchaseSearchBar;