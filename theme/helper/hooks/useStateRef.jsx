import { useState, useRef, useCallback } from 'react';

export const useStateRef = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const ref = useRef(state);

  const setValue = useCallback((value) => {
    ref.current = value;
    setState(value);
  }, []);

  return [state, setValue, ref];
}