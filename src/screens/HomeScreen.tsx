import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMedication } from '../context/MedicationContext';
import { useFamily } from '../context/FamilyContext';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const { state: medState, getMedicationsForToday, markTaken } = useMedication();
  const { getOnlineMembers, getOfflineMembers } = useFamily();
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const todayMedications = getMedicationsForToday();
  const onlineMembers = getOnlineMembers();
  const offlineMembers = getOfflineMembers();

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getNextMedication = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextMed = null;
    let nextTime = Infinity;
    
    todayMedications.forEach(med => {
      med.times.forEach(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const medTime = hours * 60 + minutes;
        if (medTime > currentTime && medTime < nextTime) {
          nextMed = med;
          nextTime = medTime;
        }
      });
    });
    
    return nextMed;
  };

  const nextMedication = getNextMedication();

  const handleMarkTaken = (medicationId: string) => {
    const time = currentTime.toTimeString().slice(0, 5);
    markTaken(medicationId, time);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    onPress?: () => void;
  }> = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}CC`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={icon} size={24} color="white" />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const MedicationCard: React.FC<{ medication: any }> = ({ medication }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={100}
      style={styles.medicationCard}
    >
      <View style={styles.medicationHeader}>
        <View style={[styles.medicationIcon, { backgroundColor: medication.color }]}>
          <Icon name={medication.icon} size={20} color="white" />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <Text style={styles.medicationDosage}>{medication.dosage}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.takeButton,
            { backgroundColor: medication.takenToday >= medication.totalToday ? '#4CAF50' : '#FF6B6B' }
          ]}
          onPress={() => handleMarkTaken(medication.id)}
        >
          <Icon 
            name={medication.takenToday >= medication.totalToday ? "check" : "add"} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${(medication.takenToday / medication.totalToday) * 100}%`,
                backgroundColor: medication.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {medication.takenToday}/{medication.totalToday}
        </Text>
      </View>
    </Animatable.View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Приветствие */}
      <Animatable.View animation="fadeInDown" style={styles.greetingContainer}>
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.greetingGradient}
        >
          <Text style={styles.greeting}>{getGreeting()}!</Text>
          <Text style={styles.time}>
            {currentTime.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </LinearGradient>
      </Animatable.View>

      {/* Статистика */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Лекарств сегодня"
          value={todayMedications.length}
          icon="medication"
          color="#4CAF50"
        />
        <StatCard
          title="Онлайн"
          value={onlineMembers.length}
          icon="wifi"
          color="#2196F3"
        />
        <StatCard
          title="Семья"
          value={onlineMembers.length + offlineMembers.length}
          icon="family-restroom"
          color="#FF9800"
        />
      </View>

      {/* Следующее лекарство */}
      {nextMedication && (
        <Animatable.View animation="fadeInUp" delay={200} style={styles.nextMedicationContainer}>
          <Text style={styles.sectionTitle}>Следующее лекарство</Text>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E8E']}
            style={styles.nextMedicationCard}
          >
            <View style={styles.nextMedicationContent}>
              <Icon name="schedule" size={24} color="white" />
              <View style={styles.nextMedicationInfo}>
                <Text style={styles.nextMedicationName}>{nextMedication.name}</Text>
                <Text style={styles.nextMedicationTime}>
                  {nextMedication.times.find(time => {
                    const [hours, minutes] = time.split(':').map(Number);
                    const medTime = hours * 60 + minutes;
                    const currentTime = new Date().getHours() * 60 + new Date().getMinutes();
                    return medTime > currentTime;
                  })}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animatable.View>
      )}

      {/* Лекарства на сегодня */}
      <View style={styles.medicationsContainer}>
        <Text style={styles.sectionTitle}>Лекарства на сегодня</Text>
        {todayMedications.length > 0 ? (
          todayMedications.map((medication, index) => (
            <MedicationCard key={medication.id} medication={medication} />
          ))
        ) : (
          <Animatable.View animation="fadeIn" style={styles.emptyState}>
            <Icon name="medication" size={48} color="#CCCCCC" />
            <Text style={styles.emptyStateText}>Нет лекарств на сегодня</Text>
          </Animatable.View>
        )}
      </View>

      {/* Статус семьи */}
      <View style={styles.familyContainer}>
        <Text style={styles.sectionTitle}>Статус семьи</Text>
        <View style={styles.familyStatus}>
          {onlineMembers.map((member, index) => (
            <Animatable.View
              key={member.id}
              animation="bounceIn"
              delay={index * 100}
              style={styles.familyMember}
            >
              <View style={[styles.memberAvatar, { backgroundColor: '#4CAF50' }]}>
                <Icon name="person" size={20} color="white" />
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <View style={styles.onlineIndicator} />
            </Animatable.View>
          ))}
          {offlineMembers.map((member, index) => (
            <Animatable.View
              key={member.id}
              animation="bounceIn"
              delay={(onlineMembers.length + index) * 100}
              style={styles.familyMember}
            >
              <View style={[styles.memberAvatar, { backgroundColor: '#9E9E9E' }]}>
                <Icon name="person" size={20} color="white" />
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <View style={[styles.onlineIndicator, { backgroundColor: '#9E9E9E' }]} />
            </Animatable.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  greetingContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  greetingGradient: {
    padding: 24,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  time: {
    fontSize: 18,
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
    fontSize: 24,
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
  nextMedicationContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  nextMedicationCard: {
    borderRadius: 12,
    padding: 16,
  },
  nextMedicationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextMedicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nextMedicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  nextMedicationTime: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  medicationsContainer: {
    margin: 16,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  takeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  familyContainer: {
    margin: 16,
  },
  familyStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  familyMember: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 16,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
});

export default HomeScreen;
