import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';
import { SaathiView } from '@/components/shared/SaathiView';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeBack } from '@/hooks/useSafeBack';
import { scale } from '@/utils/responsive';

export default function SubscriberSaathiScreen() {
  const safeBack = useSafeBack();
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchEligibleBeneficiaries();
  }, []);

  const fetchEligibleBeneficiaries = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const res = await fetch(`${API_URL}/subscriber/beneficiaries/sathi-eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setBeneficiaries(data.data || []);
        if (data.data?.length === 1) {
          setSelectedBeneficiaryId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch eligible beneficiaries', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={{ marginTop: scale(12), color: '#6B7280' }}>Loading Saathi Services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handle empty state - no eligible beneficiaries
  if (beneficiaries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => safeBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={scale(24)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saathi Companion</Text>
          <View style={{ width: scale(24) }} />
        </View>

        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="account-group-outline" size={scale(64)} color="#E11D48" style={{ marginBottom: scale(16) }} />
          <Text style={styles.errorTitle}>No Eligible Beneficiaries</Text>
          <Text style={styles.errorDesc}>
            None of your beneficiaries currently have a subscription package that includes Sathi Companion hours.
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => safeBack()}>
            <Text style={styles.closeBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If multiple beneficiaries, but none selected
  if (beneficiaries.length > 1 && !selectedBeneficiaryId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => safeBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={scale(24)} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Beneficiary</Text>
          <View style={{ width: scale(24) }} />
        </View>
        <ScrollView contentContainerStyle={styles.listContent}>
          <Text style={styles.listPrompt}>Which beneficiary needs a companion?</Text>
          {beneficiaries.map(b => (
            <TouchableOpacity 
              key={b.id} 
              style={styles.beneficiaryCard} 
              onPress={() => setSelectedBeneficiaryId(b.id)}
            >
              <View style={styles.beneficiaryIconBg}>
                <Feather name="user" size={scale(20)} color="#E11D48" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.beneficiaryName}>{b.name}</Text>
                <Text style={styles.beneficiaryDetail}>Eligible for Saathi</Text>
              </View>
              <Feather name="chevron-right" size={scale(20)} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Find selected name for the dropdown
  const selectedName = beneficiaries.find(b => b.id === selectedBeneficiaryId)?.name;

  return (
    <View style={styles.container}>
      {beneficiaries.length > 1 && (
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={styles.dropdownSelector} 
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="user" size={scale(16)} color="#E11D48" style={{ marginRight: scale(8) }} />
              <Text style={styles.dropdownText}>Managing for: <Text style={{ fontWeight: 'bold' }}>{selectedName}</Text></Text>
            </View>
            <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={scale(20)} color="#6B7280" />
          </TouchableOpacity>
          
          {showDropdown && (
            <View style={styles.dropdownMenu}>
              {beneficiaries.map(b => (
                <TouchableOpacity 
                  key={b.id} 
                  style={[styles.dropdownItem, b.id === selectedBeneficiaryId && styles.dropdownItemActive]}
                  onPress={() => {
                    setSelectedBeneficiaryId(b.id);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, b.id === selectedBeneficiaryId && styles.dropdownItemTextActive]}>
                    {b.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Render the shared Saathi component for the selected beneficiary */}
      {selectedBeneficiaryId && (
        <View style={{ flex: 1 }}>
          <SaathiView 
            beneficiaryId={selectedBeneficiaryId} 
            beneficiaryName={selectedName}
            accentColor="#E11D48" 
            onBackPress={beneficiaries.length > 1 ? () => setSelectedBeneficiaryId(null) : undefined}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    backgroundColor: '#FAFAFA',
  },
  backBtn: {
    padding: scale(8),
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: '#111827',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(24),
  },
  errorTitle: {
    fontSize: scale(20),
    fontWeight: '800',
    color: '#111827',
    marginBottom: scale(8),
  },
  errorDesc: {
    fontSize: scale(15),
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: scale(22),
    marginBottom: scale(24),
  },
  closeBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: scale(12),
    paddingHorizontal: scale(32),
    borderRadius: scale(8),
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: scale(15),
  },
  listContent: {
    padding: scale(20),
  },
  listPrompt: {
    fontSize: scale(16),
    color: '#4B5563',
    marginBottom: scale(16),
  },
  beneficiaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: scale(16),
    borderRadius: scale(12),
    marginBottom: scale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  beneficiaryIconBg: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  beneficiaryName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#111827',
  },
  beneficiaryDetail: {
    fontSize: scale(13),
    color: '#6B7280',
    marginTop: scale(2),
  },
  dropdownContainer: {
    position: 'absolute',
    top: scale(60),
    left: scale(20),
    right: scale(20),
    zIndex: 100,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownText: {
    fontSize: scale(14),
    color: '#374151',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    marginTop: scale(4),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF1F2',
  },
  dropdownItemText: {
    fontSize: scale(14),
    color: '#374151',
  },
  dropdownItemTextActive: {
    color: '#E11D48',
    fontWeight: '600',
  }
});
