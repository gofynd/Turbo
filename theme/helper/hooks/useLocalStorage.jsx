import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue, callback) {
  const [storedValue, setStoredValue] = useState(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const value = JSON.parse(item);
        setStoredValue(value);
        callback?.(value);
      } else {
        callback?.()
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
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
