import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFamily } from '../context/FamilyContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const RELATIONSHIPS = [
  'Мама', 'Папа', 'Бабушка', 'Дедушка', 'Сестра', 'Брат',
  'Жена', 'Муж', 'Дочь', 'Сын', 'Тетя', 'Дядя', 'Друг', 'Другое'
];

const AddFamilyMemberScreen: React.FC = () => {
  const { addMember, updateMember } = useFamily();
  const navigation = useNavigation();
  const route = useRoute();
  
  const isEditing = route.params?.member;
  const existingMember = route.params?.member;

  const [name, setName] = useState(existingMember?.name || '');
  const [relationship, setRelationship] = useState(existingMember?.relationship || '');
  const [phone, setPhone] = useState(existingMember?.phone || '');
  const [email, setEmail] = useState(existingMember?.email || '');
  const [notifications, setNotifications] = useState(existingMember?.notifications ?? true);
  const [showRelationshipPicker, setShowRelationshipPicker] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !relationship.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните имя и родство');
      return;
    }

    const memberData = {
      name: name.trim(),
      relationship: relationship.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notifications,
      medications: existingMember?.medications || [],
    };

    if (isEditing) {
      updateMember({
        ...existingMember,
        ...memberData,
      });
      Alert.alert('Успех', 'Информация обновлена!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      addMember(memberData);
      Alert.alert('Успех', 'Член семьи добавлен!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  const RelationshipPicker: React.FC = () => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerTitle}>Выберите родство</Text>
      <View style={styles.relationshipGrid}>
        {RELATIONSHIPS.map((rel) => (
          <TouchableOpacity
            key={rel}
            style={[
              styles.relationshipOption,
              relationship === rel && styles.selectedRelationship
            ]}
            onPress={() => {
              setRelationship(rel);
              setShowRelationshipPicker(false);
            }}
          >
            <Text style={[
              styles.relationshipText,
              relationship === rel && styles.selectedRelationshipText
            ]}>
              {rel}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Основная информация */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Введите имя"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Родство *</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowRelationshipPicker(true)}
            >
              <Text style={[styles.pickerButtonText, !relationship && styles.placeholder]}>
                {relationship || 'Выберите родство'}
              </Text>
              <Icon name="arrow-drop-down" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Контактная информация */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Контактная информация</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Телефон</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIconText}
                value={phone}
                onChangeText={setPhone}
                placeholder="+7 (999) 123-45-67"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.inputWithIconText}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Настройки */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Уведомления</Text>
              <Text style={styles.settingDescription}>
                Получать уведомления о приеме лекарств
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notifications && styles.toggleActive
              ]}
              onPress={() => setNotifications(!notifications)}
            >
              <View style={[
                styles.toggleThumb,
                notifications && styles.toggleThumbActive
              ]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Информация о статусе */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Статус</Text>
            
            <View style={styles.statusInfo}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Статус:</Text>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: existingMember.isOnline ? '#4CAF50' : '#9E9E9E' }
                ]}>
                  <Text style={styles.statusText}>
                    {existingMember.isOnline ? 'Онлайн' : 'Офлайн'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Последний раз:</Text>
                <Text style={styles.statusValue}>
                  {new Date(existingMember.lastSeen).toLocaleString('ru-RU')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {isEditing ? 'Обновить информацию' : 'Добавить члена семьи'}
        </Text>
      </TouchableOpacity>

      {showRelationshipPicker && (
        <View style={styles.overlay}>
          <View style={styles.pickerModal}>
            <RelationshipPicker />
            <TouchableOpacity
              style={styles.closePicker}
              onPress={() => setShowRelationshipPicker(false)}
            >
              <Text style={styles.closePickerText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  form: {
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#4A90E2',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  statusInfo: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
  },
  pickerContainer: {
    padding: 20,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  relationshipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  selectedRelationship: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  relationshipText: {
    fontSize: 14,
    color: '#333',
  },
  selectedRelationshipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closePicker: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  closePickerText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
});

export default AddFamilyMemberScreen;
