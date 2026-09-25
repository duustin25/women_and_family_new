import { ShieldAlert } from 'lucide-react';
import React from 'react';

export default function CreateAdvisoryBanner() {
    return (
        <div className="p-4 rounded-2xl border bg-muted/30 shadow-xs flex items-start gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-xl shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-0.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                    Preliminary Assessment & Human Validation Notice
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program. Program admission requires parental consent and physical validation.
                </p>
            </div>
        </div>
    );
}
