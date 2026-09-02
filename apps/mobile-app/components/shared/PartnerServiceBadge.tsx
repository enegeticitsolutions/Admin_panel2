import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { scale } from '@/utils/responsive';

interface PartnerServiceBadgeProps {
  size?: number;
  serviceName?: string;
  category?: string;
}

export const PartnerServiceBadge: React.FC<PartnerServiceBadgeProps> = ({
  size = 50,
  serviceName = '',
  category = '',
}) => {
  const normalized = (serviceName + ' ' + category).toLowerCase();

  // Determine icon based on benefit type/name
  let iconComponent = (
    <Ionicons name="business" size={Math.round(size * 0.48)} color="#4F46E5" />
  );

  if (normalized.includes('doctor') || normalized.includes('physician') || normalized.includes('consult')) {
    iconComponent = (
      <MaterialCommunityIcons name="doctor" size={Math.round(size * 0.52)} color="#0284C7" />
    );
  } else if (normalized.includes('physio') || normalized.includes('therapy')) {
    iconComponent = (
      <MaterialCommunityIcons name="human-male-height" size={Math.round(size * 0.52)} color="#0D9488" />
    );
  } else if (normalized.includes('lab') || normalized.includes('test') || normalized.includes('blood') || normalized.includes('diagnostic')) {
    iconComponent = (
      <Ionicons name="flask" size={Math.round(size * 0.48)} color="#7C3AED" />
    );
  } else if (normalized.includes('nurse') || normalized.includes('nursing')) {
    iconComponent = (
      <MaterialCommunityIcons name="medical-bag" size={Math.round(size * 0.52)} color="#E11D48" />
    );
  } else if (normalized.includes('ambulance')) {
    iconComponent = (
      <MaterialCommunityIcons name="ambulance" size={Math.round(size * 0.54)} color="#DC2626" />
    );
  } else {
    iconComponent = (
      <Ionicons name="shield-checkmark" size={Math.round(size * 0.48)} color="#4F46E5" />
    );
  }

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.28),
  };

  const miniBadgeSize = Math.max(14, Math.round(size * 0.32));

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Central Icon */}
      {iconComponent}

      {/* Verified Partner Corner Emblem */}
      <View
        style={[
          styles.miniBadge,
          {
            width: miniBadgeSize,
            height: miniBadgeSize,
            borderRadius: miniBadgeSize / 2,
            bottom: -2,
            right: -2,
          },
        ]}
      >
        <Ionicons name="checkmark" size={Math.round(miniBadgeSize * 0.7)} color="#FFFFFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  miniBadge: {
    position: 'absolute',
    backgroundColor: '#4F46E5',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PartnerServiceBadge;
