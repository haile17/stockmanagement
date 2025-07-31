import React from 'react';
import { View, Text, TextInput, Modal, FlatList, TouchableOpacity ,ScrollView, KeyboardAvoidingView, StatusBar, Animated, Platform} from 'react-native';
import { StyleSheet } from 'react-native';
import Button from './Button';
import styles from '../styles/RecordPopup';
import { useAlert } from '../context/AlertContext';
import Icon from 'react-native-vector-icons/Ionicons';

const RecordPopup = ({ 
  visible, 
  onClose, 
  title, 
  fields, 
  formData, 
  onFieldChange, 
  onSubmit,
  submitButtonText = "Submit",
  onNameSearch,
  onSelectItem,
  onQuantityChange,
  filteredInventory = [],
  showNameDropdown = false,
  selectedItem = null,
  formType = 'sale'
}) => {
  
  const { showError } = useAlert(); 
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleSubmit = () => {
    // Get required fields based on form type
    let requiredFields = [];
    
    if (formType === 'sale') {
      requiredFields = ['itemName', 'cartonQuantity', 'quantityPerCarton', 'pricePerPiece', 'pricePerCarton'];
    } else if (formType === 'purchase') {
      requiredFields = ['itemName', 'cartonQuantity', 'quantityPerCarton', 'purchasePricePerPiece', 'purchasePricePerCarton'];
    } else if (formType === 'credit') {
      requiredFields = ['itemName', 'cartonQuantity', 'quantityPerCarton', 'pricePerPiece', 'customerName'];
    }

    const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');

    if (missingFields.length > 0) {
      showError('Error', 'Please fill all required fields');
      return;
    }

    onSubmit();
  };

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity
    style={styles.dropdownItem}
    onPress={() => onSelectItem(item, formType)}
  >
    <Text style={styles.dropdownItemName}>{item.itemName}</Text>  
    <Text style={styles.dropdownItemDetails}>
      Qty: {item.cartonQuantity} cartons - {item.quantityPerCarton} pcs/carton - ETB{item.pricePerPiece}/pc
    </Text>
  </TouchableOpacity>
  );

  const handleFieldChange = (field, value) => {
  if (field === 'itemName' && onNameSearch) {
    onNameSearch(value, formType);
  } else {
    // For all other fields, including quantityPerCarton, call the regular onFieldChange
    onFieldChange(field, value);
  }
};

  const isFieldEditable = (field) => {
    const field_config = fields.find(f => f.key === field);
    return field_config ? (field_config.editable !== false) : true;
  };

  const shouldShowDropdown = (fieldKey) => {
    return (formType === 'sale' || formType === 'credit') && fieldKey === 'itemName';
  };

  const getIconName = (fieldKey) => {
    switch (fieldKey) {
      case 'itemName':
        return 'cube-outline';
      case 'cartonQuantity':
        return 'layers-outline';
      case 'quantityPerCarton':
        return 'grid-outline';
      case 'totalQuantity':
        return 'calculator-outline';
      case 'pricePerPiece':
      case 'purchasePricePerPiece':
        return 'pricetag-outline';
      case 'pricePerCarton':
      case 'purchasePricePerCarton':
        return 'pricetags-outline';
      case 'totalAmount':
        return 'cash-outline';
      case 'plateNumber':
        return 'car-outline';
      case 'place':
        return 'location-outline';
      case 'paymentMethod':
        return 'card-outline';
      case 'customerName':
        return 'person-outline';
      case 'phoneNumber':
        return 'call-outline';
      case 'source':
        return 'business-outline';
      case 'amountPaid':
        return 'wallet-outline';
      case 'remainingBalance':
        return 'time-outline';
      case 'paymentStatus':
        return 'checkmark-circle-outline';
      case 'dueDate':
        return 'calendar-outline';
      case 'notes':
        return 'document-text-outline';
      default:
        return 'document-text-outline';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <StatusBar backgroundColor="rgba(0, 0, 0, 0.75)" barStyle="light-content" />
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.popup,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Button
              type="ghost"
              size="small"
              onPress={onClose}
              icon={<Icon name="close" size={28} color="#64748b" />}
              style={styles.closeButton}
              ariaLabel="Close popup"
            />
          </View>
          
          <KeyboardAvoidingView 
                style={styles.content} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
              >
           <ScrollView 
                contentContainerStyle={{ paddingBottom: 20 }}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
            {selectedItem && (formType === 'sale' || formType === 'credit') && (
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemText}>
                  Selected: {selectedItem.itemName} (Available: {selectedItem.cartonQuantity} cartons)
                </Text>
                <Text style={styles.selectedItemSubText}>
                  {selectedItem.quantityPerCarton} pieces per carton - Original Price: ETB{selectedItem.pricePerPiece}/piece
                </Text>
              </View>
            )}

            {fields.map((field, index) => (
             <View key={index} style={styles.inputContainer}>
               <View style={styles.labelWithIcon}>
                 <Icon
                   name={getIconName(field.key)}
                   size={16}
                   color="#555"
                   style={styles.labelIcon}
                 />
                 <Text style={styles.label}>
                   {field.label}
                   {field.required && <Text style={styles.required}> *</Text>}
                 </Text>
               </View>
               <View style={styles.inputWrapper}>
                 <TextInput
                   style={[
                     styles.input,
                     !isFieldEditable(field.key) && styles.disabledInput,
                     (field.key === 'totalQuantity' || field.key === 'totalAmount' || field.key === 'remainingBalance') && styles.calculatedField
                   ]}
                   placeholder={field.placeholder}
                   placeholderTextColor="#999"
                   value={formData[field.key] || ''}
                   onChangeText={(text) => handleFieldChange(field.key, text)}
                   keyboardType={field.keyboardType || 'default'}
                   editable={isFieldEditable(field.key)}
                 />
                 
                 {(field.key === 'totalQuantity' || field.key === 'totalAmount' || field.key === 'remainingBalance') && (
                   <Text style={styles.calculatedHint}>
                     🔢 Auto-calculated field
                   </Text>
                 )}
                 
                 {field.key === 'pricePerPiece' && selectedItem && (formType === 'sale' || formType === 'credit') && (
                   <Text style={styles.priceHint}>
                     💡 Price is editable - modify as needed
                   </Text>
                 )}
                 
                 {shouldShowDropdown(field.key) && field.key === 'itemName' && showNameDropdown && filteredInventory.length > 0 && (
                      <View style={styles.dropdown}>
                        <ScrollView 
                          style={[styles.dropdownList, { maxHeight: 150 }]}
                          nestedScrollEnabled={true}
                          showsVerticalScrollIndicator={true}
                        >
                          {filteredInventory.map((item, index) => (
                            <TouchableOpacity
                              key={`${item.itemName}-${index}`}
                              style={styles.dropdownItem}
                              onPress={() => onSelectItem(item, formType)}
                            >
                              <Text style={styles.dropdownItemName}>{item.itemName}</Text>
                              <Text style={styles.dropdownItemDetails}>
                                Qty: {item.cartonQuantity} cartons - {item.quantityPerCarton} pcs/carton - ETB{item.pricePerPiece}/pc
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
               </View>
             </View>
           ))}
         </ScrollView>
         </KeyboardAvoidingView>
         
         <View style={styles.footer}>
           <Button
             type="outline"
             size="small"
             title="Cancel"
             onPress={onClose}
             fullWidth={true}
             icon={<Icon name="close-circle-outline" size={18} color="#64748b" />}
             iconPosition="left"
             ariaLabel="Cancel action"
             style={{ marginRight: 8 }}
           />
           <Button
             type="gradient"
             size="medium"
             title={submitButtonText}
             onPress={handleSubmit}
             fullWidth={true}
             icon={<Icon name="checkmark-circle-outline" size={18} color="#ffffff" />}
             iconPosition="left"
             ariaLabel={`${submitButtonText} form`}
             style={{ marginLeft: 8 }}
           />
         </View>
          
       </Animated.View>
     </Animated.View>
   </Modal>
 );
};

export default RecordPopup;