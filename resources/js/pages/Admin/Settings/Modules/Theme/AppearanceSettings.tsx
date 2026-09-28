import { Monitor } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppearanceSettings() {
    return (
        <Card className="border shadow-sm w-full">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Theme & Display Preferences
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    Customize the visual appearance, brightness mode, and color themes for your workstation.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <AppearanceTabs />
            </CardContent>
        </Card>
    );
}