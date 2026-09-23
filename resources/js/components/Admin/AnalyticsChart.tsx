import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartConfig {
    key: string;
    label: string;
    color: string;
}

interface ChartData {
    month: string;
    [key: string]: string | number;
}

interface Props {
    data: ChartData[];
    config?: ChartConfig[];
}

export default function AnalyticsChart({ data, config }: Props) {
    // Elegant, accessible color palette replacing harsh raw primaries
    const defaultConfig: ChartConfig[] = [
        { key: 'physical', label: 'Physical Abuse', color: '#f43f5e' }, // Rose-500
        { key: 'sexual', label: 'Sexual Abuse', color: '#8b5cf6' },    // Violet-500
        { key: 'psychological', label: 'Psychological Abuse', color: '#3b82f6' }, // Blue-500
        { key: 'economic', label: 'Economic Abuse', color: '#f59e0b' }, // Amber-500
    ];

    const activeConfig = config && config.length > 0 ? config : defaultConfig;

    return (
        <div className="w-full">
            <div className="h-[320px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 16,
                            left: -10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                fontSize: '12px',
                                fontWeight: 500
                            }}
                            cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                        />
                        <Legend
                            iconType="circle"
                            wrapperStyle={{
                                fontSize: '12px',
                                fontWeight: 500,
                                paddingTop: '12px',
                                color: '#475569'
                            }}
                        />

                        {/* Dynamically render Bars based on Config */}
                        {activeConfig.map((item) => (
                            <Bar
                                key={item.key}
                                dataKey={item.key}
                                name={item.label}
                                fill={item.color}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
