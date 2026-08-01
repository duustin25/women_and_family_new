import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, AlertTriangle, Phone } from 'lucide-react';
import Chatbot from '@/components/Chatbot';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';

export default function ChatbotWidget() {
    const { props } = usePage<any>();
    // Default to true unless explicitly toggled off by admin in system settings
    const isChatbotEnabled = props.chatbot_enabled ?? true;
    const [isOpen, setIsOpen] = useState(false);

    const brgyNum = import.meta.env.VITE_HOTLINE_BRGY || "Emergency: 911";

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            <Transition
                show={isOpen}
                enter="transition ease-out duration-300 transform"
                enterFrom="opacity-0 translate-y-8 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-200 transform"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-8 scale-95 ml-auto"
            >
                <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[600px] max-h-[80vh] shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 pointer-events-auto bg-slate-900 text-white">
                    {isChatbotEnabled ? (
                        <Chatbot className="h-full w-full border-0 rounded-none shadow-none" />
                    ) : (
                        <div className="h-full flex flex-col justify-between p-6 bg-slate-950 text-slate-100">
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-base text-white">AI Assistant Maintenance</h3>
                                            <p className="text-xs text-slate-400">Temporary Service Status</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="text-slate-400 hover:text-white transition-colors p-1"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4 text-sm leading-relaxed text-slate-300">
                                    <p className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                        The AI Chatbot Assistant is currently undergoing routine maintenance or AI service optimization.
                                    </p>
                                    <p>
                                        For urgent inquiries, assistance, or reporting emergency incidents, please contact our Barangay Emergency Desk directly:
                                    </p>
                                    
                                    <a
                                        href={`tel:${brgyNum}`}
                                        className="flex items-center justify-center gap-3 bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all border border-purple-400/40"
                                    >
                                        <Phone size={18} className="animate-bounce" />
                                        <span>Call Hotline: {brgyNum}</span>
                                    </a>
                                </div>
                            </div>

                            <div className="text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
                                Barangay Women & Family Office Desk
                            </div>
                        </div>
                    )}
                </div>
            </Transition>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-all duration-300 pointer-events-auto relative group focus-visible:ring-4 focus-visible:ring-purple-400",
                    isOpen
                        ? "bg-slate-900 hover:bg-slate-800 text-white rotate-90"
                        : isChatbotEnabled
                        ? "bg-gradient-to-r from-[#6b21a8] to-[#7c3aed] text-white hover:scale-110 hover:shadow-[#6b21a8]/50"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                )}
                aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <>
                        <MessageSquare className="h-7 w-7 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0 absolute" />
                        <span className="text-xs font-bold scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                            CHAT
                        </span>
                        <span className={`absolute -top-1 -right-1 h-3 w-3 ${isChatbotEnabled ? 'bg-green-500 animate-pulse' : 'bg-amber-400'} rounded-full border-2 border-white`} />
                    </>
                )}
            </Button>
        </div>
    );
}
