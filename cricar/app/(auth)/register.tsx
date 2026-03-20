import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/ui/Button';
import { COLORS } from '../../constants/gameConfig';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUpWithEmail, isLoading, error, clearError } = useAuthStore();

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleRegister() {
    clearError();
    if (!validate()) return;

    try {
      await signUpWithEmail(email, password, displayName, username.toLowerCase());
      router.replace('/(auth)/onboarding');
    } catch {
      // Error is handled by the store
    }
  }

  function renderInput(
    label: string,
    value: string,
    onChangeText: (t: string) => void,
    field: string,
    options?: {
      placeholder?: string;
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address';
      autoCapitalize?: 'none' | 'sentences' | 'words';
    }
  ) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, errors[field] ? styles.inputError : null]}
          placeholder={options?.placeholder || ''}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (errors[field]) {
              setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
              });
            }
          }}
          secureTextEntry={options?.secureTextEntry}
          keyboardType={options?.keyboardType || 'default'}
          autoCapitalize={options?.autoCapitalize ?? 'sentences'}
          editable={!isLoading}
        />
        {errors[field] ? (
          <Text style={styles.errorText}>{errors[field]}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the AR cricket revolution</Text>
        </View>

        <View style={styles.form}>
          {renderInput('Display Name', displayName, setDisplayName, 'displayName', {
            placeholder: 'Your name',
            autoCapitalize: 'words',
          })}

          {renderInput('Username', username, setUsername, 'username', {
            placeholder: 'Choose a username',
            autoCapitalize: 'none',
          })}

          {renderInput('Email', email, setEmail, 'email', {
            placeholder: 'you@example.com',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
          })}

          {renderInput('Password', password, setPassword, 'password', {
            placeholder: 'At least 6 characters',
            secureTextEntry: true,
          })}

          {renderInput(
            'Confirm Password',
            confirmPassword,
            setConfirmPassword,
            'confirmPassword',
            {
              placeholder: 'Re-enter password',
              secureTextEntry: true,
            }
          )}

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            size="large"
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.linkContainer}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkHighlight: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});
