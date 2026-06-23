import React from 'react';
import { View } from 'react-native';

interface Props {
  count: number;
  currentIndex: number;
}

export function PaginationDots({ count, currentIndex }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#3B82F6',
            width: i === currentIndex ? 26 : 8,
            opacity: i === currentIndex ? 1 : 0.3,
          }}
        />
      ))}
    </View>
  );
}
