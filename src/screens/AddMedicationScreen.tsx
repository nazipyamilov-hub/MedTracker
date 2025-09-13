import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import { useMedication } from '../context/MedicationContext';
import { useNavigation } from '@react-navigation/native';

const MEDICATION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

const MEDICATION_ICONS = [
  'medication', 'local-pharmacy', 'healing', 'favorite', 'star',
  'circle', 'square', 'triangle', 'diamond', 'heart'
];

const AddMedicationScreen: React.FC = () => {
  const { addMedication } = useMedication();
  const navigation = useNavigation();
  
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEDICATION_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(MEDICATION_ICONS[0]);
  const [isActive, setIsActive] = useState(true);
  const [hasEndDate, setHasEndDate] = useState(false);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [tempTime, setTempTime] = useState('');

  const handleAddTime = () => {
    if (tempTime && !times.includes(tempTime)) {
      setTimes([...times, tempTime].sort());
      setTempTime('');
      setShowTimePicker(false);
    }
  };

  const handleRemoveTime = (timeToRemove: string) => {
    setTimes(times.filter(time => time !== timeToRemove));
  };

  const handleSave = () => {
    if (!name.trim() || !dosage.trim() || times.length === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    const medication = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim() || 'По назначению врача',
      times,
      startDate: startDate.toISOString(),
      endDate: hasEndDate && endDate ? endDate.toISOString() : undefined,
      notes: notes.trim(),
      color: selectedColor,
      icon: selectedIcon,
      isActive,
    };

    addMedication(medication);
    Alert.alert('Успех', 'Лекарство добавлено!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const TimeInput: React.FC = () => (
    <Modal isVisible={showTimePicker} onBackdropPress={() => setShowTimePicker(false)}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Добавить время</Text>
        <TextInput
          style={styles.timeInput}
          placeholder="ЧЧ:ММ (например, 08:30)"
          value={tempTime}
          onChangeText={setTempTime}
          keyboardType="numeric"
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setShowTimePicker(false)}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={handleAddTime}
          >
            <Text style={styles.saveButtonText}>Добавить</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ColorPicker: React.FC = () => (
    <Modal isVisible={showColorPicker} onBackdropPress={() => setShowColorPicker(false)}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Выберите цвет</Text>
        <View style={styles.colorGrid}>
          {MEDICATION_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => {
                setSelectedColor(color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      </View>
    </Modal>
  );

  const IconPicker: React.FC = () => (
    <Modal isVisible={showIconPicker} onBackdropPress={() => setShowIconPicker(false)}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Выберите иконку</Text>
        <View style={styles.iconGrid}>
          {MEDICATION_ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                selectedIcon === icon && styles.selectedIcon
              ]}
              onPress={() => {
                setSelectedIcon(icon);
                setShowIconPicker(false);
              }}
            >
              <Icon name={icon} size={24} color={selectedIcon === icon ? '#4A90E2' : '#666'} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Основная информация */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Название лекарства *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Введите название"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Дозировка *</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              placeholder="Например: 1 таблетка, 5мл"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Частота приема</Text>
            <TextInput
              style={styles.input}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="Например: 3 раза в день"
            />
          </View>
        </View>

        {/* Время приема */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Время приема *</Text>
          
          <TouchableOpacity
            style={styles.addTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Icon name="add" size={20} color="#4A90E2" />
            <Text style={styles.addTimeText}>Добавить время</Text>
          </TouchableOpacity>

          <View style={styles.timesList}>
            {times.map((time, index) => (
              <View key={index} style={styles.timeItem}>
                <Text style={styles.timeText}>{time}</Text>
                <TouchableOpacity onPress={() => handleRemoveTime(time)}>
                  <Icon name="close" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Даты */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Период приема</Text>
          
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Icon name="calendar-today" size={20} color="#4A90E2" />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Дата начала</Text>
              <Text style={styles.dateValue}>
                {startDate.toLocaleDateString('ru-RU')}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Установить дату окончания</Text>
            <Switch
              value={hasEndDate}
              onValueChange={setHasEndDate}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={hasEndDate ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          {hasEndDate && (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Icon name="event" size={20} color="#4A90E2" />
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Дата окончания</Text>
                <Text style={styles.dateValue}>
                  {endDate ? endDate.toLocaleDateString('ru-RU') : 'Выберите дату'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Внешний вид */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Внешний вид</Text>
          
          <TouchableOpacity
            style={styles.appearanceButton}
            onPress={() => setShowColorPicker(true)}
          >
            <View style={[styles.colorPreview, { backgroundColor: selectedColor }]} />
            <Text style={styles.appearanceText}>Цвет</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.appearanceButton}
            onPress={() => setShowIconPicker(true)}
          >
            <Icon name={selectedIcon} size={24} color="#4A90E2" />
            <Text style={styles.appearanceText}>Иконка</Text>
            <Icon name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Дополнительно */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Дополнительно</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Заметки</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Дополнительная информация..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Активно</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={isActive ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Сохранить лекарство</Text>
      </TouchableOpacity>

      <TimeInput />
      <ColorPicker />
      <IconPicker />

      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate}
        mode="date"
        onConfirm={(date) => {
          setShowStartDatePicker(false);
          setStartDate(date);
        }}
        onCancel={() => setShowStartDatePicker(false)}
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate || new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowEndDatePicker(false);
          setEndDate(date);
        }}
        onCancel={() => setShowEndDatePicker(false)}
      />
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 12,
  },
  addTimeText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontSize: 16,
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  dateInfo: {
    marginLeft: 12,
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  appearanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  appearanceText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
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
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#4A90E2',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
});

export default AddMedicationScreen;
