import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { route } from 'ziggy-js';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

const SUGGESTIONS = [
    "How do I file a VAWC case?",
    "View emergency hotlines",
    "List of accredited orgs",
    "What is RA 9262?"
];

const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-neutral-800 rounded-2xl w-fit">
        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
    </div>
);

export default function Chatbot({ className }: { className?: string }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: "Greetings. I am The Sentinel, your dedicated AI assistant for the Women & Family Protection system. How may I be of service today?",
            timestamp: new Date()
        }
    ]);
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
            const response = await axios.post(route('chat.send'), { message: userMessage.content });

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.data.response || "I apologize, but I couldn't process that request.",
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
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Network Error: Unable to reach the secure server. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsEngineOffline(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={cn(
            "w-full mx-auto flex flex-col overflow-hidden transition-all duration-300",
            "border border-slate-200 dark:border-neutral-800 shadow-2xl bg-white dark:bg-neutral-900",
            className
        )}>
            {/* Clean Modern Header */}
            <CardHeader className="border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="bg-purple-50 dark:bg-purple-950/40 p-2 rounded-full border border-purple-100 dark:border-purple-900/50">
                            <Bot className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-neutral-900 bg-green-500" />
                    </div>
                    <div className="flex flex-col">
                        <CardTitle className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-1.5">
                            The Sentinel <Sparkles className="h-3.5 w-3.5 text-purple-700 dark:text-purple-400" />
                        </CardTitle>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            AI-Powered Assistant
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full"
                        onClick={() => {
                            setMessages([messages[0]]);
                            setIsLoading(false);
                        }}
                        title="Reset Chat"
                    >
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            {/* Offline/Fallback Banner */}
            {isEngineOffline && (
                <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>NLP Classification Engine Offline. Operating in keyword fallback mode.</span>
                </div>
            )}

            {/* Chat Area */}
            <CardContent className="flex-1 overflow-hidden p-0 relative flex flex-col bg-slate-50/50 dark:bg-neutral-950/30">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar"
                >
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <Avatar className="h-8 w-8 shrink-0 border border-slate-200 dark:border-neutral-800 shadow-sm bg-slate-100 dark:bg-neutral-800">
                                <AvatarFallback className="font-bold text-xs bg-slate-100 dark:bg-neutral-850">
                                    {msg.role === 'assistant' ? <Bot size={16} className="text-purple-700 dark:text-purple-400" /> : <User size={16} className="text-slate-600" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-1",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider px-1">
                                    {msg.role === 'user' ? 'You' : 'Sentinel'}
                                </div>
                                <div className={cn(
                                    "p-3.5 text-sm shadow-sm leading-relaxed font-semibold transition-all duration-200 whitespace-pre-wrap",
                                    msg.role === 'user'
                                        ? "bg-purple-700 text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-neutral-800 rounded-2xl rounded-tl-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex w-full gap-3 mr-auto max-w-[85%] animate-in fade-in">
                            <Avatar className="h-8 w-8 shrink-0 border border-slate-200 dark:border-neutral-850 shadow-sm bg-slate-100 dark:bg-neutral-800">
                                <AvatarFallback><Bot size={16} className="text-purple-700 dark:text-purple-400" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1 items-start">
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider px-1">Sentinel</div>
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions Area - Glassy Pills */}
                {!isLoading && (
                    <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-white/80 dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800">
                        {(currentSuggestions.length > 0 ? currentSuggestions : SUGGESTIONS).map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(undefined, suggestion)}
                                className="whitespace-nowrap px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 rounded-full hover:bg-purple-700 hover:text-white dark:hover:bg-purple-700 transition-all duration-200 hover:shadow-sm active:scale-95 cursor-pointer"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Input Area */}
            <CardFooter className="p-3 bg-white dark:bg-neutral-900 shrink-0 border-t border-slate-100 dark:border-neutral-800">
                <form onSubmit={(e) => handleSend(e)} className="flex w-full gap-2 items-end relative">
                    <Input
                        placeholder="Type your query..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 min-h-[44px] max-h-32 bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-slate-800 hover:border-purple-300 focus:border-purple-700 dark:focus:border-purple-500 focus:ring-1 focus:ring-purple-700 rounded-xl pl-4 pr-10 py-3 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-1 bottom-1 h-[36px] w-[36px] rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
