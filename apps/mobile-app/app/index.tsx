import { Redirect } from "expo-router";
import { View, ActivityIndicator, Image, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import * as SplashScreen from 'expo-splash-screen';
/**
 * Root entry point — redirects based on auth state from the global context.
 * No AsyncStorage reads here; the AuthProvider already loaded the session.
 */
export default function Index() {
  const { isLoading, isLoggedIn, role } = useAuth();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    // Hold our full-screen splash for 2.5 seconds
    const timer = setTimeout(() => {
      setShowCustomSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Show the custom full-screen splash screen
  if (showCustomSplash) {
    return (
      <View style={styles.splashContainer}>
        <Image 
          source={require('../assets/images/new_splash_screen.png')} 
          style={styles.splashImage} 
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="/(auth)" />;
  }

  // Role-based redirection to the correct home dashboard
  if (role === "care_companion" || role === "volunteer") {
    return <Redirect href="/(care-companion)" />;
  } else if (role === "beneficiary") {
    return <Redirect href="/(beneficiary)" />;
  } else if (role === "prospect") {
    return <Redirect href="/(setup)/subscription-packages" />;
  } else {
    // Default: subscriber dashboard
    return <Redirect href="/(subscriber)" />;
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#FFF0E6',
  },
  splashImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});
