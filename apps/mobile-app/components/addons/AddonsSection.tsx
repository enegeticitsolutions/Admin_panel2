import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddonCard, AddonItem } from './AddonCard';
import { AddonPurchaseModal, AddonPreviewData } from './AddonPurchaseModal';

interface AddonsSectionProps {
  addons: AddonItem[];
  onSelectAddon: (addon: AddonItem) => void;
  formatUnitLabelText: (count: number, rawLabel?: string) => string;
  showModal: boolean;
  onCloseModal: () => void;
  addonPreview: AddonPreviewData | null;
  addonQuantity: number;
  addonLoading: boolean;
  addonProcessing: boolean;
  onQuantityChange: (delta: number) => void;
  onPaymentSubmit: () => void;
  beneficiaryName?: string;
  // Location Props for Region-based Add-ons
  selectedAddress?: string;
  selectedPincode?: string;
  selectedRegionId?: string;
  checkingLocation?: boolean;
  onDetectLocation?: () => void;
  onOpenMapPicker?: () => void;
}

export const AddonsSection: React.FC<AddonsSectionProps> = ({
  addons,
  onSelectAddon,
  formatUnitLabelText,
  showModal,
  onCloseModal,
  addonPreview,
  addonQuantity,
  addonLoading,
  addonProcessing,
  onQuantityChange,
  onPaymentSubmit,
  beneficiaryName,
  selectedAddress,
  selectedPincode,
  selectedRegionId,
  checkingLocation,
  onDetectLocation,
  onOpenMapPicker,
}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="add-circle-outline" size={20} color="#FF5B0A" style={{ marginRight: 6 }} />
        <Text style={styles.title}>Available Add-ons</Text>
      </View>

      <Text style={styles.subtitle}>
        Top up benefits instantly. Paid units are credited immediately.
      </Text>

      {/* Location Detector Bar */}
      <View style={styles.locationBar}>
        <View style={styles.locationLeft}>
          <Ionicons name="location-sharp" size={16} color="#FF5B0A" style={{ marginRight: 6 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              {selectedAddress || (selectedPincode ? `Pincode ${selectedPincode}` : 'Detect location for regional add-ons')}
            </Text>
            <Text style={styles.locationSub}>
              {selectedRegionId ? 'Showing location-matched & global add-ons' : 'Showing global add-on benefits'}
            </Text>
          </View>
        </View>

        <View style={styles.locationActions}>
          <TouchableOpacity
            style={styles.detectBtn}
            onPress={onDetectLocation}
            disabled={checkingLocation}
            activeOpacity={0.8}
          >
            {checkingLocation ? (
              <ActivityIndicator size="small" color="#FF5B0A" />
            ) : (
              <>
                <Ionicons name="navigate" size={13} color="#FF5B0A" style={{ marginRight: 3 }} />
                <Text style={styles.detectBtnText}>Detect</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.changeBtn}
            onPress={onOpenMapPicker}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={13} color="#475569" style={{ marginRight: 3 }} />
            <Text style={styles.changeBtnText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add-ons List */}
      {!addons || addons.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No add-ons available for this location.</Text>
        </View>
      ) : (
        addons.map((addon) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            onSelect={onSelectAddon}
            formatUnitLabelText={formatUnitLabelText}
          />
        ))
      )}

      {/* Purchase Modal */}
      <AddonPurchaseModal
        visible={showModal}
        onClose={onCloseModal}
        addonPreview={addonPreview}
        addonQuantity={addonQuantity}
        addonLoading={addonLoading}
        addonProcessing={addonProcessing}
        onQuantityChange={onQuantityChange}
        onPaymentSubmit={onPaymentSubmit}
        beneficiaryName={beneficiaryName}
        formatUnitLabelText={formatUnitLabelText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 2,
  },
  locationBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  locationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detectBtn: {
    backgroundColor: '#FFF3ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD6BA',
  },
  detectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5B0A',
  },
  changeBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
});
