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
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAuthError, loginAsync, selectAuthError, selectAuthLoading } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAuthLoading);
  const reduxError = useAppSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const error = localError || reduxError;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setLocalError('Lütfen tüm alanları doldurun.');
      return;
    }
    setLocalError('');
    dispatch(clearAuthError());
    dispatch(loginAsync({ email: email.trim(), password }));
  };

  const clearErrors = () => {
    setLocalError('');
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
          <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 32, justifyContent: 'space-between' }}>

            {/* Logo & Başlık */}
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
              <Text style={{ color: '#6B7280', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
                Hesabına giriş yap
              </Text>
            </View>

            {/* Form */}
            <View style={{ gap: 16 }}>

              {/* E-posta */}
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
                  E-posta
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
                    onChangeText={(t) => { setEmail(t); clearErrors(); }}
                    placeholder="ornek@email.com"
                    placeholderTextColor="#374151"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ flex: 1, color: '#F9FAFB', fontSize: 15, paddingVertical: 14, paddingLeft: 10 }}
                  />
                </View>
              </View>

              {/* Şifre */}
              <View>
                <Text style={{ color: '#9CA3AF', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
                  Şifre
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
                    onChangeText={(t) => { setPassword(t); clearErrors(); }}
                    placeholder="••••••••"
                    placeholderTextColor="#374151"
                    secureTextEntry={!showPassword}
                    style={{ flex: 1, color: '#F9FAFB', fontSize: 15, paddingVertical: 14, paddingLeft: 10 }}
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

              {/* Hata Mesajı */}
              {error ? (
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
                  <Text style={{ color: '#FCA5A5', fontSize: 13, flex: 1 }}>{error}</Text>
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
                    Giriş Yap
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Kayıt Ol Linki */}
            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={{ color: '#6B7280', fontSize: 15 }}>
                Hesabın yok mu?{' '}
                <Text
                  style={{ color: '#60A5FA', fontWeight: '600' }}
                  onPress={() => { clearErrors(); navigation.navigate('SignUp'); }}
                >
                  Kayıt Ol
                </Text>
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
