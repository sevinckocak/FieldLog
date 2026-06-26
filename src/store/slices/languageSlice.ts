import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { DEFAULT_LOCALE, type Locale } from '../../i18n';

interface LanguageState {
  locale: Locale;
}

const initialState: LanguageState = {
  locale: DEFAULT_LOCALE,
};

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = languageSlice.actions;
export const selectLocale = (state: RootState) => state.language.locale;
export default languageSlice.reducer;
