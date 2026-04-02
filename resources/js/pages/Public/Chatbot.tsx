import PublicLayout from '@/layouts/PublicLayout';
import Chatbot from '@/components/Chatbot';
import { Head } from '@inertiajs/react';

export default function ChatbotPage() {
    return (
        <PublicLayout>
            <Head title="AI Assistant - The Sentinel" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
                            The Sentinel AI Assistant
                        </h1>
                        <p className="mt-4 text-lg text-gray-500 max-w-2xl">
                            Your 24/7 assistant for guidance on RA 9262, organization membership, and available services.
                        </p>
                    </div>

                    <Chatbot />
                </div>
            </div>
        </PublicLayout>
    );
}
