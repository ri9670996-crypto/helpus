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
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password');
      return;
    }

    setLoading(true);
    try {
      // NOTE: If testing on mobile (Expo Go), replace localhost with your PC IP (see step 6)
      const API_BASE = Platform.OS === 'web'
        ? 'http://localhost:5000'
        : 'http://localhost:5000'; // change to http://YOUR_PC_IP:5000 when testing on phone

      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert('Success', 'Login successful!');
        navigation.replace('Dashboard', { user: data.user });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Error', 'Cannot reach server');
    } finally {
      setLoading(false);
    }
  };

  const containerWidth = Platform.OS === 'web' ? Math.min(width * 0.4, 500) : width * 0.9;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.formContainer, { width: containerWidth }]}>
        <Text style={styles.logo}>💼 HelpUs</Text>
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={[styles.loginButton, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Sign In</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  logo: { fontSize: 40, fontWeight: 'bold', color: '#1A56DB', textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 18, color: '#374151', textAlign: 'center', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, padding: 12, marginBottom: 12, backgroundColor: '#F3F4F6' },
  loginButton: { backgroundColor: '#1A56DB', padding: 14, borderRadius: 10, alignItems: 'center' },
  disabled: { backgroundColor: '#9CA3AF' },
  loginButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default LoginScreen;
