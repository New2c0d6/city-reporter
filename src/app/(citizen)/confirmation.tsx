import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../services/api';
import { Report } from '../../types/index';

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
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-sm text-slate-600">Loading your report...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 px-4">
        <View className="items-center">
          <Text className="text-lg font-bold text-slate-900 mb-2">
            Something went wrong
          </Text>
          <Text className="text-sm text-slate-600 text-center mb-6">
            We couldn't load your report details. Please try again.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 py-2 px-6 rounded-md"
            onPress={loadReport}
          >
            <Text className="text-white text-sm font-semibold">Try Again</Text>
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
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Success Section */}
      <View className="bg-white border-b border-slate-200">
        <View className="px-4 py-8 items-center">
          {/* Success Icon */}
          <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-3">
            <Text className="text-2xl">✓</Text>
          </View>
          
          <Text className="text-2xl font-bold text-slate-900 text-center">
            Report Submitted
          </Text>
          <Text className="text-sm text-slate-600 text-center mt-1">
            Thank you for helping your community
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 py-6">
        {/* Reference Number Card */}
        <View className="bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <Text className="text-xs font-semibold text-slate-600 uppercase mb-1">
            Reference Number
          </Text>
          <Text className="text-3xl font-bold text-blue-600 mb-2 font-mono">
            {report.reference_number}
          </Text>
          <Text className="text-xs text-slate-600">
            Save this number to track your report
          </Text>
        </View>

        {/* Report Summary */}
        <View className="bg-white border border-slate-200 rounded-md p-4 mb-6">
          <Text className="text-sm font-bold text-slate-900 mb-4 uppercase">
            Report Summary
          </Text>

          <View className="mb-4 pb-4 border-b border-slate-200">
            <Text className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Title
            </Text>
            <Text className="text-base text-slate-900 font-medium">
              {report.title}
            </Text>
          </View>

          <View className="mb-4 pb-4 border-b border-slate-200">
            <Text className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Description
            </Text>
            <Text className="text-sm text-slate-700 leading-5">
              {report.description}
            </Text>
          </View>

          <View className="mb-4 pb-4 border-b border-slate-200">
            <Text className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Status
            </Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
              <Text className="text-sm font-semibold text-slate-900">
                {report.status === 'NEW' ? 'Reported' : report.status}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-xs font-semibold text-slate-500 uppercase mb-1">
              Submitted
            </Text>
            <Text className="text-sm text-slate-900">
              {formattedDate} at {formattedTime}
            </Text>
          </View>
        </View>

        {/* What Happens Next */}
        <View className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <Text className="text-sm font-semibold text-slate-900 mb-2">
            What Happens Next
          </Text>
          <Text className="text-sm text-slate-700 leading-5">
            Our team will review your report and take appropriate action. You can track the progress of your report using the reference number above.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          className="bg-blue-600 rounded-md py-3 items-center justify-center mb-3"
          onPress={() => {
            router.push('/');
          }}
          accessibilityLabel="Go home"
        >
          <Text className="text-white text-base font-semibold">Go Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border border-blue-600 rounded-md py-3 items-center justify-center"
          onPress={() => {
            router.push('/create-report');
          }}
          accessibilityLabel="Create another report"
        >
          <Text className="text-blue-600 text-base font-semibold">
            Create Another Report
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
