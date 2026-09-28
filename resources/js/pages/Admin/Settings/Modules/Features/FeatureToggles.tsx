import { usePage, router } from '@inertiajs/react';
import { Bot, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function FeatureToggles() {
    const { props } = usePage<any>();
    const serverValue = props.chatbot_enabled ?? true;
    const [isChatbotEnabled, setIsChatbotEnabled] = useState<boolean>(serverValue);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);

    useEffect(() => {
        if (props.chatbot_enabled !== undefined) {
            setIsChatbotEnabled(props.chatbot_enabled);
        }
    }, [props.chatbot_enabled]);

    const handleToggleChatbot = (enabled: boolean) => {
        // Optimistic UI update: instantly update UI without waiting for network
        setIsChatbotEnabled(enabled);
        setIsUpdating(true);

        router.post(route('admin.settings.feature-toggle'), {
            feature: 'chatbot_enabled',
            enabled: enabled,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsUpdating(false);
                toast.success(`Chatbot Assistant ${enabled ? 'ENABLED' : 'DISABLED (Maintenance Mode)'}.`);
            },
            onError: () => {
                // Revert on error
                setIsChatbotEnabled(!enabled);
                setIsUpdating(false);
                toast.error('Failed to update system feature setting.');
            }
        });
    };

    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    System Feature & Module Controls Con
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Toggle individual system services during scheduled maintenance, emergency downtimes, or system updates.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border border-border/80 bg-muted/30">
                    <div className="flex items-start gap-3.5">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h4 className="font-bold text-base text-foreground">Barangay Helpdesk Chatbot</h4>
                                <Badge
                                    variant={isChatbotEnabled ? "default" : "secondary"}
                                    className="text-xs font-semibold px-2.5 py-0.5"
                                >
                                    {isChatbotEnabled ? 'ACTIVE' : 'MAINTENANCE MODE'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                                Controls citizen access to the virtual assistant on the public portal and floating widget. When disabled, citizens are presented with a maintenance notice and redirected to barangay emergency contact numbers.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center pl-12 sm:pl-0">
                        <span className="text-sm font-medium text-muted-foreground">
                            {isChatbotEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                        <Switch
                            checked={isChatbotEnabled}
                            onCheckedChange={handleToggleChatbot}
                            disabled={isUpdating}
                            aria-label="Toggle Barangay Helpdesk Chatbot"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
