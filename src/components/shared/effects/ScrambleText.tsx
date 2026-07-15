import { useEffect, useRef, useState } from 'react';

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`\\';

interface ScrambleTextProps {
  text: string;
  trigger: boolean;
  className?: string;
}

export function ScrambleText({ text, trigger, className = '' }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(text);
      return;
    }

    const startTime = Date.now();
    const textLength = text.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / 600, 1);
      let result = '';

      for (let i = 0; i < textLength; i++) {
        const charProgress = Math.max(0, progress * textLength - i);
        
        if (charProgress >= 1) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(result);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [trigger, text]);

  return <span className={className}>{displayText}</span>;
}