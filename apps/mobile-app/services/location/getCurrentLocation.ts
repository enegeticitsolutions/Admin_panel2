import * as Location from 'expo-location';
import { Platform, Alert, Linking } from 'react-native';

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  try {
    if (Platform.OS !== 'web') {
      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in your device settings to detect available services near you.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        throw new Error('Permission to access location was denied');
      }

      // Check if location services are enabled on the device
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Services Disabled',
          'Please turn on Location Services in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
        throw new Error('Location services are disabled on the device');
      }

      // 1. Try to get the last known position first (fastest, prevents hanging on emulators)
      let location: Location.LocationObject | null = null;
      try {
        location = await Location.getLastKnownPositionAsync({
          maxAge: 1000 * 60 * 5, // 5 minutes
        });
      } catch (e) {
        console.warn('[LocationService] Could not get last known position', e);
      }

      // 2. Fallback to requesting current position if no cached location exists
      if (!location) {
        // Use Low accuracy instead of Balanced to prevent hanging while waiting for precise GPS lock
        const locationPromise = Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Location request timed out after 15 seconds')), 15000)
        );

        location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } else {
      // Fallback for web
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => reject(error),
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      });
    }
  } catch (error) {
    console.error('[LocationService] getCurrentLocation error:', error);
    throw error;
  }
};
