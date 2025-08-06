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
      borderRadius: 12,
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
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    saleDate: {
      fontSize: 14,
      color: '#666',
      marginBottom: 4,
    },
    statusBadge: {
      fontSize: 11,
      color: '#fff',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      fontWeight: '600',
      alignSelf: 'flex-start',
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
      fontWeight: '500',
    },
   
    expandedDetails: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    infoSection: {
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#334155',
      marginBottom: 12,
    },
    infoGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    infoCard: {
      flex: 1,
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    infoCardLabel: {
      fontSize: 12,
      color: '#64748b',
      marginBottom: 4,
      fontWeight: '500',
    },
    infoCardValue: {
      fontSize: 14,
      color: '#1e293b',
      fontWeight: '600',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
    },
    detailLabel: {
      fontSize: 14,
      color: '#64748b',
      fontWeight: '500',
    },
    detailValue: {
      fontSize: 14,
      color: '#1e293b',
      fontWeight: '600',
    },
    paymentGrid: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    paymentCard: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
    },
    paidCard: {
      backgroundColor: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
    remainingCard: {
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    paymentCardLabel: {
      fontSize: 12,
      marginBottom: 4,
      fontWeight: '500',
    },
    paymentCardValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    dueDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff7ed',
      padding: 8,
      borderRadius: 6,
      gap: 6,
    },
    dueDateText: {
      fontSize: 13,
      color: '#ea580c',
      fontWeight: '500',
    },
    additionalInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    additionalInfoText: {
      fontSize: 14,
      color: '#475569',
    },
    notesSection: {
      marginBottom: 16,
    },
    notesContent: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: '#f8fafc',
      padding: 12,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#3b82f6',
    },
    notesText: {
      flex: 1,
      fontSize: 14,
      color: '#475569',
      fontStyle: 'italic',
      lineHeight: 20,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 16,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      backgroundColor: '#fff',
    },
    expandedContainer: {
  overflow: 'hidden', // Keep this for smooth height animation
},
    actionButton: {
      flex: 1,
      minHeight: 40,
    },
    // Keep existing styles that are not modified
    saleActions: {
      paddingTop: 10,
      justifyContent: 'flex-start',
      flexDirection: 'row',
      gap: 10,
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