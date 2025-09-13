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
import { useFamily } from '../context/FamilyContext';

const ProfileScreen: React.FC = () => {
  const { state: medState } = useMedication();
  const { state: familyState } = useFamily();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [reminders, setReminders] = useState(true);

  const getTotalMedications = () => {
    return medState.medications.length;
  };

  const getActiveMedications = () => {
    return medState.medications.filter(med => med.isActive).length;
  };

  const getCompletedToday = () => {
    return medState.medications.reduce((total, med) => total + med.takenToday, 0);
  };

  const getTotalToday = () => {
    return medState.medications.reduce((total, med) => total + med.totalToday, 0);
  };

  const getCompletionRate = () => {
    const completed = getCompletedToday();
    const total = getTotalToday();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleExportData = () => {
    Alert.alert(
      'Экспорт данных',
      'Функция экспорта данных будет доступна в следующей версии',
      [{ text: 'OK' }]
    );
  };

  const handleBackupData = () => {
    Alert.alert(
      'Резервное копирование',
      'Функция резервного копирования будет доступна в следующей версии',
      [{ text: 'OK' }]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Очистить данные',
      'Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Успех', 'Данные очищены');
          }
        },
      ]
    );
  };

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

  const SettingRow: React.FC<{
    title: string;
    description: string;
    icon: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }> = ({ title, description, icon, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color="#4A90E2" />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
        thumbColor={value ? '#FFFFFF' : '#FFFFFF'}
      />
    </View>
  );

  const ActionRow: React.FC<{
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    color?: string;
  }> = ({ title, description, icon, onPress, color = '#4A90E2' }) => (
    <TouchableOpacity style={styles.actionRow} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Профиль пользователя */}
      <Animatable.View animation="fadeInDown" style={styles.profileHeader}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.profileGradient}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={40} color="white" />
            </View>
          </View>
          <Text style={styles.userName}>Пользователь</Text>
          <Text style={styles.userEmail}>user@example.com</Text>
        </LinearGradient>
      </Animatable.View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Всего лекарств"
          value={getTotalMedications()}
          icon="medication"
          color="#4CAF50"
        />
        <StatCard
          title="Активных"
          value={getActiveMedications()}
          icon="check-circle"
          color="#2196F3"
        />
        <StatCard
          title="Выполнено"
          value={`${getCompletionRate()}%`}
          icon="trending-up"
          color="#FF9800"
        />
      </View>

      {/* Настройки */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>
        
        <SettingRow
          title="Уведомления"
          description="Получать напоминания о приеме лекарств"
          icon="notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
        
        <SettingRow
          title="Напоминания"
          description="Звуковые и вибрационные напоминания"
          icon="volume-up"
          value={reminders}
          onValueChange={setReminders}
        />
        
        <SettingRow
          title="Темная тема"
          description="Использовать темную цветовую схему"
          icon="dark-mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />
      </View>

      {/* Данные */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Данные</Text>
        
        <ActionRow
          title="Экспорт данных"
          description="Сохранить данные в файл"
          icon="file-download"
          onPress={handleExportData}
        />
        
        <ActionRow
          title="Резервное копирование"
          description="Создать резервную копию"
          icon="backup"
          onPress={handleBackupData}
        />
        
        <ActionRow
          title="Очистить данные"
          description="Удалить все данные приложения"
          icon="delete-forever"
          onPress={handleClearData}
          color="#FF6B6B"
        />
      </View>

      {/* Информация о приложении */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        
        <View style={styles.appInfo}>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Версия:</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Разработчик:</Text>
            <Text style={styles.appInfoValue}>MedTracker Team</Text>
          </View>
          
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Дата сборки:</Text>
            <Text style={styles.appInfoValue}>
              {new Date().toLocaleDateString('ru-RU')}
            </Text>
          </View>
        </View>
      </View>

      {/* Поддержка */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Поддержка</Text>
        
        <ActionRow
          title="Связаться с поддержкой"
          description="Получить помощь по использованию"
          icon="support"
          onPress={() => Alert.alert('Поддержка', 'Функция поддержки будет доступна в следующей версии')}
        />
        
        <ActionRow
          title="Оставить отзыв"
          description="Поделиться мнением о приложении"
          icon="rate-review"
          onPress={() => Alert.alert('Отзыв', 'Функция отзывов будет доступна в следующей версии')}
        />
        
        <ActionRow
          title="Политика конфиденциальности"
          description="Как мы защищаем ваши данные"
          icon="privacy-tip"
          onPress={() => Alert.alert('Политика', 'Политика конфиденциальности будет доступна в следующей версии')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Спасибо за использование MedTracker!
        </Text>
        <Text style={styles.footerSubtext}>
          Следите за своим здоровьем каждый день
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  profileHeader: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appInfo: {
    padding: 16,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  appInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default ProfileScreen;
