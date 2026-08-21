import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { formatHours } from '@/utils/timeFormat';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { useAndroidBackHandler } from '@/hooks/useAndroidBackHandler';
import { sanitizeImageUri } from '@/utils/sanitizeImageUri';

interface SubscriptionTabProps {
    plan: {
        name: string;
        hoursTotal: number;
        hoursUsed: number;
        nextBillingDate: string;
        isActive: boolean;
    } | null;
    beneficiaries: any[];
}

const SubscriptionTab = ({ plan, beneficiaries }: SubscriptionTabProps) => {
    const router = useRouter();
    const { push, replace, pop } = useNavigationStack();
    useAndroidBackHandler();
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const progress = (plan && plan.hoursTotal > 0) ? (plan.hoursUsed / plan.hoursTotal) : 0;

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Current Plan Card */}
            {plan ? (
                <TouchableOpacity onPress={() => push('/package-utilization')} activeOpacity={0.9}>
                    <LinearGradient colors={['#F97316', '#EA580C']} style={styles.planCard}>
                        <View style={styles.planHeader}>
                            <View style={styles.planTitleContainer}>
                                <Text style={styles.planLabel}>Current Plan</Text>
                                <Text style={styles.planName} numberOfLines={2}>{plan.name}</Text>
                            </View>
                            <View style={styles.activeBadge}>
                                <View style={styles.activeDot} />
                                <Text style={styles.activeText}>Active</Text>
                            </View>
                        </View>

                        <View style={styles.progressSection}>
                            <View style={styles.progressLabels}>
                                <Text style={styles.progressText}>Hours Used</Text>
                                <Text style={styles.progressText}>{formatHours(plan.hoursUsed)} / {formatHours(plan.hoursTotal)}</Text>
                            </View>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                            </View>
                        </View>

                        <View style={styles.planFooter}>
                            <Text style={styles.footerLabel}>Next Billing Date</Text>
                            <Text style={styles.footerValue}>{formatDate(plan.nextBillingDate)}</Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            ) : (
                <View style={[styles.planEmptyCard]}>
                    <Ionicons name="ribbon-outline" size={40} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No Active Subscription</Text>
                </View>
            )}

            {/* Manage Subscription */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Manage Subscription</Text>
                <View style={styles.card}>
                    {[
                        { icon: 'ribbon-outline', title: 'Upgrade Plan', sub: 'Get more hours & benefits', onPress: () => push('/(setup)/subscription-packages') },
                        { icon: 'card-outline', title: 'Payment Methods', sub: 'Manage payment options' },
                        { icon: 'document-text-outline', title: 'Billing History', sub: 'View past invoices' },
                    ].map((item, i) => (
                        <React.Fragment key={i}>
                            <TouchableOpacity style={styles.manageItem} onPress={item.onPress}>
                                <View style={[styles.iconBox, manageToneByTitle[item.title]?.box]}>
                                    <Ionicons name={item.icon as any} size={23} color={manageToneByTitle[item.title]?.color || '#FF5B0A'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.manageTitle}>{item.title}</Text>
                                    <Text style={styles.manageSub}>{item.sub}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                            </TouchableOpacity>
                            {i < 2 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </View>
            </View>

            {/* Your Beneficiaries */}
            <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Your Beneficiaries</Text>
                    <TouchableOpacity style={styles.addBtn}>
                        <Text style={styles.addBtnText}>+ Add</Text>
                    </TouchableOpacity>
                </View>

                {beneficiaries?.length > 0 ? (
                    beneficiaries.map((b, i) => (
                        <TouchableOpacity
                            key={b.id || i}
                            style={styles.benCard}
                            onPress={() => push({ pathname: '/(subscriber)/beneficiary-profile', params: { id: b.id } })}
                        >
                            <View style={[styles.benAvatar]}>
                                {b.photo ? (
                                    <Image source={{ uri: b.photo }} style={styles.benPhoto} />
                                ) : (
                                    <View style={styles.initialsBox}>
                                        <Text style={styles.benInitials}>{b.name[0]}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={{ flex: 1, marginLeft: 14 }}>
                                <Text style={styles.benName}>{b.name}</Text>
                                <Text style={styles.benMeta}>{b.relationship} • {b.age} years</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.emptySubText}>No beneficiaries added yet.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const manageToneByTitle: Record<string, { color: string; box: object }> = {
    'Upgrade Plan': { color: '#FF5B0A', box: { backgroundColor: '#FFEBCB' } },
    'Payment Methods': { color: '#1F6BFF', box: { backgroundColor: '#DDEBFF' } },
    'Billing History': { color: '#A12BFF', box: { backgroundColor: '#F2DFFF' } },
};

const styles = StyleSheet.create({
    container: { paddingHorizontal: 15, paddingTop: 2 },
    planCard: {
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20,
        marginBottom: 12,
        ...Platform.select({
            ios: { shadowColor: '#FF5B0A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 10 },
            android: { elevation: 6 }
        })
    },
    planEmptyCard: { 
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, marginBottom: 24,
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6', borderStyle: 'dashed'
    },
    emptyText: { color: '#9CA3AF', fontWeight: '600', marginTop: 10 },
    emptySubText: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginTop: 10 },

    planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
    planTitleContainer: { flex: 1, marginRight: 10 },
    planLabel: { fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', marginBottom: 4, fontWeight: '500' },
    planName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', lineHeight: 25 },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        flexShrink: 0,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#16A34A',
        marginRight: 5,
    },
    activeText: { color: '#16A34A', fontSize: 12, fontWeight: '700' },
    
    progressSection: { marginBottom: 16 },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    progressText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
    progressBarBg: { height: 8, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: 8, backgroundColor: '#FFFFFF', borderRadius: 4 },

    planFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)' },
    footerLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
    footerValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '700' },

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
    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: '600', color: '#111111' },
    addBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 3, paddingVertical: 4, borderRadius: 8 },
    addBtnText: { color: '#FF5B0A', fontWeight: '500', fontSize: 14 },

    card: { backgroundColor: 'transparent', borderRadius: 0, padding: 0 },
    manageItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    iconBox: { width: 47, height: 47, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    manageTitle: { fontSize: 17, fontWeight: '600', color: '#111111' },
    manageSub: { fontSize: 15, color: '#4B5563', marginTop: 4 },
    divider: { height: 10, backgroundColor: 'transparent', marginLeft: 61 },

    benCard: { backgroundColor: '#F8F8F8', borderRadius: 12, padding: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center' },
    benAvatar: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
    initialsBox: { width: 40, height: 40, backgroundColor: '#FF5B0A', justifyContent: 'center', alignItems: 'center' },
    benPhoto: { width: 40, height: 40 },
    benInitials: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
    benName: { fontSize: 16, fontWeight: '700', color: '#111111', marginBottom: 2 },
    benMeta: { fontSize: 14, color: '#4B5563' },
});

export default SubscriptionTab;
