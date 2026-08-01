import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';

export interface AccessibilitySettings {
    fontSize: FontSize;
    highContrast: boolean;
    voiceAssist: boolean;
    dyslexicFont: boolean;
}

const STORAGE_KEY = 'brgy_accessibility_settings';

const defaultSettings: AccessibilitySettings = {
    fontSize: 'normal',
    highContrast: false,
    voiceAssist: false,
    dyslexicFont: false,
};

export function useAccessibilityMode() {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : defaultSettings;
        } catch {
            return defaultSettings;
        }
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Failed to save accessibility settings:', e);
        }

        // Apply HTML class modifications
        const root = document.documentElement;

        // Font scaling
        root.classList.remove('font-size-large', 'font-size-xlarge');
        if (settings.fontSize === 'large') root.classList.add('font-size-large');
        if (settings.fontSize === 'xlarge') root.classList.add('font-size-xlarge');

        // High contrast
        if (settings.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // Dyslexic font
        if (settings.dyslexicFont) {
            root.classList.add('dyslexic-font');
        } else {
            root.classList.remove('dyslexic-font');
        }
    }, [settings]);

    // Speech Synthesis helper
    const speak = useCallback((text: string) => {
        if (!settings.voiceAssist || !('speechSynthesis' in window)) return;

        // Cancel ongoing speech to avoid queueing delays
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Slightly slower for elderly / hard of hearing
        utterance.pitch = 1.0;
        utterance.lang = 'en-US'; // Works for Tagalog/English mix in Web Speech API

        window.speechSynthesis.speak(utterance);
    }, [settings.voiceAssist]);

    const updateSetting = <K extends keyof AccessibilitySettings>(
        key: K,
        value: AccessibilitySettings[K]
    ) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetAccessibility = () => {
        setSettings(defaultSettings);
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    return {
        settings,
        updateSetting,
        resetAccessibility,
        speak,
    };
}
