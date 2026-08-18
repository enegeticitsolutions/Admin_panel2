import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeleteAccountWithConfirm } from '@/utils/deleteAccount';

interface DeleteAccountButtonProps {
  title?: string;
  subtitle?: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'card' | 'row' | 'button';
  onBeforeDelete?: () => void;
}

/**
 * DeleteAccountButton — Reusable UI Component for initiating the
 * account deletion workflow with a confirmation alert.
 */
export const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({
  title = 'Delete Account',
  subtitle = 'Permanently deactivate account & sign out',
  style,
  variant = 'row',
  onBeforeDelete,
}) => {
  const deleteAccount = useDeleteAccountWithConfirm(onBeforeDelete);

  if (variant === 'button') {
    return (
      <TouchableOpacity
        style={[styles.simpleButton, style]}
        onPress={deleteAccount}
        activeOpacity={0.75}
      >
        <Ionicons name="trash-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
        <Text style={styles.simpleButtonText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.rowContainer, variant === 'card' && styles.cardContainer, style]}
      onPress={deleteAccount}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Ionicons name="trash-outline" size={22} color="#DC2626" />
      </View>
      <View style={styles.contentCol}>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subText}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  subText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  simpleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  simpleButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DeleteAccountButton;
