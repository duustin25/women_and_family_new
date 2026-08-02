import { usePage, router } from '@inertiajs/react';
import { Bot, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { route } from 'ziggy-js';

export default function FeatureToggles() {
    const { props } = usePage<any>();
    const isChatbotEnabled = props.chatbot_enabled ?? true;

    const handleToggleChatbot = (enabled: boolean) => {
        router.post(route('admin.settings.feature-toggle'), {
            feature: 'chatbot_enabled',
            enabled: enabled,
        }, {
            onSuccess: () => {
                toast.success(`AI Chatbot Assistant ${enabled ? 'ENABLED' : 'DISABLED'}.`);
            },
            onError: () => {
                toast.error('Failed to update system feature setting.');
            }
        });
    };

    return (
        <Card>
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    System Feature Switches & Module Controls
                </CardTitle>
                <CardDescription className="text-xs">
                    Enable or disable system modules during server maintenance, API quota limits, or system updates.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm">AI Sentinel Chatbot Assistant</h4>
                                <Badge variant={isChatbotEnabled ? "default" : "secondary"}>
                                    {isChatbotEnabled ? 'ACTIVE' : 'MAINTENANCE MODE'}
                                </Badge>
                                <Button
                                    variant={isChatbotEnabled ? "default" : "destructive"}
                                    size="sm"
                                    onClick={() => handleToggleChatbot(!isChatbotEnabled)}
                                >
                                    {isChatbotEnabled ? 'Enabled' : 'Disabled'}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                                Controls public portal access to the AI chatbot. Disabling transitions the widget to a maintenance notice directing citizens to emergency hotlines.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:self-center">
                        <Switch
                            checked={isChatbotEnabled}
                            onCheckedChange={handleToggleChatbot}
                            aria-label="Toggle AI Sentinel Chatbot"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
