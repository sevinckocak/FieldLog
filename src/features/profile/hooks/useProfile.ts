import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logoutAsync, selectUser } from '../../../store/slices/authSlice';
import { setTheme } from '../../../store/slices/themeSlice';
import { useTheme } from '../../../hooks/useTheme';
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
  logout: () => void;
  changeTheme: (dark: boolean) => void;
}

export function useProfile(): UseProfileResult {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { isDark, mode } = useTheme();

  const profile: ProfileData = {
    displayName: user?.displayName ?? 'Kullanıcı',
    email: user?.email ?? null,
    avatarLetter: (
      user?.displayName?.[0] ?? user?.email?.[0] ?? '?'
    ).toUpperCase(),
  };

  const logout = () => dispatch(logoutAsync());
  const changeTheme = (dark: boolean) => dispatch(setTheme(dark ? 'dark' : 'light'));

  return { profile, isDark, mode, logout, changeTheme };
}
