import React from 'react';
import AnalyticsSkeleton from '@/components/Admin/Analytics/Common/AnalyticsSkeleton';
import GadProjectPipelineChart from '@/components/Admin/Analytics/Gad/GadProjectPipelineChart';

interface GadTabProps {
    gadAnalytics?: any;
    isPresident: boolean;
}

export default function GadTab({
    gadAnalytics,
    isPresident,
}: GadTabProps) {
    if (!gadAnalytics) {
        return <AnalyticsSkeleton />;
    }

    return (
        <div className="space-y-5">
            <GadProjectPipelineChart gadAnalytics={gadAnalytics} isPresident={isPresident} />
        </div>
    );
}
