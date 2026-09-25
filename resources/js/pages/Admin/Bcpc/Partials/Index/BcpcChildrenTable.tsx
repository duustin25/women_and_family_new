import { Link } from '@inertiajs/react';
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Info, UserCheck } from 'lucide-react';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BcpcChildListItem } from './types';

interface BcpcChildrenTableProps {
    childrenList: BcpcChildListItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onResetFilters: () => void;
}

export default function BcpcChildrenTable({
    childrenList,
    totalCount,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    onResetFilters,
}: BcpcChildrenTableProps) {
    const calculateAge = (dobString: string) => {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        const today = new Date();
        let years = today.getFullYear() - dob.getFullYear();
        let months = today.getMonth() - dob.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < dob.getDate())) {
            years--;
            months = 12 + months;
        }
        if (years === 0) {
            return `${months} mos old`;
        }
        return `${years}y ${months}m old`;
    };

    return (
        <>
            <CardContent className="p-0">
                {/* 📱 Mobile Card View (md:hidden) */}
                <div className="md:hidden divide-y divide-border">
                    {childrenList.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground italic text-xs">
                            No child records match your criteria.
                        </div>
                    ) : (
                        childrenList.map((child: any) => {
                            const latest = child.latest_assessment;
                            const wfa = latest?.wfa_status ?? 'Normal';
                            const hfa = latest?.hfa_status ?? 'Normal';
                            const wflh = latest?.wflh_status ?? 'Normal';
                            const logs = latest?.intervention_logs ?? [];
                            const hasOedema = logs.includes('Bilateral Oedema (Fluid Retention) [SAM PIMAM]');
                            const isElevatedBodyMass = (wflh === 'Overweight' || wflh === 'Obese' || wfa === 'Overweight');
                            const isStunted = ['Stunted', 'Severely Stunted'].includes(hfa);
                            const isSAM = !isElevatedBodyMass && (hasOedema || wfa === 'Severely Underweight' || wflh === 'Severely Wasted');
                            const isMAM = !isSAM && !isElevatedBodyMass && (wfa === 'Underweight' || wflh === 'Wasted');
                            const isDoubleBurden = isStunted && isElevatedBodyMass;

                            const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                            const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));
                            const isStalledSAM = isSAM && daysElapsed >= 40;

                            return (
                                <div key={child.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className={`h-10 w-10 border-2 ${isSAM ? 'border-red-400' : isDoubleBurden ? 'border-purple-400' : 'border-emerald-300'}`}>
                                                <AvatarFallback className={`font-bold text-xs ${isSAM ? 'bg-red-100 text-red-600' : isDoubleBurden ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {child.child_first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-sm text-foreground">
                                                    {child.child_first_name} {child.child_last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {child.sex} • {calculateAge(child.date_of_birth)} {child.zone ? `• ${child.zone.name}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        {isSAM ? (
                                            <Badge variant="destructive" className="text-[10px] uppercase font-bold">SAM</Badge>
                                        ) : isDoubleBurden ? (
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold border-purple-400 text-purple-700 dark:text-purple-300">Double Burden</Badge>
                                        ) : isMAM ? (
                                            <Badge className="text-[10px] uppercase font-bold bg-amber-500 text-white">MAM</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300">Normal</Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-dashed">
                                        <span>Guardian: <strong className="text-foreground">{child.guardian_name}</strong></span>
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                            <span title={`WFA: ${wfa}`} className="flex items-center gap-0.5">W <span className={`h-2 w-2 rounded-full inline-block ${wfa.includes('Severely') ? 'bg-red-500' : wfa.includes('Underweight') ? 'bg-amber-500' : 'bg-emerald-500'}`} /></span>
                                            <span title={`HFA: ${hfa}`} className="flex items-center gap-0.5">H <span className={`h-2 w-2 rounded-full inline-block ${hfa.includes('Severely') ? 'bg-red-500' : hfa.includes('Stunted') ? 'bg-amber-500' : 'bg-emerald-500'}`} /></span>
                                            <span title={`WFL: ${wflh}`} className="flex items-center gap-0.5">L <span className={`h-2 w-2 rounded-full inline-block ${wflh.includes('Severely') ? 'bg-red-500' : wflh.includes('Wasted') ? 'bg-amber-500' : (wflh === 'Overweight' || wflh === 'Obese') ? 'bg-purple-500' : 'bg-emerald-500'}`} /></span>
                                        </div>
                                    </div>

                                    {child.sfp_status === 'Enrolled' && (
                                        <div className="space-y-1 bg-muted/40 p-2.5 rounded-xl">
                                            <div className="flex justify-between text-[10px] font-bold text-emerald-600">
                                                <span>120-Day Feeding</span>
                                                <span>Day {daysElapsed}/120</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                <div className={`${isStalledSAM ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full transition-all`} style={{ width: `${percent}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    <Button asChild variant="outline" className="w-full h-11 min-h-[44px] text-xs font-semibold rounded-xl">
                                        <Link href={`/admin/bcpc/cases/${child.id}`}>
                                            View Profile & Diagnostic Dossier <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </Button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* 💻 Desktop Table View (hidden md:block) */}
                <div className="hidden md:block overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold py-4 pl-6 uppercase text-[10px] tracking-wider text-muted-foreground">Child & Parent Information</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Age & Barangay Zone</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground text-center">WHO 3-Axis Diagnostics</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">120-Day Feeding Progress</TableHead>
                                <TableHead className="font-bold uppercase text-[10px] tracking-wider text-muted-foreground">Last Checked</TableHead>
                                <TableHead className="text-right font-bold uppercase text-[10px] tracking-wider text-muted-foreground pr-6">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {childrenList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center text-muted-foreground italic font-medium">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Info className="w-8 h-8 text-muted-foreground/40" />
                                            <p className="text-sm font-semibold">No child records match your current search/filter criteria.</p>
                                            <Button size="sm" variant="outline" onClick={onResetFilters} className="rounded-xl font-bold text-xs">
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}

                            {childrenList.map((child: any) => {
                                const latest = child.latest_assessment;
                                const wfa = latest?.wfa_status ?? 'Normal';
                                const hfa = latest?.hfa_status ?? 'Normal';
                                const wflh = latest?.wflh_status ?? 'Normal';
                                const logs = latest?.intervention_logs ?? [];
                                const hasOedema = logs.includes('Bilateral Oedema (Fluid Retention) [SAM PIMAM]');

                                const isOverweight = (wflh === 'Overweight' || wfa === 'Overweight');
                                const isObese = (wflh === 'Obese');
                                const isElevatedBodyMass = isOverweight || isObese;
                                const isStunted = ['Stunted', 'Severely Stunted'].includes(hfa);

                                const isSAM = !isElevatedBodyMass && (hasOedema || wfa === 'Severely Underweight' || wflh === 'Severely Wasted');
                                const isMAM = !isSAM && !isElevatedBodyMass && (wfa === 'Underweight' || wflh === 'Wasted');
                                const isDoubleBurden = isStunted && isElevatedBodyMass;

                                const daysElapsed = child.sfp_start_date ? Math.min(120, Math.floor((new Date().getTime() - new Date(child.sfp_start_date).getTime()) / (1000 * 60 * 60 * 24))) : 0;
                                const percent = Math.min(100, Math.max(0, (daysElapsed / 120) * 100));
                                const isStalledSAM = isSAM && daysElapsed >= 40;

                                const lastDate = latest ? new Date(latest.date_of_weighing) : null;
                                const daysSinceWeighed = lastDate ? Math.floor((new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24)) : 0;
                                const isOverdue = (isSAM || isMAM || isDoubleBurden || isStunted || child.sfp_status === 'Enrolled') && daysSinceWeighed > 30;

                                return (
                                    <TableRow key={child.id} className={`transition-all hover:bg-muted/40 ${isSAM ? 'bg-red-500/5 hover:bg-red-500/10' : isDoubleBurden ? 'bg-purple-500/5 hover:bg-purple-500/10' : ''}`}>
                                        <TableCell className="pl-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <Avatar className={`h-9 w-9 border-2 ${isSAM ? 'border-red-400' : isDoubleBurden ? 'border-purple-400' : 'border-emerald-300'}`}>
                                                    <AvatarFallback className={`font-bold text-xs ${isSAM ? 'bg-red-100 text-red-600' : isDoubleBurden ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {child.child_first_name[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {isSAM && <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse shrink-0" title="SAM Urgent Alert" />}
                                                        {isDoubleBurden && <span className="h-2 w-2 rounded-full bg-purple-600 shrink-0" title="Double Burden Alert" />}
                                                        <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-emerald-600 transition-colors">
                                                            {child.child_first_name} {child.child_last_name}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                                        Guardian: <strong className="text-foreground font-bold">{child.guardian_name}</strong>
                                                    </span>
                                                    {child.bns_name && (
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 uppercase tracking-wide flex items-center gap-1">
                                                            <UserCheck className="w-3 h-3 text-emerald-600" />
                                                            BNS: {child.bns_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                                                    <span>{child.sex}</span>
                                                    <span>•</span>
                                                    <span>{calculateAge(child.date_of_birth)}</span>
                                                </div>
                                                {child.zone && (
                                                    <Badge variant="outline" className="text-[9px] font-extrabold border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 w-fit uppercase px-2 py-0.5 rounded-md">
                                                        {child.zone.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {isSAM ? (
                                                    <Badge variant="destructive" className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-md animate-pulse">
                                                        SAM Priority
                                                    </Badge>
                                                ) : isDoubleBurden ? (
                                                    <Badge variant="outline" className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-md border-purple-400 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                                                        Double Burden
                                                    </Badge>
                                                ) : isMAM ? (
                                                    <Badge className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-md bg-amber-500 text-white">
                                                        MAM Priority
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300">
                                                        Normal Range
                                                    </Badge>
                                                )}

                                                <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-muted-foreground mt-0.5">
                                                    <span title={`Weight-for-Age: ${wfa}`} className="flex items-center gap-1 cursor-help">
                                                        WFA <span className={`h-2 w-2 rounded-full inline-block ${wfa.includes('Severely') ? 'bg-red-500' : wfa.includes('Underweight') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    </span>
                                                    <span>•</span>
                                                    <span title={`Height-for-Age: ${hfa}`} className="flex items-center gap-1 cursor-help">
                                                        HFA <span className={`h-2 w-2 rounded-full inline-block ${hfa.includes('Severely') ? 'bg-red-500' : hfa.includes('Stunted') ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                    </span>
                                                    <span>•</span>
                                                    <span title={`Weight-for-Length: ${wflh}`} className="flex items-center gap-1 cursor-help">
                                                        WFL <span className={`h-2 w-2 rounded-full inline-block ${wflh.includes('Severely') ? 'bg-red-500' : wflh.includes('Wasted') ? 'bg-amber-500' : (wflh === 'Overweight' || wflh === 'Obese') ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3.5 min-w-[160px]">
                                            {child.sfp_status === 'Enrolled' ? (
                                                <div className="space-y-1.5 max-w-[150px]">
                                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-600">
                                                        <span>Active Feeding</span>
                                                        <span>Day {daysElapsed}/120</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                        <div className={`${isStalledSAM ? 'bg-amber-500' : 'bg-emerald-500'} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
                                                    </div>
                                                </div>
                                            ) : child.sfp_status === 'Graduated' ? (
                                                <div className="flex items-center gap-1.5 text-teal-600 font-bold text-xs uppercase">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                    <span>SFP Graduate</span>
                                                </div>
                                            ) : child.sfp_status === 'Completed' ? (
                                                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase">
                                                    <Award className="w-4 h-4 shrink-0" />
                                                    <span>Completed Cycle</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    Not Enrolled
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-xs font-semibold py-3.5">
                                            <div className="flex flex-col">
                                                <span className="text-foreground">
                                                    {lastDate ? lastDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'No record'}
                                                </span>
                                                {isOverdue && (
                                                    <Badge variant="outline" className="w-fit text-[8px] font-black uppercase border-rose-400 bg-rose-50 text-rose-700 mt-1">
                                                        {daysSinceWeighed}d Overdue
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right pr-6 py-3.5">
                                            <Button variant="outline" size="sm" asChild className="font-bold text-xs hover:bg-emerald-500/10 hover:text-emerald-600 border-2 rounded-xl h-8 px-3">
                                                <Link href={`/admin/bcpc/cases/${child.id}`}>
                                                    Profile <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {/* Pagination Footer */}
            {totalCount > itemsPerPage && (
                <CardFooter className="p-3.5 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground font-medium">
                        Showing <strong className="text-foreground">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-foreground">{Math.min(currentPage * itemsPerPage, totalCount)}</strong> of <strong className="text-foreground">{totalCount}</strong> children
                    </span>

                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="h-8 px-3 rounded-xl text-xs font-bold"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
                        </Button>

                        <div className="flex items-center gap-1 px-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                .map((p, idx, arr) => {
                                    const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                    return (
                                        <React.Fragment key={p}>
                                            {showEllipsis && <span className="text-muted-foreground text-xs px-1">...</span>}
                                            <Button
                                                variant={currentPage === p ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => onPageChange(p)}
                                                className={`h-8 w-8 p-0 rounded-xl text-xs font-black ${
                                                    currentPage === p ? 'bg-emerald-600 text-white' : ''
                                                }`}
                                            >
                                                {p}
                                            </Button>
                                        </React.Fragment>
                                    );
                                })}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 px-3 rounded-xl text-xs font-bold"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </>
    );
}
