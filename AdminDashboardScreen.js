import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { BASE_URL } from '../../config/api';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ route, navigation }) => {
  const { admin } = route.params || {};
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/dashboard`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error - Check server connection');
      console.log('Dashboard stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const MenuButton = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.menuButton, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading Admin Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{admin?.username || 'Admin'}</Text>
          <Text style={styles.role}>{admin?.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}</Text>
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.profileInitials}>
            <Text style={styles.profileText}>A</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
        }
      >
        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>📊 System Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon="👥"
            color="#3B82F6"
            onPress={() => navigation.navigate('UserManagement')}
          />
          <StatCard
            title="Active Investments"
            value={stats?.active_investments || 0}
            icon="💼"
            color="#10B981"
            onPress={() => navigation.navigate('InvestmentManagement')}
          />
          <StatCard
            title="Pending Withdrawals"
            value={stats?.pending_withdrawals ? `৳${stats.pending_withdrawals}` : '৳0'}
            icon="🏧"
            color="#F59E0B"
            onPress={() => navigation.navigate('WithdrawalManagement')}
          />
          <StatCard
            title="Today's Profit"
            value={stats?.today_profits ? `৳${stats.today_profits}` : '৳0'}
            icon="💰"
            color="#EF4444"
          />
          <StatCard
            title="Total Investment"
            value={stats?.total_investment_usd ? `$${stats.total_investment_usd}` : '$0'}
            icon="📈"
            color="#8B5CF6"
          />
          <StatCard
            title="New Users Today"
            value={stats?.new_users_today || 0}
            icon="🆕"
            color="#06B6D4"
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <MenuButton
            title="User Management"
            icon="👥"
            color="#3B82F6"
            onPress={() => navigation.navigate('UserManagement')}
          />
          <MenuButton
            title="Withdrawals"
            icon="🏧"
            color="#F59E0B"
            onPress={() => navigation.navigate('WithdrawalManagement')}
          />
          <MenuButton
            title="Investments"
            icon="💼"
            color="#10B981"
            onPress={() => navigation.navigate('InvestmentManagement')}
          />
          <MenuButton
            title="Commissions"
            icon="💸"
            color="#8B5CF6"
            onPress={() => navigation.navigate('CommissionManagement')}
          />
        </View>

        {/* System Info */}
        <View style={styles.systemInfo}>
          <Text style={styles.systemTitle}>🖥️ System Information</Text>
          <View style={styles.systemStats}>
            <View style={styles.systemStat}>
              <Text style={styles.systemStatLabel}>Admin Role:</Text>
              <Text style={styles.systemStatValue}>{admin?.role || 'admin'}</Text>
            </View>
            <View style={styles.systemStat}>
              <Text style={styles.systemStatLabel}>Permissions:</Text>
              <Text style={styles.systemStatValue}>
                {admin?.permissions ? admin.permissions.length : 5} modules
              </Text>
            </View>
            <View style={styles.systemStat}>
              <Text style={styles.systemStatLabel}>Last Updated:</Text>
              <Text style={styles.systemStatValue}>{new Date().toLocaleTimeString()}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => navigation.navigate('Login') }
              ]
            );
          }}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2d2d2d',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  greeting: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  role: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  profileContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: width > 768 ? '32%' : '48%',
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    fontSize: 20,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statTitle: {
    color: '#cccccc',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuButton: {
    width: width > 768 ? '48%' : '48%',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  systemInfo: {
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  systemTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  systemStats: {
    gap: 12,
  },
  systemStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  systemStatLabel: {
    color: '#cccccc',
    fontSize: 14,
    fontWeight: '500',
  },
  systemStatValue: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboardScreen;