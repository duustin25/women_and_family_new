import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Map } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

interface Props {
    data: any[];
}

export default function VawcGeographicalDensityChart({ data }: Props) {
    return (
        <Card className="shadow-sm border">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="uppercase tracking-widest text-xs font-black text-orange-600 flex items-center gap-2">
                    <Map className="w-4 h-4" /> Geographical Case Density
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground">
                    Total Cases recorded per Barangay Zone
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={80} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 10, fontWeight: 'black' }} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
