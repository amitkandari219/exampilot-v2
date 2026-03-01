import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FOCUS_MODE_KEY = 'examPilot:focusMode';

export function useFocusMode() {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(FOCUS_MODE_KEY).then((value) => {
      if (value === 'true') setIsActive(true);
    });
  }, []);

  const toggle = useCallback(async () => {
    const newValue = !isActive;
    setIsActive(newValue);
    await AsyncStorage.setItem(FOCUS_MODE_KEY, String(newValue));
  }, [isActive]);

  return { isActive, toggle };
}
