import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useMedication } from '../context/MedicationContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const MedicationDetailScreen: React.FC = () => {
  const { updateMedication, markTaken } = useMedication();
  const navigation = useNavigation();
  const route = useRoute();
  
  const medication = route.params?.medication;
  const [isActive, setIsActive] = useState(medication.isActive);

  if (!medication) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Лекарство не найдено</Text>
      </View>
    );
  }

  const handleToggleActive = () => {
    const updatedMedication = { ...medication, isActive: !isActive };
    updateMedication(updatedMedication);
    setIsActive(!isActive);
  };

  const handleMarkTaken = (time: string) => {
    markTaken(medication.id, time);
    Alert.alert('Успех', `Лекарство отмечено как принятое в ${time}`);
  };

  const getProgressPercentage = () => {
    return (medication.takenToday / medication.totalToday) * 100;
  };

  const getNextTime = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const time of medication.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const medTime = hours * 60 + minutes;
      if (medTime > currentTime) {
        return time;
      }
    }
    return null;
  };

  const nextTime = getNextTime();

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={icon} size={20} color="white" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <Animatable.View animation="fadeInDown" style={styles.header}>
        <LinearGradient
          colors={[medication.color, `${medication.color}CC`]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.medicationIcon}>
              <Icon name={medication.icon} size={32} color="white" />
            </View>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{medication.name}</Text>
              <Text style={styles.medicationDosage}>{medication.dosage}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Принято сегодня"
          value={`${medication.takenToday}/${medication.totalToday}`}
          icon="check-circle"
          color="#4CAF50"
        />
        <StatCard
          title="Прогресс"
          value={`${Math.round(getProgressPercentage())}%`}
          icon="trending-up"
          color="#2196F3"
        />
        <StatCard
          title="Следующий прием"
          value={nextTime || 'Завершено'}
          icon="schedule"
          color="#FF9800"
        />
      </View>

      {/* Прогресс-бар */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Прогресс на сегодня</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: medication.color 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {medication.takenToday} из {medication.totalToday} приемов
          </Text>
        </View>
      </View>

      {/* Время приема */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Время приема</Text>
        <View style={styles.timesContainer}>
          {medication.times.map((time: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeCard,
                { borderColor: medication.color }
              ]}
              onPress={() => handleMarkTaken(time)}
            >
              <Text style={[styles.timeText, { color: medication.color }]}>
                {time}
              </Text>
              <Icon 
                name="check-circle" 
                size={20} 
                color={medication.takenToday > index ? '#4CAF50' : '#E0E0E0'} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Информация */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Частота:</Text>
          <Text style={styles.infoValue}>{medication.frequency}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Дата начала:</Text>
          <Text style={styles.infoValue}>
            {new Date(medication.startDate).toLocaleDateString('ru-RU')}
          </Text>
        </View>
        
        {medication.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Дата окончания:</Text>
            <Text style={styles.infoValue}>
              {new Date(medication.endDate).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        )}
        
        {medication.lastTaken && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Последний прием:</Text>
            <Text style={styles.infoValue}>
              {new Date(medication.lastTaken).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        )}
        
        {medication.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.infoLabel}>Заметки:</Text>
            <Text style={styles.notesText}>{medication.notes}</Text>
          </View>
        )}
      </View>

      {/* Настройки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Активно</Text>
            <Text style={styles.settingDescription}>
              Лекарство активно и напоминания включены
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={handleToggleActive}
            trackColor={{ false: '#E0E0E0', true: medication.color }}
            thumbColor={isActive ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Действия */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('AddMedication', { medication })}
        >
          <Icon name="edit" size={20} color="white" />
          <Text style={styles.actionButtonText}>Редактировать</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              'Удалить лекарство',
              'Вы уверены, что хотите удалить это лекарство?',
              [
                { text: 'Отмена', style: 'cancel' },
                { 
                  text: 'Удалить', 
                  style: 'destructive',
                  onPress: () => {
                    // Здесь должна быть функция удаления
                    navigation.goBack();
                  }
                },
              ]
            );
          }}
        >
          <Icon name="delete" size={20} color="white" />
          <Text style={styles.actionButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationInfo: {
    marginLeft: 16,
    flex: 1,
  },
  medicationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  medicationDosage: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  statTitle: {
    fontSize: 10,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'center',
  },
  progressSection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 0,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#FAFAFA',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  notesContainer: {
    marginTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    lineHeight: 20,
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
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  editButton: {
    backgroundColor: '#4A90E2',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MedicationDetailScreen;
