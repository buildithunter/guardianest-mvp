import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Simple Chat Message Component
interface Message {
  text: string;
  isUser: boolean;
}

// Feature Card Component
const FeatureCard = ({ title, description, icon, color, onPress }: {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.featureCard} onPress={onPress}>
    <LinearGradient colors={[color, color + '90']} style={styles.featureGradient}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

// Chat Screen Component
const ChatScreen = ({ chatType, onBack }: { chatType: string; onBack: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8787/ai/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          type: chatType,
          childAge: 8
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { text: data.data.response, isUser: false }]);
      } else {
        setMessages(prev => [...prev, { text: 'Sorry, I had trouble understanding that. Can you try again?', isUser: false }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Sorry, I\'m having trouble connecting. Please check that the server is running!', isUser: false }]);
    }
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.chatTitle}>
          {chatType === 'homework' ? '📚 Homework Helper' : '📖 Story Time'}
        </Text>
      </LinearGradient>
      
      <ScrollView style={styles.messagesContainer}>
        {messages.length === 0 && (
          <View style={styles.welcomeMessage}>
            <Text style={styles.welcomeText}>
              {chatType === 'homework' 
                ? "Hi! I'm here to help you with your homework. What subject are you working on?"
                : "Hi! I'd love to tell you a story. What kind of story would you like to hear?"}
            </Text>
          </View>
        )}
        
        {messages.map((message, index) => (
          <View key={index} style={message.isUser ? styles.userMessage : styles.aiMessage}>
            <Text style={message.isUser ? styles.userMessageText : styles.aiMessageText}>
              {message.text}
            </Text>
          </View>
        ))}
        
        {isLoading && (
          <View style={styles.aiMessage}>
            <Text style={styles.loadingText}>Thinking... 🤔</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={chatType === 'homework' ? "Ask about your homework..." : "Tell me what story you'd like..."}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Main App Component
export default function SimpleApp() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'chat'>('dashboard');
  const [chatType, setChatType] = useState<string>('homework');

  const features = [
    {
      title: "📚 Homework Helper",
      description: "Get help with math, reading, and more!",
      icon: "🤖",
      color: "#4CAF50",
      action: () => {
        setChatType('homework');
        setCurrentScreen('chat');
      },
    },
    {
      title: "📖 Story Time",
      description: "Listen to magical bedtime stories",
      icon: "✨",
      color: "#9C27B0",
      action: () => {
        setChatType('story');
        setCurrentScreen('chat');
      },
    },
  ];

  if (currentScreen === 'chat') {
    return <ChatScreen chatType={chatType} onBack={() => setCurrentScreen('dashboard')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <Text style={styles.welcomeTitle}>Welcome to Guardianest! 👋</Text>
          <Text style={styles.welcomeSubtitle}>Your AI Learning Companion</Text>
          <View style={styles.profileBadge}>
            <Text style={styles.profileText}>🎓 Mobile Demo</Text>
          </View>
        </LinearGradient>

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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
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
    width: '47%',
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
  chatHeader: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 55,
    zIndex: 1,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeMessage: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },
  welcomeText: {
    color: '#1976d2',
    fontSize: 14,
    textAlign: 'center',
  },
  userMessage: {
    backgroundColor: '#667eea',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  userMessageText: {
    color: '#ffffff',
    fontSize: 14,
  },
  aiMessage: {
    backgroundColor: '#f1f3f4',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  aiMessageText: {
    color: '#2c3e50',
    fontSize: 14,
  },
  loadingText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
