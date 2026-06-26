import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutAsync, selectUser } from '../../../store/slices/authSlice';
import { setTheme } from '../../../store/slices/themeSlice';
import { setLocale, selectLocale } from '../../../store/slices/languageSlice';
import { useTheme } from '../../../hooks/useTheme';
import { LANGUAGES, type Locale } from '../../../i18n';
import i18n from '../../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../../../theme';

export interface ProfileData {
  displayName: string;
  email: string | null;
  avatarLetter: string;
}

export interface UseProfileResult {
  profile: ProfileData;
  isDark: boolean;
  mode: ThemeMode;
  locale: Locale;
  currentLanguageName: string;
  logout: () => void;
  changeTheme: (dark: boolean) => void;
  changeLocale: (locale: Locale) => void;
}

export function useProfile(): UseProfileResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const locale = useAppSelector(selectLocale);
  const { isDark, mode } = useTheme();

  const profile: ProfileData = {
    displayName: user?.displayName ?? '',
    email: user?.email ?? null,
    avatarLetter: (
      user?.displayName?.[0] ?? user?.email?.[0] ?? '?'
    ).toUpperCase(),
  };

  const logout = () => dispatch(logoutAsync());
  const changeTheme = (dark: boolean) => dispatch(setTheme(dark ? 'dark' : 'light'));
  const changeLocale = async (newLocale: Locale) => {
    dispatch(setLocale(newLocale));
    await i18n.changeLanguage(newLocale);
    await AsyncStorage.setItem('app_locale', newLocale);
  };

  return {
    profile,
    isDark,
    mode,
    locale,
    currentLanguageName: LANGUAGES[locale],
    logout,
    changeTheme,
    changeLocale,
  };
}
