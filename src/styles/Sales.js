import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
  },
    containerTwo: {
      display: 'flex',
      paddingTop: 70,
    },
    header: {
      backgroundColor: '#fff',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#393247',
    },
    subtitle: {
      fontSize: 16,
      color: '#666',
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 8,
      borderWidth: 0.5,
      borderColor: '#8DA9A4',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statNumber: {
       fontSize: 14,
      fontWeight: '500',
      color: '#393247',
    },
    statLabel: {
      fontSize: 10,
      color: '#666',
      marginTop: 4,
      textAlign: 'center',
      
    },
    searchContainer: {
      paddingHorizontal: 16,
      marginBottom: 0,
      
    },
    searchInput: {
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 0.5,
      borderColor: '#8DA9A4',
    },
    filtersContainer: {
      paddingHorizontal: 16,
      
    },
    filterGroup: {
      flexDirection: 'row',
      
      alignItems: 'center',
      marginRight: 20,
    },
    filterGroupTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      paddingVertical: 8,
      marginRight: 8,
    },
    filterButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: '#e0e0e0',
      marginRight: 8,
      minHeight: '10%',
    },
    filterButtonActive: {
      backgroundColor: '#393247',
    },
    filterButtonText: {
      fontSize: 12,
      color: '#666',
      fontWeight: '500',
    },
    filterButtonTextActive: {
      color: '#fff',
    },
    salesList: { 
      paddingTop: 10,
      marginVertical: 10,
      paddingHorizontal: 16,

    },
    saleItem: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      borderWidth: 0.5,
      borderColor: '#8DA9A4',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    saleItemEven: {
      backgroundColor: '#fafafa',
    },
    saleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    saleDate: {
      fontSize: 14,
      color: '#666',
    },
    saleAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#393247',
    },
    saleDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    saleInfo: {
      flex: 1,
      marginRight: 12,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 4,
    },
    itemDetails: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    itemPrice:{
      fontSize: 14,
      color: '#393247',
      fontWeight: '500',
    },
    customerName: {
      fontSize: 14,
      color: '#2C2C3A',
      fontStyle: 'italic',
    },
    saleActions: {
      justifyContent: 'center',
    },
    returnButton: {
      minWidth: 80,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      color: '#666',
      marginBottom: 8,
    },
    emptySubText: {
      fontSize: 14,
      color: '#999',
      textAlign: 'center',
      marginBottom: 16,
    },
    clearFiltersButton: {
      marginTop: 12,
    },
  });

export default styles;