import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  helpText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
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