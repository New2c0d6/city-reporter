import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView 
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header */}
      <View className="bg-white border-b border-slate-200 px-4 py-6">
        <Text className="text-2xl font-bold text-slate-900">
          City Reporter
        </Text>
        <Text className="text-sm text-slate-600 mt-1">
          Report civic issues and help improve your neighborhood
        </Text>
      </View>

      {/* Main Content */}
      <View className="px-4 py-8">
        {/* Primary Action Card */}
        <TouchableOpacity
          className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 mb-6 shadow-md"
          onPress={() => router.push('/create-report')}
          accessibilityLabel="Create a new report"
          accessibilityHint="Report a civic issue"
        >
          <Text className="text-4xl mb-2">📝</Text>
          <Text className="text-lg font-bold text-white mb-1">
            Report an Issue
          </Text>
          <Text className="text-sm text-blue-100">
            Document a problem you've found and help us fix it
          </Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
          <Text className="text-sm font-bold text-slate-900 uppercase mb-3">
            How It Works
          </Text>
          
          <View className="flex-row mb-3">
            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-blue-600">1</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900">Report</Text>
              <Text className="text-xs text-slate-600 mt-0.5">
                Tell us about the issue with details and location
              </Text>
            </View>
          </View>

          <View className="flex-row mb-3">
            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-blue-600">2</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900">Track</Text>
              <Text className="text-xs text-slate-600 mt-0.5">
                Get a reference number to monitor your report
              </Text>
            </View>
          </View>

          <View className="flex-row">
            <View className="w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Text className="text-sm font-bold text-blue-600">3</Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-slate-900">Impact</Text>
              <Text className="text-xs text-slate-600 mt-0.5">
                Watch as our team takes action to resolve the issue
              </Text>
            </View>
          </View>
        </View>

        {/* What to Report */}
        <View className="bg-white border border-slate-200 rounded-lg p-4">
          <Text className="text-sm font-bold text-slate-900 uppercase mb-3">
            What You Can Report
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
              <Text className="text-sm text-slate-700">Damaged roads and potholes</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
              <Text className="text-sm text-slate-700">Broken streetlights</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
              <Text className="text-sm text-slate-700">Illegal garbage dumping</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
              <Text className="text-sm text-slate-700">Water leaks and flooding</Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-2" />
              <Text className="text-sm text-slate-700">Other public infrastructure problems</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
