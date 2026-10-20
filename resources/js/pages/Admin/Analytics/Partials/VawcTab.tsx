import React from 'react';
import AnalyticsSkeleton from '@/components/Admin/Analytics/Common/AnalyticsSkeleton';
import VawcMonthlyAbuseChart from '@/components/Admin/Analytics/Vawc/VawcMonthlyAbuseChart';
import VawcGeographicalDensityChart from '@/components/Admin/Analytics/Vawc/VawcGeographicalDensityChart';
import { ChartData, ChartConfig, ZoneData } from '../types';

interface VawcTabProps {
    vawcData?: ChartData[];
    vawcChartConfig: ChartConfig[];
    zoneDistribution?: ZoneData[];
    onSelectZone?: (zoneName: string) => void;
}

export default function VawcTab({
    vawcData,
    vawcChartConfig,
    zoneDistribution,
    onSelectZone,
}: VawcTabProps) {
    if (!vawcData) {
        return <AnalyticsSkeleton />;
    }

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 print:grid-cols-1 gap-5">
                {/* Row 1 Left: Monthly Abuse Reports (60% width) */}
                <div className="lg:col-span-3 min-w-0 print:w-full">
                    <VawcMonthlyAbuseChart data={vawcData} config={vawcChartConfig} />
                </div>

                {/* Row 1 Right: Geographical Case Distribution (40% width) */}
                <div className="lg:col-span-2 min-w-0 print:w-full">
                    <VawcGeographicalDensityChart
                        data={zoneDistribution || []}
                        onSelectZone={onSelectZone}
                    />
                </div>
            </div>
        </div>
    );
}
