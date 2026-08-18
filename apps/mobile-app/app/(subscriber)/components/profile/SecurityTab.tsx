import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Alert, 
    Platform, 
    Linking, 
    Modal, 
    Switch,
    useWindowDimensions 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { useAndroidBackHandler } from '@/hooks/useAndroidBackHandler';
import { LEGAL_CONFIG } from '@/constants/legal';
import { DeleteAccountButton } from '@/components/shared/DeleteAccountButton';

interface SecurityItemProps {
    icon: any;
    title: string;
    subtitle: string;
    status?: string;
    onPress: () => void;
}

const SecurityItem = ({ icon, title, subtitle, status, onPress }: SecurityItemProps) => (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconBox, iconToneByTitle[title]?.box]}>
            <Ionicons name={icon} size={23} color={iconToneByTitle[title]?.color || '#FF5B0A'} />
        </View>
        <View style={styles.itemContent}>
            <View style={styles.titleRow}>
                <Text style={styles.itemTitle}>{title}</Text>
                {status && (
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.itemSub}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
);

const iconToneByTitle: Record<string, { color: string; box: object }> = {
    'Login Activity': { color: '#A12BFF', box: { backgroundColor: '#F2DFFF' } },
    'Notification Preference': { color: '#16A34A', box: { backgroundColor: '#D8F9E1' } },
    'Privacy Policy': { color: '#1F6BFF', box: { backgroundColor: '#DDEBFF' } },
    'Terms & Conditions': { color: '#FF5B0A', box: { backgroundColor: '#FFEBCB' } },
};

export interface NotificationPreferencesState {
    pushEnabled: boolean;
    medicationReminders: boolean;
    visitUpdates: boolean;
    announcements: boolean;
}

const NOTIF_PREFS_KEY = 'user_notification_preferences';

export const SecurityTab = () => {
    const router = useRouter();
    const { push } = useNavigationStack();
    useAndroidBackHandler();
    const { width } = useWindowDimensions();
    const modalContentWidth = Math.min(Math.max(width - 40, 0), 400);

    // Notification Preferences State
    const [notifModalVisible, setNotifModalVisible] = useState(false);
    const [notifPrefs, setNotifPrefs] = useState<NotificationPreferencesState>({
        pushEnabled: true,
        medicationReminders: true,
        visitUpdates: true,
        announcements: true,
    });

    useEffect(() => {
        loadNotificationPreferences();
    }, []);

    const loadNotificationPreferences = async () => {
        try {
            const saved = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
            if (saved) {
                setNotifPrefs(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Error loading notification preferences:', e);
        }
    };

    const updatePreference = async (key: keyof NotificationPreferencesState, value: boolean) => {
        try {
            const updated = { ...notifPrefs, [key]: value };
            // If turning master push off, turn off sub-toggles visually
            if (key === 'pushEnabled' && !value) {
                updated.medicationReminders = false;
                updated.visitUpdates = false;
                updated.announcements = false;
            } else if (key !== 'pushEnabled' && value) {
                updated.pushEnabled = true;
            }

            setNotifPrefs(updated);
            await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.warn('Error saving notification preference:', e);
        }
    };

    const openPrivacyPolicy = () => {
        Linking.openURL(LEGAL_CONFIG.PRIVACY_POLICY_URL).catch(err => {
            console.log('Error opening privacy link:', err);
            Alert.alert('Privacy Policy', `Visit Privacy Policy at:\n${LEGAL_CONFIG.PRIVACY_POLICY_URL}`);
        });
    };

    const openTermsOfService = () => {
        Linking.openURL(LEGAL_CONFIG.TERMS_OF_SERVICE_URL).catch(err => {
            console.log('Error opening terms link:', err);
            Alert.alert('Terms & Conditions', `Visit Terms & Conditions at:\n${LEGAL_CONFIG.TERMS_OF_SERVICE_URL}`);
        });
    };

    return (
        <View style={styles.container}>
            {/* Preferences & Legal */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences & Legal</Text>
                <View style={styles.card}>
                    <SecurityItem 
                        icon="notifications-outline" 
                        title="Notification Preference" 
                        subtitle="Choice of push notifications" 
                        onPress={() => setNotifModalVisible(true)}
                    />
                    <View style={styles.divider} />
                    <SecurityItem 
                        icon="shield-checkmark-outline" 
                        title="Privacy Policy" 
                        subtitle="Read privacy policy" 
                        onPress={openPrivacyPolicy}
                    />
                    <View style={styles.divider} />
                    <SecurityItem 
                        icon="document-text-outline" 
                        title="Terms & Conditions" 
                        subtitle="Read terms of service" 
                        onPress={openTermsOfService}
                    />
                </View>
            </View>

            {/* Account Deletion / Danger Zone */}
            <View style={[styles.section, styles.dangerSection]}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>Account Management</Text>
                <View style={styles.card}>
                    <DeleteAccountButton />
                </View>
            </View>

            {/* Notification Preference Modal */}
            <Modal visible={notifModalVisible} animationType="fade" transparent={true} onRequestClose={() => setNotifModalVisible(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, { width: modalContentWidth }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notification Preferences</Text>
                            <TouchableOpacity onPress={() => setNotifModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Feather name="x" size={22} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtext}>
                            Choose which push notifications you want to receive on your device.
                        </Text>

                        {/* Master Push Toggle */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleTextCol}>
                                <Text style={styles.toggleTitle}>Allow Push Notifications</Text>
                                <Text style={styles.toggleDesc}>Master switch for all app notifications</Text>
                            </View>
                            <Switch
                                value={notifPrefs.pushEnabled}
                                onValueChange={(v) => updatePreference('pushEnabled', v)}
                                trackColor={{ false: '#D1D5DB', true: '#FFB47D' }}
                                thumbColor={notifPrefs.pushEnabled ? '#FF5B0A' : '#F3F4F6'}
                            />
                        </View>

                        <View style={styles.modalDivider} />

                        {/* Sub Toggles */}
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleTextCol}>
                                <Text style={styles.toggleTitle}>Medication Reminders</Text>
                                <Text style={styles.toggleDesc}>Daily dosage & refill alerts</Text>
                            </View>
                            <Switch
                                value={notifPrefs.medicationReminders}
                                onValueChange={(v) => updatePreference('medicationReminders', v)}
                                trackColor={{ false: '#D1D5DB', true: '#FFB47D' }}
                                thumbColor={notifPrefs.medicationReminders ? '#FF5B0A' : '#F3F4F6'}
                                disabled={!notifPrefs.pushEnabled}
                            />
                        </View>

                        <View style={styles.modalDivider} />

                        <View style={styles.toggleRow}>
                            <View style={styles.toggleTextCol}>
                                <Text style={styles.toggleTitle}>Visit Updates</Text>
                                <Text style={styles.toggleDesc}>Care companion visit status & notes</Text>
                            </View>
                            <Switch
                                value={notifPrefs.visitUpdates}
                                onValueChange={(v) => updatePreference('visitUpdates', v)}
                                trackColor={{ false: '#D1D5DB', true: '#FFB47D' }}
                                thumbColor={notifPrefs.visitUpdates ? '#FF5B0A' : '#F3F4F6'}
                                disabled={!notifPrefs.pushEnabled}
                            />
                        </View>

                        <View style={styles.modalDivider} />

                        <View style={styles.toggleRow}>
                            <View style={styles.toggleTextCol}>
                                <Text style={styles.toggleTitle}>Announcements & Alerts</Text>
                                <Text style={styles.toggleDesc}>Important platform & subscription updates</Text>
                            </View>
                            <Switch
                                value={notifPrefs.announcements}
                                onValueChange={(v) => updatePreference('announcements', v)}
                                trackColor={{ false: '#D1D5DB', true: '#FFB47D' }}
                                thumbColor={notifPrefs.announcements ? '#FF5B0A' : '#F3F4F6'}
                                disabled={!notifPrefs.pushEnabled}
                            />
                        </View>

                        <TouchableOpacity 
                            style={styles.doneBtn} 
                            onPress={() => setNotifModalVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.doneBtnText}>Save & Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 15, paddingTop: 0 },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingHorizontal: 16,
        paddingTop: 18,
        paddingBottom: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F2E7DE',
        ...Platform.select({
            ios: { shadowColor: '#4A2B17', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
            android: { elevation: 3 },
        }),
    },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#111111', marginBottom: 22 },
    card: {
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
    },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    iconBox: {
        width: 47, height: 47, borderRadius: 24,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 14
    },
    itemContent: { flex: 1 },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    itemTitle: { fontSize: 17, fontWeight: '600', color: '#111111' },
    itemSub: { fontSize: 14, color: '#4B5563', marginTop: 3 },
    statusBadge: { 
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 10, marginLeft: 10
    },
    statusText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 6 },

    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 22,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    modalSubtext: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 18,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    toggleTextCol: {
        flex: 1,
        paddingRight: 12,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    toggleDesc: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    modalDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },
    doneBtn: {
        backgroundColor: '#FF5B0A',
        borderRadius: 12,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 20,
    },
    doneBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    dangerSection: {
        borderColor: '#FEE2E2',
        backgroundColor: '#FFFFFF',
        marginTop: 4,
    },
    dangerTitle: {
        color: '#DC2626',
    },
});

export default SecurityTab;
