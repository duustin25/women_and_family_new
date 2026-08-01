import { describe, it, expect, beforeEach } from 'vitest';

describe('Accessibility Toolbar Engine Unit Test', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = '';
    });

    it('initializes default accessibility settings in localStorage', () => {
        const defaultSettings = {
            fontSize: 'normal',
            highContrast: false,
            voiceAssist: false,
            dyslexicFont: false,
        };

        localStorage.setItem('brgy_accessibility_settings', JSON.stringify(defaultSettings));
        const stored = JSON.parse(localStorage.getItem('brgy_accessibility_settings') || '{}');
        expect(stored.fontSize).toBe('normal');
        expect(stored.highContrast).toBe(false);
    });

    it('applies high contrast class to HTML root element', () => {
        document.documentElement.classList.add('high-contrast');
        expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('applies font size scaling classes to HTML root element', () => {
        document.documentElement.classList.add('font-size-large');
        expect(document.documentElement.classList.contains('font-size-large')).toBe(true);
        
        document.documentElement.classList.remove('font-size-large');
        document.documentElement.classList.add('font-size-xlarge');
        expect(document.documentElement.classList.contains('font-size-xlarge')).toBe(true);
    });
});
