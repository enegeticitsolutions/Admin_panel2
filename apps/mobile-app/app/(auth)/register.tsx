import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { API_URL } from '@/constants/api';
import { useSafeBack } from '@/hooks/useSafeBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { useAndroidBackHandler } from '@/hooks/useAndroidBackHandler';
import { useAuth } from '@/contexts/AuthContext';
import { IS_PASSWORD_LOGIN_ENABLED } from '@/constants/authMode';

export default function RegisterScreen() {
    const { push, replace } = useNavigationStack();
    useAndroidBackHandler();
    const safeBack = useSafeBack();
    const { login } = useAuth();

    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [resendTimer, setResendTimer] = useState(30);
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        pincode: "",
        age: "",
        password: "",
    });

    const [isCheckingPincode, setIsCheckingPincode] = useState(false);
    const [zoneDetails, setZoneDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Resend countdown timer
    useEffect(() => {
        let interval: any;
        if (step === 'otp' && resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, resendTimer]);

    // Dynamic Pincode Check
    useEffect(() => {
        const checkPincode = async () => {
            if (form.pincode.length === 6) {
                setIsCheckingPincode(true);
                try {
                    const response = await fetch(`${API_URL}/public/zones/check-pincode?pincode=${form.pincode}`);
                    const data = await response.json();
                    if (data.success && data.data && data.data.available) {
                        setZoneDetails(data.data);
                    } else {
                        setZoneDetails(false);
                    }
                } catch (err) {
                    console.error("Failed to check pincode", err);
                    setZoneDetails(null);
                } finally {
                    setIsCheckingPincode(false);
                }
            } else {
                setZoneDetails(null);
            }
        };

        const timeout = setTimeout(checkPincode, 500);
        return () => clearTimeout(timeout);
    }, [form.pincode]);

    const handleBackPress = () => {
        if (step === 'otp') {
            setStep('form');
        } else {
            safeBack();
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0 || isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: `91${form.phone}` }),
            });
            const data = await response.json();
            if (data.success) {
                setResendTimer(30);
                Alert.alert("Code Sent", "A new verification code has been sent to your phone number.");
            } else {
                Alert.alert("Error", data.message || "Failed to resend verification code.");
            }
        } catch (err) {
            Alert.alert("Network Error", "Could not connect to the backend server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!form.name.trim()) {
            Alert.alert("Missing Name", "Please enter your full name.");
            return;
        }
        if (form.phone.length !== 10) {
            Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number.");
            return;
        }
        if (form.pincode.length !== 6) {
            Alert.alert("Invalid Pincode", "Please enter a valid 6-digit pincode.");
            return;
        }
        const ageNum = parseInt(form.age, 10);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
            Alert.alert("Invalid Age", "Please enter a valid age (18+).");
            return;
        }

        if (IS_PASSWORD_LOGIN_ENABLED) {
            if (!form.password || form.password.length < 6) {
                Alert.alert("Weak Password", "Password must be at least 6 characters.");
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/auth/register-password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: `+91${form.phone}`,
                        name: form.name,
                        age: ageNum,
                        pincode: form.pincode,
                        password: form.password,
                    }),
                });

                const data = await response.json();

                if (data.success) {
                    const result = data.data;
                    await login(result.token, result.user);
                    if (result.user.role === 'care_companion') {
                        replace("/(care-companion)");
                    } else if (result.user.role === 'beneficiary') {
                        replace("/(beneficiary)");
                    } else if (result.user.role === 'prospect') {
                        replace("/(setup)/subscription-packages");
                    } else {
                        replace("/(subscriber)");
                    }
                } else {
                    Alert.alert("Registration Failed", data.message || "Something went wrong.");
                }
            } catch (error) {
                console.error("Register Error:", error);
                Alert.alert("Network Error", "Could not connect to the backend server.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Production mode (password disabled): Send OTP first
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/auth/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ phone: `91${form.phone}` }),
                });

                const data = await response.json();

                if (data.success) {
                    setStep('otp');
                    setResendTimer(30);
                    setOtp(["", "", "", "", "", ""]);
                } else {
                    Alert.alert("Verification Error", data.message || "Failed to send verification code.");
                }
            } catch (error) {
                console.error("Send OTP Error:", error);
                Alert.alert("Network Error", "Could not connect to the backend server.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleVerifyAndRegister = async () => {
        const enteredOtp = otp.join("");
        if (enteredOtp.length !== 6) {
            Alert.alert("Invalid Code", "Please fill in all 6 digits of the verification code.");
            return;
        }

        const ageNum = parseInt(form.age, 10);

        setIsLoading(true);
        try {
            // 1. Verify OTP code
            const verifyRes = await fetch(`${API_URL}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone: `+91${form.phone}`, otp: enteredOtp }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyData.success) {
                Alert.alert("Verification Failed", verifyData.message || "Invalid verification code entered.");
                setIsLoading(false);
                return;
            }

            // 2. Complete OTP registration
            const registerRes = await fetch(`${API_URL}/auth/register-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: `+91${form.phone}`,
                    name: form.name,
                    age: ageNum,
                    pincode: form.pincode,
                }),
            });

            const registerData = await registerRes.json();

            if (registerData.success) {
                const result = registerData.data;
                await login(result.token, result.user);
                if (result.user.role === 'care_companion') {
                    replace("/(care-companion)");
                } else if (result.user.role === 'beneficiary') {
                    replace("/(beneficiary)");
                } else if (result.user.role === 'prospect') {
                    replace("/(setup)/subscription-packages");
                } else {
                    replace("/(subscriber)");
                }
            } else {
                Alert.alert("Registration Failed", registerData.message || "Something went wrong.");
            }
        } catch (error) {
            console.error("Verify & Register Error:", error);
            Alert.alert("Network Error", "Could not connect to the backend server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
            >
                <View style={styles.navHeader}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.navTitle}>
                        {step === 'otp' ? 'Verify Mobile Number' : 'Create Account'}
                    </Text>
                    <View style={styles.backBtn} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 'form' ? (
                        <>
                            <View style={styles.welcomeHeader}>
                                <Text style={styles.title}>Welcome!</Text>
                                <Text style={styles.subtitle}>
                                    Let's set up your account to access personalised care for your loved ones
                                </Text>
                            </View>

                            <LinearGradient
                                colors={["#FFFFFF", "#FFE2CC"]}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.formCard}
                            >
                                {/* Full Name */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="words"
                                        value={form.name}
                                        onChangeText={(text) => setForm({ ...form, name: text })}
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Phone */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number *</Text>
                                    <View style={styles.phoneRow}>
                                        <View style={styles.countryCodeBox}>
                                            <Text style={styles.countryCodeText}>+91</Text>
                                        </View>
                                        <TextInput
                                            style={styles.phoneInput}
                                            placeholder="Enter 10-digit number"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            maxLength={10}
                                            value={form.phone}
                                            onChangeText={(text) => setForm({ ...form, phone: text })}
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>

                                {/* Pincode */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Service Area Pincode *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 6-digit pincode"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        value={form.pincode}
                                        onChangeText={(text) => setForm({ ...form, pincode: text })}
                                        editable={!isLoading}
                                    />

                                    {isCheckingPincode && (
                                        <View style={styles.checkingBox}>
                                            <ActivityIndicator size="small" color="#FE6700" />
                                            <Text style={styles.checkingText}>Checking availability...</Text>
                                        </View>
                                    )}

                                    {zoneDetails && zoneDetails.available === true && (
                                        <View>
                                            <View style={styles.locationPinRow}>
                                                <Ionicons name="pin" size={14} color="#EF4444" />
                                                <Text style={styles.locationPinText}>{zoneDetails.location}</Text>
                                            </View>
                                            <View style={styles.successBox}>
                                                <View style={styles.successHeader}>
                                                    <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
                                                    <Text style={styles.successMessage}>
                                                        Great! We serve {zoneDetails.location}
                                                    </Text>
                                                </View>
                                                <View style={styles.successStatsRow}>
                                                    <Text style={styles.successCheck}>✓</Text>
                                                    <Text style={styles.successStatText}>
                                                        {zoneDetails.stats.companions} care companions available
                                                    </Text>
                                                </View>
                                                <View style={styles.successStatsRow}>
                                                    <Text style={styles.successCheck}>✓</Text>
                                                    <Text style={styles.successStatText}>
                                                        {zoneDetails.stats.centers} active care centers
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    {zoneDetails === false && (
                                        <View style={styles.unavailableBox}>
                                            <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
                                            <Text style={styles.unavailableText}>
                                                We are not serving this area yet, but we are coming soon!
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Age */}
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Age *</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your age"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        maxLength={3}
                                        value={form.age}
                                        onChangeText={(text) => setForm({ ...form, age: text })}
                                        editable={!isLoading}
                                    />
                                </View>

                                {/* Password — staging only */}
                                {IS_PASSWORD_LOGIN_ENABLED && (
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Password *</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Secure password (min 6 chars)"
                                            placeholderTextColor="#9CA3AF"
                                            secureTextEntry
                                            value={form.password}
                                            onChangeText={(text) => setForm({ ...form, password: text })}
                                            editable={!isLoading}
                                        />
                                    </View>
                                )}

                                <TouchableOpacity
                                    style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    activeOpacity={0.85}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>
                                            {IS_PASSWORD_LOGIN_ENABLED ? "Create Account" : "Send Verification Code"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </LinearGradient>
                        </>
                    ) : (
                        /* Step 2: OTP Verification */
                        <>
                            <View style={styles.welcomeHeader}>
                                <Text style={styles.title}>Enter Code</Text>
                                <Text style={styles.subtitle}>
                                    We have sent a 6-digit verification code to{"\n"}
                                    <Text style={{ fontWeight: '600', color: '#111827' }}>+91 {form.phone}</Text>
                                </Text>
                            </View>

                            <LinearGradient
                                colors={["#FFFFFF", "#FFE2CC"]}
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={styles.formCard}
                            >
                                <Text style={styles.label}>Verification Code *</Text>
                                <View style={styles.otpRow}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                                            keyboardType="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            editable={!isLoading}
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                                    onPress={handleVerifyAndRegister}
                                    disabled={isLoading}
                                    activeOpacity={0.85}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Verify & Create Account</Text>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.otpActionsRow}>
                                    <TouchableOpacity
                                        onPress={handleResendOtp}
                                        disabled={resendTimer > 0 || isLoading}
                                        style={{ paddingVertical: 8 }}
                                    >
                                        <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
                                            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setStep('form')}
                                        disabled={isLoading}
                                        style={{ paddingVertical: 8 }}
                                    >
                                        <Text style={styles.changePhoneText}>Edit Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </>
                    )}

                    <View style={styles.bottomSection}>
                        <TouchableOpacity
                            style={styles.loginRow}
                            onPress={() => push("/(auth)")}
                        >
                            <Text style={styles.loginTextNormal}>Already have an account? </Text>
                            <Text style={styles.loginTextHighlight}>Login</Text>
                        </TouchableOpacity>

                        <Text style={styles.footerText}>
                            By continuing, you agree to our{" "}
                            <Text style={styles.footerLink}>Terms of Service</Text>
                            {"\n"}and <Text style={styles.footerLink}>Privacy Policy</Text>
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    keyboardView: {
        flex: 1,
    },
    navHeader: {
        height: Platform.OS === "ios" ? 54 : 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF",
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    navTitle: {
        fontSize: 16,
        lineHeight: 24,
        color: "#000000",
        fontFamily: "Poppins-Regular",
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 24,
        backgroundColor: "#FFFFFF",
    },
    welcomeHeader: {
        alignItems: "center",
        marginBottom: 28,
    },
    title: {
        fontSize: 24,
        lineHeight: 32,
        color: "#000000",
        fontFamily: "Poppins-SemiBold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        color: "#667085",
        textAlign: "center",
        fontFamily: "Poppins-Regular",
    },
    formCard: {
        width: "100%",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingTop: 26,
        paddingBottom: 36,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    inputGroup: {
        marginBottom: 22,
    },
    label: {
        fontSize: 14,
        lineHeight: 20,
        color: "#344054",
        fontFamily: "Poppins-Medium",
        marginBottom: 9,
    },
    input: {
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        fontSize: 16,
        lineHeight: 24,
        color: "#111827",
        fontFamily: "Poppins-Regular",
    },
    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    countryCodeBox: {
        width: 64,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    countryCodeText: {
        fontSize: 14,
        lineHeight: 20,
        color: "#000000",
        fontFamily: "Poppins-Regular",
    },
    phoneInput: {
        flex: 1,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        fontSize: 16,
        lineHeight: 24,
        color: "#111827",
        fontFamily: "Poppins-Regular",
    },
    checkingBox: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    checkingText: {
        fontSize: 12,
        color: "#667085",
        marginLeft: 8,
        fontFamily: "Poppins-Regular",
    },
    locationPinRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    locationPinText: {
        fontSize: 14,
        lineHeight: 20,
        color: "#667085",
        marginLeft: 6,
        fontFamily: "Poppins-Regular",
    },
    successBox: {
        backgroundColor: "#ECFDF3",
        borderWidth: 1,
        borderColor: "#22C55E",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 15,
        marginBottom: 4,
    },
    successHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 15,
        lineHeight: 22,
        color: "#16A34A",
        marginLeft: 10,
        fontFamily: "Poppins-Regular",
    },
    successStatsRow: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 30,
        marginBottom: 2,
    },
    successCheck: {
        fontSize: 14,
        lineHeight: 20,
        color: "#16A34A",
        marginRight: 6,
        fontFamily: "Poppins-Regular",
    },
    successStatText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#16A34A",
        fontFamily: "Poppins-Regular",
    },
    unavailableBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFBEB",
        borderWidth: 1,
        borderColor: "#FDE68A",
        borderRadius: 8,
        padding: 14,
        marginBottom: 4,
    },
    unavailableText: {
        flex: 1,
        fontSize: 13,
        color: "#D97706",
        marginLeft: 10,
        lineHeight: 18,
        fontFamily: "Poppins-Regular",
    },
    primaryButton: {
        height: 50,
        borderRadius: 8,
        backgroundColor: "#FFA366",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    primaryButtonDisabled: {
        opacity: 0.75,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        lineHeight: 24,
        fontFamily: "Poppins-SemiBold",
    },
    otpRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 24,
    },
    otpInput: {
        width: 44,
        height: 52,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
        backgroundColor: "#FFFFFF",
        textAlign: "center",
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        fontFamily: "Poppins-SemiBold",
    },
    otpInputFilled: {
        borderColor: "#FE6700",
        backgroundColor: "#FFF5ED",
    },
    otpActionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 18,
        paddingHorizontal: 4,
    },
    resendText: {
        fontSize: 14,
        color: "#FE6700",
        fontFamily: "Poppins-Medium",
    },
    resendTextDisabled: {
        color: "#9CA3AF",
    },
    changePhoneText: {
        fontSize: 14,
        color: "#6B7280",
        fontFamily: "Poppins-Regular",
    },
    bottomSection: {
        alignItems: "center",
        marginTop: 32,
    },
    loginRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
    },
    loginTextNormal: {
        fontSize: 15,
        lineHeight: 24,
        color: "#6B6B6B",
        fontFamily: "Poppins-Regular",
    },
    loginTextHighlight: {
        fontSize: 15,
        lineHeight: 24,
        color: "#FE6700",
        fontFamily: "Poppins-Medium",
    },
    footerText: {
        fontSize: 13,
        lineHeight: 20,
        color: "#9CA3AF",
        textAlign: "center",
        fontFamily: "Poppins-Regular",
    },
    footerLink: {
        color: "#FE6700",
    },
});
