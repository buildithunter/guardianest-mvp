import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './src/App';
// import SimpleApp from './src/SimpleApp';
// import TestApp from './src/TestApp';

export default function AppWrapper() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}
