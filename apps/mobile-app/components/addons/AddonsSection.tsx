import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
}) => {
  if (!addons || addons.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="add-circle-outline" size={20} color="#FF5B0A" style={{ marginRight: 6 }} />
        <Text style={styles.title}>Available Add-ons</Text>
      </View>

      <Text style={styles.subtitle}>
        Top up benefits instantly. Paid units are credited immediately.
      </Text>

      {addons.map((addon) => (
        <AddonCard
          key={addon.id}
          addon={addon}
          onSelect={onSelectAddon}
          formatUnitLabelText={formatUnitLabelText}
        />
      ))}

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
    marginBottom: 14,
    marginLeft: 2,
  },
});
