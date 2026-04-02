import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';

interface VawcFormFieldsProps {
    data: any;
    setData: (field: string, value: any) => void;
    errors: any;
    options: { id: number; name: string }[];
    zones: { id: number; name: string }[];
}

export default function VawcFormFields({ data, setData, errors, options, zones }: VawcFormFieldsProps) {
    return (
        <>
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 border-b pb-2 mb-4">Victim Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-neutral-500">Victim Name <span className="text-red-500">*</span></Label>
                        <Input
                            value={data.victim_name}
                            onChange={e => setData('victim_name', e.target.value)}
                            placeholder="Full Name"
                            className="font-bold h-11"
                            required
                        />
                        {errors.victim_name && <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} />{errors.victim_name}</span>}
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-neutral-500">Age</Label>
                        <Input
                            value={data.victim_age}
                            onChange={e => setData('victim_age', e.target.value)}
                            placeholder="Age"
                            className="h-11"
                        />
                        {errors.victim_age && <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} />{errors.victim_age}</span>}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 border-b pb-2 mt-8 mb-4">Complainant Information (If not victim)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-neutral-500">Complainant Name</Label>
                        <Input
                            value={data.complainant_name}
                            onChange={e => setData('complainant_name', e.target.value)}
                            placeholder="Name (Select 'Relation' if not victim)"
                            className="h-11"
                        />
                        {errors.complainant_name && <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} />{errors.complainant_name}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-neutral-500">Contact #</Label>
                            <Input
                                value={data.complainant_contact}
                                onChange={e => setData('complainant_contact', e.target.value)}
                                placeholder="Mobile/Tel"
                                className="h-11"
                            />
                            {errors.complainant_contact && <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} />{errors.complainant_contact}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-neutral-500">Relation</Label>
                            <Input
                                value={data.relation_to_victim}
                                onChange={e => setData('relation_to_victim', e.target.value)}
                                placeholder="e.g. Parent, Neighbor"
                                className="h-11"
                            />
                            {errors.relation_to_victim && <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} />{errors.relation_to_victim}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-neutral-500">Incident Date <span className="text-red-500">*</span></Label>
                    <Input
                        type="datetime-local"
                        value={data.incident_date}
                        onChange={e => setData('incident_date', e.target.value)}
                        className="h-11 font-mono text-sm"
                        required
                    />
                    {errors.incident_date && <span className="text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12} />{errors.incident_date}</span>}
                </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Abuse Type <span className="text-red-500">*</span></Label>
                    <Select value={data.abuse_type} onValueChange={v => setData('abuse_type', v)} required>
                        <SelectTrigger className="h-11"><SelectValue placeholder="Select Abuse Type" /></SelectTrigger>
                        <SelectContent>
                            {options.map((t) => (
                                <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.abuse_type && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.abuse_type}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 pb-2">
                <div className="md:col-span-1 space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Barangay Zone <span className="text-red-500">*</span></Label>
                    <Select 
                        value={data.zone_id?.toString()} 
                        onValueChange={v => setData('zone_id', parseInt(v))} 
                        required
                    >
                        <SelectTrigger className="h-11"><SelectValue placeholder="Select Zone" /></SelectTrigger>
                        <SelectContent>
                            {zones.map((z) => (
                                <SelectItem key={z.id} value={z.id.toString()}>{z.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.zone_id && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.zone_id}</span>}
                </div>
                <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-500">Specific Location / Purok <span className="text-red-500">*</span></Label>
                    <Input
                        value={data.incident_location}
                        onChange={e => setData('incident_location', e.target.value)}
                        placeholder="e.g. Purok 4, Near Elementary School"
                        className="h-11"
                        required
                    />
                    {errors.incident_location && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12} />{errors.incident_location}</span>}
                </div>
            </div>
        </>
    );
}
