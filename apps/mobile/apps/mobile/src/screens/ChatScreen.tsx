import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'homework' | 'story';
}

interface ChatScreenProps {
  chatType: 'homework' | 'story';
  childAge?: number;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ chatType, childAge = 8, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: chatType === 'homework' 
        ? "Hi! I'm here to help you learn! What subject would you like help with today? 📚"
        : "Hello! I love telling stories! What kind of story would you like to hear today? ✨",
      isUser: false,
      timestamp: new Date(),
      type: chatType,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      type: chatType,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call your API
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8787';
      const response = await fetch(`${apiUrl}/ai/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage.text,
          type: chatType,
          childAge: childAge,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const result = await response.json();
      
      if (result.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.data.response,
          isUser: false,
          timestamp: new Date(),
          type: chatType,
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.error || 'AI response failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Oops!',
        'I had trouble understanding that. Can you try asking in a different way?',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.aiMessage
    ]}>
      {message.isUser ? (
        <View style={styles.userBubble}>
          <Text style={styles.userMessageText}>{message.text}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={chatType === 'homework' ? ['#4CAF50', '#45a049'] : ['#9C27B0', '#7B1FA2']}
          style={styles.aiBubble}
        >
          <Text style={styles.aiMessageText}>{message.text}</Text>
        </LinearGradient>
      )}
      <Text style={styles.timestamp}>
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  const headerColors = chatType === 'homework' ? ['#4CAF50', '#45a049'] : ['#9C27B0', '#7B1FA2'];
  const headerTitle = chatType === 'homework' ? '🤖 Homework Helper' : '✨ Story Time';
  const placeholderText = chatType === 'homework' 
    ? 'Ask me about math, reading, science...'
    : 'Tell me what story you want to hear...';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient colors={headerColors} style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>Age {childAge}</Text>
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <View style={styles.loadingContainer}>
              <LinearGradient
                colors={['#f0f0f0', '#e0e0e0']}
                style={styles.loadingBubble}
              >
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}>Thinking...</Text>
              </LinearGradient>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={['#ffffff', '#f8f9fa']}
            style={styles.inputGradient}
          >
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={placeholderText}
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                { opacity: (!inputText.trim() || isLoading) ? 0.5 : 1 }
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient colors={headerColors} style={styles.sendButtonGradient}>
                <Text style={styles.sendButtonText}>Send</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Messages Styles
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  aiBubble: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '85%',
  },
  userMessageText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
  },
  aiMessageText: {
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
    marginHorizontal: 5,
  },

  // Loading Styles
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },

  // Input Styles
  inputContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
  },
  inputGradient: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
    color: '#333',
  },
  sendButton: {
    marginLeft: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChatScreen;
