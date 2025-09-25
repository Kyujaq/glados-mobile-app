import React from 'react';
import { StatusBar } from 'react-native';
import { AppProvider, SettingsProvider } from './providers';
import { AppThemeProvider } from './theme/AppThemeProvider';
import AppNavigator from './navigation/AppNavigator';

const App = (): JSX.Element => {
  return (
    <SettingsProvider>
      <AppProvider>
        <AppThemeProvider>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </AppThemeProvider>
      </AppProvider>
    </SettingsProvider>
  );
};

export default App;
