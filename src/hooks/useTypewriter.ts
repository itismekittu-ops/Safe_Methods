import { useEffect, useState } from 'react';

interface Options {
  paused?: boolean;
  reduced?: boolean;
}

export function useTypewriter(phrases: string[], { paused = false, reduced = false }: Options = {}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(reduced ? phrases[0] : '');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (paused || phrases.length === 0) return;
    const phrase = phrases[index];
    let timer: ReturnType<typeof setTimeout>;

    if (reduced) {
      if (text !== phrase) setText(phrase);
      timer = setTimeout(() => setIndex((index + 1) % phrases.length), 3200);
      return () => clearTimeout(timer);
    }

    if (!deleting && text.length < phrase.length) {
      timer = setTimeout(() => setText(phrase.slice(0, text.length + 1)), 55);
    } else if (!deleting) {
      timer = setTimeout(() => setDeleting(true), 1700);
    } else if (text.length > 0) {
      timer = setTimeout(() => setText(phrase.slice(0, text.length - 1)), 26);
    } else {
      timer = setTimeout(() => {
        setDeleting(false);
        setIndex((index + 1) % phrases.length);
      }, 250);
    }
    return () => clearTimeout(timer);
  }, [text, deleting, index, paused, reduced, phrases]);

  return text;
}