import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DatePickerInput = ({ 
  style, 
  placeholder = "Select Date", 
  value, 
  onDateChange,
  minDate,
  disabled = false 
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const screenWidth = Dimensions.get('window').width;
  
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

  const isDateDisabled = (date) => {
    const minDate = getMinimumDate();
    return date < minDate;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const selectDate = (date) => {
    if (!isDateDisabled(date)) {
      const isoString = date.toISOString().split('T')[0];
      onDateChange(isoString);
      setShowCalendar(false);
    }
  };

  const openCalendar = () => {
    if (!disabled) {
      // Set current month to the selected date or current date
      if (value) {
        setCurrentMonth(new Date(value));
      } else {
        setCurrentMonth(new Date());
      }
      setShowCalendar(true);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentMonth);

  return (
    <View>
      <TouchableOpacity
        style={[
          style,
          disabled && { opacity: 0.6, backgroundColor: '#f5f5f5' }
        ]}
        onPress={openCalendar}
        disabled={disabled}
      >
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
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

      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            margin: 20,
            padding: 0,
            maxWidth: screenWidth - 40,
            width: '90%',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}>
            {/* Calendar Header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#eee'
            }}>
              <TouchableOpacity 
                onPress={() => navigateMonth(-1)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#f0f0f0'
                }}
              >
                <Icon name="chevron-back" size={20} color="#333" />
              </TouchableOpacity>
              
              <Text style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#333'
              }}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity 
                onPress={() => navigateMonth(1)}
                style={{
                  padding: 8,
                  borderRadius: 20,
                  backgroundColor: '#f0f0f0'
                }}
              >
                <Icon name="chevron-forward" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Calendar Body */}
            <View style={{ padding: 16 }}>
              {/* Day Headers */}
              <View style={{
                flexDirection: 'row',
                marginBottom: 8
              }}>
                {dayNames.map((dayName, index) => (
                  <View key={index} style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 8
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: '#666'
                    }}>
                      {dayName}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Calendar Days */}
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}>
                {days.map((day, index) => (
                  <View key={index} style={{
                    width: '14.28%',
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 2
                  }}>
                    {day ? (
                      <TouchableOpacity
                        onPress={() => selectDate(day)}
                        disabled={isDateDisabled(day)}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSameDay(day, value ? new Date(value) : null) 
                            ? '#007AFF' 
                            : 'transparent',
                          opacity: isDateDisabled(day) ? 0.3 : 1
                        }}
                      >
                        <Text style={{
                          fontSize: 16,
                          color: isSameDay(day, value ? new Date(value) : null) 
                            ? '#fff' 
                            : isDateDisabled(day) 
                              ? '#ccc' 
                              : '#333',
                          fontWeight: isSameDay(day, value ? new Date(value) : null) ? '600' : '400'
                        }}>
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={{ width: 36, height: 36 }} />
                    )}
                  </View>
                ))}
              </View>
            </View>

            {/* Calendar Footer */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 16,
              borderTopWidth: 1,
              borderTopColor: '#eee'
            }}>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: '#f0f0f0'
                }}
              >
                <Text style={{
                  color: '#666',
                  fontWeight: '500'
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  // Select today if no date is selected
                  const today = new Date();
                  const tomorrow = getMinimumDate();
                  const dateToSelect = today >= tomorrow ? today : tomorrow;
                  selectDate(dateToSelect);
                }}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: '#007AFF'
                }}
              >
                <Text style={{
                  color: '#fff',
                  fontWeight: '500'
                }}>
                  Today
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DatePickerInput;