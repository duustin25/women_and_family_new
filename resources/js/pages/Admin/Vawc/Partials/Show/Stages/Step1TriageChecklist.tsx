import React from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
    assessForm: any;
    handleAssessCase: (e: React.FormEvent) => void;
}

export const Step1TriageChecklist: React.FC<Props> = ({
    assessForm,
    handleAssessCase,
}) => {
    return (
        <form onSubmit={handleAssessCase} className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <ClipboardList className="w-5 h-5" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">VAWC Desk Triage Checklist</h4>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                    Check all risk factors identified during intake. The vulnerability algorithm will calculate priority index.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {[
                        { id: 'requires_medical', label: 'Medical Attention Required', desc: 'Physical injuries needing clinic/hospital transfer' },
                        { id: 'requires_alternative_housing', label: 'Alternative Housing / Shelter Needed', desc: 'Displaced or unsafe; needs temporary placement' },
                        { id: 'is_repeat_offense', label: 'Repeat Offense / History of Abuse', desc: 'Perpetrator has history of domestic violence' },
                        { id: 'has_weapon_involved', label: 'Weapons Involved', desc: 'Abuse involves use or threat of weapons' },
                        { id: 'weapons_confiscated', label: 'Weapons Confiscated', desc: 'Tanod or PNP retrieved weapons from scene' },
                        { id: 'perpetrator_present', label: 'Perpetrator Present at Scene', desc: 'Active threat remaining at location' },
                        { id: 'warrantless_arrest_made', label: 'Warrantless Arrest Made', desc: 'Tanod/Citizen arrest due to active crime' },
                        { id: 'incident_veracity', label: 'Incident Verified', desc: 'Veracity of report physically confirmed' },
                    ].map((item) => (
                        <label key={item.id} className="flex items-start space-x-3 p-3.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors cursor-pointer">
                            <Checkbox
                                checked={Boolean(assessForm.data[item.id])}
                                onCheckedChange={(checked) => assessForm.setData(item.id, Boolean(checked))}
                                className="mt-0.5"
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-foreground">{item.label}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 font-normal">{item.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={assessForm.processing} className="bg-[#ce1126] hover:bg-red-700 font-bold text-xs px-6 py-2">
                    <Save className="w-4 h-4 mr-1.5" />
                    {assessForm.processing ? 'Calculating...' : 'Save & Calculate Risk Triage'}
                </Button>
            </div>
        </form>
    );
};
