import { useState } from "react";

export const useLocalStorage = (
  key: string,
  initialValue: string
): [string, (s: string) => void] => {
  const [storedValue, setStoredValue] = useState<string>(() => {
    const item = window.localStorage.getItem(key);
    return item ?? initialValue;
  });
  const setValue = (value: string): void => {
    setStoredValue(value);
    window.localStorage.setItem(key, value);
  };
  return [storedValue, setValue];
};
//YY
