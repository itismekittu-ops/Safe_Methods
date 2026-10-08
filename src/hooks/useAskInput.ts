import { useCallback, useEffect, useRef, useState } from 'react';

export type AskStatus = 'idle' | 'error' | 'sending' | 'sent';

export function useAskInput(reduced: boolean, onAsk: (question: string) => void) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<AskStatus>('idle');
  const [submitted, setSubmitted] = useState('');
  const [isAutoTyping, setIsAutoTyping] = useState(false);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopTyping = useCallback(() => {
    if (typingRef.current) clearInterval(typingRef.current);
    typingRef.current = null;
    setIsAutoTyping(false);
  }, []);

  useEffect(() => stopTyping, [stopTyping]);

  const autoType = useCallback(
    (question: string) => {
      stopTyping();
      setStatus('idle');
      onAsk(question);
      if (reduced) {
        setValue(question);
        return;
      }
      let i = 0;
      setValue('');
      setIsAutoTyping(true);
      typingRef.current = setInterval(() => {
        i += 1;
        setValue(question.slice(0, i));
        if (i >= question.length) stopTyping();
      }, 32);
    },
    [reduced, stopTyping, onAsk]
  );

  const onChange = (next: string) => {
    stopTyping();
    if (status === 'error' || status === 'sent') setStatus('idle');
    setValue(next);
  };

  const submit = () => {
    const question = value.trim();
    if (!question) {
      setStatus('error');
      inputRef.current?.focus();
      return;
    }
    stopTyping();
    setSubmitted(question);
    setStatus('sent');
    setValue('');
    onAsk(question);
  };

  return { value, status, submitted, isAutoTyping, inputRef, autoType, onChange, submit };
}