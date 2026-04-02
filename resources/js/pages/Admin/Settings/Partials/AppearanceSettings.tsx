import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';

export default function AppearanceSettings() {
    return (
        <div className="space-y-4 mt-6 animate-in fade-in zoom-in-95 duration-300">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 ">
                        <Monitor className="w-5 h-5 text-purple-500" />
                        <CardTitle className="text-lg font-bold">Theme & Display Settings</CardTitle>
                    </div>
                    <CardDescription>Customize the visual interface and color modes for the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AppearanceTabs />
                </CardContent>
            </Card>
        </div>
    );
}