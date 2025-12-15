import { useState, useEffect, useRef } from 'react';

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    function updateProgress() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;

      setProgress(Math.min(100, Math.max(0, progress)));
      setReadingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }

    updateProgress();
    window.addEventListener('scroll', updateProgress);
    const interval = setInterval(updateProgress, 1000);

    return () => {
      window.removeEventListener('scroll', updateProgress);
      clearInterval(interval);
    };
  }, []);

  return { progress, readingTime };
}
