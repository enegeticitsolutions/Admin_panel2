import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';

export const deleteSathiAccount = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return false;

    const response = await fetch(`${API_URL}/sathi/profile`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('[deleteSathiAccount] Error deleting account:', error);
    return false;
  }
};
