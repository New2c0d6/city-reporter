import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing[10] }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>City Reporter</Text>
        <Text style={styles.appSubtitle}>
          Report civic issues and help improve your neighborhood
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Primary Action Card */}
        <TouchableOpacity
          style={[styles.primaryCard, shadows.md]}
          onPress={() => router.push('/create-report')}
          accessibilityLabel="Create a new report"
          accessibilityHint="Report a civic issue"
        >
          <Text style={styles.cardEmoji}>📝</Text>
          <Text style={styles.cardTitle}>Report an Issue</Text>
          <Text style={styles.cardDescription}>
            Document a problem you've found and help us fix it
          </Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={[styles.infoCard, styles.cardBorder]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Report</Text>
              <Text style={styles.stepDescription}>
                Tell us about the issue with details and location
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Track</Text>
              <Text style={styles.stepDescription}>
                Get a reference number to monitor your report
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Impact</Text>
              <Text style={styles.stepDescription}>
                Watch as our team takes action to resolve the issue
              </Text>
            </View>
          </View>
        </View>

        {/* What to Report */}
        <View style={[styles.infoCard, styles.cardBorder]}>
          <Text style={styles.sectionTitle}>What You Can Report</Text>
          
          <View style={styles.bulletItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.bulletText}>Damaged roads and potholes</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.bulletText}>Broken streetlights</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.bulletText}>Illegal garbage dumping</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.bulletText}>Water leaks and flooding</Text>
          </View>
          
          <View style={styles.bulletItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.bulletText}>Other public infrastructure problems</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  appTitle: {
    ...typography.pageTitle,
    color: colors.neutral[900],
  },
  appSubtitle: {
    ...typography.body,
    color: colors.neutral[600],
    marginTop: spacing[1],
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[8],
  },
  primaryCard: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[6],
    marginBottom: spacing[6],
  },
  cardEmoji: {
    fontSize: 48,
    marginBottom: spacing[2],
  },
  cardTitle: {
    ...typography.sectionHeading,
    color: colors.neutral[0],
    marginBottom: spacing[1],
  },
  cardDescription: {
    ...typography.body,
    color: colors.primary[100],
  },
  infoCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sectionTitle: {
    ...typography.cardHeading,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    marginTop: spacing[1],
  },
  stepNumberText: {
    ...typography.small,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  stepDescription: {
    ...typography.small,
    color: colors.neutral[600],
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[2],
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[400],
    marginRight: spacing[2],
    marginTop: spacing[1],
  },
  bulletText: {
    ...typography.body,
    color: colors.neutral[700],
    flex: 1,
  },
});
