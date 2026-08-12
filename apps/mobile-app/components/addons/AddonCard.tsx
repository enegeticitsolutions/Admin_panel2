import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AddonItem {
  id: string;
  code?: string;
  name: string;
  description?: string;
  unitLabel?: string;
  addonPrice?: number;
  addonDiscountPrice?: number;
  addonIncludedUnits?: number;
  benefitType?: { name: string; iconCode?: string };
}

interface AddonCardProps {
  addon: AddonItem;
  onSelect?: (addon: AddonItem) => void;
  formatUnitLabelText?: (count: number, rawLabel?: string) => string;
  selectedQuantity?: number;
  onQuantityChange?: (addon: AddonItem, delta: number) => void;
}

export const AddonCard: React.FC<AddonCardProps> = ({
  addon,
  onSelect,
  formatUnitLabelText,
  selectedQuantity,
  onQuantityChange,
}) => {
  const units = addon.addonIncludedUnits || 1;
  const hasDiscount = !!(addon.addonDiscountPrice && addon.addonDiscountPrice < (addon.addonPrice || 0));
  const finalPrice = addon.addonDiscountPrice ?? addon.addonPrice ?? 0;
  const originalPrice = addon.addonPrice ?? 0;

  const formattedUnits = formatUnitLabelText
    ? formatUnitLabelText(units, addon.unitLabel)
    : `+${units} ${addon.unitLabel || 'units'}`;

  const isStepperMode = selectedQuantity !== undefined && onQuantityChange !== undefined;
  const qty = selectedQuantity || 0;
  const isSelected = qty > 0;

  return (
    <View style={[styles.card, isSelected && styles.cardSelected]}>
      <View style={styles.contentRow}>
        <View style={styles.infoCol}>
          <Text style={styles.categoryText}>
            {addon.benefitType?.name || 'ADD-ON'}
          </Text>

          <Text style={styles.name}>{addon.name}</Text>

          {addon.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {addon.description}
            </Text>
          ) : null}

          <View style={styles.unitPill}>
            <Text style={styles.unitText}>{formattedUnits}</Text>
          </View>
        </View>

        <View style={styles.actionCol}>
          <View style={styles.priceRow}>
            {hasDiscount && (
              <Text style={styles.strikePrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
            )}
            <Text style={styles.price}>₹{finalPrice.toLocaleString('en-IN')}</Text>
          </View>

          {isStepperMode ? (
            qty === 0 ? (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => onQuantityChange(addon, 1)}
                activeOpacity={0.8}
              >
                <Text style={styles.addBtnText}>+ Add</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => onQuantityChange(addon, -1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={12} color="#0F172A" />
                </TouchableOpacity>

                <Text style={styles.stepperQty}>{qty}</Text>

                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => onQuantityChange(addon, 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={12} color="#0F172A" />
                </TouchableOpacity>
              </View>
            )
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => onSelect && onSelect(addon)}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSelected: {
    borderColor: '#FF5B0A',
    backgroundColor: '#FFFBF9',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5B0A',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  unitPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 10,
  },
  strikePrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  addBtn: {
    backgroundColor: '#FF5B0A',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    paddingHorizontal: 10,
  },
});
