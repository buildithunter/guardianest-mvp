import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../navigation/AppNavigator';

type DashboardNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const { width } = Dimensions.get('window');

// Feature Card Component
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <LinearGradient
      colors={[color, color + '90']}
      style={styles.featureGradient}
    >
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Main Dashboard Component
const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user, profile, signOutUser } = useAuth();

  const isChild = profile?.role === 'child';
  const userName = isChild ? 'Little Scholar' : user?.email?.split('@')[0] || 'Parent';
  const childAge = 8; // This could come from child profile in the future

  const childFeatures = [
    {
      title: "📚 Homework Helper",
      description: "Get help with math, reading, and more!",
      icon: "🤖",
      color: "#4CAF50",
      action: () => navigation.navigate('Chat', { chatType: 'homework', childAge }),
    },
    {
      title: "📖 Story Time",
      description: "Listen to magical bedtime stories",
      icon: "✨",
      color: "#9C27B0",
      action: () => navigation.navigate('Chat', { chatType: 'story', childAge }),
    },
    {
      title: "📸 Photo Helper",
      description: "Take a photo of your homework",
      icon: "📷",
      color: "#FF9800",
      action: () => Alert.alert("Coming Soon!", "Photo homework scanning will be available soon! 📸"),
    },
  ];

  const parentFeatures = [
    {
      title: "👨‍👩‍👧‍👦 Manage Children",
      description: "Add and manage child accounts",
      icon: "👶",
      color: "#2196F3",
      action: () => Alert.alert("Feature Coming Soon", "Child management dashboard is in development!"),
    },
    {
      title: "📊 Usage Reports",
      description: "Monitor your child's learning",
      icon: "📈",
      color: "#4CAF50",
      action: () => Alert.alert("Feature Coming Soon", "Usage analytics dashboard is in development!"),
    },
    {
      title: "⚙️ Settings",
      description: "Configure parental controls",
      icon: "🔧",
      color: "#FF5722",
      action: () => Alert.alert("Feature Coming Soon", "Settings panel is in development!"),
    },
    {
      title: "🎯 AI Testing",
      description: "Test AI responses and quality",
      icon: "🧪",
      color: "#9C27B0",
      action: () => navigation.navigate('Chat', { chatType: 'homework', childAge: 10 }),
    },
  ];

  const features = isChild ? childFeatures : parentFeatures;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={isChild ? ['#FF6B6B', '#4ECDC4'] : ['#667eea', '#764ba2']}
          style={styles.header}
        >
          <Text style={styles.welcomeTitle}>
            {isChild ? `Hi there! 👋` : `Welcome back! 👋`}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {isChild ? "Ready to learn something new?" : `Hello ${userName}`}
          </Text>
          {profile && (
            <View style={styles.profileBadge}>
              <Text style={styles.profileText}>
                {isChild ? "🎓 Student" : `👨‍💼 ${profile.tier.toUpperCase()}`}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>
            {isChild ? "What would you like to do?" : "Parent Dashboard"}
          </Text>
          
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

        {/* Quick Stats for Parents */}
        {!isChild && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Today's Activity</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Children Active</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Questions Asked</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Stories Read</Text>
              </View>
            </View>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Header Styles
  header: {
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
    width: (width - 60) / 2,
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureGradient: {
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

  // Stats Styles
  statsContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },

  // Sign Out Button
  signOutButton: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  bottomPadding: {
    height: 20,
  },
});

export default DashboardScreen;
