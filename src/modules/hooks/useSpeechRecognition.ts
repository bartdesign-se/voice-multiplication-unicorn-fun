
import { useState, useCallback, useEffect } from 'react';

interface UseSpeechRecognitionProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = (language: string, props?: UseSpeechRecognitionProps) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasReceivedResult, setHasReceivedResult] = useState(false);
  const [isSecondAttempt, setIsSecondAttempt] = useState(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = language;
      setRecognition(recognitionInstance);
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognition) return;

    setHasReceivedResult(false);
    setIsSecondAttempt(false);
    setIsListening(true);

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      if (!hasReceivedResult && !isSecondAttempt) {
        setIsSecondAttempt(true);
        setTimeout(() => startListening(), 100);
      }
    };

    recognition.onresult = (event) => {
      setHasReceivedResult(true);
      const result = event.results[0][0].transcript.trim().toLowerCase();
      props?.onResult?.(result);
    };

    recognition.onerror = (event) => {
      props?.onError?.(event.error);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
    }
  }, [recognition, hasReceivedResult, isSecondAttempt, props]);

  return { startListening, isListening };
};
