import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavigator from './navigation/AppNavigator';

// Loading component
const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.loadingGradient}
    >
      <Text style={styles.loadingTitle}>Guardianest</Text>
      <ActivityIndicator size="large" color="#ffffff" style={styles.loadingSpinner} />
      <Text style={styles.loadingText}>Loading your learning adventure...</Text>
    </LinearGradient>
  </View>
);

// Main app content
const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <AppNavigator />;
};

// Root App component
export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  loadingSpinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
});
