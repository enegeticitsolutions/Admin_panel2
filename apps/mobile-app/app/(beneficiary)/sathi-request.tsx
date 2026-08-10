import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SaathiView } from '@/components/shared/SaathiView';

export default function SathiRequestScreen() {
  const [beneficiaryId, setBeneficiaryId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem('userData');
      if (userStr) {
        const user = JSON.parse(userStr);
        setBeneficiaryId(user.id);
      }
    };
    loadUser();
  }, []);

  if (!beneficiaryId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6A00" />
      </View>
    );
  }

  return <SaathiView beneficiaryId={beneficiaryId} />;
}
