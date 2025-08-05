import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerTwo: {
      display: 'flex',
      padding: 16,
    },

  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fixedBottomActions: {
  position: 'absolute',
  bottom: 35,
  left: 0,
  right: 0,
  backgroundColor: 'transparent',
  flexDirection: 'row',
  paddingHorizontal: 12,
  justifyContent: 'space-around',
  paddingBottom: 20,
  flexWrap:'wrap',
},
  card: {
    width: '48%',
    backgroundColor: '#373b4d',
    padding: 15,
    borderWidth: 1,
    borderColor: '#373b4d',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#ecedef',
  },
  cardText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#d7d7d7ff',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
  },
  cardTitleRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 5,
},
icon: {
  marginRight: 6,
  marginBottom: 5,
},
  table: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#555',
  },
  tableCell: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#555',
  },
});

export default styles;