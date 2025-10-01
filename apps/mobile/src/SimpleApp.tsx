import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple Feature Card without gradient
const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}> = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.featureCard, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDescription}>{description}</Text>
  </TouchableOpacity>
);

// Main App Component
export default function SimpleApp() {
  const features = [
    {
      title: "📚 Homework Helper",
      description: "Get help with math, reading, and more!",
      icon: "🤖",
      color: "#4CAF50",
      action: () => Alert.alert("Homework Helper", "This will open the homework chat!"),
    },
    {
      title: "📖 Story Time",
      description: "Listen to magical bedtime stories",
      icon: "✨",
      color: "#9C27B0",
      action: () => Alert.alert("Story Time", "This will open the story chat!"),
    },
    {
      title: "📸 Photo Helper",
      description: "Take a photo of your homework",
      icon: "📷",
      color: "#FF9800",
      action: () => Alert.alert("Coming Soon!", "Photo homework scanning will be available soon! 📸"),
    },
    {
      title: "🎯 Test Server",
      description: "Test if the API server is working",
      icon: "🧪",
      color: "#2196F3",
      action: async () => {
        try {
          const response = await fetch('http://127.0.0.1:8787/health');
          const data = await response.json();
          Alert.alert("Server Status", `✅ Server is running!\\n\\nService: ${data.service}\\nVersion: ${data.version}\\nTime: ${new Date(data.time).toLocaleString()}`);
        } catch (error) {
          Alert.alert("Server Status", "❌ Server is not responding.\\n\\nMake sure the server is running on port 8787.");
        }
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.welcomeTitle}>Welcome to Guardianest! 👋</Text>
        <Text style={styles.welcomeSubtitle}>Your AI Learning Companion</Text>
        <View style={styles.profileBadge}>
          <Text style={styles.profileText}>📱 React Native</Text>
        </View>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>What would you like to do?</Text>
        
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onPress={feature.action}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header Styles
  header: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 15,
  },
  profileBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  profileText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Features Styles
  featuresContainer: {
    padding: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '47%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
});
