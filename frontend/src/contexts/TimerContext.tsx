import { createContext } from 'react';

interface TimerSettings {
  focusTime: number;
  breakTime: number;
  longBreakTime: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  volume: number;
}

interface TimerContextType {
  settings: TimerSettings;
  setSettings: (settings: TimerSettings) => void;
}

export const TimerSettingsContext = createContext<TimerContextType>({
  settings: {
    focusTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    volume: 80,
  },
  setSettings: () => {},
});