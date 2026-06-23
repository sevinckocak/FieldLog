import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../../config/firebase/firebaseConfig';
import type { RootState } from '../index';

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

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'E-posta veya şifre hatalı.',
  'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
  'auth/wrong-password': 'Hatalı şifre.',
  'auth/invalid-email': 'Geçersiz e-posta adresi.',
  'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda.',
  'auth/weak-password': 'Şifre en az 6 karakter olmalı.',
  'auth/too-many-requests': 'Çok fazla deneme yapıldı. Lütfen bekleyin.',
  'auth/network-request-failed': 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
  'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
};

export const loginAsync = createAsyncThunk<
  void,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged listener → setUser → RootNavigator geçiş yapar
  } catch (e: any) {
    return rejectWithValue(FIREBASE_ERRORS[e.code] ?? 'Bir hata oluştu. Lütfen tekrar deneyin.');
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
    // updateProfile onAuthStateChanged'ı tetiklemez, bu yüzden user'ı kendimiz döndürüyoruz
    return {
      uid: user.uid,
      email: user.email,
      displayName: fullName,
      photoURL: user.photoURL,
    };
  } catch (e: any) {
    return rejectWithValue(FIREBASE_ERRORS[e.code] ?? 'Bir hata oluştu. Lütfen tekrar deneyin.');
  }
});

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
});

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
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Giriş yapılamadı.';
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
        state.error = action.payload ?? 'Kayıt olunamadı.';
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
