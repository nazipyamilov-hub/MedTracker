import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
  color: string;
  icon: string;
  isActive: boolean;
  lastTaken?: string;
  takenToday: number;
  totalToday: number;
}

interface MedicationState {
  medications: Medication[];
  loading: boolean;
}

type MedicationAction =
  | { type: 'SET_MEDICATIONS'; payload: Medication[] }
  | { type: 'ADD_MEDICATION'; payload: Medication }
  | { type: 'UPDATE_MEDICATION'; payload: Medication }
  | { type: 'DELETE_MEDICATION'; payload: string }
  | { type: 'MARK_TAKEN'; payload: { id: string; time: string } }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: MedicationState = {
  medications: [],
  loading: true,
};

const medicationReducer = (state: MedicationState, action: MedicationAction): MedicationState => {
  switch (action.type) {
    case 'SET_MEDICATIONS':
      return { ...state, medications: action.payload, loading: false };
    case 'ADD_MEDICATION':
      return { ...state, medications: [...state.medications, action.payload] };
    case 'UPDATE_MEDICATION':
      return {
        ...state,
        medications: state.medications.map(med =>
          med.id === action.payload.id ? action.payload : med
        ),
      };
    case 'DELETE_MEDICATION':
      return {
        ...state,
        medications: state.medications.filter(med => med.id !== action.payload),
      };
    case 'MARK_TAKEN':
      return {
        ...state,
        medications: state.medications.map(med => {
          if (med.id === action.payload.id) {
            const today = new Date().toDateString();
            const isToday = med.lastTaken === today;
            return {
              ...med,
              lastTaken: today,
              takenToday: isToday ? med.takenToday + 1 : 1,
            };
          }
          return med;
        }),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

interface MedicationContextType {
  state: MedicationState;
  addMedication: (medication: Omit<Medication, 'id' | 'takenToday' | 'totalToday'>) => void;
  updateMedication: (medication: Medication) => void;
  deleteMedication: (id: string) => void;
  markTaken: (id: string, time: string) => void;
  getMedicationsForToday: () => Medication[];
  getUpcomingMedications: () => Medication[];
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(medicationReducer, initialState);

  // Загрузка данных при запуске
  useEffect(() => {
    loadMedications();
  }, []);

  // Сохранение данных при изменении
  useEffect(() => {
    if (!state.loading) {
      saveMedications();
    }
  }, [state.medications, state.loading]);

  const loadMedications = async () => {
    try {
      const stored = await AsyncStorage.getItem('medications');
      if (stored) {
        const medications = JSON.parse(stored);
        dispatch({ type: 'SET_MEDICATIONS', payload: medications });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Ошибка загрузки лекарств:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveMedications = async () => {
    try {
      await AsyncStorage.setItem('medications', JSON.stringify(state.medications));
    } catch (error) {
      console.error('Ошибка сохранения лекарств:', error);
    }
  };

  const addMedication = (medicationData: Omit<Medication, 'id' | 'takenToday' | 'totalToday'>) => {
    const newMedication: Medication = {
      ...medicationData,
      id: Date.now().toString(),
      takenToday: 0,
      totalToday: medicationData.times.length,
    };
    dispatch({ type: 'ADD_MEDICATION', payload: newMedication });
  };

  const updateMedication = (medication: Medication) => {
    dispatch({ type: 'UPDATE_MEDICATION', payload: medication });
  };

  const deleteMedication = (id: string) => {
    dispatch({ type: 'DELETE_MEDICATION', payload: id });
  };

  const markTaken = (id: string, time: string) => {
    dispatch({ type: 'MARK_TAKEN', payload: { id, time } });
  };

  const getMedicationsForToday = (): Medication[] => {
    const today = new Date().toDateString();
    return state.medications.filter(med => {
      if (!med.isActive) return false;
      if (med.lastTaken === today && med.takenToday >= med.totalToday) return false;
      return true;
    });
  };

  const getUpcomingMedications = (): Medication[] => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return state.medications.filter(med => {
      if (!med.isActive) return false;
      
      return med.times.some(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const medTime = hours * 60 + minutes;
        return medTime > currentTime;
      });
    });
  };

  const value: MedicationContextType = {
    state,
    addMedication,
    updateMedication,
    deleteMedication,
    markTaken,
    getMedicationsForToday,
    getUpcomingMedications,
  };

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedication = () => {
  const context = useContext(MedicationContext);
  if (context === undefined) {
    throw new Error('useMedication должен использоваться внутри MedicationProvider');
  }
  return context;
};
