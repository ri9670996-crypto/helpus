
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

// User Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';

// Admin Screens
import AdminLoginScreen from './src/screens/admin/AdminLoginScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1A56DB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
        }}
      >
        {/* User Routes */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ 
            headerShown: false,
            contentStyle: Platform.OS === 'web' ? { 
              minHeight: '100vh',
              backgroundColor: '#F9FAFB'
            } : {}
          }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen}
          options={{ 
            title: 'HelpUs Dashboard',
            contentStyle: Platform.OS === 'web' ? { 
              maxWidth: 1200,
              marginHorizontal: 'auto'
            } : {}
          }}
        />

        {/* Admin Routes */}
        <Stack.Screen 
          name="AdminLogin" 
          component={AdminLoginScreen}
          options={{ 
            title: 'Admin Login',
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
          }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ 
            title: 'Admin Dashboard',
            headerStyle: {
              backgroundColor: '#1a1a1a',
            },
            headerBackVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}