import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../services/api';
import { Report } from '../../types/index';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

export default function ConfirmationScreen() {
  const router = useRouter();
  const { reportId } = useLocalSearchParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const loadReport = async () => {
    if (!reportId) {
      Alert.alert('Error', 'No report ID provided');
      router.back();
      return;
    }

    try {
      setLoading(true);
      const data = await apiClient.getReport(reportId as string);
      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      Alert.alert('Error', 'Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading your report...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We couldn't load your report details. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadReport}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formattedDate = new Date(report.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(report.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing[10] }}
    >
      {/* Success Section */}
      <View style={styles.successSection}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
          
          <Text style={styles.successTitle}>Report Submitted</Text>
          <Text style={styles.successSubtitle}>
            Thank you for helping your community
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Reference Number Card */}
        <View style={styles.referenceCard}>
          <Text style={styles.referenceLabel}>Reference Number</Text>
          <Text style={styles.referenceNumber}>{report.reference_number}</Text>
          <Text style={styles.referenceHint}>
            Save this number to track your report
          </Text>
        </View>

        {/* Report Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Report Summary</Text>

          <View style={styles.summaryField}>
            <Text style={styles.summaryFieldLabel}>Title</Text>
            <Text style={styles.summaryFieldValue}>{report.title}</Text>
          </View>

          <View style={styles.summaryField}>
            <Text style={styles.summaryFieldLabel}>Description</Text>
            <Text style={styles.summaryFieldValue}>{report.description}</Text>
          </View>

          <View style={styles.summaryField}>
            <Text style={styles.summaryFieldLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {report.status === 'NEW' ? 'Reported' : report.status}
              </Text>
            </View>
          </View>

          <View style={styles.summaryField}>
            <Text style={styles.summaryFieldLabel}>Submitted</Text>
            <Text style={styles.summaryFieldValue}>
              {formattedDate} at {formattedTime}
            </Text>
          </View>
        </View>

        {/* What Happens Next */}
        <View style={styles.nextStepsBox}>
          <Text style={styles.nextStepsTitle}>What Happens Next</Text>
          <Text style={styles.nextStepsText}>
            Our team will review your report and take appropriate action. You can track the progress of your report using the reference number above.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            router.push('/');
          }}
          accessibilityLabel="Go home"
        >
          <Text style={styles.primaryButtonText}>Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {
            router.push('/create-report');
          }}
          accessibilityLabel="Create another report"
        >
          <Text style={styles.secondaryButtonText}>Create Another Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  loadingText: {
    marginTop: spacing[3],
    ...typography.body,
    color: colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
  },
  errorContent: {
    alignItems: 'center',
  },
  errorTitle: {
    ...typography.sectionHeading,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  errorMessage: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  retryButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.neutral[0],
    ...typography.small,
    fontWeight: '600',
  },
  successSection: {
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  successContent: {
    paddingVertical: spacing[8],
    alignItems: 'center',
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  checkIcon: {
    fontSize: 28,
  },
  successTitle: {
    ...typography.pageTitle,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: spacing[1],
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  referenceCard: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  referenceLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[600],
    marginBottom: spacing[1],
  },
  referenceNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary[600],
    marginBottom: spacing[2],
    fontFamily: 'Courier New',
  },
  referenceHint: {
    ...typography.small,
    color: colors.neutral[600],
  },
  summaryCard: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  summaryTitle: {
    ...typography.small,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing[4],
  },
  summaryField: {
    paddingBottom: spacing[4],
    marginBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  summaryFieldLabel: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  summaryFieldValue: {
    ...typography.body,
    color: colors.neutral[900],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warning[500],
    marginRight: spacing[2],
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  nextStepsBox: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    marginBottom: spacing[6],
  },
  nextStepsTitle: {
    ...typography.small,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  nextStepsText: {
    ...typography.small,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
    minHeight: 50,
  },
  primaryButtonText: {
    color: colors.neutral[0],
    ...typography.cardHeading,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  secondaryButtonText: {
    color: colors.primary[600],
    ...typography.cardHeading,
  },
});
