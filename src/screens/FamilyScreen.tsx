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
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useFamily } from '../context/FamilyContext';
import { useNavigation } from '@react-navigation/native';

const FamilyScreen: React.FC = () => {
  const { state, deleteMember, getOnlineMembers, getOfflineMembers } = useFamily();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const onlineMembers = getOnlineMembers();
  const offlineMembers = getOfflineMembers();

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Удалить члена семьи',
      `Вы уверены, что хотите удалить "${name}"?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => deleteMember(id)
        },
      ]
    );
  };

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'мама':
      case 'мать':
        return 'woman';
      case 'папа':
      case 'отец':
        return 'man';
      case 'бабушка':
        return 'elderly-woman';
      case 'дедушка':
        return 'elderly';
      case 'сестра':
        return 'girl';
      case 'брат':
        return 'boy';
      case 'жена':
        return 'woman-2';
      case 'муж':
        return 'man-2';
      default:
        return 'person';
    }
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'мама':
      case 'мать':
        return '#E91E63';
      case 'папа':
      case 'отец':
        return '#2196F3';
      case 'бабушка':
        return '#9C27B0';
      case 'дедушка':
        return '#3F51B5';
      case 'сестра':
        return '#FF9800';
      case 'брат':
        return '#4CAF50';
      case 'жена':
        return '#F44336';
      case 'муж':
        return '#607D8B';
      default:
        return '#9E9E9E';
    }
  };

  const renderMember = ({ item }: { item: any }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={100}
      style={[
        styles.memberCard,
        { borderLeftColor: getRelationshipColor(item.relationship) }
      ]}
    >
      <View style={styles.memberHeader}>
        <View style={[
          styles.memberAvatar,
          { backgroundColor: getRelationshipColor(item.relationship) }
        ]}>
          <Icon name={getRelationshipIcon(item.relationship)} size={24} color="white" />
        </View>
        
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberRelationship}>{item.relationship}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.isOnline ? '#4CAF50' : '#9E9E9E' }
            ]} />
            <Text style={[
              styles.statusText,
              { color: item.isOnline ? '#4CAF50' : '#9E9E9E' }
            ]}>
              {item.isOnline ? 'Онлайн' : 'Офлайн'}
            </Text>
          </View>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddFamilyMember', { member: item })}
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

      {item.phone && (
        <View style={styles.contactInfo}>
          <Icon name="phone" size={16} color="#666" />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
      )}

      {item.email && (
        <View style={styles.contactInfo}>
          <Icon name="email" size={16} color="#666" />
          <Text style={styles.contactText}>{item.email}</Text>
        </View>
      )}

      <View style={styles.lastSeenContainer}>
        <Text style={styles.lastSeenText}>
          Последний раз: {new Date(item.lastSeen).toLocaleString('ru-RU')}
        </Text>
      </View>
    </Animatable.View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const StatCard: React.FC<{
    title: string;
    value: number;
    color: string;
    icon: string;
  }> = ({ title, value, color, icon }) => (
    <View style={styles.statCard}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Статистика */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Всего"
          value={state.members.length}
          color="#4A90E2"
          icon="family-restroom"
        />
        <StatCard
          title="Онлайн"
          value={onlineMembers.length}
          color="#4CAF50"
          icon="wifi"
        />
        <StatCard
          title="Офлайн"
          value={offlineMembers.length}
          color="#9E9E9E"
          icon="wifi-off"
        />
      </View>

      {state.members.length > 0 ? (
        <FlatList
          data={state.members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Animatable.View animation="bounceIn" delay={200}>
            <Icon name="family-restroom" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>Нет членов семьи</Text>
            <Text style={styles.emptyStateText}>
              Добавьте ваших близких для отслеживания их статуса
            </Text>
          </Animatable.View>
        </View>
      )}
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddFamilyMember')}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 16,
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
  listContainer: {
    padding: 16,
  },
  memberCard: {
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
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  memberRelationship: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  lastSeenContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },
  lastSeenText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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

export default FamilyScreen;
