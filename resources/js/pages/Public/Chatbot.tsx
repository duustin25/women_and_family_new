import { Head, usePage } from '@inertiajs/react';
import { AlertCircle, Phone } from 'lucide-react';
import Chatbot from '@/components/Chatbot';
import PublicLayout from '@/layouts/PublicLayout';

export default function ChatbotPage() {
    const { props } = usePage<any>();
    const isChatbotEnabled = props.chatbot_enabled ?? true;
    const brgyNum = import.meta.env.VITE_HOTLINE_BRGY || "Emergency: 911";

    return (
        <PublicLayout>
            <Head title="Villa-Bot Helpdesk" />

            <div className="py-12">
                <div className="w-[92%] sm:w-[88%] lg:w-[80%] max-w-7xl mx-auto px-1 sm:px-2">
                    <div className="flex flex-col items-center justify-center mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Villa-Bot Helpdesk
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                            Official virtual assistance for Barangay 183 Villamor citizen inquiries, service schedules, filing procedures, and barangay contacts.
                        </p>
                    </div>

                    {isChatbotEnabled ? (
                        <div className="max-w-3xl mx-auto h-[620px] max-h-[78vh] rounded-2xl overflow-hidden border border-border shadow-sm">
                            <Chatbot />
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto p-8 rounded-2xl border border-border/80 bg-card text-card-foreground text-center space-y-4 shadow-sm">
                            <div className="inline-flex p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                                <AlertCircle size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Helpdesk Under Maintenance</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                The automated virtual assistant is currently offline for scheduled maintenance or system updates. For immediate concerns, please reach out to the Barangay Operations Center.
                            </p>
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-semibold text-sm rounded-lg">
                                <Phone size={16} />
                                <span>{brgyNum}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
