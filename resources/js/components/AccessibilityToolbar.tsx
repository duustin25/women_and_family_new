import { useState } from 'react';
import { useAccessibilityMode } from '@/hooks/use-accessibility-mode';
import { Volume2, VolumeX, Eye, Type, RotateCcw, Accessibility, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function AccessibilityToolbar() {
    const { settings, updateSetting, resetAccessibility, speak } = useAccessibilityMode();
    const [isOpen, setIsOpen] = useState(false);

    const handleSpeakNotice = (label: string) => {
        if (settings.voiceAssist) {
            speak(label);
        }
    };

    return (
        <div id="accessibility-toolbar-container" className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 font-sans" role="region" aria-label="Accessibility Options">
            {/* Main Accessibility Trigger Button */}
            <button
                onClick={() => {
                    const newState = !isOpen;
                    setIsOpen(newState);
                    handleSpeakNotice(newState ? "Accessibility Menu Opened" : "Accessibility Menu Closed");
                }}
                onFocus={() => handleSpeakNotice("Accessibility Menu Button. Press enter to open menu.")}
                className="flex items-center gap-2 bg-purple-900 hover:bg-purple-950 text-white border-2 border-purple-400/80 font-bold px-3 py-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-purple-300 focus-visible:outline-none min-h-[44px] min-w-[44px]"
                aria-expanded={isOpen}
                aria-label="Toggle Accessibility Menu"
            >
                <span className="hidden sm:inline text-sm uppercase tracking-wider font-extrabold text-white">
                    Accessibility
                </span>
                {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>

            {/* Expanded Accessibility Panel */}
            {isOpen && (
                <div
                    id="accessibility-toolbar-panel"
                    className="fixed bottom-20 left-3 right-3 sm:left-6 sm:right-auto sm:w-96 max-w-[calc(100vw-1.5rem)] bg-slate-900 text-white border-2 border-purple-500/40 rounded-2xl shadow-2xl p-4 sm:p-5 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 max-h-[75vh] overflow-y-auto"
                    role="dialog"
                    aria-label="Accessibility Settings"
                >
                    <div className="flex items-center justify-between border-b border-purple-800/50 pb-3 mb-4">
                        <div className="flex items-center gap-2 text-purple-300 font-extrabold text-base">
                            <span>Accessibility Settings</span>
                        </div>
                        <button
                            onClick={resetAccessibility}
                            onFocus={() => handleSpeakNotice("Reset Accessibility Settings")}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors py-1 px-2 rounded hover:bg-slate-800"
                            title="Reset all settings"
                        >
                            <RotateCcw size={14} /> Reset
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* 1. Voice Assist (Text-to-Speech) Toggle */}
                        <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-purple-900/40">
                            <div className="flex items-center gap-3">
                                {settings.voiceAssist ? (
                                    <Volume2 className="text-purple-400 shrink-0" size={22} />
                                ) : (
                                    <VolumeX className="text-slate-400 shrink-0" size={22} />
                                )}
                                <div>
                                    <div className="text-sm font-bold text-slate-100">Voice Assist</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const next = !settings.voiceAssist;
                                    updateSetting('voiceAssist', next);
                                    if (next) {
                                        speak("Voice Assist Activated. Elements will be read aloud when focused.");
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] min-w-[60px] ${settings.voiceAssist
                                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                aria-label="Toggle Voice Reader"
                            >
                                {settings.voiceAssist ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        {/* 2. Text Resizing */}
                        <div className="bg-slate-800/80 p-3 rounded-xl border border-purple-900/40 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                                <Type size={18} className="text-purple-400" />
                                <span>Text Size</span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                {(
                                    [
                                        { id: 'normal', label: 'Normal' },
                                        { id: 'large', label: 'Large' },
                                        { id: 'xlarge', label: 'X-Large' },
                                    ] as const
                                ).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            updateSetting('fontSize', item.id);
                                            handleSpeakNotice(`Text size set to ${item.label}`);
                                        }}
                                        onFocus={() => handleSpeakNotice(`Text size option: ${item.label}`)}
                                        className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-lg border transition-all min-h-[44px] flex items-center justify-center text-center leading-tight ${settings.fontSize === item.id
                                            ? 'bg-purple-600 text-white border-purple-400 ring-2 ring-purple-400'
                                            : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. High Contrast Mode */}
                        <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-purple-900/40">
                            <div className="flex items-center gap-3">
                                <Eye className={settings.highContrast ? "text-purple-400" : "text-slate-400"} size={22} />
                                <div>
                                    <div className="text-sm font-bold text-slate-100">High Contrast Mode</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const next = !settings.highContrast;
                                    updateSetting('highContrast', next);
                                    handleSpeakNotice(next ? "High Contrast Mode Enabled" : "High Contrast Mode Disabled");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] min-w-[60px] ${settings.highContrast
                                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                aria-label="Toggle High Contrast Mode"
                            >
                                {settings.highContrast ? 'ON' : 'OFF'}
                            </button>
                        </div>

                        {/* 4. Dyslexic Friendly Font */}
                        <div className="flex items-center justify-between bg-slate-800/80 p-3 rounded-xl border border-purple-900/40">
                            <div className="flex items-center gap-3">
                                <Type className={settings.dyslexicFont ? "text-purple-400" : "text-slate-400"} size={22} />
                                <div>
                                    <div className="text-sm font-bold text-slate-100">Dyslexia Font</div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const next = !settings.dyslexicFont;
                                    updateSetting('dyslexicFont', next);
                                    handleSpeakNotice(next ? "Dyslexic Font Enabled" : "Dyslexic Font Disabled");
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[44px] min-w-[60px] ${settings.dyslexicFont
                                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                aria-label="Toggle Dyslexic Font"
                            >
                                {settings.dyslexicFont ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
