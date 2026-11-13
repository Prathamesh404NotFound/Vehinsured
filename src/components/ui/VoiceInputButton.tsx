import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { startVoiceRecognition, isWebSpeechSupported } from '../../services/speech/voiceService';
import { useTranslation } from '../../features/i18n/context';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, className = '' }) => {
  const { language, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isWebSpeechSupported()) {
    return null; // Gracefully hidden if Web Speech API unavailable
  }

  const handleToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setErrorMsg(null);
    setIsListening(true);

    startVoiceRecognition({
      language,
      onResult: (text) => {
        onTranscript(text);
      },
      onError: (msg) => {
        setErrorMsg(msg);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        title={isListening ? t('btn.listening') : t('btn.speak')}
        className={`p-1.5 rounded-md transition-colors ${
          isListening
            ? 'bg-red-100 text-red-600 animate-pulse'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
        }`}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      {errorMsg && (
        <span className="absolute bottom-full left-0 mb-1 z-10 w-48 p-1.5 text-xs bg-red-800 text-white rounded-md shadow-lg">
          {errorMsg}
        </span>
      )}
    </div>
  );
};
