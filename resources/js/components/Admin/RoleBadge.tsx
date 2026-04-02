import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
    role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const config: Record<string, string> = {
        'admin': 'bg-red-50 text-red-600 border-red-200',
        'head': 'bg-blue-50 text-blue-600 border-blue-200',
        'president': 'bg-purple-50 text-purple-600 border-purple-200',
        'resident': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    };

    const label: Record<string, string> = {
        'admin': 'Super Admin',
        'head': 'Committee Head',
        'president': 'Org President',
        'resident': 'Resident',
    };

    return (
        <Badge variant="outline" className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config[role] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {label[role] || role}
        </Badge>
    );
}
