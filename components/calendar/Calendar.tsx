import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns"; // date-fns instead of moment.js
import { pl } from 'date-fns/locale'; // Importing Polish locale for date formatting
import { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";

export interface WeekViewProps {
  from: Date;
  offerDays: string[];
  orderDays: string[];
  onMonthChange?: (newMonth: Date) => void; // Callback for month change
}

interface MonthDay {
  day: string;
  date: string;
  today: boolean;
  offer: boolean;
  order: boolean;
  isCurrentMonth: boolean;
}

// Color theme
const colorTheme = {
  primary: "#0070ff",
  primaryLight: "#4688eb",
  warning: "#ffaa2a",
  text: {
    primary: "#000000",
    secondary: "#555555",
    muted: "#aaaaaa",
    disabled: "#cccccc",
    white: "#ffffff"
  },
  background: {
    light: "#f6f6f6",
    lighter: "#f0f0f0",
    disabled: "#e0e0e0"
  },
  border: {
    light: "#f6f6f6",
    lighter: "#f0f0f0",
    muted: "#666666"
  }
};

export const DayFormat = "yyyy-MM-dd";

export default function MonthView({
  from,
  orderDays,
  offerDays,
  onMonthChange,
}: WeekViewProps) {
  const [width, setWidth] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popup, setPopup] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const monthStart = startOfMonth(from);
  const monthEnd = endOfMonth(from);

  const firstMonday = startOfWeek(monthStart, { weekStartsOn: 1 });
  const lastSunday = endOfWeek(monthEnd, { weekStartsOn: 1 });

  let day = firstMonday;
  const days: MonthDay[] = [];

  while (day <= lastSunday || isSameDay(day, lastSunday)) {
    days.push({
      day: format(day, "dd"),
      date: format(day, DayFormat),
      today: isSameDay(day, new Date()),
      offer: offerDays.includes(format(day, DayFormat)),
      order: orderDays.includes(format(day, DayFormat)),
      isCurrentMonth: isSameMonth(day, from),
    });

    day = addDays(day, 1);
  }

  const weeks: MonthDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const weekDayNames = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nie"]; // Day names changed to Polish

  // Handlers for month navigation
  const handlePreviousMonth = () => {
    const previousMonth = subMonths(from, 1);
    onMonthChange?.(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(from, 1);
    onMonthChange?.(nextMonth);
  };

  const handleDayPress = (dayData: MonthDay) => {
    if (dayData.isCurrentMonth) {
      setSelectedDate(dayData.date);
    }
  };

  const showPopup = (message: string, type: 'success' | 'error') => {
    setPopup({
      visible: true,
      message,
      type
    });
  };

  // Function to handle order submission
  // To be replaced with actual API call
  const handleOrder = async () => {
    if (selectedDate) {
      const selectedDay = days.find(d => d.date === selectedDate);
      if (selectedDay?.offer) {
        try {
          const response = await fetch('https://example.com/order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              date: selectedDate,
              timestamp: new Date().toISOString(),
            }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Zamówienie wysłane pomyślnie:', result);
            showPopup('Zamówienie zostało złożone pomyślnie!', 'success');
          } else {
            console.error('Błąd podczas wysyłania zamówienia:', response.status);
            showPopup('Wystąpił błąd podczas składania zamówienia', 'error');
          }
        } catch (error) {
          console.error('Błąd sieci podczas wysyłania zamówienia:', error);
          showPopup('Błąd połączenia. Sprawdź internet i spróbuj ponownie', 'error');
        }
      }
    }
  };

  const getSelectedDayInfo = () => {
    if (!selectedDate) return null;

    const selectedDay = days.find(d => d.date === selectedDate);
    const formattedDate = format(new Date(selectedDate), "d LLLL yyyy", { locale: pl });

    return {
      text: `Wybrana data: ${formattedDate}`,
      showButton: true,
      isAvailable: selectedDay?.offer || false
    };
  };

  const selectedDayInfo = getSelectedDayInfo();

  return (
    <View style={styles.container}>
      <View
        style={styles.days}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        {/* Month header with navigation */}
        <View style={styles.monthHeader}>
          <Pressable style={styles.navButton} onPress={handlePreviousMonth}>
            <ThemedText style={styles.navArrow}>←</ThemedText>
          </Pressable>

          <View style={styles.monthTitle}>
            <ThemedText style={styles.monthText}>
              {format(from, "LLLL yyyy", { locale: pl })}
            </ThemedText>
          </View>

          <Pressable style={styles.navButton} onPress={handleNextMonth}>
            <ThemedText style={styles.navArrow}>→</ThemedText>
          </Pressable>
        </View>

        {/* Week day header */}
        <View style={styles.weekHeader}>
          {weekDayNames.map((dayName) => (
            <View
              key={dayName}
              style={{
                width: width / 7,
                padding: 2,
              }}
            >
              <ThemedText style={styles.weekDayName}>{dayName}</ThemedText>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View key={`week-${week[0]?.date || weekIndex}`} style={styles.weekRow}>
            {week.map((d) => (
              <View
                style={{
                  ...{
                    width: width / 7,
                    padding: 1,
                  },
                }}
                key={d.date}
              >
                <Pressable
                  style={{
                    ...styles.touchableBox,
                    ...(d.offer || !d.isCurrentMonth ? {} : styles.noOfferDay),
                    ...(d.isCurrentMonth ? {} : styles.otherMonthDay),
                    ...(d.today && d.isCurrentMonth
                      ? styles.todayBackground
                      : {}),
                    ...(selectedDate === d.date && d.isCurrentMonth
                      ? styles.selectedDay
                      : {}),
                  }}
                  onPress={() => handleDayPress(d)}
                >
                  <View style={styles.dayBox}>
                    {d.isCurrentMonth && (
                      <ThemedText
                        style={{
                          ...styles.dayText,
                          ...(d.today ? { fontWeight: "bold", color: colorTheme.primary } : {}),
                          ...(d.isCurrentMonth ? {} : styles.otherMonthText),
                          ...(selectedDate === d.date ? { color: colorTheme.text.white, fontWeight: "bold" } : {}),
                        }}
                      >
                        {d.day}
                      </ThemedText>
                    )}
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Selected date display */}
      {selectedDayInfo && (
        <View style={styles.selectedDateContainer}>
          <ThemedText style={styles.selectedDateText}>
            {selectedDayInfo.text}
          </ThemedText>
          <Pressable
            style={[
              styles.orderButton,
              !selectedDayInfo.isAvailable && styles.orderButtonDisabled
            ]}
            onPress={selectedDayInfo.isAvailable ? handleOrder : undefined}
            disabled={!selectedDayInfo.isAvailable}
          >
            <ThemedText style={[
              styles.orderButtonText,
              !selectedDayInfo.isAvailable && styles.orderButtonTextDisabled
            ]}>
              Zamów
            </ThemedText>
          </Pressable>
          {!selectedDayInfo.isAvailable && (
            <ThemedText style={styles.noOfferText}>
              brak oferty
            </ThemedText>
          )}
        </View>
      )}

      {/* Popup Modal */}
      <Modal
        transparent={true}
        visible={popup.visible}
        animationType="fade"
        onRequestClose={() => setPopup(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.popupOverlay}>
          <View style={[
            styles.popupContainer,
            popup.type === 'success' ? styles.popupSuccess : styles.popupError
          ]}>
            <ThemedText style={styles.popupText}>
              {popup.message}
            </ThemedText>
            <Pressable
              style={styles.popupButton}
              onPress={() => setPopup(prev => ({ ...prev, visible: false }))}
            >
              <ThemedText style={styles.popupButtonText}>OK</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  status: {
    position: "absolute",
    borderRadius: 5,
    width: 15,
    aspectRatio: 1,
  },
  unavailable: {
    opacity: 0.5,
  },
  ordered: {
    top: -3,
    right: -3,
    backgroundColor: colorTheme.primaryLight,
  },
  orderedUnpaid: {
    top: -3,
    right: -3,
    backgroundColor: colorTheme.warning,
  },
  cancelled: {
    bottom: -3,
    left: -3,
    backgroundColor: colorTheme.border.muted,
  },
  added: {
    bottom: -3,
    right: -3,
    backgroundColor: colorTheme.primary,
  },
  orderedText: {
    fontSize: 10,
    textAlign: "center",
    fontFamily: "poppins-bold",
    color: colorTheme.text.white,
  },
  days: {
    marginVertical: 2,
    marginHorizontal: 2,
    alignSelf: "stretch",
  },
  weekHeader: {
    flexDirection: "row",
  },
  weekRow: {
    flexDirection: "row",
  },
  dayText: {
    textAlign: "center",
    fontSize: 13,
    color: colorTheme.text.primary,
  },
  weekDayName: {
    textAlign: "center",
    color: colorTheme.text.muted,
    fontFamily: "poppins-bold",
    textTransform: "uppercase",
    fontSize: 8,
  },
  selectedDay: {
    backgroundColor: colorTheme.primary,
    borderColor: colorTheme.primary,
  },
  today: {
    color: colorTheme.text.secondary,
  },
  todayBackground: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: colorTheme.primary,
  },
  touchableBox: {
    backgroundColor: colorTheme.background.light,
    aspectRatio: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colorTheme.border.light,
    justifyContent: "center",
  },
  dayBox: {
    justifyContent: "center",
    marginHorizontal: 0,
  },
  otherMonthDay: {
    backgroundColor: colorTheme.background.lighter,
    borderColor: colorTheme.border.lighter,
    opacity: 0.4,
  },
  noOfferDay: {
    opacity: 0.4,
  },
  otherMonthText: {
    color: colorTheme.text.disabled,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  monthTitle: {
    flex: 1,
    alignItems: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  navButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: colorTheme.background.lighter,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  navArrow: {
    fontSize: 18,
    fontWeight: "bold",
    color: colorTheme.text.primary,
  },
  selectedDateContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colorTheme.background.light,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: colorTheme.text.primary,
  },
  orderButton: {
    backgroundColor: colorTheme.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  orderButtonDisabled: {
    backgroundColor: colorTheme.background.disabled,
  },
  orderButtonText: {
    color: colorTheme.text.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  orderButtonTextDisabled: {
    color: colorTheme.text.disabled,
  },
  noOfferText: {
    fontSize: 14,
    color: colorTheme.text.muted,
    marginTop: 8,
    textAlign: "center",
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popupContainer: {
    backgroundColor: colorTheme.text.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  popupSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  popupError: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  popupText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: colorTheme.text.primary,
    fontFamily: "poppins-bold",
    lineHeight: 22,
  },
  popupButton: {
    backgroundColor: colorTheme.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
  },
  popupButtonText: {
    color: colorTheme.text.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
