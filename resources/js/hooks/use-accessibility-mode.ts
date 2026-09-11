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

        if (!text || text.trim().length === 0) return;

        const utterance = new SpeechSynthesisUtterance(text.trim());
        utterance.rate = 0.95; // Slightly slower for elderly / hard of hearing
        utterance.pitch = 1.0;
        utterance.lang = 'en-US'; // Works for Tagalog/English mix in Web Speech API

        window.speechSynthesis.speak(utterance);
    }, [settings.voiceAssist]);

    // Global listener for Voice Assist: Tab (focusin), Hover (mouseover debounce), and Escape (stop speech)
    useEffect(() => {
        if (!settings.voiceAssist || typeof window === 'undefined') return;

        const extractAccessibleText = (el: HTMLElement | null): string => {
            if (!el) return '';

            // 1. Explicit ARIA label
            const ariaLabel = el.getAttribute('aria-label');
            if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

            // 2. Explicit ARIA description
            const ariaDescription = el.getAttribute('aria-description');
            if (ariaDescription && ariaDescription.trim()) return ariaDescription.trim();

            // 3. Tooltip / Title
            const title = el.getAttribute('title');
            if (title && title.trim()) return title.trim();

            // 4. Image alt text
            if (el instanceof HTMLImageElement && el.alt) {
                return `Image: ${el.alt.trim()}`;
            }

            // 5. Input, Select, Textarea elements
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
                if (el.id) {
                    const label = document.querySelector(`label[for="${el.id}"]`);
                    if (label && label.textContent) {
                        return `${label.textContent.trim()} input`;
                    }
                }
                const placeholder = (el as HTMLInputElement).placeholder;
                if (placeholder) return `Input field: ${placeholder}`;
                return 'Input field';
            }

            // 6. Text content
            const rawText = el.innerText || el.textContent || '';
            const cleanText = rawText.replace(/\s+/g, ' ').trim();
            if (!cleanText) return '';

            // Cap extremely long text blocks to first sentence or 200 characters to prevent endless reading
            const truncatedText = cleanText.length > 200 ? cleanText.slice(0, 200) + '...' : cleanText;

            if (el.tagName === 'A') return `Link: ${truncatedText}`;
            if (el.tagName === 'BUTTON') return `Button: ${truncatedText}`;
            if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) return `Heading: ${truncatedText}`;

            return truncatedText;
        };

        // 1. Keyboard Tab / Focus listener
        const handleFocusIn = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            if (!target) return;
            const textToSpeak = extractAccessibleText(target);
            if (textToSpeak) {
                speak(textToSpeak);
            }
        };

        // 2. Mouse Hover listener with 300ms debounce
        let hoverTimer: ReturnType<typeof setTimeout> | null = null;
        let lastTarget: HTMLElement | null = null;

        const handleMouseOver = (e: MouseEvent) => {
            const target = (e.target as HTMLElement)?.closest?.('a, button, [role="button"], h1, h2, h3, h4, h5, h6, p, label, li, [tabindex="0"], [aria-label]') as HTMLElement || (e.target as HTMLElement);
            if (!target || target === lastTarget) return;

            if (hoverTimer) clearTimeout(hoverTimer);

            hoverTimer = setTimeout(() => {
                lastTarget = target;
                const textToSpeak = extractAccessibleText(target);
                if (textToSpeak) {
                    speak(textToSpeak);
                }
            }, 300);
        };

        const handleMouseOut = () => {
            if (hoverTimer) clearTimeout(hoverTimer);
        };

        // 3. Escape key to immediately cancel speech
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };

        document.addEventListener('focusin', handleFocusIn, true);
        document.addEventListener('mouseover', handleMouseOver, true);
        document.addEventListener('mouseout', handleMouseOut, true);
        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            if (hoverTimer) clearTimeout(hoverTimer);
            document.removeEventListener('focusin', handleFocusIn, true);
            document.removeEventListener('mouseover', handleMouseOver, true);
            document.removeEventListener('mouseout', handleMouseOut, true);
            document.removeEventListener('keydown', handleKeyDown, true);
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, [settings.voiceAssist, speak]);

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
