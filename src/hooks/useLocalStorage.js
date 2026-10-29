import { useState, useEffect, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const fallback = () =>
      initialValue instanceof Function ? initialValue() : initialValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return fallback();
      const parsed = JSON.parse(item);
      // guard against "null" or a wrong type (e.g. object instead of array)
      if (
        parsed === null ||
        Array.isArray(parsed) !== Array.isArray(fallback())
      )
        return fallback();
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return fallback();
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const setValue = useCallback((value) => {
    setStoredValue((prev) => (value instanceof Function ? value(prev) : value));
  }, []);

  return [storedValue, setValue];
}
