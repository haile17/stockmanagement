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
      borderWidth: 0.8,
      borderColor: '#b3cde0',
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
      color: '#005b96',
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: '#03396c',
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
      borderWidth: 0.8,
      borderColor: '#b3cde0',
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
      borderWidth: 0.8,
      borderColor: '#b3cde0',
      backgroundColor: '#e0e0e0',
      marginRight: 8,
      minHeight: '10%',
    },
    filterButtonActive: {
      backgroundColor: '#005b96',
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
      borderWidth: 0.8,
      borderColor: '#b3cde0',
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
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    leftHeader: {
      flex: 2,
    },
    rightHeader: {
      flex: 1,
      alignItems: 'flex-end',
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
      fontSize: 13,
      color: '#34495e',
      fontWeight: '500',
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
        color: '#27ae60',
        marginBottom: 4,
      },
    saleDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    leftDetails: {
        flex: 2,
        paddingRight: 12,
      },

      rightDetails: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      },
    saleInfo: {
      flex: 1,
      marginRight: 12,
    },
    itemName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#393247',
      marginBottom: 2,
    },
    itemCode: {
      fontSize: 12,
      color: '#7f8c8d',
      fontStyle: 'italic',
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
      marginBottom: 6,
      paddingRight: 8,
    },
    infoLabel: {
      fontSize: 13,
      color: '#34495e',
      fontWeight: '500',
      flex: 1,
    },
    infoValue: {
  fontSize: 13,
  color: '#2c3e50',
  fontWeight: '400',
  flex: 1,
  textAlign: 'right',
},
dateTimeSection: {
  alignItems: 'flex-end',
  marginBottom: 12,
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    additionalInfoText: {
      fontSize: 14,
      color: '#475569',
    },
    paymentStatus: {
        fontSize: 11,
        fontWeight: '500',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
      },

      paidStatus: {
        color: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
      },
      unpaidStatus: {
  color: '#e74c3c',
  backgroundColor: 'rgba(231, 76, 60, 0.1)',
},
    sourceText: {
  fontSize: 11,
  color: '#7f8c8d',
  fontStyle: 'italic',
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
      minWidth: 70,
  paddingHorizontal: 8,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      color: '#011f4b',
      
    },
    emptySubText: {
      fontSize: 14,
      color: '#011f4b',
      textAlign: 'center',
      marginBottom: 16,
    },
    clearFiltersButton: {
      marginTop: 12,
    },
    dateTimeContainer: {
  flexDirection: 'column',
  alignItems: 'flex-start',
},
saleTime: {
   fontSize: 11,
  color: '#7f8c8d',
  marginTop: 2,
},
creditBadge: {
  fontSize: 10,
  color: '#3498db',
  backgroundColor: 'rgba(52, 152, 219, 0.1)',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 8,
  textAlign: 'center',
},
  });

export default styles;