import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import styles from '../styles/PopupStyles';

const Popup = ({ visible, onClose, title, fields, onSubmit }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.popup}>
        <View style={styles.popupContent}>
          <Text style={styles.popupTitle}>{title}</Text>
          {fields.map((field, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={field.placeholder}
              value={field.value}
              onChangeText={field.onChangeText}
              keyboardType={field.keyboardType || 'default'}
            />
          ))}
          <View style={styles.popupActions}>
            <TouchableOpacity style={styles.button} onPress={onSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Popup;