import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  Chat: {
    chatType: 'homework' | 'story';
    childAge?: number;
  };
  PhotoHelper: undefined;
  ManageChildren: undefined;
  UsageReports: undefined;
  Settings: undefined;
  AITesting: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Loading will be handled by the AuthProvider
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // We'll use custom headers
          gestureEnabled: true,
        }}
      >
        {session ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen 
              name="Chat" 
              component={ChatScreen}
              options={{
                gestureDirection: 'horizontal',
              }}
            />
            {/* Add more screens here as needed */}
          </>
        ) : (
          // Authentication screen
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
