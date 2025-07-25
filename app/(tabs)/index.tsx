import { parseISO } from 'date-fns';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Calendar from '@/components/calendar/Calendar';

export default function HomeScreen() {
  const [currentMonth, setCurrentMonth] = useState<Date>(parseISO("2025-08-01"));

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/pagaspot-screen.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hej!</ThemedText>
        <HelloWave />
      </ThemedView>

      <Calendar
        from={currentMonth}
        offerDays={['2025-08-10','2025-08-11','2025-08-12','2025-08-15','2025-08-17','2025-08-18']}
        orderDays={[]}
        onMonthChange={handleMonthChange}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    width: '100%',
    height: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
