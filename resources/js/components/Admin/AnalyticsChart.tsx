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
    // Default config if not provided (Fallbacks)
    const defaultConfig: ChartConfig[] = [
        { key: 'physical', label: 'Physical Abuse', color: '#FF0000' },
        { key: 'sexual', label: 'Sexual Abuse', color: '#0000FF' },
        { key: 'psychological', label: 'Psychological Abuse', color: '#00FF00' },
        { key: 'economic', label: 'Economic Abuse', color: '#FFFF00' },
    ];

    const activeConfig = config || defaultConfig;

    return (
        <div className="p-4 rounded-lg">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#64748b" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#525252 ' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />

                        {/* Dynamically render Bars based on Config */}
                        { (activeConfig || []).map((item) => (
                            <Bar
                                key={item.key}
                                dataKey={item.key}
                                name={item.label}
                                fill={item.color}
                                radius={[4, 4, 0, 0]}
                            />
                        ))}

                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
