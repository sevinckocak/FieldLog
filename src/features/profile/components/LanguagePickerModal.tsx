import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../hooks/useTheme';
import { LANGUAGES, type Locale } from '../../../i18n';

interface LanguageOption {
  locale: Locale;
  flag: string;
  nativeName: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { locale: 'tr', flag: '🇹🇷', nativeName: 'Türkçe' },
  { locale: 'en', flag: '🇬🇧', nativeName: 'English' },
  { locale: 'de', flag: '🇩🇪', nativeName: 'Deutsch' },
  { locale: 'fr', flag: '🇫🇷', nativeName: 'Français' },
  { locale: 'es', flag: '🇪🇸', nativeName: 'Español' },
];

interface Props {
  visible: boolean;
  currentLocale: Locale;
  onSelect: (locale: Locale) => void;
  onClose: () => void;
}

export default function LanguagePickerModal({
  visible,
  currentLocale,
  onSelect,
  onClose,
}: Props) {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation('profile');
  const { t: tCommon } = useTranslation('common');

  const [internalVisible, setInternalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(480)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
    } else if (internalVisible) {
      animateClose(() => setInternalVisible(false));
    }
  }, [visible]);

  useEffect(() => {
    if (internalVisible && visible) {
      slideAnim.setValue(480);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 180,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [internalVisible]);

  const animateClose = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 480,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleClose = () => {
    animateClose(onClose);
  };

  const handleSelect = (locale: Locale) => {
    onSelect(locale);
    animateClose(onClose);
  };

  const sheetBg = isDark ? '#0D1117' : '#FFFFFF';
  const itemSelectedBg = isDark ? 'rgba(59,130,246,0.14)' : '#EFF6FF';
  const separatorColor = isDark ? '#1E2D3D' : '#F0F4F8';
  const cancelBg = isDark ? '#161D27' : '#F8FAFC';
  const blurTint = isDark ? 'dark' : 'light';

  return (
    <Modal
      visible={internalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.root}>
        {/* ── Backdrop ─── */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
          <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
            {Platform.OS === 'ios' ? (
              <BlurView
                style={StyleSheet.absoluteFill}
                intensity={45}
                tint={blurTint}
              />
            ) : (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  {
                    backgroundColor: isDark
                      ? 'rgba(0,0,0,0.82)'
                      : 'rgba(0,0,0,0.52)',
                  },
                ]}
              />
            )}
          </Animated.View>
        </Pressable>

        {/* ── Sheet ─── */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: sheetBg,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleWrap}>
            <View
              style={[
                styles.handle,
                { backgroundColor: isDark ? '#2D3F50' : '#DDE3EA' },
              ]}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {t('languagePicker.title')}
          </Text>

          {/* Language List */}
          <View
            style={[
              styles.list,
              {
                backgroundColor: isDark ? '#111827' : '#F8FAFC',
                borderColor: separatorColor,
              },
            ]}
          >
            {LANGUAGE_OPTIONS.map((lang, index) => {
              const isSelected = lang.locale === currentLocale;
              const isLast = index === LANGUAGE_OPTIONS.length - 1;

              return (
                <TouchableOpacity
                  key={lang.locale}
                  activeOpacity={0.55}
                  onPress={() => handleSelect(lang.locale)}
                  style={[
                    styles.item,
                    isSelected && { backgroundColor: itemSelectedBg },
                    !isLast && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: separatorColor,
                    },
                  ]}
                >
                  {/* Flag */}
                  <Text style={styles.flag}>{lang.flag}</Text>

                  {/* Language name */}
                  <Text
                    style={[
                      styles.langName,
                      {
                        color: isSelected
                          ? colors.primary
                          : colors.textPrimary,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {lang.nativeName}
                  </Text>

                  {/* Native label (dimmed) */}
                  {!isSelected && (
                    <Text
                      style={[styles.langSubtext, { color: colors.textMuted }]}
                    >
                      {LANGUAGES[lang.locale]}
                    </Text>
                  )}

                  {/* Checkmark */}
                  {isSelected ? (
                    <View
                      style={[
                        styles.checkCircle,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.checkPlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            activeOpacity={0.65}
            onPress={handleClose}
            style={[styles.cancelBtn, { backgroundColor: cancelBg }]}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              {tCommon('cancel')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 36,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 24,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  list: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    minHeight: 62,
  },
  flag: {
    fontSize: 26,
    marginRight: 14,
    lineHeight: 32,
  },
  langName: {
    fontSize: 16,
    flex: 1,
    letterSpacing: 0.1,
  },
  langSubtext: {
    fontSize: 13,
    marginRight: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkPlaceholder: {
    width: 22,
    height: 22,
  },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
