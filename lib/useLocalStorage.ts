"use client";

import { useState } from "react";

function readValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return initialValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(error);
    return initialValue;
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => readValue(key, initialValue));

  const setValue = (value: T | ((value: T) => T)) => {
    setStoredValue((prev) => {
      try {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      } catch (error) {
        console.error(error);
        return prev;
      }
    });
  };

  return [storedValue, setValue] as const;
}
