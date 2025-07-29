import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  tutorialContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 500,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tutorialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tutorialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  tutorialContent: {
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  guidelineSection: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#555',
    marginVertical: 3,
    paddingLeft: 10,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  exampleSection: {
    marginVertical: 15,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  exampleTable: {
    marginTop: 10,
  },
  exampleRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  exampleHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  exampleCell: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  tutorialActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  proceedButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
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