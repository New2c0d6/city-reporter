import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../services/api';
import { Category } from '../../types/index';

type FormErrors = Record<string, string>;

export default function CreateReportScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Form state
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await apiClient.getCategories();
      setCategories(data);
      // Set first category as default
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!title.trim()) {
      newErrors.title = 'Please enter a title';
    } else if (title.length > 255) {
      newErrors.title = 'Title must be 255 characters or less';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const report = await apiClient.createReport({
        category_id: categoryId as number,
        title: title.trim(),
        description: description.trim(),
      });

      // Navigate to confirmation screen with report data
      router.push({
        pathname: '/confirmation',
        params: {
          reportId: report.id,
          referenceNumber: report.reference_number,
          title: report.title,
          description: report.description,
          status: report.status,
          created_at: report.created_at,
        },
      } as any);
    } catch (error) {
      console.error('Failed to create report:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Unable to submit report', errorMessage, [
        { text: 'OK' },
        { text: 'Try again', onPress: handleSubmit },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = categoryId && title.trim() && description.trim();
  const selectedCategory = categories.find((c) => c.id === categoryId);

  if (loadingCategories) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-sm text-slate-600">Loading categories...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Header Section */}
      <View className="bg-white border-b border-slate-200 px-4 py-6">
        <Text className="text-2xl font-bold text-slate-900 mb-1">
          Report an Issue
        </Text>
        <Text className="text-sm text-slate-600">
          Help us improve your neighborhood
        </Text>
      </View>

      {/* Form Content */}
      <View className="px-4 py-6">
        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-900 mb-2">
            Category <Text className="text-red-600">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`border rounded-md px-3 py-3 bg-white flex-row justify-between items-center ${
              errors.categoryId ? 'border-red-500' : 'border-slate-300'
            }`}
            disabled={isSubmitting}
          >
            <Text
              className={`text-base ${
                selectedCategory ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {selectedCategory?.name || 'Select a category...'}
            </Text>
            <Text className="text-slate-400">▼</Text>
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View className="border border-slate-300 border-t-0 rounded-b-md bg-white">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  className={`px-3 py-3 border-b border-slate-100 flex-row justify-between items-center ${
                    categoryId === category.id ? 'bg-blue-50' : ''
                  }`}
                  onPress={() => {
                    setCategoryId(category.id);
                    setShowCategoryDropdown(false);
                    setErrors({ ...errors, categoryId: '' });
                  }}
                >
                  <Text
                    className={`text-base ${
                      categoryId === category.id
                        ? 'text-blue-700 font-semibold'
                        : 'text-slate-900'
                    }`}
                  >
                    {category.name}
                  </Text>
                  {categoryId === category.id && (
                    <Text className="text-blue-600">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {errors.categoryId && (
            <Text className="text-red-600 text-sm mt-1">
              {errors.categoryId}
            </Text>
          )}
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-900 mb-2">
            Title <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            className={`border rounded-md px-3 py-3 text-base bg-white ${
              errors.title ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Brief summary of the issue"
            placeholderTextColor="#a1a5b4"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            maxLength={255}
            editable={!isSubmitting}
            style={{ color: '#0f172a' }}
            accessibilityLabel="Report title"
            accessibilityHint="Enter a brief summary of the issue"
          />
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-xs text-slate-500">
              {title.length} / 255 characters
            </Text>
          </View>
          {errors.title && (
            <Text className="text-red-600 text-sm mt-1">
              {errors.title}
            </Text>
          )}
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-slate-900 mb-2">
            Description <Text className="text-red-600">*</Text>
          </Text>
          <TextInput
            className={`border rounded-md px-3 py-3 text-base bg-white ${
              errors.description ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Provide details about the issue"
            placeholderTextColor="#a1a5b4"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            maxLength={5000}
            multiline
            numberOfLines={5}
            editable={!isSubmitting}
            style={{ color: '#0f172a', textAlignVertical: 'top' }}
            accessibilityLabel="Report description"
            accessibilityHint="Provide detailed information about the issue"
          />
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-xs text-slate-500">
              {description.length} / 5,000 characters
            </Text>
          </View>
          {errors.description && (
            <Text className="text-red-600 text-sm mt-1">
              {errors.description}
            </Text>
          )}
          <Text className="text-xs text-slate-500 mt-2">
            Be specific about the location and what needs to be fixed.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-md py-3 items-center justify-center mb-4 ${
            !isFormValid || isSubmitting
              ? 'bg-slate-300'
              : 'bg-blue-600'
          }`}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          accessibilityLabel="Submit report"
          accessibilityHint="Submit your report to the city"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">
              Submit Report
            </Text>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View className="bg-blue-50 border border-blue-200 rounded-md px-3 py-3">
          <Text className="text-sm text-slate-700 leading-5">
            <Text className="font-semibold">Next steps:</Text> Photos and location can be added after you submit this report.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
