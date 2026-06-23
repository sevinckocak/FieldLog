import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSlide } from './components/OnboardingSlide';
import { PaginationDots } from './components/PaginationDots';
import {
  ONBOARDING_SLIDES,
  OnboardingSlide as SlideType,
} from './data/onboardingData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const flatListRef = useRef<FlatList<SlideType>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const completedRef = useRef(false);

  const isLast = currentIndex === ONBOARDING_SLIDES.length - 1;

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      setCurrentIndex(index);
    },
    [],
  );

  const handleComplete = useCallback(async () => {
    if (completedRef.current) return;
    completedRef.current = true;
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } finally {
      onComplete();
    }
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (isLast) {
      handleComplete();
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, [currentIndex, isLast, handleComplete]);

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Üst Bar - Atla Butonu */}
      <View className="h-12 flex-row items-center justify-end px-6">
        {!isLast && (
          <TouchableOpacity
            onPress={handleComplete}
            activeOpacity={0.6}
            className="py-2 pl-4"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-gray-400 text-base font-medium">Atla</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slaytlar */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={{ flex: 1 }}
      />

      {/* Alt Bar - Sayfalama Noktaları ve Buton */}
      <View className="flex-row items-center justify-between px-8 pb-10 pt-4">
        <PaginationDots
          count={ONBOARDING_SLIDES.length}
          currentIndex={currentIndex}
        />

        {isLast ? (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            className="bg-blue-500 rounded-full px-7 py-4"
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 14,
              elevation: 10,
            }}
          >
            <Text className="text-white text-base font-semibold">
              Başlayalım
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: '#3B82F6',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.45,
              shadowRadius: 14,
              elevation: 10,
            }}
          >
            <Ionicons name="arrow-forward" size={22} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
