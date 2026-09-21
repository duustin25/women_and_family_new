import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
    currentStep: number;
    processing: boolean;
    handleNext: (e?: React.MouseEvent) => void;
}

export const CreateHeader: React.FC<Props> = ({
    currentStep,
    processing,
    handleNext,
}) => {
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        New Case Incident Intake
                    </h1>
                    <Badge variant="destructive" className="font-bold text-xs px-2.5 py-0.5 rounded-md">
                        RA 9262 Protocol
                    </Badge>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5">
                    Hierarchical Intake Gateway & Master Dossier Management
                </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-initial min-h-[44px] sm:min-h-[40px] text-sm font-semibold px-4">
                    <Link href={route('admin.vawc.index')} className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Cancel Intake
                    </Link>
                </Button>
                {currentStep === 4 ? (
                    <Button
                        type="submit"
                        size="sm"
                        disabled={processing}
                        className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-5 shadow-sm cursor-pointer"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {processing ? 'Saving...' : 'Save Case Intake'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleNext}
                        className="w-full sm:w-auto min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-5 shadow-sm cursor-pointer"
                    >
                        Next Step <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                )}
            </div>
        </div>
    );
};
