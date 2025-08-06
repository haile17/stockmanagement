import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';

interface TableProps {
  headers: string[];
  data: (string | number | JSX.Element)[][];
  noDataMessage?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, noDataMessage = 'No data available' }) => {
  const screenWidth = Dimensions.get('window').width;
  const minColumnWidth = Math.max(120, (screenWidth - 40) / headers.length); // Minimum 120px per column
  
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View>
          {/* Headers */}
          <View style={styles.headerRow}>
            {headers.map((header, index) => (
              <View 
                key={index} 
                style={[
                  styles.headerCell,
                  { width: minColumnWidth },
                  index === headers.length - 1 && styles.lastHeaderCell
                ]}
              >
                <Text style={styles.headerText}>{header}</Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          <View style={styles.dataContainer}>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.dataRow}>
                  {row.map((cell, cellIndex) => (
                    <View 
                      key={cellIndex} 
                      style={[
                        styles.dataCell,
                        { width: minColumnWidth },
                        cellIndex === row.length - 1 && styles.lastDataCell
                      ]}
                    >
                      {typeof cell === 'string' || typeof cell === 'number' ? (
                        <Text style={styles.dataCellText} numberOfLines={2}>{cell}</Text>
                      ) : (
                        <View style={styles.actionCell}>
                          {cell}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.noDataRow}>
                <Text style={styles.noDataText}>{noDataMessage}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#9ebaf3',
    backgroundColor: '#f5f5f5',
  },
  headerCell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#9ebaf3',
  },
  lastHeaderCell: {
    borderRightWidth: 0,
  },
  headerText: {
    fontWeight: 'bold',
    color: '#27374D',
    fontSize: 14,
    textAlign: 'center',
  },
  dataContainer: {
    flexGrow: 1,
  },
  dataRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  dataCell: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    minHeight: 50,
  },
  lastDataCell: {
    borderRightWidth: 0,
  },
  dataCellText: {
    color: '#27374D',
    fontSize: 13,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  actionCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataRow: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  noDataText: {
    color: '#27374D',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Table;