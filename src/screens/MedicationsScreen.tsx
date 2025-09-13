import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useMedication } from '../context/MedicationContext';
import { useNavigation } from '@react-navigation/native';

const MedicationsScreen: React.FC = () => {
  const { state, deleteMedication } = useMedication();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Удалить лекарство',
      `Вы уверены, что хотите удалить "${name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => deleteMedication(id)
        },
      ]
    );
  };

  const renderMedication = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.medicationCard,
        { borderLeftColor: item.color, opacity: item.isActive ? 1 : 0.6 }
      ]}
      onPress={() => navigation.navigate('MedicationDetail', { medication: item })}
    >
      <View style={styles.medicationHeader}>
        <View style={[styles.medicationIcon, { backgroundColor: item.color }]}>
          <Icon name={item.icon} size={24} color="white" />
        </View>
        <View style={styles.medicationInfo}>
          <Text style={styles.medicationName}>{item.name}</Text>
          <Text style={styles.medicationDosage}>{item.dosage}</Text>
          <Text style={styles.medicationFrequency}>{item.frequency}</Text>
        </View>
        <View style={styles.medicationActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MedicationDetail', { medication: item })}
          >
            <Icon name="edit" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Icon name="delete" size={20} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.medicationTimes}>
        <Text style={styles.timesLabel}>Время приема:</Text>
        <View style={styles.timesContainer}>
          {item.times.map((time: string, index: number) => (
            <View key={index} style={styles.timeTag}>
              <Text style={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.medicationStatus}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Статус:</Text>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.isActive ? '#4CAF50' : '#9E9E9E' }
          ]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Активно' : 'Неактивно'}
            </Text>
          </View>
        </View>
        
        {item.lastTaken && (
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Последний прием:</Text>
            <Text style={styles.statusValue}>
              {new Date(item.lastTaken).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      {state.medications.length > 0 ? (
        <FlatList
          data={state.medications}
          renderItem={renderMedication}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="medication" size={64} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>Нет лекарств</Text>
          <Text style={styles.emptyStateText}>
            Добавьте ваше первое лекарство для отслеживания
          </Text>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddMedication')}
      >
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 16,
  },
  medicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  medicationFrequency: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  medicationActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  medicationTimes: {
    marginBottom: 12,
  },
  timesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: 'bold',
  },
  medicationStatus: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MedicationsScreen;
