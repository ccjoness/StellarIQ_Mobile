/**
 * Registration screen component
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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleSignInService } from '../../services/googleSignIn';
import { Logo } from '../../components/Logo';
import { useTheme } from '../../hooks/useTheme';

export function RegisterScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuth();
  const { theme } = useTheme();

  const isGoogleSignInAvailable = GoogleSignInService.isAvailable();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!agreedToDisclaimer) {
      Alert.alert('Error', 'Please agree to the educational disclaimer to continue');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      await register({
        email: formData.email.trim(),
        password: formData.password,
        username: formData.fullName.trim() || formData.email.split('@')[0], // Use fullName as username, or email prefix as fallback
        agreed_to_disclaimer: agreedToDisclaimer,
        full_name: formData.fullName.trim() || undefined,
      });
      // Navigation will be handled by the auth state change
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleGoogleRegister = async () => {
    try {
      clearError();
      const result = await GoogleSignInService.signIn();
      
      if (result.success && result.idToken) {
        await loginWithGoogle(result.idToken);
        // Navigation will be handled by the auth state change
      } else {
        Alert.alert('Google Sign-In Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Google Sign-In Error', 'Failed to sign in with Google');
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login' as never);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Logo size={80} style={styles.logo} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Join StellarIQ to track your investments</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Full Name (Optional)</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
            <View style={[styles.passwordContainer, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.colors.text }]}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                placeholder="Enter your password (min 8 characters)"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={[styles.passwordToggleText, { color: theme.colors.primary }]}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Confirm Password</Text>
            <View style={[styles.passwordContainer, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <TextInput
                style={[styles.passwordInput, { color: theme.colors.text }]}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="Confirm your password"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={[styles.passwordToggleText, { color: theme.colors.primary }]}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Educational Disclaimer Checkbox */}
          <TouchableOpacity
            style={styles.disclaimerContainer}
            onPress={() => setAgreedToDisclaimer(!agreedToDisclaimer)}
            disabled={isLoading}
          >
            <View style={[
              styles.checkbox,
              {
                borderColor: theme.colors.border,
                backgroundColor: agreedToDisclaimer ? theme.colors.primary : 'transparent'
              }
            ]}>
              {agreedToDisclaimer && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.disclaimerTextContainer}>
              <Text style={[styles.disclaimerText, { color: theme.colors.text }]}>
                I understand that StellarIQ is for{' '}
                <Text style={[styles.disclaimerBold, { color: theme.colors.primary }]}>
                  educational purposes only
                </Text>
                {' '}and that market data may be delayed or inaccurate. I will not make trading or investment decisions based solely on this app and will consult with qualified financial advisors for investment advice.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.registerButton,
              { backgroundColor: theme.colors.primary },
              (isLoading || !agreedToDisclaimer) && styles.disabledButton
            ]}
            onPress={handleRegister}
            disabled={isLoading || !agreedToDisclaimer}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {isGoogleSignInAvailable && (
            <>
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>OR</Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, { borderColor: theme.colors.border }, isLoading && styles.disabledButton]}
                onPress={handleGoogleRegister}
                disabled={isLoading}
              >
                <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
              <Text style={[styles.footerLink, { color: theme.colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor will be set dynamically via theme
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    // color will be set dynamically via theme
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    // color will be set dynamically via theme
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
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
    // borderColor and backgroundColor will be set dynamically via theme
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    // borderColor and backgroundColor will be set dynamically via theme
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  passwordToggleText: {
    fontSize: 14,
    fontWeight: '600',
    // color will be set dynamically via theme
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerTextContainer: {
    flex: 1,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '600',
  },
  registerButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    // backgroundColor will be set dynamically via theme
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    // backgroundColor will be set dynamically via theme
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    // color will be set dynamically via theme
  },
  googleButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    // borderColor will be set dynamically via theme
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // color will be set dynamically via theme
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    // color will be set dynamically via theme
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    // color will be set dynamically via theme
  },
});
