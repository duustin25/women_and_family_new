import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Smartphone } from 'lucide-react';
import Chatbot from '@/components/Chatbot';
import { cn } from '@/lib/utils';
import { Transition } from '@headlessui/react';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            <Transition
                show={isOpen}
                enter="transition ease-out duration-300 transform"
                enterFrom="opacity-0 translate-y-8 scale-95"
                enterTo="opacity-100 translate-y-0 scale-100"
                leave="transition ease-in duration-200 transform"
                leaveFrom="opacity-100 translate-y-0 scale-100"
                leaveTo="opacity-0 translate-y-8 scale-95 ml-auto"
            >
                <div className="w-[calc(100vw-2rem)] sm:w-[380px] h-[600px] max-h-[80vh] shadow-2xl rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 pointer-events-auto">
                    <Chatbot className="h-full w-full border-0 rounded-none shadow-none" />
                </div>
            </Transition>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-all duration-300 pointer-events-auto relative group",
                    isOpen
                        ? "bg-slate-900 hover:bg-slate-800 text-white rotate-90"
                        : "bg-gradient-to-r from-[#6b21a8] to-[#7c3aed] text-white hover:scale-110 hover:shadow-[#6b21a8]/50"
                )}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <>
                        <MessageSquare className="h-7 w-7 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0 absolute" />
                        <span className="text-xs font-bold scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                            CHAT
                        </span>
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    </>
                )}
            </Button>
        </div>
    );
}
