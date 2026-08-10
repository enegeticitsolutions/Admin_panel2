import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DEEP_ORANGE = '#FE6700';

export interface CelebrationItem {
    id: string;
    beneficiaryId?: string;
    name: string;
    type: string;
    date: string;
    role?: 'Primary' | 'Secondary';
}

export interface UpcomingCelebrationsCardProps {
    celebrations?: CelebrationItem[];
}

/**
 * UpcomingCelebrationsCard
 * Component displaying upcoming birthday celebrations of beneficiaries
 * assigned to the Care Companion (as Primary or Secondary CC).
 */
export const UpcomingCelebrationsCard: React.FC<UpcomingCelebrationsCardProps> = ({ celebrations = [] }) => {
    return (
        <View style={styles.card}>
            <View style={styles.celebrationHeader}>
                <MaterialCommunityIcons name="cake-variant-outline" size={24} color={DEEP_ORANGE} />
                <Text style={styles.celebrationTitle}>Upcoming Celebrations</Text>
            </View>

            {celebrations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        No upcoming birthdays for your assigned beneficiaries at this time.
                    </Text>
                </View>
            ) : (
                celebrations.map((celebration: CelebrationItem, index: number) => {
                    const isLast = index === celebrations.length - 1;
                    return (
                        <View key={celebration.id} style={[styles.celebrationRow, isLast && { marginBottom: 0 }]}>
                            <View style={styles.celebrationInfo}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.celebrationName}>{celebration.name}</Text>
                                    {celebration.role && (
                                        <View style={[
                                            styles.roleTag,
                                            celebration.role === 'Primary' ? styles.primaryTag : styles.secondaryTag
                                        ]}>
                                            <Text style={[
                                                styles.roleTagText,
                                                celebration.role === 'Primary' ? styles.primaryTagText : styles.secondaryTagText
                                            ]}>
                                                {celebration.role}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.celebrationType}>{celebration.type}</Text>
                            </View>
                            <View style={styles.dateBadge}>
                                <Text style={styles.dateBadgeText}>{celebration.date}</Text>
                            </View>
                        </View>
                    );
                })
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FDF2F8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    celebrationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    celebrationTitle: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 16,
        color: '#111827',
        marginLeft: 8,
    },
    celebrationRow: {
        flexDirection: 'row',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    celebrationInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 6,
    },
    celebrationName: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 15,
        color: '#111827',
    },
    celebrationType: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    roleTag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    primaryTag: {
        backgroundColor: '#FFF7ED',
        borderWidth: 1,
        borderColor: '#FFEDD5',
    },
    secondaryTag: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    roleTagText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 10,
    },
    primaryTagText: {
        color: '#C2410C',
    },
    secondaryTagText: {
        color: '#4B5563',
    },
    dateBadge: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 4,
        marginLeft: 8,
    },
    dateBadgeText: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 12,
        color: '#374151',
    },
    emptyContainer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    emptyText: {
        fontFamily: 'Poppins_400Regular',
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default UpcomingCelebrationsCard;
