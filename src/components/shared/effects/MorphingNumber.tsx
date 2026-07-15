import { useEffect, useState } from 'react';

interface MorphingDigitProps {
  digit: string;
  delay?: number;
  trigger: boolean;
}

function MorphingDigit({ digit, delay = 0, trigger }: MorphingDigitProps) {
  const [currentDigit, setCurrentDigit] = useState('0');
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setCurrentDigit('0');
      return;
    }

    const target = parseInt(digit);
    if (isNaN(target)) {
      setCurrentDigit(digit);
      return;
    }

    const timeout = setTimeout(() => {
      let steps = 0;
      const maxSteps = 12 + Math.floor(Math.random() * 8);
      
      const interval = setInterval(() => {
        steps++;
        
        if (steps >= maxSteps) {
          setCurrentDigit(digit);
          setIsGlowing(true);
          setTimeout(() => setIsGlowing(false), 500);
          clearInterval(interval);
        } else {
          setCurrentDigit(String(Math.floor(Math.random() * 10)));
        }
      }, 40 + Math.random() * 25);
      
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [trigger, digit, delay]);

  return (
    <span className={`inline-block font-mono font-black tabular-nums ${
      isGlowing 
        ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' 
        : 'text-white'
    }`}>
      {currentDigit}
    </span>
  );
}

interface MorphingNumberProps {
  value: number;
  trigger: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function MorphingNumber({
  value,
  trigger,
  prefix = '',
  suffix = '',
  className = '',
}: MorphingNumberProps) {
  const digits = value.toLocaleString('pt-BR').split('');

  return (
    <div className={`inline-flex items-baseline ${className}`}>
      {prefix && (
        <span className="text-emerald-500 mr-1 text-lg">{prefix}</span>
      )}
      
      {digits.map((digit, i) => (
        digit === ',' || digit === '.' ? (
          <span key={i} className="text-white font-mono font-black">{digit}</span>
        ) : (
          <MorphingDigit key={i} digit={digit} delay={i * 60} trigger={trigger} />
        )
      ))}
      
      {suffix && (
        <span className="text-emerald-500 ml-1 text-lg font-bold">{suffix}</span>
      )}
    </div>
  );
}