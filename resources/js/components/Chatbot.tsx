import axios from 'axios';
import { Send, User, RefreshCcw, MessageSquare, X, Info } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

const SUGGESTIONS = [
    "How to file a VAWC case?",
    "Report child protection concern",
    "Nutrition Program",
    "Latest Announcements",
    "Barangay Officials",
    "Emergency Hotlines",
    "What is RA 9262?",
    "Accredited Organizations"
];

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/70 dark:bg-muted/40 rounded-2xl w-fit">
        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
    </div>
);

interface ChatbotProps {
    className?: string;
    onClose?: () => void;
}

export default function Chatbot({ className, onClose }: ChatbotProps) {
    const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: "Magandang araw! Welcome to the Women & Family Helpdesk.\n\nI can assist you with public procedures, office schedules, filing requirements, officials directory, and barangay hotlines.\n\nHow may I help you today?",
        timestamp: new Date()
    };

    const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEngineOffline, setIsEngineOffline] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, currentSuggestions]);

    const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
        if (e) e.preventDefault();

        const textToSend = overrideInput || input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setCurrentSuggestions([]);

        try {
            const endpoint = typeof route === 'function' ? route('chat.send', undefined, false) : '/chat/send';
            const response = await axios.post(
                endpoint,
                { message: userMessage.content },
                {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response || "I apologize, but I could not process your inquiry. Please try again or visit the Barangay Hall.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);

            if (response.data.suggestions && Array.isArray(response.data.suggestions)) {
                setCurrentSuggestions(response.data.suggestions);
            }

            if (response.data.error === 'engine_offline') {
                setIsEngineOffline(true);
            } else {
                setIsEngineOffline(false);
            }
        } catch (error: any) {
            console.error("Chat error:", error);
            const serverMessage = error?.response?.data?.message;
            const content = serverMessage
                ? `Notice: ${serverMessage}`
                : "Unable to connect to the helpdesk service. Please check your network connection or try again later.";
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "w-full h-full flex flex-col overflow-hidden bg-card text-card-foreground",
            className
        )}>
            {/* ── HEADER (ZERO UNWANTED GAPS OR MARGINS) ── */}
            <div className="border-b border-border/70 bg-card px-4 py-3 shrink-0 flex items-center gap-3">
                <div className="relative">
                    <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl border border-primary/20 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                </div>
                <div className="flex flex-col min-w-0">
                    <h3 className="text-sm font-bold text-foreground tracking-tight truncate leading-tight">
                        Chatbot
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mt-0.5">
                        <span>Online Citizen Assistance</span>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                        onClick={() => {
                            setMessages([welcomeMessage]);
                            setIsLoading(false);
                            setCurrentSuggestions([]);
                        }}
                        title="Start New Conversation"
                    >
                        <RefreshCcw className="h-3.5 w-3.5" />
                    </Button>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                            onClick={onClose}
                            title="Close Helpdesk"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* ── COMPACT ADVISORY NOTICE (ATTACHED DIRECTLY UNDER HEADER) ── */}
            <div className="bg-muted/50 border-b border-border/50 px-3.5 py-1.5 flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">For life-threatening emergencies, dial <strong>911</strong> immediately.</span>
            </div>

            {/* Offline Engine Notice */}
            {isEngineOffline && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-1.5 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-[11px] font-medium shrink-0">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    <span>Operating in keyword reference mode.</span>
                </div>
            )}

            {/* ── CHAT MESSAGES CANVAS (FILLS ALL REMAINING SPACE DIRECTLY) ── */}
            <div className="flex-1 overflow-hidden relative flex flex-col bg-background/50">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scroll-smooth"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full gap-2.5 max-w-[88%] animate-in fade-in slide-in-from-bottom-1 duration-200",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <Avatar className="h-7 w-7 shrink-0 border border-border shadow-2xs mt-0.5">
                                <AvatarFallback className="text-[11px] font-semibold bg-muted text-muted-foreground">
                                    {msg.role === 'assistant' ? '183' : <User size={13} />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-1",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">
                                    {msg.role === 'user' ? 'You' : 'Helpdesk'}
                                </span>
                                <div className={cn(
                                    "p-3 text-sm leading-relaxed transition-all whitespace-pre-wrap rounded-2xl",
                                    msg.role === 'user'
                                        ? "bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-2xs"
                                        : "bg-muted/70 dark:bg-muted/40 text-foreground border border-border/60 rounded-tl-xs shadow-2xs font-normal"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex w-full gap-2.5 mr-auto max-w-[88%] animate-in fade-in">
                            <Avatar className="h-7 w-7 shrink-0 border border-border shadow-2xs mt-0.5">
                                <AvatarFallback className="text-[11px] font-semibold bg-muted text-muted-foreground">183</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1 items-start">
                                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider px-1">Helpdesk</span>
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SUGGESTION CHIPS (FLUSH AT BOTTOM OF CHAT WITH HIDDEN SCROLLBAR) ── */}
                {!isLoading && (
                    <div className="px-3 py-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 bg-card border-t border-border/60">
                        {(currentSuggestions.length > 0 ? currentSuggestions : SUGGESTIONS).map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(undefined, suggestion)}
                                className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-foreground bg-muted/60 hover:bg-primary hover:text-primary-foreground border border-border/70 rounded-full transition-colors shrink-0 cursor-pointer shadow-2xs active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── INPUT FOOTER (SEAMLESSLY ATTACHED AT BOTTOM, NO GAP) ── */}
            <div className="p-3 bg-card shrink-0 border-t border-border/70 flex flex-col gap-1.5">
                <form onSubmit={(e) => handleSend(e)} className="flex w-full gap-2 items-center">
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 h-10 bg-muted/40 border-border/80 focus-visible:ring-1 focus-visible:ring-primary rounded-xl px-3.5 text-sm"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                        title="Send message"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <p className="text-[10px] text-center text-muted-foreground leading-tight w-full">
                    Informational public assistance &bull; In-person services available at the Barangay Hall
                </p>
            </div>
        </div>
    );
}
