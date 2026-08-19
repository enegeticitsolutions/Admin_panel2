import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeImageUri } from '@/utils/sanitizeImageUri';
import { API_URL } from '@/constants/api';

export interface BeneficiaryItemData {
  id: string;
  name: string;
  age?: number;
  relationship?: string;
  photo?: string | null;
  isActive?: boolean;
  status?: string; // 'active' | 'inactive' | 'deleted'
  gender?: string;
  subscriptions?: Array<{
    id: string;
    packageType?: string;
    isActive?: boolean;
    package?: { name?: string };
  }>;
}

interface BeneficiariesModalProps {
  visible: boolean;
  onClose: () => void;
  beneficiaries: BeneficiaryItemData[];
  onSelectBeneficiary?: (beneficiaryId: string) => void;
  onRefresh?: () => void;
}

type FilterTab = 'all' | 'active' | 'inactive';

export const BeneficiariesModal: React.FC<BeneficiariesModalProps> = ({
  visible,
  onClose,
  beneficiaries = [],
  onSelectBeneficiary,
  onRefresh,
}) => {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const [localBeneficiaries, setLocalBeneficiaries] = useState<BeneficiaryItemData[]>(beneficiaries);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<BeneficiaryItemData | null>(null);
  const [feedback, setFeedback] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  useEffect(() => {
    setLocalBeneficiaries(beneficiaries);
  }, [beneficiaries]);

  const isBenActive = (b: BeneficiaryItemData): boolean => {
    // If explicitly deleted or inactive by status field, not active
    if (b.status === 'deleted' || b.status === 'inactive') return false;
    if (b.isActive === false) return false;
    if (Array.isArray(b.subscriptions)) {
      return b.subscriptions.some((s) => Boolean(s.isActive));
    }
    return Boolean(b.isActive);
  };

  const activeCount = useMemo(() => {
    return localBeneficiaries.filter((b) => isBenActive(b)).length;
  }, [localBeneficiaries]);

  const inactiveCount = useMemo(() => {
    return localBeneficiaries.filter((b) => !isBenActive(b)).length;
  }, [localBeneficiaries]);

  const filteredBeneficiaries = useMemo(() => {
    return localBeneficiaries.filter((b) => {
      // 1. Tab filter
      const active = isBenActive(b);
      if (activeFilter === 'active' && !active) return false;
      if (activeFilter === 'inactive' && active) return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (b.name || '').toLowerCase().includes(q);
        const relMatch = (b.relationship || '').toLowerCase().includes(q);
        const ageMatch = String(b.age || '').includes(q);
        return nameMatch || relMatch || ageMatch;
      }
      return true;
    });
  }, [localBeneficiaries, activeFilter, searchQuery]);

  const getInitials = (name: string) => {
    if (!name) return 'B';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleBeneficiaryPress = async (b: BeneficiaryItemData) => {
    onClose();
    try {
      await AsyncStorage.setItem('selectedBeneficiaryId', b.id);
      if (onSelectBeneficiary) {
        onSelectBeneficiary(b.id);
      }
    } catch (e) {
      console.warn('Error selecting beneficiary:', e);
    }
  };

  const executeDeleteBeneficiary = async (beneficiaryId: string, name: string) => {
    setDeletingId(beneficiaryId);
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setFeedback({
          title: 'Session Expired',
          message: 'Authentication session expired. Please log in again.',
          type: 'error',
        });
        return;
      }

      const res = await fetch(`${API_URL}/subscriber/beneficiaries/${beneficiaryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Remove locally
        setLocalBeneficiaries((prev) => prev.filter((b) => b.id !== beneficiaryId));
        
        // Clear if it was the selected one
        const currentSelected = await AsyncStorage.getItem('selectedBeneficiaryId');
        if (currentSelected === beneficiaryId) {
          await AsyncStorage.removeItem('selectedBeneficiaryId');
        }

        setFeedback({
          title: 'Beneficiary Removed',
          message: `${name || 'Beneficiary'} has been removed successfully.`,
          type: 'success',
        });

        if (onRefresh) {
          onRefresh();
        }
      } else {
        const errorMsg = data.message || 'Could not delete beneficiary.';
        setFeedback({
          title: 'Delete Failed',
          message: errorMsg,
          type: 'error',
        });
      }
    } catch (error: any) {
      console.error('[BeneficiariesModal] Delete error:', error);
      setFeedback({
        title: 'Error',
        message: 'Network error while removing beneficiary. Please try again.',
        type: 'error',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteBeneficiary = (item: BeneficiaryItemData) => {
    const isSelf = (item.relationship || '').toLowerCase() === 'self';
    if (isSelf) {
      setFeedback({
        title: 'Cannot Delete Self Profile',
        message: 'Your personal subscriber profile cannot be removed as a beneficiary.',
        type: 'warning',
      });
      return;
    }
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    await executeDeleteBeneficiary(target.id, target.name);
    setItemToDelete(null);
  };

  const renderBeneficiaryCard = ({ item }: { item: BeneficiaryItemData }) => {
    const active = isBenActive(item);
    const activeSub = (item.subscriptions || []).find((s) => s.isActive);
    const packageName = activeSub?.package?.name || activeSub?.packageType;
    const isSelf = (item.relationship || '').toLowerCase() === 'self';
    const isDeleting = deletingId === item.id;

    return (
      <View style={[styles.benCard, !active && styles.benCardInactive]}>
        <TouchableOpacity
          style={styles.cardMainTouchable}
          activeOpacity={0.7}
          onPress={() => handleBeneficiaryPress(item)}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.photo ? (
              <Image
                source={{ uri: sanitizeImageUri(item.photo) }}
                style={styles.avatarImg}
              />
            ) : (
              <View style={[styles.avatarFallback, isSelf && styles.avatarSelf]}>
                <Text style={[styles.avatarInitials, isSelf && styles.avatarSelfText]}>
                  {getInitials(item.name)}
                </Text>
              </View>
            )}
            {/* Dot Indicator on Avatar */}
            <View
              style={[
                styles.avatarStatusDot,
                active ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </View>

          {/* Info Column */}
          <View style={styles.infoCol}>
            <View style={styles.nameRow}>
              <Text style={styles.benName} numberOfLines={1}>
                {item.name}
              </Text>
              {isSelf && (
                <View style={styles.selfBadge}>
                  <Text style={styles.selfBadgeText}>Self</Text>
                </View>
              )}
            </View>

            <Text style={styles.benSubText}>
              {item.relationship ? `${item.relationship}` : 'Beneficiary'}
              {item.age ? ` • ${item.age} yrs` : ''}
              {item.gender ? ` • ${item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}` : ''}
            </Text>

            {packageName && (
              <View style={styles.planBadgeRow}>
                <Ionicons name="shield-checkmark" size={12} color="#059669" />
                <Text style={styles.planBadgeText} numberOfLines={1}>
                  {packageName}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Right Actions Column */}
        <View style={styles.actionsCol}>
          <View style={[styles.statusPill, active ? styles.statusPillActive : styles.statusPillInactive]}>
            <View style={[styles.miniDot, active ? styles.miniDotActive : styles.miniDotInactive]} />
            <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextInactive]}>
              {active ? 'Active' : 'Inactive'}
            </Text>
          </View>

          {/* Delete Action (for non-Self beneficiaries) */}
          {!isSelf && (
            <TouchableOpacity
              style={styles.deleteIconBtn}
              onPress={() => handleDeleteBeneficiary(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdropDismiss}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheetContainer, { maxHeight: height * 0.88 }]}>
          {/* Top Grab Handle */}
          <View style={styles.grabHandle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>All Beneficiaries</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{localBeneficiaries.length}</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>
                Manage, select, or delete beneficiary members
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Feather name="x" size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, relation or age..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <Feather name="x-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Pills */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.filterPill, activeFilter === 'all' && styles.filterPillSelected]}
              onPress={() => setActiveFilter('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextSelected]}>
                All ({localBeneficiaries.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'active' && styles.filterPillSelected,
              ]}
              onPress={() => setActiveFilter('active')}
              activeOpacity={0.7}
            >
              <View style={[styles.pillDot, styles.miniDotActive]} />
              <Text style={[styles.filterPillText, activeFilter === 'active' && styles.filterPillTextSelected]}>
                Active ({activeCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterPill,
                activeFilter === 'inactive' && styles.filterPillSelected,
              ]}
              onPress={() => setActiveFilter('inactive')}
              activeOpacity={0.7}
            >
              <View style={[styles.pillDot, styles.miniDotInactive]} />
              <Text style={[styles.filterPillText, activeFilter === 'inactive' && styles.filterPillTextSelected]}>
                Inactive ({inactiveCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Beneficiaries FlatList */}
          <FlatList
            data={filteredBeneficiaries}
            keyExtractor={(item) => item.id}
            renderItem={renderBeneficiaryCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={44} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No beneficiaries found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? `No results matching "${searchQuery}"`
                    : activeFilter === 'inactive'
                    ? 'No inactive beneficiaries'
                    : 'No beneficiaries registered yet'}
                </Text>
              </View>
            }
          />

          {/* Bottom Add Action */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                router.push('/(setup)/beneficiary-info');
              }}
            >
              <Ionicons name="person-add-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.addBtnText}>Add New Beneficiary</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Delete Confirmation Modal UI */}
          {itemToDelete && (
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmCard}>
                <View style={styles.confirmIconContainer}>
                  <Feather name="alert-triangle" size={36} color="#D97706" />
                </View>
                <Text style={styles.confirmTitle}>Delete Beneficiary</Text>
                <Text style={styles.confirmMessage}>
                  Are you sure you want to delete <Text style={{ fontWeight: '700', color: '#111827' }}>{itemToDelete.name}</Text>? Deleting this profile will delete the beneficiary account and the beneficiary will lose access.
                </Text>

                <View style={styles.confirmBtnRow}>
                  <TouchableOpacity
                    style={styles.confirmCancelBtn}
                    onPress={() => !deletingId && setItemToDelete(null)}
                    disabled={!!deletingId}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmCancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmDeleteBtn, !!deletingId && { opacity: 0.7 }]}
                    onPress={handleConfirmDelete}
                    disabled={!!deletingId}
                    activeOpacity={0.7}
                  >
                    {deletingId ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Custom Feedback Dialog Modal UI (Success / Error / Warning) */}
          {feedback && (
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmCard}>
                <View style={styles.confirmIconContainer}>
                  {feedback.type === 'success' && (
                    <Feather name="check-circle" size={38} color="#059669" />
                  )}
                  {feedback.type === 'error' && (
                    <Feather name="alert-circle" size={38} color="#DC2626" />
                  )}
                  {feedback.type === 'warning' && (
                    <Feather name="alert-triangle" size={38} color="#D97706" />
                  )}
                  {feedback.type === 'info' && (
                    <Feather name="info" size={38} color="#2563EB" />
                  )}
                </View>
                <Text style={styles.confirmTitle}>{feedback.title}</Text>
                <Text style={styles.confirmMessage}>{feedback.message}</Text>

                <TouchableOpacity
                  style={[
                    styles.confirmOkBtn,
                    feedback.type === 'success' && { backgroundColor: '#059669' },
                    feedback.type === 'error' && { backgroundColor: '#DC2626' },
                  ]}
                  onPress={() => setFeedback(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmOkBtnText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  grabHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#FFF2E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD8BF',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterPillSelected: {
    backgroundColor: '#111827',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterPillTextSelected: {
    color: '#FFFFFF',
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  benCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  benCardInactive: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E5E7EB',
    opacity: 0.9,
  },
  cardMainTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  avatarSelf: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EA580C',
  },
  avatarSelfText: {
    color: '#2563EB',
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotActive: {
    backgroundColor: '#10B981',
  },
  dotInactive: {
    backgroundColor: '#9CA3AF',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    maxWidth: '80%',
  },
  selfBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  selfBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  benSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  actionsCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 8,
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
  },
  statusPillInactive: {
    backgroundColor: '#F3F4F6',
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  miniDotActive: {
    backgroundColor: '#10B981',
  },
  miniDotInactive: {
    backgroundColor: '#9CA3AF',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#059669',
  },
  statusTextInactive: {
    color: '#6B7280',
  },
  deleteIconBtn: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5B0A',
    borderRadius: 12,
    paddingVertical: 13,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
    elevation: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 10,
  },
  confirmIconContainer: {
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  confirmBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E11D48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmOkBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FF5B0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmOkBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default BeneficiariesModal;
