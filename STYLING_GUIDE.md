# City Reporter - Styling Implementation Guide

## Overview

All UI components in City Reporter use React Native's native `StyleSheet` API with a centralized design system theme. This approach provides:

- **Performance**: Direct native styling without transpilation overhead
- **Maintainability**: Single source of truth for design tokens (colors, spacing, typography)
- **Consistency**: All screens follow the same design system
- **Accessibility**: Built-in support for accessibility labels and hints

## Design System Architecture

### 1. Theme System (`src/constants/theme.ts`)

All design tokens are defined in a single file, organized by category:

#### Colors

**Neutral Scale** - Used for text, backgrounds, borders
```typescript
colors.neutral[0]    // #ffffff (cards, inputs)
colors.neutral[50]   // #f8fafc (app background)
colors.neutral[100]  // #f1f5f9 (hover backgrounds)
colors.neutral[200]  // #e2e8f0 (borders)
colors.neutral[500]  // #64748b (secondary text)
colors.neutral[900]  // #0f172a (headings)
```

**Primary (Blue)** - Main actions and interactive elements
```typescript
colors.primary[50]   // #eff6ff (light backgrounds)
colors.primary[600]  // #2563eb (main actions, links)
colors.primary[700]  // #1d4ed8 (hover state)
```

**Semantic Colors**
- `colors.success` - Resolved/completed states (green)
- `colors.warning` - Pending/attention needed (amber)
- `colors.danger` - Errors/destructive (red)
- `colors.info` - Informational (blue)

#### Spacing

4px base unit system for consistent spacing:
```typescript
spacing[1] = 4px    // Tight spacing
spacing[2] = 8px    // Small gaps
spacing[3] = 12px   // Form elements
spacing[4] = 16px   // Default padding
spacing[6] = 24px   // Card sections
spacing[8] = 32px   // Page sections
```

#### Typography

Pre-configured text styles for different contexts:
```typescript
typography.display          // 36px, 700, large headings
typography.pageTitle        // 28px, 700, page titles
typography.sectionHeading   // 20px, 600, section headings
typography.cardHeading      // 16px, 600, card titles
typography.bodyLarge        // 16px, 400, larger body text
typography.body            // 14px, 400, default body
typography.small           // 13px, 400, small text
typography.caption         // 12px, 400, captions
```

#### Border Radius

Restrained rounding for clean appearance:
```typescript
borderRadius.md = 8px    // Buttons, inputs, dropdowns
borderRadius.lg = 12px   // Cards, modals
borderRadius.full = 9999 // Badges, avatars
```

#### Shadows

Subtle depth with native elevation:
```typescript
shadows.sm  // 1px, low elevation
shadows.md  // 4px offset, medium elevation
shadows.lg  // 12px offset, high elevation
```

## Using the Design System

### Creating a Styled Component

1. **Import theme tokens**
```typescript
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { StyleSheet } from 'react-native';
```

2. **Define styles using tokens**
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    ...typography.cardHeading,
  },
  buttonText: {
    color: colors.neutral[0],
  },
});
```

3. **Apply styles to components**
```typescript
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Submit</Text>
</TouchableOpacity>
```

### Conditional Styling

```typescript
<View
  style={[
    styles.input,
    errors.email && styles.inputError,  // Add error border
    isDisabled && styles.inputDisabled,  // Add disabled state
  ]}
/>
```

## Common Patterns

### Buttons

**Primary Button** (main action)
```typescript
const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: colors.neutral[0],
    ...typography.cardHeading,
  },
});
```

**Secondary Button** (supporting action)
```typescript
const styles = StyleSheet.create({
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    minHeight: 50,
  },
  secondaryButtonText: {
    color: colors.primary[600],
    ...typography.cardHeading,
  },
});
```

### Form Fields

**Input with Label and Error**
```typescript
const styles = StyleSheet.create({
  label: {
    ...typography.small,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    ...typography.bodyLarge,
  },
  inputError: {
    borderColor: colors.danger[500],
    backgroundColor: colors.danger[50],
  },
  errorText: {
    color: colors.danger[600],
    ...typography.small,
    marginTop: spacing[1],
  },
});
```

### Cards

**Info Card**
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[0],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
});
```

**Alert/Info Box**
```typescript
const styles = StyleSheet.create({
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
  },
});
```

## Best Practices

### 1. Use Theme Tokens, Never Hardcode Colors

❌ **Bad**
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
  },
});
```

✅ **Good**
```typescript
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing[3],
  },
});
```

### 2. Use Typography Spreads for Consistency

❌ **Bad**
```typescript
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
});
```

✅ **Good**
```typescript
const styles = StyleSheet.create({
  title: {
    ...typography.pageTitle,
  },
});
```

### 3. Maintain Spacing Grid

Use the spacing scale consistently:
```typescript
// Avoid arbitrary spacing values
marginBottom: 15,  // ❌

// Use spacing grid
marginBottom: spacing[4], // 16px ✅
```

### 4. Combine Styles with Array Syntax

```typescript
// For conditional styling
<View
  style={[
    styles.base,
    isActive && styles.activeState,
    error && styles.errorState,
  ]}
/>
```

### 5. Always Include Accessibility

```typescript
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Submit form"
  accessibilityHint="Send your report to the city"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

## Color Usage Guidelines

### Text

| Token | Usage |
|-------|-------|
| neutral-900 | Primary text, headings |
| neutral-700 | Secondary text in cards |
| neutral-600 | Tertiary text, labels |
| neutral-500 | Disabled text |
| neutral-0 | Text on dark backgrounds |

### Backgrounds

| Token | Usage |
|-------|-------|
| neutral-0 | Cards, inputs |
| neutral-50 | App background |
| neutral-100 | Hover states |

### Interactive

| Token | Usage |
|-------|-------|
| primary-600 | Primary buttons, links |
| primary-700 | Primary hover state |
| danger-600 | Errors, destructive actions |
| success-600 | Success messages |
| warning-600 | Warnings, pending states |

## Responsive Design Notes

React Native handles responsive design differently than web. Key considerations:

1. **Use flexbox** for layout
2. **Avoid fixed widths** where possible
3. **Test on multiple screen sizes** during development
4. **Use `useWindowDimensions`** for window-aware layouts

## File Organization

```
src/
├── constants/
│   └── theme.ts          # All design tokens
├── app/
│   ├── (citizen)/
│   │   ├── index.tsx     # Home screen
│   │   ├── create-report.tsx
│   │   └── confirmation.tsx
│   └── _layout.tsx
└── services/
    └── api.ts
```

## Adding New Colors or Tokens

If you need to add new design tokens:

1. Add to `src/constants/theme.ts`
2. Use consistent naming (e.g., `colors.newColor[600]`)
3. Document the token and its purpose
4. Update this guide

Example:
```typescript
// In theme.ts
export const colors = {
  // ... existing colors
  newColor: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
};
```

## Performance Considerations

- StyleSheet definitions are created once and reused
- Avoid creating new StyleSheet objects inside render functions
- Use `StyleSheet.create()` at module level
- Conditional styles are applied via array syntax, not object spreading

## Troubleshooting

### Styles not appearing
- Ensure component is using correct style prop
- Check if conditional styles are overriding base styles
- Verify token exists in theme.ts

### Colors look different on device
- Test on actual device (not just simulator)
- Ensure color values match design system
- Check for OS-specific rendering differences

### Spacing is inconsistent
- Use spacing array values consistently
- Avoid mixing arbitrary values with spacing tokens
- Review component spacing with design grid

## Migration from Previous Styling

If migrating existing styled components:

1. Import theme tokens
2. Replace hardcoded values with token references
3. Use typography spreads instead of manual font sizes
4. Convert colors to semantic names
5. Test thoroughly on multiple devices
