import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'parent-login' | 'parent-signup' | 'child-login' | 'child-setup';

export const AuthScreen: React.FC = () => {
  const { signInWithEmail, signUpAsParent, signInWithInviteCode, linkChildToParent, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('parent-login');
  
  // Parent auth fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  
  // Child auth fields
  const [inviteCode, setInviteCode] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const handleParentLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const { error } = await signInWithEmail(email, password);
    if (error) {
      Alert.alert('Login Failed', error.message || 'An error occurred during login');
    }
  };

  const handleParentSignup = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const { error } = await signUpAsParent(email, password, dob || undefined);
    if (error) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    } else {
      Alert.alert(
        'Success',
        'Account created! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => setMode('parent-login') }]
      );
    }
  };

  const handleChildLogin = async () => {
    if (!inviteCode) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    const { error, child } = await signInWithInviteCode(inviteCode);
    if (error || !child) {
      Alert.alert('Login Failed', 'Invalid invite code. Please check and try again.');
    } else {
      Alert.alert('Success', `Welcome back, ${child.name}!`);
      // Navigate to child dashboard
    }
  };

  const handleChildSetup = async () => {
    if (!parentEmail || !parentPassword || !childName || !childAge) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const age = parseInt(childAge);
    if (isNaN(age) || age < 3 || age > 18) {
      Alert.alert('Error', 'Please enter a valid age between 3 and 18');
      return;
    }

    const { error, inviteCode } = await linkChildToParent(parentEmail, parentPassword, childName, age);
    if (error) {
      Alert.alert('Setup Failed', error.message || 'Failed to set up child account');
    } else {
      Alert.alert(
        'Child Account Created!',
        `Invite code: ${inviteCode}\\n\\nShare this code with your child to let them sign in on their device.`,
        [
          { text: 'Copy Code', onPress: () => {/* Copy to clipboard */} },
          { text: 'Done', onPress: () => setMode('parent-login') },
        ]
      );
    }
  };

  const renderParentLogin = () => (
    <>
      <Text style={styles.title}>Parent Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleParentLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('parent-signup')}>
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity onPress={() => setMode('child-login')}>
        <Text style={styles.linkText}>Child Login with Invite Code</Text>
      </TouchableOpacity>
    </>
  );

  const renderParentSignup = () => (
    <>
      <Text style={styles.title}>Create Parent Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (YYYY-MM-DD) - Optional"
        value={dob}
        onChangeText={setDob}
        keyboardType="numeric"
      />
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleParentSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('parent-login')}>
        <Text style={styles.linkText}>Already have an account? Sign in</Text>
      </TouchableOpacity>
      
      <View style={styles.divider} />
      
      <TouchableOpacity onPress={() => setMode('child-setup')}>
        <Text style={styles.linkText}>Set up a Child Account</Text>
      </TouchableOpacity>
    </>
  );

  const renderChildLogin = () => (
    <>
      <Text style={styles.title}>Child Login</Text>
      <Text style={styles.subtitle}>Ask your parent for your invite code</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Invite Code"
        value={inviteCode}
        onChangeText={setInviteCode}
        autoCapitalize="characters"
      />
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleChildLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('parent-login')}>
        <Text style={styles.linkText}>Parent Login</Text>
      </TouchableOpacity>
    </>
  );

  const renderChildSetup = () => (
    <>
      <Text style={styles.title}>Set up Child Account</Text>
      <Text style={styles.subtitle}>Create an invite code for your child</Text>
      
      <Text style={styles.sectionTitle}>Parent Credentials</Text>
      <TextInput
        style={styles.input}
        placeholder="Parent Email"
        value={parentEmail}
        onChangeText={setParentEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Parent Password"
        value={parentPassword}
        onChangeText={setParentPassword}
        secureTextEntry
      />
      
      <Text style={styles.sectionTitle}>Child Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Child's Name"
        value={childName}
        onChangeText={setChildName}
      />
      <TextInput
        style={styles.input}
        placeholder="Child's Age"
        value={childAge}
        onChangeText={setChildAge}
        keyboardType="numeric"
      />
      
      <TouchableOpacity 
        style={[styles.button, styles.primaryButton]} 
        onPress={handleChildSetup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Create Child Account</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setMode('parent-login')}>
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.appTitle}>Guardianest</Text>
        <Text style={styles.appSubtitle}>Safe AI for Kids</Text>
        
        {mode === 'parent-login' && renderParentLogin()}
        {mode === 'parent-signup' && renderParentSignup()}
        {mode === 'child-login' && renderChildLogin()}
        {mode === 'child-setup' && renderChildSetup()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#7f8c8d',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#2c3e50',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#3498db',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e8ed',
    marginVertical: 20,
  },
});

export default AuthScreen;
