import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

const DatePickerInput = ({ 
  style, 
  placeholder, 
  value, 
  onDateChange,
  minDate,
  disabled = false 
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Set minimum date to tomorrow
  const getMinimumDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return minDate || tomorrow;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      onDateChange(selectedDate.toISOString().split('T')[0]);
    }
  };

  const openPicker = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          style,
          disabled && { opacity: 0.6, backgroundColor: '#f5f5f5' }
        ]}
        onPress={openPicker}
        disabled={disabled}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{
            color: value ? '#000' : '#999',
            fontSize: 16,
            flex: 1
          }}>
            {value ? formatDate(value) : placeholder}
          </Text>
          <Icon name="calendar-outline" size={20} color="#666" />
        </View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : getMinimumDate()}
          mode="date"
          minimumDate={getMinimumDate()}
          onChange={handleDateChange}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}
    </View>
  );
};

export default DatePickerInput;