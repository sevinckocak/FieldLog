import React from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import { OnboardingSlide as SlideData } from '../data/onboardingData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  slide: SlideData;
}

export function OnboardingSlide({ slide }: Props) {
  return (
    <View
      style={{ width: SCREEN_WIDTH }}
      className="items-center pt-2 pb-4 px-6"
    >
      {/* Görsel Alanı */}
      <View
        style={{ height: SCREEN_HEIGHT * 0.43 }}
        className="w-full items-center justify-center"
      >
        <Image
          source={slide.image}
          style={{
            width: SCREEN_WIDTH * 0.86,
            height: SCREEN_HEIGHT * 0.43,
          }}
          resizeMode="contain"
        />
      </View>

      {/* Metin Alanı */}
      <View className="mt-8 w-full items-center">
        <Text
          className="text-white text-3xl font-bold text-center"
          style={{ lineHeight: 40 }}
        >
          {slide.title}
        </Text>
        <Text
          className="text-gray-400 text-base text-center mt-4"
          style={{ lineHeight: 24 }}
        >
          {slide.description}
        </Text>
      </View>
    </View>
  );
}
