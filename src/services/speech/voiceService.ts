import { SupportedLanguage } from '../../types';

export function isWebSpeechSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export interface VoiceRecognitionOptions {
  language: SupportedLanguage;
  onResult: (transcript: string) => void;
  onError: (errorMsg: string) => void;
  onEnd: () => void;
}

export function startVoiceRecognition(options: VoiceRecognitionOptions): { stop: () => void } | null {
  if (!isWebSpeechSupported()) {
    options.onError('Voice speech recognition is not supported in this browser.');
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Map application language to BCP 47 locale codes
  const langMap: Record<SupportedLanguage, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
  };

  recognition.lang = langMap[options.language] || 'en-IN';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    options.onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    options.onError(`Speech recognition error: ${event.error || 'Unknown'}`);
  };

  recognition.onend = () => {
    options.onEnd();
  };

  try {
    recognition.start();
  } catch (e: any) {
    options.onError(`Failed to start microphone listener: ${e.message || e}`);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {}
    },
  };
}
