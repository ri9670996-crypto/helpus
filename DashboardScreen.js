import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const DashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.userName}>John Doe</Text>
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.profileInitials}>
            <Text style={styles.profileText}>JD</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Portfolio Value */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>$1,845.50</Text>
          <Text style={styles.portfolioChange}>+2.5% today</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$1,500.00</Text>
            <Text style={styles.statLabel}>USDT Balance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>৳28,500</Text>
            <Text style={styles.statLabel}>BDT Balance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Active Plans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>৳1,400</Text>
            <Text style={styles.statLabel}>Today's Profit</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>💼</Text>
              </View>
              <Text style={styles.actionText}>Invest</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>🏧</Text>
              </View>
              <Text style={styles.actionText}>Withdraw</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>👥</Text>
              </View>
              <Text style={styles.actionText}>Referral</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionEmoji}>📊</Text>
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            <ActivityItem 
              type="investment" 
              title="Starter Plan Investment" 
              amount="$100" 
              time="2 hours ago" 
            />
            <ActivityItem 
              type="profit" 
              title="Daily Profit" 
              amount="৳70" 
              time="Today" 
            />
            <ActivityItem 
              type="commission" 
              title="Referral Commission" 
              amount="৳400" 
              time="Yesterday" 
            />
          </View>
        </View>

        {/* Deposit Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deposit USDT</Text>
          <View style={styles.depositCard}>
            <Text style={styles.depositLabel}>BEP20 Address</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>0x2269ce1f94e6e2ab5ac933adae12e37ceba2a5cf</Text>
              <TouchableOpacity style={styles.copyButton}>
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Activity Item Component
const ActivityItem = ({ type, title, amount, time }) => (
  <View style={styles.activityItem}>
    <View style={[
      styles.activityIcon,
      type === 'investment' && styles.investmentIcon,
      type === 'profit' && styles.profitIcon,
      type === 'commission' && styles.commissionIcon
    ]}>
      <Text style={styles.activityEmoji}>
        {type === 'investment' ? '💼' : type === 'profit' ? '💰' : '👥'}
      </Text>
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
    <Text style={[
      styles.activityAmount,
      type === 'profit' && styles.positiveAmount,
      type === 'commission' && styles.positiveAmount
    ]}>
      {amount}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#1A56DB',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#1A56DB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  portfolioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  portfolioLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  portfolioValue: {
    color: '#111827',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  portfolioChange: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#1A56DB',
    fontSize: 14,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    width: '23%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  investmentIcon: {
    backgroundColor: '#EFF6FF',
  },
  profitIcon: {
    backgroundColor: '#ECFDF5',
  },
  commissionIcon: {
    backgroundColor: '#FEF3C7',
  },
  activityEmoji: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  activityAmount: {
    color: '#111827',
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveAmount: {
    color: '#047857',
  },
  depositCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  depositLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    color: '#111827',
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  copyButton: {
    backgroundColor: '#1A56DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  copyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DashboardScreen;