import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../services/api';
import { Category } from '../../types/index';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing[10] }}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Report an Issue</Text>
        <Text style={styles.subtitle}>Help us improve your neighborhood</Text>
      </View>

      {/* Form Content */}
      <View style={styles.content}>
        {/* Category Selection */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            style={[
              styles.dropdown,
              errors.categoryId && styles.inputError,
            ]}
            disabled={isSubmitting}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedCategory && styles.placeholderText,
              ]}
            >
              {selectedCategory?.name || 'Select a category...'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>

          {showCategoryDropdown && (
            <View style={styles.dropdownMenu}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.dropdownItem,
                    categoryId === category.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    setCategoryId(category.id);
                    setShowCategoryDropdown(false);
                    setErrors({ ...errors, categoryId: '' });
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      categoryId === category.id && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {categoryId === category.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {errors.categoryId && (
            <Text style={styles.errorText}>{errors.categoryId}</Text>
          )}
        </View>

        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              errors.title && styles.inputError,
            ]}
            placeholder="Brief summary of the issue"
            placeholderTextColor={colors.neutral[400]}
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            maxLength={255}
            editable={!isSubmitting}
            accessibilityLabel="Report title"
            accessibilityHint="Enter a brief summary of the issue"
          />
          <View style={styles.charCountContainer}>
            <Text style={styles.charCount}>
              {title.length} / 255 characters
            </Text>
          </View>
          {errors.title && (
            <Text style={styles.errorText}>{errors.title}</Text>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              errors.description && styles.inputError,
            ]}
            placeholder="Provide details about the issue"
            placeholderTextColor={colors.neutral[400]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            maxLength={5000}
            multiline
            numberOfLines={5}
            editable={!isSubmitting}
            textAlignVertical="top"
            accessibilityLabel="Report description"
            accessibilityHint="Provide detailed information about the issue"
          />
          <View style={styles.charCountContainer}>
            <Text style={styles.charCount}>
              {description.length} / 5,000 characters
            </Text>
          </View>
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
          <Text style={styles.helperText}>
            Be specific about the location and what needs to be fixed.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          accessibilityLabel="Submit report"
          accessibilityHint="Submit your report to the city"
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>Next steps:</Text> Photos and location can be added after you submit this report.
          </Text>
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
  header: {
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  pageTitle: {
    ...typography.pageTitle,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  content: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[6],
  },
  fieldContainer: {
    marginBottom: spacing[6],
  },
  label: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  required: {
    color: colors.danger[600],
  },
  dropdown: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.neutral[0],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    ...typography.bodyLarge,
    color: colors.neutral[900],
    flex: 1,
  },
  placeholderText: {
    color: colors.neutral[400],
  },
  dropdownArrow: {
    color: colors.neutral[400],
    marginLeft: spacing[2],
  },
  dropdownMenu: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.neutral[300],
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    backgroundColor: colors.neutral[0],
    marginTop: -1,
  },
  dropdownItem: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: colors.primary[50],
  },
  dropdownItemText: {
    ...typography.bodyLarge,
    color: colors.neutral[900],
  },
  dropdownItemTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  checkmark: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    ...typography.bodyLarge,
    backgroundColor: colors.neutral[0],
    color: colors.neutral[900],
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger[500],
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  charCount: {
    ...typography.small,
    color: colors.neutral[500],
  },
  helperText: {
    ...typography.small,
    color: colors.neutral[500],
    marginTop: spacing[2],
  },
  errorText: {
    color: colors.danger[600],
    ...typography.small,
    marginTop: spacing[1],
  },
  submitButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    minHeight: 50,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral[300],
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.neutral[0],
    ...typography.cardHeading,
  },
  infoBox: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  infoText: {
    ...typography.small,
    color: colors.neutral[700],
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: '600',
  },
});
