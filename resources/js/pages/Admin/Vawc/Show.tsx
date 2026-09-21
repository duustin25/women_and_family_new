import React from 'react';
import { Head } from '@inertiajs/react';
import { ArchiveX } from 'lucide-react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVawcCaseWorkflow } from '@/hooks/useVawcCaseWorkflow';
import AppLayout from '@/layouts/app-layout';
import { ShowProps } from './Partials/Show/types';
import { VawcCaseHeader } from './Partials/Show/VawcCaseHeader';
import { VawcMasterDossierBanner } from './Partials/Show/VawcMasterDossierBanner';
import { VawcRaveScorecard } from './Partials/Show/VawcRaveScorecard';
import { VawcProgressionStepper } from './Partials/Show/VawcProgressionStepper';
import { Step1TriageChecklist } from './Partials/Show/Stages/Step1TriageChecklist';
import { Step2BpoApplication } from './Partials/Show/Stages/Step2BpoApplication';
import { Step3BpoIssuance } from './Partials/Show/Stages/Step3BpoIssuance';
import { Step4BpoService } from './Partials/Show/Stages/Step4BpoService';
import { Step5MonitoringExit } from './Partials/Show/Stages/Step5MonitoringExit';
import { Step6EscalationView } from './Partials/Show/Stages/Step6EscalationView';
import { Step7ArchivedView } from './Partials/Show/Stages/Step7ArchivedView';
import { VawcMonitoringLogSection } from './Partials/Show/Stages/VawcMonitoringLogSection';
import { VawcProfileGrid } from './Partials/Show/Background/VawcProfileGrid';
import { VawcDossierTimeline } from './Partials/Show/Background/VawcDossierTimeline';
import { VawcAuditTrailCard } from './Partials/Show/Background/VawcAuditTrailCard';
import { VawcEscalateModal } from './Partials/Show/Modals/VawcEscalateModal';
import { VawcCloseCaseModal } from './Partials/Show/Modals/VawcCloseCaseModal';

export default function Show({ case: vawcCase, crossStats, survivorStats }: ShowProps) {
    const workflow = useVawcCaseWorkflow(vawcCase);
    const { stepNum } = workflow;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: route('dashboard') },
            { title: 'VAWC Cases', href: route('admin.vawc.index') },
            { title: vawcCase.sub_case_number || vawcCase.case_report?.case_number, href: '#' }
        ]}>
            <Head title={`Case Workflow: ${vawcCase.case_report?.case_number}`} />

            <div className="w-full max-w-full overflow-x-clip px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
                {/* 1. Header with Redaction Controls */}
                <VawcCaseHeader
                    vawcCase={vawcCase}
                    isRedacted={workflow.isRedacted}
                    setIsRedacted={workflow.setIsRedacted}
                />

                {/* 2. Master Dossier Command Bar */}
                <VawcMasterDossierBanner
                    vawcCase={vawcCase}
                    stepNum={stepNum}
                    activeCaseStatusLabel={workflow.activeCaseStatusLabel}
                    redactName={workflow.redactName}
                    daysRemaining={workflow.daysRemaining}
                    activeBpo={workflow.activeBpo}
                />

                {/* 3. VAWC-RAVE Algorithm Risk Scorecard */}
                <VawcRaveScorecard vawcCase={vawcCase} />

                {/* 4. Statutory Case Progression Stepper (Steps 1 to 7) */}
                <VawcProgressionStepper stepNum={stepNum} />

                {/* 5. Primary Guided Action Card */}
                <Card className="shadow-xs border overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 bg-muted/20 pb-4 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-red-600 text-white font-bold text-xs px-2.5 py-1 shrink-0">
                                    STEP {stepNum}: CURRENT PHASE
                                </Badge>
                                <CardTitle className="text-lg sm:text-xl font-bold">
                                    {stepNum === 1 && "Perform Triage Assessment"}
                                    {stepNum === 2 && "File Application for Protection Order"}
                                    {stepNum === 3 && "Barangay Head: Issue Protection Order"}
                                    {stepNum === 4 && "Print & Serve Official Protection Order"}
                                    {stepNum === 5 && "Ongoing Compliance Monitoring"}
                                    {stepNum === 6 && "Case Referred to Higher Legal Authorities"}
                                    {stepNum === 7 && "Case File Closed & Archived"}
                                </CardTitle>
                            </div>
                            {(stepNum === 5 || stepNum === 6) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => workflow.setShowCloseModal(true)}
                                    className="text-xs font-bold min-h-[44px] sm:min-h-[38px] cursor-pointer self-start sm:self-auto shrink-0"
                                >
                                    <ArchiveX className="w-4 h-4 mr-1 text-slate-500" /> Close Case File
                                </Button>
                            )}
                        </div>
                        <CardDescription className="text-xs font-medium mt-2">
                            {stepNum === 1 && "Assess risk factors and immediate needs below to calculate the triage level."}
                            {stepNum === 2 && "Click below to file the official 15-day Protection Order application."}
                            {stepNum === 3 && "Review application and confirm issuance within 24 hours of filing."}
                            {stepNum === 4 && "Print documents, serve to respondent, and record service status below."}
                            {stepNum === 5 && "Record monitoring check-ins and compliance logs during the 15-day SLA."}
                            {stepNum === 6 && "Case referred to PNP WCPD or Prosecutor due to violation or high risk."}
                            {stepNum === 7 && "Case record is closed, locked, and preserved for audit compliance."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        {stepNum === 1 && (
                            <Step1TriageChecklist
                                assessForm={workflow.assessForm}
                                handleAssessCase={workflow.handleAssessCase}
                            />
                        )}
                        {stepNum === 2 && (
                            <Step2BpoApplication
                                vawcCase={vawcCase}
                                bpoForm={workflow.bpoForm}
                                handleApplyBpo={workflow.handleApplyBpo}
                                handleColdCaseDirectReferral={workflow.handleColdCaseDirectReferral}
                                isColdCase={workflow.isColdCase}
                                daysSinceIncident={workflow.daysSinceIncident}
                                toLocalISOString={workflow.toLocalISOString}
                                getNowLocalISO={workflow.getNowLocalISO}
                            />
                        )}
                        {stepNum === 3 && (
                            <Step3BpoIssuance
                                activeBpo={workflow.activeBpo}
                                issuanceForm={workflow.issuanceForm}
                                handleIssueBpo={workflow.handleIssueBpo}
                                issuanceAnalysis={workflow.issuanceAnalysis}
                                formatDateTime={workflow.formatDateTime}
                                toLocalISOString={workflow.toLocalISOString}
                                getNowLocalISO={workflow.getNowLocalISO}
                            />
                        )}
                        {stepNum === 4 && (
                            <Step4BpoService
                                caseRouteKey={workflow.caseRouteKey}
                                activeBpo={workflow.activeBpo}
                                respondent={workflow.respondent}
                                serviceForm={workflow.serviceForm}
                                handleRecordService={workflow.handleRecordService}
                                serviceAnalysis={workflow.serviceAnalysis}
                                formatDateTime={workflow.formatDateTime}
                                toLocalISOString={workflow.toLocalISOString}
                                getNowLocalISO={workflow.getNowLocalISO}
                            />
                        )}
                        {stepNum === 5 && (
                            <Step5MonitoringExit
                                caseRouteKey={workflow.caseRouteKey}
                                activeBpo={workflow.activeBpo}
                                daysRemaining={workflow.daysRemaining}
                                closeForm={workflow.closeForm}
                                escalationForm={workflow.escalationForm}
                                setShowCloseModal={workflow.setShowCloseModal}
                                setShowEscalateModal={workflow.setShowEscalateModal}
                                getNowLocalISO={workflow.getNowLocalISO}
                            />
                        )}
                        {stepNum === 6 && (
                            <Step6EscalationView
                                caseRouteKey={workflow.caseRouteKey}
                                vawcCase={vawcCase}
                                setShowCloseModal={workflow.setShowCloseModal}
                                formatDateTime={workflow.formatDateTime}
                            />
                        )}
                        {stepNum === 7 && (
                            <Step7ArchivedView
                                vawcCase={vawcCase}
                                formatDateTime={workflow.formatDateTime}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* 6. Ongoing Monitoring & Compliance Logs (Steps 5 & 6) */}
                <VawcMonitoringLogSection
                    stepNum={stepNum}
                    vawcCase={vawcCase}
                    complianceForm={workflow.complianceForm}
                    escalationForm={workflow.escalationForm}
                    handleLogCompliance={workflow.handleLogCompliance}
                    handleEscalate={workflow.handleEscalate}
                    formatDateTime={workflow.formatDateTime}
                />

                {/* 7. Comprehensive Dossier Profile Grid */}
                <VawcProfileGrid
                    vawcCase={vawcCase}
                    victim={workflow.victim}
                    respondent={workflow.respondent}
                    crossStats={crossStats}
                    survivorStats={survivorStats}
                    isRedacted={workflow.isRedacted}
                    redactName={workflow.redactName}
                    redactAddress={workflow.redactAddress}
                    redactContact={workflow.redactContact}
                />

                {/* 8. Master Dossier Timeline & Historical Incidents */}
                <VawcDossierTimeline
                    vawcCase={vawcCase}
                    formatDateOnly={workflow.formatDateOnly}
                />

                {/* 9. Dual-Timestamp Statutory Audit Trail */}
                <VawcAuditTrailCard
                    vawcCase={vawcCase}
                    isHistoricalEntry={workflow.isHistoricalEntry}
                    formatDateTime={workflow.formatDateTime}
                    formatDateOnly={workflow.formatDateOnly}
                />

                {/* 10. Modals */}
                <VawcEscalateModal
                    open={workflow.showEscalateModal}
                    onOpenChange={workflow.setShowEscalateModal}
                    escalationForm={workflow.escalationForm}
                    handleEscalate={workflow.handleEscalate}
                />

                <VawcCloseCaseModal
                    open={workflow.showCloseModal}
                    onOpenChange={workflow.setShowCloseModal}
                    vawcCase={vawcCase}
                    stepNum={stepNum}
                    closeForm={workflow.closeForm}
                    handleCloseCase={workflow.handleCloseCase}
                    judicialFields={workflow.judicialFields}
                    setJudicialFields={workflow.setJudicialFields}
                />
            </div>
        </AppLayout>
    );
}
