import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
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
import {
  REMEMBER_ME_KEY,
  clearAuthError,
  loginAsync,
  selectAuthError,
  selectAuthLoading,
} from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const reduxError = useAppSelector(selectAuthError);
  const { t } = useTranslation('auth');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localErrorKey, setLocalErrorKey] = useState('');

  // Kullanıcının önceki tercihini yükle (varsa)
  useEffect(() => {
    AsyncStorage.getItem(REMEMBER_ME_KEY).then((v) => {
      if (v !== null) setRememberMe(v === 'true');
    });
  }, []);

  const errorText = localErrorKey
    ? t(localErrorKey as any)
    : reduxError
      ? t(`errors.${reduxError}` as any)
      : null;

  const handleLogin = () => {
    if (!email.trim() || !password) {
      setLocalErrorKey('validation.fillAllFields');
      return;
    }
    setLocalErrorKey('');
    dispatch(clearAuthError());
    dispatch(loginAsync({ email: email.trim(), password, rememberMe }));
  };

  const clearErrors = () => {
    setLocalErrorKey('');
    dispatch(clearAuthError());
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
          <View
            style={{
              flex: 1,
              paddingHorizontal: 24,
              paddingTop: 48,
              paddingBottom: 32,
              justifyContent: 'space-between',
            }}
          >
            {/* ── Logo & Başlık ─────────────────────── */}
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
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
                FieldLog
              </Text>
              <Text
                style={{ color: '#6B7280', fontSize: 15, marginTop: 8, textAlign: 'center' }}
              >
                {t('login.subtitle')}
              </Text>
            </View>

            {/* ── Form ──────────────────────────────── */}
            <View style={{ gap: 16 }}>

              {/* E-posta */}
              <View>
                <Text
                  style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 8 }}
                >
                  {t('login.emailLabel')}
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
                  <Ionicons name="mail-outline" size={18} color="#4B5563" />
                  <TextInput
                    value={email}
                    onChangeText={(v) => { setEmail(v); clearErrors(); }}
                    placeholder={t('login.emailPlaceholder')}
                    placeholderTextColor="#374151"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                      flex: 1,
                      color: '#F9FAFB',
                      fontSize: 15,
                      paddingVertical: 14,
                      paddingLeft: 10,
                    }}
                  />
                </View>
              </View>

              {/* Şifre */}
              <View>
                <Text
                  style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 8 }}
                >
                  {t('login.passwordLabel')}
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
                  <Ionicons name="lock-closed-outline" size={18} color="#4B5563" />
                  <TextInput
                    value={password}
                    onChangeText={(v) => { setPassword(v); clearErrors(); }}
                    placeholder={t('login.passwordPlaceholder')}
                    placeholderTextColor="#374151"
                    secureTextEntry={!showPassword}
                    style={{
                      flex: 1,
                      color: '#F9FAFB',
                      fontSize: 15,
                      paddingVertical: 14,
                      paddingLeft: 10,
                    }}
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#4B5563"
                    />
                  </Pressable>
                </View>
              </View>

              {/* Beni Hatırla */}
              <TouchableOpacity
                onPress={() => setRememberMe((v) => !v)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    borderWidth: 2,
                    borderColor: rememberMe ? '#3B82F6' : '#374151',
                    backgroundColor: rememberMe ? '#3B82F6' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                  )}
                </View>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>
                  {t('login.rememberMe')}
                </Text>
              </TouchableOpacity>

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
                  <Text style={{ color: '#FCA5A5', fontSize: 13, flex: 1 }}>
                    {errorText}
                  </Text>
                </View>
              ) : null}

              {/* Giriş Butonu */}
              <TouchableOpacity
                onPress={handleLogin}
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
                    {t('login.submitButton')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Kayıt Ol Linki ────────────────────── */}
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: '#6B7280', fontSize: 15 }}>
                {t('login.noAccount')}{' '}
                <Text
                  style={{ color: '#60A5FA', fontWeight: '600' }}
                  onPress={() => { clearErrors(); navigation.navigate('SignUp'); }}
                >
                  {t('login.signUpLink')}
                </Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
