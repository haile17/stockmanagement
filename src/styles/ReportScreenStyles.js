// styles/ReportScreenStyles.js
import { StyleSheet } from 'react-native';

export const reportScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 65, // Adjusted for header height
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  refreshButton: {
    minWidth: 80,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  // Simplified debug button styles
  debugButton: {
    marginTop: 10,
  },
  debugButtonText: {
    fontSize: 12,
  },
  reportTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
    gap: 8, // Add gap between buttons
  },
  // Simplified report type button styles - Button component handles active state
  reportTypeButton: {
    flex: 1,
    margin: 0, // Remove margin, use gap instead
  },
  
  reportTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  dateFilterContainer: {
    marginBottom: 16,
  },
  datePickersRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  // Simplified date picker button styles
  datePickerButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#393247',
      backgroundColor: '#f8f9fa',
      marginBottom: 0,
      minHeight: 44,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
      },
      scrollingTextContainer: {
      flex: 1,
      height: 20,
      justifyContent: 'center',
    },
    clearDatesButton: {
        minWidth: 60, // Fixed width for clear button
        marginBottom: 0,
        minHeight: 40,
      },
  clearDatesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Simplified generate button
  generateButton: {
    marginTop: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pdfItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    minHeight: 80, // Ensure consistent height
  },
 pdfItemInfo: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
  },
  pdfItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  pdfItemDate: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  pdfItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 50, // Ensure space for menu button
    maxWidth: '75%',
    minHeight: 40, // Ensure consistent height
  },
  expandedButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 4,
  },
  animatedButtonContainer: {
  // Container for individual animated buttons with transform origin
    transformOrigin: 'center',
   },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
},
  // Simplified action button styles - let Button component handle colors
 actionButton: {
    margin: 0,
    minWidth: 55,
    height: 28,
    shadowColor: '#000', // Add shadow for depth during animation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: '500',
  },
  menuButton: {
  minWidth: 40,
  height: 28,
  paddingHorizontal: 0,
},
});