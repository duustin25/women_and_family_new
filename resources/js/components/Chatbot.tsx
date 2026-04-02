import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

// Modern animated dots indicator
const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
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
        setCurrentSuggestions([]); // Clear previous suggestions

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
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Network Error: Unable to reach the secure server. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={cn(
            "w-full mx-auto flex flex-col overflow-hidden transition-all duration-300",
            "border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10",
            className
        )}>
            {/* Premium Header */}
            <CardHeader className="relative overflow-hidden border-b border-indigo-500/20 bg-gradient-to-r from-[#6b21a8] via-[#7c3aed] to-[#6b21a8] p-4 shrink-0">
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwem0xIDFWMGgyMnYyekgxem0wIDIyVjJoMjJ2MjBoLTIyeiIgZmlsbD0iI2ZmZmZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] bg-[length:24px_24px]" />
                <div className="relative flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 opacity-75 blur animate-pulse" />
                        <div className="relative bg-white p-1.5 rounded-full">
                            <Bot className="h-5 w-5 text-[#6b21a8]" />
                        </div>
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#6b21a8] bg-green-400" />
                    </div>
                    <div className="flex flex-col text-white">
                        <CardTitle className="text-base font-bold tracking-wide flex items-center gap-2">
                            The Sentinel <Sparkles className="h-3 w-3 text-yellow-300" />
                        </CardTitle>
                        <span className="text-[10px] uppercase font-medium text-indigo-100 tracking-wider">
                            AI-Powered Assistant
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-white/80 hover:text-white hover:bg-white/10 rounded-full"
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

            {/* Chat Area */}
            <CardContent className="flex-1 overflow-hidden p-0 relative flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
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
                            <Avatar className={cn(
                                "h-8 w-8 shrink-0 border border-white dark:border-slate-700 shadow-sm",
                                msg.role === 'assistant' ? "bg-indigo-50 dark:bg-indigo-900/50" : "bg-slate-100 dark:bg-slate-800"
                            )}>
                                <AvatarFallback className="font-bold text-xs">
                                    {msg.role === 'assistant' ? <Bot size={16} className="text-[#6b21a8] dark:text-indigo-400" /> : <User size={16} className="text-slate-600 dark:text-slate-400" />}
                                </AvatarFallback>
                            </Avatar>

                            <div className={cn(
                                "flex flex-col gap-1",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1">
                                    {msg.role === 'user' ? 'You' : 'Sentinel'}
                                </div>
                                <div className={cn(
                                    "p-3.5 text-sm shadow-sm relative group transition-all duration-200 hover:shadow-md whitespace-pre-wrap leading-relaxed",
                                    msg.role === 'user'
                                        ? "bg-gradient-to-br from-[#6b21a8] to-[#7c3aed] text-white rounded-2xl rounded-tr-sm"
                                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm"
                                )}>
                                    {msg.content}
                                </div>
                                <div className="text-[9px] text-slate-400 dark:text-slate-500 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex w-full gap-3 mr-auto max-w-[85%] animate-in fade-in">
                            <Avatar className="h-8 w-8 shrink-0 border border-white dark:border-slate-700 shadow-sm bg-indigo-50 dark:bg-indigo-900/50">
                                <AvatarFallback><Bot size={16} className="text-[#6b21a8] dark:text-indigo-400" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-1 items-start">
                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium px-1">Sentinel</div>
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                </div>

                {/* Suggestions Area - Glassy Pills */}
                {!isLoading && (
                    <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800">
                        {(currentSuggestions.length > 0 ? currentSuggestions : SUGGESTIONS).map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(undefined, suggestion)}
                                className="whitespace-nowrap px-3 py-1.5 text-[11px] font-semibold text-[#6b21a8] dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full hover:bg-[#6b21a8] hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all duration-200 hover:shadow-sm active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Input Area */}
            <CardFooter className="p-3 bg-white dark:bg-slate-900 shrink-0 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={(e) => handleSend(e)} className="flex w-full gap-2 items-end relative">
                    <Input
                        placeholder="Type your query..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 min-h-[44px] max-h-32 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 focus:border-[#6b21a8] dark:focus:border-[#6b21a8] focus:ring-1 focus:ring-[#6b21a8] rounded-xl pl-4 pr-10 py-3 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim()}
                        className="absolute right-1 bottom-1 h-[36px] w-[36px] rounded-lg bg-[#6b21a8] hover:bg-[#581c87] text-white shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
