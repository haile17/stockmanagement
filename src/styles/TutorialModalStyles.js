import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
     modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  });

export default styles;