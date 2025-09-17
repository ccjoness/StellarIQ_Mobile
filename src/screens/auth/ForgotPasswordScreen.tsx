/**
 * Forgot password screen component
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import {useAuth} from '@/contexts/AuthContext';
import {useTheme} from '@/hooks/useTheme';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();
  const { theme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      clearError();
      await requestPasswordReset(email.trim());
      setIsEmailSent(true);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setEmail('');
  };

  if (isEmailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.successIcon, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.successIconText}>✓</Text>
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>Check Your Email</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            We've sent password reset instructions to {email}
          </Text>

          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            If you don't see the email in your inbox, please check your spam folder.
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={navigateToLogin}
          >
            <Text style={styles.primaryButtonText}>Back to Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            onPress={handleTryAgain}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Try Different Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email Address</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }, isLoading && styles.disabledButton]}
            onPress={handleRequestReset}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Instructions</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
            onPress={navigateToLogin}
            disabled={isLoading}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically via theme
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    // color will be set dynamically via theme
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    // color will be set dynamically via theme
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    // color will be set dynamically via theme
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    // backgroundColor will be set dynamically via theme
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    // color will be set dynamically via theme
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    // color will be set dynamically via theme
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    // backgroundColor, borderColor, and color will be set dynamically via theme
  },
  primaryButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    // backgroundColor will be set dynamically via theme
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    // borderColor and backgroundColor will be set dynamically via theme
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // color will be set dynamically via theme
  },
  disabledButton: {
    opacity: 0.6,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    // backgroundColor will be set dynamically via theme
  },
  successIconText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
