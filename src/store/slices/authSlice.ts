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

// Firebase hata kodlarını i18n key'lerine dönüştürür.
// auth.json errors.* altındaki key'lerle eşleşir.
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

export const loginAsync = createAsyncThunk<
  void,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged listener → setUser → RootNavigator geçiş yapar
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
    // updateProfile onAuthStateChanged'ı tetiklemez, bu yüzden user'ı kendimiz döndürüyoruz
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
