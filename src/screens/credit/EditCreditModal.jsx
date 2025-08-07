// components/EditCreditModal.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Button from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditCreditModal = ({
  visible,
  onClose,
  creditItem,
  onSave,
  formatNumberWithCommas
}) => {
  const [formData, setFormData] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Payment status options
  const paymentStatusOptions = ['Unpaid', 'Partially Paid', 'Paid', 'Pending'];

  useEffect(() => {
    if (creditItem && visible) {
      setFormData({
        customerName: creditItem.customerName || '',
        phoneNumber: creditItem.phoneNumber || '',
        place: creditItem.place || '',
        amountPaid: (creditItem.amountPaid || 0).toString(),
        remainingBalance: (creditItem.remainingBalance || 0).toString(),
        paymentStatus: creditItem.paymentStatus || 'Unpaid',
        dueDate: creditItem.dueDate || '',
        notes: creditItem.notes || '',
        plateNumber: creditItem.plateNumber || ''
      });
    }
  }, [creditItem, visible]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.customerName.trim()) {
        Alert.alert('Error', 'Customer name is required');
        return;
      }

      // Validate payment amounts
      const amountPaid = parseFloat(formData.amountPaid) || 0;
      const remainingBalance = parseFloat(formData.remainingBalance) || 0;
      
      if (amountPaid < 0 || remainingBalance < 0) {
        Alert.alert('Error', 'Payment amounts cannot be negative');
        return;
      }

      // Calculate total amount to validate
      const totalAmount = parseFloat(creditItem.totalAmount) || 
                         (parseInt(creditItem.cartonQuantity || 0) * parseFloat(creditItem.pricePerCarton || 0)) ||
                         (parseInt(creditItem.totalQuantity || 0) * parseFloat(creditItem.pricePerPiece || 0));

      if (amountPaid + remainingBalance !== totalAmount) {
        Alert.alert(
          'Validation Error',
          `Amount paid (${formatNumberWithCommas(amountPaid)}) + Remaining balance (${formatNumberWithCommas(remainingBalance)}) should equal total amount (${formatNumberWithCommas(totalAmount)})`
        );
        return;
      }

      // Auto-update payment status based on amounts
      let updatedPaymentStatus = formData.paymentStatus;
      if (amountPaid === 0) {
        updatedPaymentStatus = 'Unpaid';
      } else if (remainingBalance === 0) {
        updatedPaymentStatus = 'Paid';
      } else if (amountPaid > 0 && remainingBalance > 0) {
        updatedPaymentStatus = 'Partially Paid';
      }

      const updatedCredit = {
        ...creditItem,
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        place: formData.place.trim(),
        amountPaid: amountPaid,
        remainingBalance: remainingBalance,
        paymentStatus: updatedPaymentStatus,
        dueDate: formData.dueDate,
        notes: formData.notes.trim(),
        plateNumber: formData.plateNumber.trim(),
        lastUpdated: new Date().toISOString()
      };

      await onSave(updatedCredit);
      onClose();
      
    } catch (error) {
      console.error('Error updating credit:', error);
      Alert.alert('Error', 'Failed to update credit information');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        dueDate: selectedDate.toISOString()
      });
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Credit Sale</Text>
            <Button
              onPress={handleSave}
              title={loading ? 'Saving...' : 'Save'}
              loading={loading}
              disabled={loading}
              fullWidth={false}
              size="small"
              variant='outline'
              color="primary"
            />
          </View>

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Item Info (Read-only) */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Icon name="cube-outline" size={20} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Item Information</Text>
              </View>
              <View style={styles.readOnlyContainer}>
                <View style={styles.itemInfoRow}>
                  <Text style={styles.readOnlyText}>
                    {creditItem?.itemName}
                  </Text>
                  <View style={styles.itemCodeBadge}>
                    <Text style={styles.itemCodeText}>{creditItem?.itemCode}</Text>
                  </View>
                </View>
                <Text style={styles.readOnlySubText}>
                  Quantity: {formatNumberWithCommas(creditItem?.cartonQuantity || 0)} cartons
                </Text>
              </View>
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Icon name="person-outline" size={20} color="#10b981" />
                <Text style={styles.sectionTitle}>Customer Information</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  Customer Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person" size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.customerName}
                    onChangeText={(text) => setFormData({...formData, customerName: text})}
                    placeholder="Enter customer name"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="call" size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.phoneNumber}
                    onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="location" size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.place}
                    onChangeText={(text) => setFormData({...formData, place: text})}
                    placeholder="Enter location"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>

            {/* Payment Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Icon name="card-outline" size={20} color="#f59e0b" />
                <Text style={styles.sectionTitle}>Payment Information</Text>
              </View>
              
              <View style={styles.paymentRow}>
                <View style={styles.paymentInputHalf}>
                  <Text style={styles.inputLabel}>Amount Paid</Text>
                  <View style={styles.currencyInputWrapper}>
                    <Text style={styles.currencySymbol}>ETB</Text>
                    <TextInput
                      style={styles.currencyInput}
                      value={formData.amountPaid}
                      onChangeText={(text) => setFormData({...formData, amountPaid: text})}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.paymentInputHalf}>
                  <Text style={styles.inputLabel}>Remaining Balance</Text>
                  <View style={styles.currencyInputWrapper}>
                    <Text style={styles.currencySymbol}>ETB</Text>
                    <TextInput
                      style={styles.currencyInput}
                      value={formData.remainingBalance}
                      onChangeText={(text) => setFormData({...formData, remainingBalance: text})}
                      placeholder="0"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Payment Status</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.statusContainer}>
                    {paymentStatusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          formData.paymentStatus === status && styles.statusOptionSelected
                        ]}
                        onPress={() => setFormData({...formData, paymentStatus: status})}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.statusOptionText,
                          formData.paymentStatus === status && styles.statusOptionTextSelected
                        ]}>
                          {status}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Due Date</Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.datePickerContent}>
                    <Icon name="calendar" size={18} color="#3b82f6" />
                    <Text style={styles.datePickerText}>
                      {formatDateForDisplay(formData.dueDate)}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderContainer}>
                <Icon name="information-circle-outline" size={20} color="#8b5cf6" />
                <Text style={styles.sectionTitle}>Additional Information</Text>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Plate Number</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="car" size={16} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={formData.plateNumber}
                    onChangeText={(text) => setFormData({...formData, plateNumber: text})}
                    placeholder="Enter plate number"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes</Text>
                <View style={styles.textAreaWrapper}>
                  <TextInput
                    style={styles.textArea}
                    value={formData.notes}
                    onChangeText={(text) => setFormData({...formData, notes: text})}
                    placeholder="Enter additional notes or comments"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={formData.dueDate ? new Date(formData.dueDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    letterSpacing: -0.3,
  },
  readOnlyContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  itemInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  readOnlyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  itemCodeBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemCodeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3b82f6',
  },
  readOnlySubText: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingVertical: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentInputHalf: {
    flex: 1,
  },
  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  currencySymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    paddingVertical: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  statusOptionSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusOptionText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  statusOptionTextSelected: {
    color: '#ffffff',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
    fontWeight: '500',
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textArea: {
    fontSize: 15,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
};

export default EditCreditModal;