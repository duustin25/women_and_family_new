import PublicLayout from '@/layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';

const formatContent = (text?: string) => {
    if (!text) return null; // or return ''
    
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
        if (part.match(urlRegex)) {
            const href = part.startsWith('http') ? part : `https://${part}`;
            return (
                <a 
                    key={index} 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 underline hover:no-underline font-medium"
                >
                    {part}
                </a>
            );
        }
        return part;
    });
};



export default function Show({ announcement }: { announcement: any }) {
    // 1. ADD THIS LINE: This extracts the actual data from the Resource wrapper
    const record = announcement.data;

    // Function to handle the back action
    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        // This takes them exactly where they were before
        window.history.back(); 
    };

    // 2. Add a safety check in case the data is missing
    if (!record) return <div className="p-20 text-center">Loading...</div>;

    return (    
        <PublicLayout>
            <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors">
                {/* 3. UPDATE ALL REFERENCES to use 'record' instead of 'announcement' */}
                <Head title={record.title} />
                
                <div className="max-w-4xl mx-auto px-6 py-12">
                    {/* Change Link to an anchor or button and use window.history.back() */}
                    <a 
                        href="#" 
                        onClick={handleBack}
                        className="flex items-center text-slate-500 hover:text-blue-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Previous Page
                    </a>

                    <article>
                        <header className="mb-8">
                            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">
                                {record.category}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 mb-6 leading-tight">
                                {record.title}
                            </h1>
                            
                            <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400 text-sm">
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {record.event_date}
                                </span>
                                {record.location && (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> {record.location}
                                    </span>
                                )}
                            </div>
                        </header>

                        {record.image && (
                            <div className="aspect-video w-full overflow-hidden rounded-2xl mb-12 shadow-xl">
                                <img src={record.image} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}

                        <div className="prose dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                                {formatContent(record.content)}
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </PublicLayout>
    );
}