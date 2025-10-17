import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { BASE_URL } from '../../config/api';

const { width } = Dimensions.get('window');

const AdminLoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Admin login successful!');
        navigation.navigate('AdminDashboard', { admin: data.admin });
      } else {
        Alert.alert('Error', data.message || 'Invalid admin credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error - Check server connection');
      console.log('Admin login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>👑 HelpUs</Text>
        <Text style={styles.tagline}>Admin Panel</Text>
        <Text style={styles.warning}>Restricted Access</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>System Administrator Access</Text>

        <TextInput
          style={styles.input}
          placeholder="Admin Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleAdminLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>🔐 Admin Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Default Admin Credentials:</Text>
          <Text style={styles.demoText}>Username: <Text style={styles.highlight}>admin</Text></Text>
          <Text style={styles.demoText}>Password: <Text style={styles.highlight}>admin123</Text></Text>
        </View>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>← Back to User Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  warning: {
    fontSize: 14,
    color: '#ff6b6b',
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#2d2d2d',
    padding: 30,
    borderRadius: 20,
    width: width > 768 ? '50%' : '90%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FFD700',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  demoTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  demoText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  highlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminLoginScreen;