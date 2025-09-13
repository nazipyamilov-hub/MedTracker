import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
  medications: string[]; // IDs лекарств
  notifications: boolean;
}

interface FamilyState {
  members: FamilyMember[];
  loading: boolean;
}

type FamilyAction =
  | { type: 'SET_MEMBERS'; payload: FamilyMember[] }
  | { type: 'ADD_MEMBER'; payload: FamilyMember }
  | { type: 'UPDATE_MEMBER'; payload: FamilyMember }
  | { type: 'DELETE_MEMBER'; payload: string }
  | { type: 'UPDATE_ONLINE_STATUS'; payload: { id: string; isOnline: boolean } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: FamilyState = {
  members: [],
  loading: true,
};

const familyReducer = (state: FamilyState, action: FamilyAction): FamilyState => {
  switch (action.type) {
    case 'SET_MEMBERS':
      return { ...state, members: action.payload, loading: false };
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] };
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map(member =>
          member.id === action.payload.id ? action.payload : member
        ),
      };
    case 'DELETE_MEMBER':
      return {
        ...state,
        members: state.members.filter(member => member.id !== action.payload),
      };
    case 'UPDATE_ONLINE_STATUS':
      return {
        ...state,
        members: state.members.map(member => {
          if (member.id === action.payload.id) {
            return {
              ...member,
              isOnline: action.payload.isOnline,
              lastSeen: new Date().toISOString(),
            };
          }
          return member;
        }),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

interface FamilyContextType {
  state: FamilyState;
  addMember: (member: Omit<FamilyMember, 'id' | 'isOnline' | 'lastSeen'>) => void;
  updateMember: (member: FamilyMember) => void;
  deleteMember: (id: string) => void;
  updateOnlineStatus: (id: string, isOnline: boolean) => void;
  getOnlineMembers: () => FamilyMember[];
  getOfflineMembers: () => FamilyMember[];
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(familyReducer, initialState);

  // Загрузка данных при запуске
  useEffect(() => {
    loadMembers();
  }, []);

  // Сохранение данных при изменении
  useEffect(() => {
    if (!state.loading) {
      saveMembers();
    }
  }, [state.members, state.loading]);

  // Симуляция онлайн статуса
  useEffect(() => {
    const interval = setInterval(() => {
      state.members.forEach(member => {
        // Случайно обновляем статус для демонстрации
        if (Math.random() > 0.8) {
          const isOnline = Math.random() > 0.5;
          dispatch({ 
            type: 'UPDATE_ONLINE_STATUS', 
            payload: { id: member.id, isOnline } 
          });
        }
      });
    }, 10000); // Каждые 10 секунд

    return () => clearInterval(interval);
  }, [state.members]);

  const loadMembers = async () => {
    try {
      const stored = await AsyncStorage.getItem('familyMembers');
      if (stored) {
        const members = JSON.parse(stored);
        dispatch({ type: 'SET_MEMBERS', payload: members });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Ошибка загрузки членов семьи:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveMembers = async () => {
    try {
      await AsyncStorage.setItem('familyMembers', JSON.stringify(state.members));
    } catch (error) {
      console.error('Ошибка сохранения членов семьи:', error);
    }
  };

  const addMember = (memberData: Omit<FamilyMember, 'id' | 'isOnline' | 'lastSeen'>) => {
    const newMember: FamilyMember = {
      ...memberData,
      id: Date.now().toString(),
      isOnline: true,
      lastSeen: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MEMBER', payload: newMember });
  };

  const updateMember = (member: FamilyMember) => {
    dispatch({ type: 'UPDATE_MEMBER', payload: member });
  };

  const deleteMember = (id: string) => {
    dispatch({ type: 'DELETE_MEMBER', payload: id });
  };

  const updateOnlineStatus = (id: string, isOnline: boolean) => {
    dispatch({ type: 'UPDATE_ONLINE_STATUS', payload: { id, isOnline } });
  };

  const getOnlineMembers = (): FamilyMember[] => {
    return state.members.filter(member => member.isOnline);
  };

  const getOfflineMembers = (): FamilyMember[] => {
    return state.members.filter(member => !member.isOnline);
  };

  const value: FamilyContextType = {
    state,
    addMember,
    updateMember,
    deleteMember,
    updateOnlineStatus,
    getOnlineMembers,
    getOfflineMembers,
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily должен использоваться внутри FamilyProvider');
  }
  return context;
};
