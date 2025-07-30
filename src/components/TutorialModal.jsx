import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Button, { ButtonGroup } from './Button';
import styles from '../styles/TutorialModalStyles'; // You'll need to create this

const TutorialModal = ({ visible, onClose, onProceed }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.tutorialContainer}>
          <View style={styles.tutorialHeader}>
            <Text style={styles.tutorialTitle}>📊 Excel Import Guidelines</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.tutorialContent}>
            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>📋 File Requirements:</Text>
              <Text style={styles.bulletPoint}>• File must be .xlsx or .xls format</Text>
              <Text style={styles.bulletPoint}>• Maximum file size: 10MB</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>📑 Required Columns (exact names):</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Name</Text> - Product/Item name</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Part Number</Text> - Unique identifier</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Quantity</Text> - Number of items (positive integer)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Price</Text> - Unit price (positive number)</Text>
              <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Source</Text> - Where item was obtained</Text>
            </View>

            <View style={styles.guidelineSection}>
              <Text style={styles.sectionTitle}>✅ Data Validation:</Text>
              <Text style={styles.bulletPoint}>• All columns must be filled</Text>
              <Text style={styles.bulletPoint}>• Quantity must be a positive whole number</Text>
              <Text style={styles.bulletPoint}>• Price must be a positive decimal number</Text>
              <Text style={styles.bulletPoint}>• No empty rows between data</Text>
            </View>

            <View style={styles.exampleSection}>
              <Text style={styles.sectionTitle}>📝 Example Format:</Text>
              <View style={styles.exampleTable}>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleHeader}>Name</Text>
                  <Text style={styles.exampleHeader}>Part Number</Text>
                  <Text style={styles.exampleHeader}>Quantity</Text>
                  <Text style={styles.exampleHeader}>Price</Text>
                  <Text style={styles.exampleHeader}>Source</Text>
                </View>
                <View style={styles.exampleRow}>
                  <Text style={styles.exampleCell}>Screw M8</Text>
                  <Text style={styles.exampleCell}>SCR-M8-001</Text>
                  <Text style={styles.exampleCell}>100</Text>
                  <Text style={styles.exampleCell}>2.50</Text>
                  <Text style={styles.exampleCell}>Hardware Store</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.tutorialActions}>
            <ButtonGroup direction="row" spacing={12} fullWidth>
              <Button
                type="secondary"
                variant="outline"
                size="medium"
                onPress={onClose}
                title="Cancel"
                style={{ flex: 1 }}
              />
              <Button
                type="gradient"
                size="medium"
                onPress={onProceed}
                title="Proceed to Select File"
                icon={<Icon name="folder-open" size={18} color="white" />}
                iconPosition="left"
                style={{ flex: 1 }}
              />
            </ButtonGroup>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TutorialModal;