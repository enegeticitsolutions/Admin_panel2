import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal } from 'react-native';
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeBack } from '@/hooks/useSafeBack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigationStack } from '@/contexts/NavigationStackContext';
import { useAndroidBackHandler } from '@/hooks/useAndroidBackHandler';
import { AddressPicker, SelectedAddress } from '@/components/ui/AddressPicker';
import { getAccurateLocation } from '@/services/location';
import { serviceabilityService, ServiceabilityResult } from '@/services/serviceability.service';

export default function LocationScreen() {
    const [selectedLocation, setSelectedLocation] = useState<{
        address: string;
        latitude?: number;
        longitude?: number;
        pincode?: string;
    } | null>(null);
    const [pincodeInput, setPincodeInput] = useState("");
    const [showAddressPicker, setShowAddressPicker] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const router = useRouter();
    const { push, replace, pop } = useNavigationStack();
    useAndroidBackHandler();
    const safeBack = useSafeBack();

    const handleGpsDetect = async () => {
        setIsLocating(true);
        try {
            const loc = await getAccurateLocation();
            const resolvedAddress = loc.address || [loc.city, loc.state].filter(Boolean).join(', ') || 'Current GPS Location';
            setSelectedLocation({
                address: resolvedAddress,
                latitude: loc.latitude,
                longitude: loc.longitude,
                pincode: loc.pincode,
            });
            if (loc.pincode) setPincodeInput(loc.pincode);
        } catch (err) {
            Alert.alert("Location Detection", "Could not detect GPS location. Please select your address on the map.");
            setShowAddressPicker(true);
        } finally {
            setIsLocating(false);
        }
    };

    const handleAddressSelected = (address: SelectedAddress) => {
        setShowAddressPicker(false);
        setSelectedLocation({
            address: address.address,
            latitude: address.latitude !== 0 ? address.latitude : undefined,
            longitude: address.longitude !== 0 ? address.longitude : undefined,
            pincode: address.pincode,
        });
        if (address.pincode) setPincodeInput(address.pincode);
    };

    const handleCheckAvailability = async () => {
        setIsChecking(true);
        try {
            const result = await serviceabilityService.checkLocation(
                selectedLocation?.latitude,
                selectedLocation?.longitude,
                selectedLocation?.pincode || pincodeInput
            );

            if (result.isServiceable) {
                push("/(auth)/coverage-success");
            } else {
                push("/(auth)/coverage-failure");
            }
        } catch (err) {
            Alert.alert("Error", "Could not verify serviceability. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => safeBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Check Service Area</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.content}>
                    {/* Illustration Container */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.mockImage}>
                            <Ionicons name="location" size={48} color="#F97316" />
                        </View>
                    </View>

                    {/* Location Card */}
                    <View style={styles.card}>
                        <Text style={styles.title}>Where are you located?</Text>
                        <Text style={styles.subtitle}>
                            Select your area on the map or enter your PIN code to check if our care companions serve your region.
                        </Text>

                        {/* Location Picker Box */}
                        <TouchableOpacity
                            style={styles.locationPickerBox}
                            onPress={() => setShowAddressPicker(true)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.locationIconBox}>
                                <Ionicons name="map-outline" size={20} color="#F97316" />
                            </View>
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.locationBoxTitle} numberOfLines={1}>
                                    {selectedLocation?.address || "Choose location on map"}
                                </Text>
                                <Text style={styles.locationBoxSubtitle} numberOfLines={1}>
                                    {selectedLocation?.pincode ? `Pincode: ${selectedLocation.pincode}` : "Tap to open interactive map & places search"}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.detectButton}
                            onPress={handleGpsDetect}
                            disabled={isLocating}
                            activeOpacity={0.8}
                        >
                            {isLocating ? (
                                <ActivityIndicator size="small" color="#F97316" style={styles.btnIcon} />
                            ) : (
                                <Ionicons name="navigate-outline" size={20} color="#F97316" style={styles.btnIcon} />
                            )}
                            <Text style={styles.detectButtonText}>
                                {isLocating ? "Detecting location..." : "Use device GPS location"}
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Or enter PIN code</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter 6-digit PIN code"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={6}
                                value={pincodeInput}
                                onChangeText={setPincodeInput}
                            />
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.checkButton,
                                (!selectedLocation && pincodeInput.length < 6) && styles.checkButtonDisabled,
                            ]}
                            onPress={handleCheckAvailability}
                            disabled={(!selectedLocation && pincodeInput.length < 6) || isChecking}
                            activeOpacity={0.85}
                        >
                            {isChecking ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.checkButtonText}>Check Availability</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.terms}>
                        By continuing, you agree to our{"\n"}
                        <Text style={styles.orangeText}>Terms of Service</Text> and{" "}
                        <Text style={styles.orangeText}>Privacy Policy</Text>
                    </Text>
                </View>
            </KeyboardAvoidingView>

            <Modal visible={showAddressPicker} animationType="slide" transparent={false}>
                <AddressPicker
                    onAddressSelected={handleAddressSelected}
                    onCancel={() => setShowAddressPicker(false)}
                    title="Select Location"
                    subtitle="Move the pin to your area"
                />
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 20,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    content: {
        flex: 1,
    },
    illustrationContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
    },
    mockImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#FFF5ED",
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#FFF5ED",
        padding: 24,
        borderRadius: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#4B5563",
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 32,
    },
    label: {
        fontSize: 13,
        color: "#4B5563",
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        marginBottom: 24,
    },
    input: {
        height: 48,
        paddingHorizontal: 16,
        fontSize: 16,
        color: "#111827",
    },
    detectButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#F97316",
        backgroundColor: "#FFF",
        marginBottom: 16,
    },
    btnIcon: {
        marginRight: 8,
    },
    detectButtonText: {
        color: "#F97316",
        fontWeight: "600",
        fontSize: 16,
    },
    checkButton: {
        backgroundColor: "#FBA56B", // Slightly lighter orange for disabled feel, change to #F97316 when valid
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    checkButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    footer: {
        alignItems: "center",
    },
    terms: {
        textAlign: "center",
        fontSize: 12,
        lineHeight: 18,
        color: "#9CA3AF",
    },
    locationPickerBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    locationIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF5ED",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    locationBoxTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 2,
    },
    locationBoxSubtitle: {
        fontSize: 12,
        color: "#6B7280",
    },
    checkButtonDisabled: {
        backgroundColor: "#FDBA74",
        opacity: 0.7,
    },
    orangeText: {
        color: "#F97316",
        fontWeight: "500",
    },
});
