import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../config/firebase/firebaseConfig';
import type { RootState } from '../index';

// ─── Constants ────────────────────────────────────────────────────────────────

/** AsyncStorage key'i — "Beni Hatırla" tercihini saklar */
export const REMEMBER_ME_KEY = '@fieldlog/remember_me';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SerializedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: SerializedUser | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  initialized: false,
  loading: false,
  error: null,
};

// Firebase hata kodlarını i18n key'lerine dönüştürür
const FIREBASE_ERROR_KEYS: Record<string, string> = {
  'auth/invalid-credential': 'invalidCredential',
  'auth/user-not-found': 'userNotFound',
  'auth/wrong-password': 'wrongPassword',
  'auth/invalid-email': 'invalidEmail',
  'auth/email-already-in-use': 'emailAlreadyInUse',
  'auth/weak-password': 'weakPassword',
  'auth/too-many-requests': 'tooManyRequests',
  'auth/network-request-failed': 'networkRequestFailed',
  'auth/user-disabled': 'userDisabled',
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loginAsync = createAsyncThunk<
  void,
  { email: string; password: string; rememberMe: boolean },
  { rejectValue: string }
>('auth/login', async ({ email, password, rememberMe }, { rejectWithValue }) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // "Beni Hatırla" tercihini kaydet — App.tsx bu değeri okuyarak
    // sonraki açılışta session'ı devam ettirip ettirmeyeceğine karar verir
    await AsyncStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
  } catch (e: any) {
    return rejectWithValue(FIREBASE_ERROR_KEYS[e.code] ?? 'default');
  }
});

export const signUpAsync = createAsyncThunk<
  SerializedUser,
  { fullName: string; email: string; password: string },
  { rejectValue: string }
>('auth/signUp', async ({ fullName, email, password }, { rejectWithValue }) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: fullName });
    // Yeni kayıt sonrası oturumu kalıcı yap (kullanıcı henüz seçim yapmadı)
    await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
    return {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      photoURL: user.photoURL,
    };
  } catch (e: any) {
    return rejectWithValue(FIREBASE_ERROR_KEYS[e.code] ?? 'default');
  }
});

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
  // Çıkış yapınca tercihi sil — sonraki girişte kullanıcı yeniden seçsin
  await AsyncStorage.removeItem(REMEMBER_ME_KEY);
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<SerializedUser | null>) {
      state.user = action.payload;
      state.initialized = true;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state) => {
        state.loading = false;
        // Kullanıcı onAuthStateChanged → setUser ile set edilir
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'default';
      })

      // signUp
      .addCase(signUpAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(signUpAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'default';
      })

      // logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, clearAuthError } = authSlice.actions;

export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
