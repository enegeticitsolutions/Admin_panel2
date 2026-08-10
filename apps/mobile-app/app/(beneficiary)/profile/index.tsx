import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, TextInput, Modal, useWindowDimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/api';
import { useLogoutWithConfirm } from '@/utils/logout';
import { useSafeBack } from '@/hooks/useSafeBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { useAndroidBackHandler } from '@/hooks/useAndroidBackHandler';
import { AddressInputField } from '@/components/ui/AddressInputField';

interface ContactInfo {
    phone: string;
    email: string;
    address: string;
    isEmailVerified?: boolean;
}

interface ProfileData {
    name: string;
    age: number;
    gender: string;
    bloodGroup: string;
    allergiesCount: number;
    conditionsCount: number;
    contact: ContactInfo;
}

export default function ProfileScreen() {
    const { width } = useWindowDimensions();
    const MAX_CONTENT_WIDTH = 440;
    const BASE_HORIZONTAL_PADDING = 20;
    const contentWidth = Math.min(Math.max(width - BASE_HORIZONTAL_PADDING * 2, 0), MAX_CONTENT_WIDTH);
    const responsiveContentStyle = { width: contentWidth, alignSelf: 'center' as const };
    const router = useRouter();
    const { push, replace, pop } = useNavigationStack();
    useAndroidBackHandler();
    const safeBack = useSafeBack();
    const logoutWithConfirm = useLogoutWithConfirm();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData>({
        name: 'Beneficiary',
        age: 70,
        gender: 'Not specified',
        bloodGroup: 'A+',
        allergiesCount: 0,
        conditionsCount: 0,
        contact: {
            phone: 'Not provided',
            email: 'Not provided',
            address: 'Not provided',
            isEmailVerified: false,
        }
    });

    // Edit Modal States
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editLocation, setEditLocation] = useState({});
    const [saving, setSaving] = useState(false);

    // Email Verification Modal States
    const [emailVerifyModalVisible, setEmailVerifyModalVisible] = useState(false);
    const [verifyEmailInput, setVerifyEmailInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [emailVerifyStatus, setEmailVerifyStatus] = useState({ message: '', isError: false });

    useEffect(() => {
        fetchProfile();
    }, []);

    const mapFromEnum = (enumVal: string): string => {
        switch (enumVal) {
            case 'A_positive': return 'A+';
            case 'A_negative': return 'A-';
            case 'B_positive': return 'B+';
            case 'B_negative': return 'B-';
            case 'O_positive': return 'O+';
            case 'O_negative': return 'O-';
            case 'AB_positive': return 'AB+';
            case 'AB_negative': return 'AB-';
            default: return 'A+';
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/beneficiary/profile/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (result.success && result.data) {
                const b = result.data;
                const formattedGender = b.gender ? b.gender.charAt(0).toUpperCase() + b.gender.slice(1) : 'Not specified';
                const fetchedEmail = b.user?.email || b.email;
                const isEmailPlaceholder = !fetchedEmail || fetchedEmail.includes('margaret.williams') || fetchedEmail.includes('example.com');

                setProfile({
                    name: b.name || b.user?.name || 'Beneficiary',
                    age: b.age || 70,
                    gender: formattedGender,
                    bloodGroup: mapFromEnum(b.bloodGroup),
                    allergiesCount: b.allergies ? b.allergies.length : 0,
                    conditionsCount: b.conditions ? b.conditions.length : 0,
                    contact: {
                        phone: b.user?.phone || b.phone || 'Not provided',
                        email: isEmailPlaceholder ? 'Not provided' : fetchedEmail,
                        address: b.address || 'Not provided',
                        isEmailVerified: b.user?.isVerified || false,
                    }
                });
            }
        } catch (e) {
            console.error('Error fetching beneficiary profile:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = () => {
        setEditName(profile.name);
        setEditPhone(profile.contact.phone === 'Not provided' ? '' : profile.contact.phone);
        setEditEmail(profile.contact.email === 'Not provided' ? '' : profile.contact.email);
        setEditAddress(profile.contact.address === 'Not provided' ? '' : profile.contact.address);
        setEditModalVisible(true);
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const token = await AsyncStorage.getItem('userToken');

            if (token) {
                const response = await fetch(`${API_URL}/beneficiary/profile/me`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editName,
                        phone: editPhone,
                        address: editAddress
                    })
                });

                const result = await response.json();
                if (result.success) {
                    const userDataStr = await AsyncStorage.getItem('userData');
                    if (userDataStr) {
                        const userData = JSON.parse(userDataStr);
                        userData.name = editName;
                        await AsyncStorage.setItem('userData', JSON.stringify(userData));
                    }
                }
            }

            setProfile(prev => ({
                ...prev,
                name: editName,
                contact: {
                    ...prev.contact,
                    phone: editPhone || 'Not provided',
                    address: editAddress || 'Not provided'
                }
            }));
            setEditModalVisible(false);
        } catch (e) {
            console.error('Save Profile Error:', e);
        } finally {
            setSaving(false);
        }
    };

    // Open Email Verify Modal
    const handleOpenEmailVerifyModal = () => {
        const currentEmail = profile.contact.email === 'Not provided' ? '' : profile.contact.email;
        setVerifyEmailInput(currentEmail);
        setOtpInput('');
        setOtpSent(false);
        setEmailVerifyStatus({ message: '', isError: false });
        setEmailVerifyModalVisible(true);
    };

    // Send Email OTP Handler
    const handleSendEmailOtp = async () => {
        if (!verifyEmailInput || !verifyEmailInput.includes('@')) {
            setEmailVerifyStatus({ message: 'Please enter a valid email address', isError: true });
            return;
        }

        setSendingOtp(true);
        setEmailVerifyStatus({ message: '', isError: false });

        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_URL}/auth/send-email-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ email: verifyEmailInput.trim() })
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || 'Failed to send OTP code');
            }

            setOtpSent(true);
            setEmailVerifyStatus({ message: json.message || 'Verification code sent to your email!', isError: false });
        } catch (err: any) {
            setEmailVerifyStatus({ message: err.message || 'Failed to send verification code', isError: true });
        } finally {
            setSendingOtp(false);
        }
    };

    // Verify OTP Handler
    const handleVerifyEmailOtp = async () => {
        if (!otpInput || otpInput.trim().length < 4) {
            setEmailVerifyStatus({ message: 'Please enter the verification code sent to your email', isError: true });
            return;
        }

        setVerifyingOtp(true);
        setEmailVerifyStatus({ message: '', isError: false });

        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await fetch(`${API_URL}/auth/verify-email-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    email: verifyEmailInput.trim(),
                    otp: otpInput.trim()
                })
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.message || 'Invalid verification code');
            }

            // Success! Update local profile state
            setProfile(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    email: verifyEmailInput.trim(),
                    isEmailVerified: true
                }
            }));

            Alert.alert('Email Verified', 'Your email address has been verified successfully!');
            setEmailVerifyModalVisible(false);
        } catch (err: any) {
            setEmailVerifyStatus({ message: err.message || 'Failed to verify code', isError: true });
        } finally {
            setVerifyingOtp(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color="#FE6700" />
                <Text style={styles.loadingText}>Retrieving profile information...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF0E6' }}>
            <SafeAreaView style={{ flex: 0, backgroundColor: '#FE6700' }} edges={['top']} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header Banner */}
                <View style={styles.gradientHeader}>
                    <View style={[styles.topRow, responsiveContentStyle]}>
                        <TouchableOpacity onPress={() => safeBack()} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Feather name="arrow-left" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <TouchableOpacity onPress={handleOpenEdit} style={styles.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Feather name="edit-2" size={18} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Avatar Wrap */}
                    <View style={[styles.avatarContainer, responsiveContentStyle]}>
                        <View style={styles.avatarFrame}>
                            <Image
                                source={require('../../../assets/images/group4.png')}
                                style={styles.largeAvatar}
                                defaultSource={require('../../../assets/images/group4.png')}
                            />
                            <TouchableOpacity style={styles.pencilBadge} activeOpacity={0.8} onPress={handleOpenEdit}>
                                <Feather name="edit-2" size={14} color="#FE6700" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.beneficiaryName}>{profile.name}</Text>
                        <Text style={styles.subDetailText}>
                            {profile.age} years old • {profile.gender}
                        </Text>
                    </View>
                </View>

                {/* Main Body Section */}
                <View style={[styles.bodyContainer, responsiveContentStyle]}>
                    {/* Stat Cards Row */}
                    <View style={styles.statCardsRow}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIconWrap, { backgroundColor: '#FEF2F2' }]}>
                                <Ionicons name="heart" size={18} color="#EF4444" />
                            </View>
                            <Text style={styles.statLabel}>Blood Type</Text>
                            <Text style={styles.statValue}>{profile.bloodGroup}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIconWrap, { backgroundColor: '#FFF7ED' }]}>
                                <MaterialCommunityIcons name="alert-circle" size={20} color="#F97316" />
                            </View>
                            <Text style={styles.statLabel}>Allergies</Text>
                            <Text style={styles.statValue}>{profile.allergiesCount}</Text>
                        </View>

                        <View style={styles.statCard}>
                            <View style={[styles.statIconWrap, { backgroundColor: '#F3E8FF' }]}>
                                <MaterialCommunityIcons name="heart-pulse" size={20} color="#A855F7" />
                            </View>
                            <Text style={styles.statLabel}>Conditions</Text>
                            <Text style={styles.statValue}>{profile.conditionsCount}</Text>
                        </View>
                    </View>

                    {/* Contact Information Panel */}
                    <View style={styles.panel}>
                        <View style={styles.panelHeaderRow}>
                            <Text style={styles.panelTitle}>Contact Information</Text>
                            <TouchableOpacity onPress={handleOpenEdit}>
                                <Text style={styles.editLink}>Edit</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.contactRow}>
                            <Feather name="phone" size={18} color="#6B7280" style={styles.contactIcon} />
                            <View style={styles.contactTextCol}>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>{profile.contact.phone}</Text>
                            </View>
                        </View>

                        <View style={styles.contactRow}>
                            <Feather name="mail" size={18} color="#6B7280" style={styles.contactIcon} />
                            <View style={[styles.contactTextCol, { flex: 1 }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.contactLabel}>Email</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        {profile.contact.isEmailVerified && (
                                            <View style={styles.verifiedBadge}>
                                                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                                                <Text style={styles.verifiedBadgeText}>Verified</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity onPress={handleOpenEmailVerifyModal} activeOpacity={0.7}>
                                            <Text style={styles.verifyActionText}>
                                                {profile.contact.email && profile.contact.email !== 'Not provided'
                                                    ? 'Change Email'
                                                    : 'Verify Email'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <Text style={styles.contactValue}>{profile.contact.email}</Text>
                            </View>
                        </View>

                        <View style={styles.contactRow}>
                            <Feather name="map-pin" size={18} color="#6B7280" style={styles.contactIcon} />
                            <View style={styles.contactTextCol}>
                                <Text style={styles.contactLabel}>Address</Text>
                                <Text style={styles.contactValue}>{profile.contact.address}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Sub-Pages Navigation Panel */}
                    <View style={styles.panel}>
                        <TouchableOpacity
                            style={styles.navRow}
                            onPress={() => push('/(beneficiary)/profile/health-info')}
                            activeOpacity={0.6}
                        >
                            <View style={[styles.navIconWrap, { backgroundColor: '#FEF2F2' }]}>
                                <Ionicons name="heart-outline" size={20} color="#EF4444" />
                            </View>
                            <View style={styles.navTextCol}>
                                <Text style={styles.navTitle}>Health Information</Text>
                                <Text style={styles.navDesc}>Allergies, conditions, blood type</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#9CA3AF" />
                        </TouchableOpacity>

                        <View style={styles.navDivider} />

                        <TouchableOpacity
                            style={styles.navRow}
                            onPress={() => push('/(beneficiary)/profile/emergency-contacts')}
                            activeOpacity={0.6}
                        >
                            <View style={[styles.navIconWrap, { backgroundColor: '#FFF7ED' }]}>
                                <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#F97316" />
                            </View>
                            <View style={styles.navTextCol}>
                                <Text style={styles.navTitle}>Emergency Contacts</Text>
                                <Text style={styles.navDesc}>Family, doctor, emergency contacts</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#9CA3AF" />
                        </TouchableOpacity>

                        <View style={styles.navDivider} />

                        <TouchableOpacity
                            style={styles.navRow}
                            onPress={() => push('/(beneficiary)/profile/settings')}
                            activeOpacity={0.6}
                        >
                            <View style={[styles.navIconWrap, { backgroundColor: '#F3F4F6' }]}>
                                <Feather name="settings" size={20} color="#4B5563" />
                            </View>
                            <View style={styles.navTextCol}>
                                <Text style={styles.navTitle}>Settings</Text>
                                <Text style={styles.navDesc}>About app, privacy, terms</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutBtn} onPress={logoutWithConfirm} activeOpacity={0.75}>
                        <Feather name="log-out" size={18} color="#DC2626" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    <View style={{ height: 60 }} />
                </View>
            </ScrollView>

            {/* Quick Contact Editor Modal */}
            <Modal visible={editModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, responsiveContentStyle]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile Information</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Feather name="x" size={22} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editName}
                                onChangeText={setEditName}
                                placeholder="Beneficiary Name"
                            />

                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.textInput}
                                value={editPhone}
                                onChangeText={setEditPhone}
                                keyboardType="phone-pad"
                                placeholder="Phone number"
                            />

                            <Text style={styles.inputLabel}>Email Address</Text>
                            <TextInput
                                style={[styles.textInput, styles.disabledInput]}
                                value={profile.contact.email}
                                editable={false}
                                placeholder="Email Address"
                            />

                            <View style={{ marginBottom: 15 }}>
                                <AddressInputField
                                    label="Residential Address"
                                    value={editAddress}
                                    onChangeText={setEditAddress}
                                    onLocationFetched={(details) => {
                                        setEditAddress(details.address || editAddress);
                                        setEditLocation({
                                            city: details.city,
                                            state: details.state,
                                            pincode: details.pincode,
                                            latitude: details.latitude,
                                            longitude: details.longitude
                                        });
                                    }}
                                />
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                            onPress={handleSaveProfile}
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Email Verification Modal */}
            <Modal visible={emailVerifyModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalBackdrop}>
                    <View style={[styles.modalCard, responsiveContentStyle]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Verify Email Address</Text>
                            <TouchableOpacity onPress={() => setEmailVerifyModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Feather name="x" size={22} color="#4B5563" />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 13, color: '#4B5563', marginBottom: 15 }}>
                            We will send a 6-digit verification code to your email address to confirm ownership.
                        </Text>

                        <Text style={styles.inputLabel}>Email Address</Text>
                        <TextInput
                            style={styles.textInput}
                            value={verifyEmailInput}
                            onChangeText={setVerifyEmailInput}
                            placeholder="Enter your email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!otpSent}
                        />

                        {emailVerifyStatus.message ? (
                            <Text style={[styles.statusText, emailVerifyStatus.isError ? styles.errorStatus : styles.successStatus]}>
                                {emailVerifyStatus.message}
                            </Text>
                        ) : null}

                        {!otpSent ? (
                            <TouchableOpacity
                                style={[styles.saveBtn, sendingOtp && { opacity: 0.7 }]}
                                onPress={handleSendEmailOtp}
                                disabled={sendingOtp}
                                activeOpacity={0.8}
                            >
                                {sendingOtp ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Send Verification Code</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <>
                                <Text style={[styles.inputLabel, { marginTop: 10 }]}>Enter 6-Digit Verification Code</Text>
                                <TextInput
                                    style={[styles.textInput, styles.otpInputStyle]}
                                    value={otpInput}
                                    onChangeText={setOtpInput}
                                    placeholder="• • • • • •"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    autoFocus
                                />

                                <TouchableOpacity
                                    style={[styles.saveBtn, verifyingOtp && { opacity: 0.7 }]}
                                    onPress={handleVerifyEmailOtp}
                                    disabled={verifyingOtp}
                                    activeOpacity={0.8}
                                >
                                    {verifyingOtp ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Verify & Save Email</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ marginTop: 12, alignItems: 'center' }}
                                    onPress={handleSendEmailOtp}
                                    disabled={sendingOtp}
                                >
                                    <Text style={{ fontFamily: 'Poppins-Medium', fontSize: 13, color: '#FE6700' }}>
                                        Resend Code
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF0E6' },
    loadingText: { marginTop: 12, fontFamily: 'Poppins-Regular', fontSize: 14, color: '#4B5563' },
    scrollContent: { flexGrow: 1, backgroundColor: '#FFF0E6' },

    gradientHeader: {
        backgroundColor: '#FE6700',
        paddingTop: Platform.OS === 'ios' ? 12 : 16,
        paddingBottom: 24,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        marginBottom: 16,
    },
    headerBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 18,
        color: '#FFFFFF',
    },

    avatarContainer: {
        alignItems: 'center',
    },
    avatarFrame: {
        position: 'relative',
        marginBottom: 12,
    },
    largeAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    pencilBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#FFFFFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    beneficiaryName: {
        fontFamily: 'Poppins-Bold',
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subDetailText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },

    bodyContainer: {
        paddingHorizontal: 0,
        marginTop: 18,
    },
    statCardsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 8,
        alignItems: 'center',
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    statIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    statLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 11,
        color: '#6B7280',
        marginBottom: 2,
    },
    statValue: {
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        color: '#111827',
    },

    panel: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    panelHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    panelTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 16,
        color: '#111827',
    },
    editLink: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#FE6700',
    },

    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    contactIcon: {
        marginRight: 14,
    },
    contactTextCol: {
        flex: 1,
    },
    contactLabel: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#6B7280',
    },
    contactValue: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#111827',
        marginTop: 2,
    },
    verifyActionText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 12,
        color: '#FE6700',
        textDecorationLine: 'underline',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    verifiedBadgeText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 11,
        color: '#16A34A',
        marginLeft: 4,
    },

    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    navIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    navTextCol: {
        flex: 1,
    },
    navTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 15,
        color: '#111827',
    },
    navDesc: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    navDivider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },

    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 14,
        paddingVertical: 14,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#DC2626',
        marginLeft: 8,
    },

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
        marginBottom: 16,
    },
    modalTitle: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 17,
        color: '#111827',
    },
    inputLabel: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        color: '#374151',
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontFamily: 'Poppins-Regular',
        fontSize: 14,
        color: '#111827',
        marginBottom: 16,
    },
    disabledInput: {
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
        borderColor: '#E5E7EB',
    },
    otpInputStyle: {
        textAlign: 'center',
        fontSize: 22,
        letterSpacing: 6,
        fontFamily: 'Poppins-Bold',
        color: '#FE6700',
    },
    statusText: {
        fontFamily: 'Poppins-Medium',
        fontSize: 13,
        marginBottom: 14,
        textAlign: 'center',
    },
    errorStatus: {
        color: '#EF4444',
    },
    successStatus: {
        color: '#16A34A',
    },
    saveBtn: {
        backgroundColor: '#FE6700',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 6,
    },
    saveBtnText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 15,
        color: '#FFFFFF',
    },
});