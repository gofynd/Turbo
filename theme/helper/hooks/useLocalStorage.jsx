import { useState, useEffect } from "react";

const getSafeLocalStorage = () => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

export function useLocalStorage(key, initialValue, callback) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    const storage = getSafeLocalStorage();
    if (!storage) return;

    try {
      const item = storage.getItem(key);
      if (item !== null) {
        const value = JSON.parse(item);
        setStoredValue(value);
        callback?.(value);
      } else {
        callback?.();
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
  }, []);

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      const storage = getSafeLocalStorage();
      if (!storage) return;

      storage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
