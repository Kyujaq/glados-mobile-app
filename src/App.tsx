import React from 'react';
import { StatusBar } from 'react-native';
import { AppProvider } from './providers/AppProvider';
import { AppThemeProvider } from './theme/AppThemeProvider';
import AppNavigator from './navigation/AppNavigator';

const App = (): JSX.Element => {
  return (
    <AppProvider>
      <AppThemeProvider>
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </AppThemeProvider>
    </AppProvider>
  );
};

export default App;
