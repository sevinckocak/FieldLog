import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAuthError, signUpAsync, selectAuthError, selectAuthLoading } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

interface InputFieldProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secure?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
}

function InputField({
  label, icon, value, onChangeText, placeholder,
  secure, showToggle, onToggle, keyboardType, autoCapitalize,
}: InputFieldProps) {
  return (
    <View>
      <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
        {label}
      </Text>
      <View
        style={{
          backgroundColor: '#111827',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#1F2937',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
        }}
      >
        <Ionicons name={icon} size={18} color="#4B5563" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#374151"
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          style={{ flex: 1, color: '#F9FAFB', fontSize: 15, paddingVertical: 14, paddingLeft: 10 }}
        />
        {showToggle && (
          <Pressable
            onPress={onToggle}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#4B5563"
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const reduxError = useAppSelector(selectAuthError);
  const { t } = useTranslation('auth');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localErrorKey, setLocalErrorKey] = useState('');

  const errorText = localErrorKey
    ? t(localErrorKey as any)
    : reduxError
      ? t(`errors.${reduxError}` as any)
      : null;

  const clearErrors = () => {
    setLocalErrorKey('');
    dispatch(clearAuthError());
  };

  const handleSignUp = () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalErrorKey('validation.fillAllFields');
      return;
    }
    if (password !== confirmPassword) {
      setLocalErrorKey('validation.passwordsDoNotMatch');
      return;
    }
    if (password.length < 6) {
      setLocalErrorKey('validation.passwordTooShort');
      return;
    }
    setLocalErrorKey('');
    dispatch(clearAuthError());
    dispatch(signUpAsync({ fullName: fullName.trim(), email: email.trim(), password }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#030712' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32, justifyContent: 'space-between' }}>

            {/* Geri Butonu + Başlık */}
            <View>
              <TouchableOpacity
                onPress={() => { clearErrors(); navigation.goBack(); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ alignSelf: 'flex-start', marginBottom: 32, padding: 4 }}
              >
                <Ionicons name="arrow-back" size={22} color="#9CA3AF" />
              </TouchableOpacity>

              <View style={{ alignItems: 'center', marginBottom: 36 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    backgroundColor: '#1D4ED8',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.4,
                    shadowRadius: 16,
                    elevation: 12,
                  }}
                >
                  <Ionicons name="map" size={34} color="#FFFFFF" />
                </View>
                <Text style={{ color: '#F9FAFB', fontSize: 28, fontWeight: '700' }}>
                  {t('signup.title')}
                </Text>
                <Text style={{ color: '#6B7280', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
                  {t('signup.subtitle')}
                </Text>
              </View>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>
              <InputField
                label={t('signup.fullNameLabel')}
                icon="person-outline"
                value={fullName}
                onChangeText={(v) => { setFullName(v); clearErrors(); }}
                placeholder={t('signup.fullNamePlaceholder')}
                autoCapitalize="words"
              />
              <InputField
                label={t('signup.emailLabel')}
                icon="mail-outline"
                value={email}
                onChangeText={(v) => { setEmail(v); clearErrors(); }}
                placeholder={t('signup.emailPlaceholder')}
                keyboardType="email-address"
              />
              <InputField
                label={t('signup.passwordLabel')}
                icon="lock-closed-outline"
                value={password}
                onChangeText={(v) => { setPassword(v); clearErrors(); }}
                placeholder={t('signup.passwordPlaceholder')}
                secure={!showPassword}
                showToggle
                onToggle={() => setShowPassword((v) => !v)}
              />
              <InputField
                label={t('signup.confirmPasswordLabel')}
                icon="shield-checkmark-outline"
                value={confirmPassword}
                onChangeText={(v) => { setConfirmPassword(v); clearErrors(); }}
                placeholder={t('signup.confirmPasswordPlaceholder')}
                secure={!showConfirm}
                showToggle
                onToggle={() => setShowConfirm((v) => !v)}
              />

              {/* Hata Mesajı */}
              {errorText ? (
                <View
                  style={{
                    backgroundColor: '#1A0505',
                    borderRadius: 10,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: '#7F1D1D',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Ionicons name="alert-circle-outline" size={16} color="#F87171" />
                  <Text style={{ color: '#FCA5A5', fontSize: 13, flex: 1 }}>{errorText}</Text>
                </View>
              ) : null}

              {/* Kayıt Ol Butonu */}
              <TouchableOpacity
                onPress={handleSignUp}
                disabled={loading}
                activeOpacity={0.85}
                style={{
                  backgroundColor: '#3B82F6',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginTop: 4,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 14,
                  elevation: 10,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {t('signup.submitButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Giriş Yap Linki */}
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: '#6B7280', fontSize: 15 }}>
                {t('signup.hasAccount')}{' '}
                <Text
                  style={{ color: '#60A5FA', fontWeight: '600' }}
                  onPress={() => { clearErrors(); navigation.navigate('Login'); }}
                >
                  {t('signup.loginLink')}
                </Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
