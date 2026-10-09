import { useCallback, useEffect, useRef, useState } from 'react';

const TYPE_SPEED = 24;

export function useAskInput(reduced: boolean, onSend: (text: string) => void) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'auto_typing' | 'sent'>('idle');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const onChange = useCallback((v: string) => {
    if (status === 'auto_typing' && timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setValue(v);
    setStatus('idle');
  }, [status]);

  const submit = useCallback((override?: string) => {
    const text = typeof override === 'string' && override.trim().length > 0 
      ? override.trim() 
      : value.trim();

    if (!text) return;

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setSubmitted(text);
    setStatus('sent');
    setValue('');
    onSend(text);
  }, [value, onSend]);

  const autoType = useCallback((question: string) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    if (reduced) {
      setValue(question);
      submit(question);
      return;
    }

    setStatus('auto_typing');
    setValue('');
    let idx = 0;

    const step = () => {
      idx += 1;
      setValue(question.slice(0, idx));
      if (idx < question.length) {
        timerRef.current = window.setTimeout(step, TYPE_SPEED);
      } else {
        timerRef.current = window.setTimeout(() => {
          submit(question);
        }, 120);
      }
    };

    timerRef.current = window.setTimeout(step, TYPE_SPEED);
  }, [reduced, submit]);

  return {
    value,
    status,
    submitted,
    inputRef,
    onChange,
    submit,
    autoType,
  };
}