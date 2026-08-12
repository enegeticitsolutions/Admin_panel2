import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AddonPreviewData {
  benefitId: string;
  benefitName: string;
  benefitTypeName?: string;
  unitLabel?: string;
  quantity: number;
  unitPrice: number;
  unitIncludedUnits: number;
  includedUnits: number;
  originalPrice: number;
  basePrice: number;
  hasDiscount: boolean;
  gstRate: number;
  tax: number;
  total: number;
}

interface AddonPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  addonPreview: AddonPreviewData | null;
  addonQuantity: number;
  addonLoading: boolean;
  addonProcessing: boolean;
  onQuantityChange: (delta: number) => void;
  onPaymentSubmit: () => void;
  beneficiaryName?: string;
  formatUnitLabelText: (count: number, rawLabel?: string) => string;
}

export const AddonPurchaseModal: React.FC<AddonPurchaseModalProps> = ({
  visible,
  onClose,
  addonPreview,
  addonQuantity,
  addonLoading,
  addonProcessing,
  onQuantityChange,
  onPaymentSubmit,
  beneficiaryName = 'beneficiary',
  formatUnitLabelText,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Purchase Add-on</Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {addonLoading && !addonPreview ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#FF5B0A" />
              <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 13 }}>Loading add-on pricing...</Text>
            </View>
          ) : addonPreview ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubTitle}>{addonPreview.benefitName}</Text>
              <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
                {addonPreview.benefitTypeName} · +{formatUnitLabelText(addonPreview.includedUnits, addonPreview.unitLabel)}
              </Text>

              {/* Quantity Selector Bar */}
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Select Quantity / Packs</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={[styles.quantityBtn, (addonQuantity <= 1 || addonLoading) && styles.quantityBtnDisabled]}
                    onPress={() => onQuantityChange(-1)}
                    disabled={addonQuantity <= 1 || addonLoading}
                  >
                    <Ionicons name="remove" size={18} color={addonQuantity <= 1 ? '#9CA3AF' : '#111827'} />
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityValueText}>{addonQuantity}</Text>
                    <Text style={styles.quantityUnitText}>
                      {addonQuantity === 1 ? 'pack' : 'packs'} ({formatUnitLabelText(addonPreview.includedUnits, addonPreview.unitLabel)})
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.quantityBtn, addonLoading && styles.quantityBtnDisabled]}
                    onPress={() => onQuantityChange(1)}
                    disabled={addonLoading}
                  >
                    <Ionicons name="add" size={18} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Pricing Breakdown */}
              <View style={styles.addonPricingBox}>
                <View style={styles.addonPricingRow}>
                  <Text style={styles.addonPricingLabel}>
                    Base Price ({addonQuantity} {addonQuantity === 1 ? 'pack' : 'packs'})
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {addonPreview.hasDiscount && (
                      <Text style={styles.addonPricingStrike}>₹{addonPreview.originalPrice}</Text>
                    )}
                    <Text style={styles.addonPricingValue}>₹{addonPreview.basePrice}</Text>
                  </View>
                </View>

                <View style={styles.addonPricingRow}>
                  <Text style={styles.addonPricingLabel}>GST (18%)</Text>
                  <Text style={styles.addonPricingValue}>₹{addonPreview.tax}</Text>
                </View>

                <View style={[styles.addonPricingRow, { borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 8, paddingTop: 12 }]}>
                  <Text style={[styles.addonPricingLabel, { fontWeight: '800', fontSize: 15, color: '#111827' }]}>Total</Text>
                  <Text style={[styles.addonPricingValue, { fontWeight: '800', fontSize: 18, color: '#FF5B0A' }]}>₹{addonPreview.total}</Text>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 20, textAlign: 'center' }}>
                +{formatUnitLabelText(addonPreview.includedUnits, addonPreview.unitLabel)} will be instantly credited to {beneficiaryName}'s package.
              </Text>

              <TouchableOpacity
                style={[styles.requestServiceBtn, addonProcessing && { opacity: 0.7 }]}
                onPress={onPaymentSubmit}
                disabled={addonProcessing}
              >
                {addonProcessing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="card-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.requestServiceBtnText}>
                  {addonProcessing ? 'PROCESSING...' : `PAY ₹${addonPreview.total}`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15 },
      android: { elevation: 10 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF5B0A',
    marginTop: 12,
    marginBottom: 8,
  },
  quantityContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  quantityLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9A3412',
    marginBottom: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityBtnDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  quantityDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#9A3412',
  },
  quantityUnitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#C2410C',
  },
  addonPricingBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addonPricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addonPricingLabel: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '600',
  },
  addonPricingValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  addonPricingStrike: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  requestServiceBtn: {
    backgroundColor: '#FF5B0A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestServiceBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
