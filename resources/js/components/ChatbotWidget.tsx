import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { MessageSquare, X, AlertCircle, Phone } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import Chatbot from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ChatbotWidget() {
    const { props } = usePage<any>();
    // Default to true unless explicitly toggled off by admin in system settings
    const isChatbotEnabled = props.chatbot_enabled ?? true;
    const [isOpen, setIsOpen] = useState(false);

    const brgyNum = import.meta.env.VITE_HOTLINE_BRGY || "Emergency: 911";

    // Close on Escape key press for keyboard & screen reader accessibility
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 flex flex-col items-end gap-2.5 pointer-events-none">
            <Transition
                show={isOpen}
                as="div"
                className="w-full sm:w-auto flex justify-end"
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 translate-y-3 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-150 transform"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-3 scale-95"
            >
                <div className={cn(
                    "w-full sm:w-[380px] shadow-2xl rounded-2xl overflow-hidden border border-border/80 pointer-events-auto bg-card text-card-foreground",
                    isChatbotEnabled
                        ? "h-[min(520px,calc(100dvh-5.5rem))] sm:h-[560px]"
                        : "h-auto max-h-[calc(100dvh-5.5rem)]"
                )}>
                    {isChatbotEnabled ? (
                        <Chatbot
                            className="h-full w-full border-0 rounded-none shadow-none"
                            onClose={() => setIsOpen(false)}
                        />
                    ) : (
                        <div className="p-4 sm:p-5 flex flex-col gap-3.5 bg-card text-card-foreground">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-border/70 pb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
                                        <AlertCircle size={18} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm sm:text-base text-foreground leading-tight">Helpdesk Offline</h3>
                                        <p className="text-[11px] text-muted-foreground">Maintenance Notice</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
                                    aria-label="Close Notice"
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Body Content */}
                            <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                <p className="bg-muted/50 p-3 rounded-xl border border-border/60 text-foreground font-medium text-xs sm:text-sm">
                                    The virtual helpdesk is temporarily undergoing routine system maintenance.
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    For urgent inquiries, statutory assistance, or emergency reporting, please contact our Barangay Emergency Desk:
                                </p>
                                
                                <a
                                    href={`tel:${brgyNum}`}
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all text-xs sm:text-sm"
                                >
                                    <Phone size={15} />
                                    <span>Call Hotline: {brgyNum}</span>
                                </a>
                            </div>

                            {/* Footer */}
                            <div className="text-center text-[10.5px] text-muted-foreground border-t border-border/70 pt-2.5">
                                Barangay 183 Women & Family Protection Office
                            </div>
                        </div>
                    )}
                </div>
            </Transition>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-12 w-12 sm:h-13 sm:w-13 rounded-full shadow-lg transition-all duration-200 pointer-events-auto relative cursor-pointer border border-border/40",
                    isOpen
                        ? "bg-muted text-foreground hover:bg-muted/80 shadow-md"
                        : isChatbotEnabled
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:scale-105 active:scale-95"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                )}
                aria-label={isOpen ? "Close Villa-Bot Helpdesk" : "Open Villa-Bot Helpdesk"}
                title={isOpen ? "Close Villa-Bot" : "Open Villa-Bot Helpdesk"}
            >
                {isOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <>
                        <MessageSquare className="h-5 w-5" />
                        <span className={`absolute -top-0.5 -right-0.5 h-3 w-3 ${isChatbotEnabled ? 'bg-emerald-500' : 'bg-amber-400'} rounded-full border-2 border-background`} />
                    </>
                )}
            </Button>
        </div>
    );
}
