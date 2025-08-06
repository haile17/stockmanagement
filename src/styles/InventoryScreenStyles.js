import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitleContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 10,
},
 sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#353a5f',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 450,
      gap: 15,
    },
    loadingText: {
      fontSize: 16,
      color: '#666',
      fontWeight: '500',
    },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  clearButton: {
    padding: 5,
  },
  helpTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8, // Adjust as needed
  },
  helpText: {
    fontSize: 14,
    color: '#353a5f',
    flexShrink: 1, // Ensures text wraps properly
  },
  sectionHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#c6d7f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  sectionIcon: {
    backgroundColor: '#c6d7f8ff',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  disabledButton: {
      opacity: 0.6,
    },
  deleteButton: {
  padding: 8,
  borderRadius: 4,
  backgroundColor: '#ffebee',
  alignItems: 'center',
  justifyContent: 'center',
},
});

export default styles;