import React from 'react';
import { Head } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Save, UserPlus, MapPin, UserX, FileCheck } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';

import { useVawcCreateWorkflow } from '@/hooks/useVawcCreateWorkflow';
import { CreateProps } from './Partials/Create/types';
import { CreateHeader } from './Partials/Create/CreateHeader';
import { DossierSearchGateway } from './Partials/Create/DossierSearchGateway';
import { Step1Survivor } from './Partials/Create/Step1Survivor';
import { Step2Incident } from './Partials/Create/Step2Incident';
import { Step3Respondent } from './Partials/Create/Step3Respondent';
import { Step4Verify } from './Partials/Create/Step4Verify';
import { CreateConfirmModal } from './Partials/Create/CreateConfirmModal';

export default function Create({ abuseTypes, zones, preselectedDossier }: CreateProps) {
    const {
        currentStep,
        setCurrentStep,
        showConfirmModal,
        setShowConfirmModal,

        // Master Dossier Search Gateway
        dossierQuery,
        setDossierQuery,
        isSearchingDossiers,
        dossierSearchResults,
        attachedDossier,
        handleAttachDossier,
        handleDetachDossier,
        debouncedDossierQuery,

        // Step 1: Survivor Auto-Suggest
        isSearchingSurvivors,
        survivorSearchResults,
        selectedSurvivorEntity,
        handleSelectSurvivorEntity,
        handleClearSurvivorEntity,

        // Step 3: Respondent Auto-Suggest & Serial Alert
        isSearchingRespondents,
        respondentSearchResults,
        selectedRespondentEntity,
        handleSelectRespondentEntity,
        handleClearRespondentEntity,
        matchedRespondent,

        // Form state & handlers
        data,
        setData,
        processing,
        errors,
        toggleReferral,
        toggleActionSought,
        toggleWeaponUsed,
        toggleSubstanceAbuse,
        toggleEmergencyAction,
        handleBirthdateChange,
        handleIntakeTypeChange,
        handleNext,
        handleBack,
        handleKeyDown,
        handlePromptSave,
        handleConfirmSave,
        handleSubmit,
    } = useVawcCreateWorkflow(preselectedDossier);

    return (
        <AppLayout breadcrumbs={[
            { title: 'VAWC Management', href: '/admin/vawc' },
            { title: 'New Case Intake', href: '/admin/vawc/create' }
        ]}>
            <Head title="File New Incident - VAWC Management" />

            <form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
            >
                {/* ── TOP HEADER ── */}
                <CreateHeader
                    currentStep={currentStep}
                    processing={processing}
                    handleNext={handleNext}
                />

                {/* ── STEP 0: MASTER DOSSIER LIVE SEARCH GATEWAY ── */}
                <DossierSearchGateway
                    dossierQuery={dossierQuery}
                    setDossierQuery={setDossierQuery}
                    debouncedDossierQuery={debouncedDossierQuery}
                    isSearchingDossiers={isSearchingDossiers}
                    dossierSearchResults={dossierSearchResults}
                    attachedDossier={attachedDossier}
                    handleAttachDossier={handleAttachDossier}
                    handleDetachDossier={handleDetachDossier}
                />

                {/* ── SHADCN TABS WIZARD ── */}
                <Tabs value={currentStep.toString()} onValueChange={(val) => setCurrentStep(parseInt(val))} className="w-full">
                    <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full h-auto p-1.5 bg-muted rounded-xl gap-1">
                        <TabsTrigger value="1" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <UserPlus className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">1. Reporter</span>
                            <span className="hidden sm:inline truncate">1. Reporter & Victim</span>
                        </TabsTrigger>
                        <TabsTrigger value="2" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">2. Incident</span>
                            <span className="hidden sm:inline truncate">2. Incident Facts</span>
                        </TabsTrigger>
                        <TabsTrigger value="3" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <UserX className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">3. Respondent</span>
                            <span className="hidden sm:inline truncate">3. Respondent Profile</span>
                        </TabsTrigger>
                        <TabsTrigger value="4" className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 min-h-[44px] sm:min-h-[40px] font-semibold text-xs sm:text-sm">
                            <FileCheck className="w-4 h-4 shrink-0" />
                            <span className="sm:hidden">4. Verify</span>
                            <span className="hidden sm:inline truncate">4. Verification</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Step 1: Reporter & Victim */}
                    <TabsContent value="1">
                        <Step1Survivor
                            data={data}
                            setData={setData}
                            errors={errors}
                            attachedDossier={attachedDossier}
                            handleDetachDossier={handleDetachDossier}
                            handleIntakeTypeChange={handleIntakeTypeChange}
                            selectedSurvivorEntity={selectedSurvivorEntity}
                            handleSelectSurvivorEntity={handleSelectSurvivorEntity}
                            handleClearSurvivorEntity={handleClearSurvivorEntity}
                            isSearchingSurvivors={isSearchingSurvivors}
                            survivorSearchResults={survivorSearchResults}
                            handleBirthdateChange={handleBirthdateChange}
                        />
                    </TabsContent>

                    {/* Step 2: Incident Facts */}
                    <TabsContent value="2">
                        <Step2Incident
                            data={data}
                            setData={setData}
                            errors={errors}
                            zones={zones}
                            abuseTypes={abuseTypes}
                            toggleWeaponUsed={toggleWeaponUsed}
                            toggleSubstanceAbuse={toggleSubstanceAbuse}
                        />
                    </TabsContent>

                    {/* Step 3: Respondent Profile */}
                    <TabsContent value="3">
                        <Step3Respondent
                            data={data}
                            setData={setData}
                            errors={errors}
                            attachedDossier={attachedDossier}
                            handleDetachDossier={handleDetachDossier}
                            selectedRespondentEntity={selectedRespondentEntity}
                            handleSelectRespondentEntity={handleSelectRespondentEntity}
                            handleClearRespondentEntity={handleClearRespondentEntity}
                            isSearchingRespondents={isSearchingRespondents}
                            respondentSearchResults={respondentSearchResults}
                            matchedRespondent={matchedRespondent}
                        />
                    </TabsContent>

                    {/* Step 4: Verification, Remedies & Witnesses */}
                    <TabsContent value="4">
                        <Step4Verify
                            data={data}
                            setData={setData}
                            toggleReferral={toggleReferral}
                            toggleActionSought={toggleActionSought}
                            toggleEmergencyAction={toggleEmergencyAction}
                        />
                    </TabsContent>
                </Tabs>

                {/* ── BOTTOM WIZARD NAVIGATION ── */}
                <div className="flex justify-between items-center pt-4 border-t gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="min-h-[44px] sm:min-h-[40px] text-sm font-semibold px-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Previous Step
                    </Button>

                    <div className="flex items-center gap-2">
                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleNext}
                                className="min-h-[44px] sm:min-h-[40px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 shadow-xs"
                            >
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="sm"
                                onClick={handlePromptSave}
                                disabled={processing}
                                className="min-h-[44px] sm:min-h-[40px] bg-[#ce1126] hover:bg-red-700 text-white font-bold text-sm px-5 shadow-xs"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {processing ? 'Saving...' : 'Save & File Incident'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── CONFIRMATION MODAL ── */}
                <CreateConfirmModal
                    open={showConfirmModal}
                    onOpenChange={setShowConfirmModal}
                    attachedDossier={attachedDossier}
                    data={data}
                    processing={processing}
                    onConfirm={handleConfirmSave}
                />
            </form>
        </AppLayout>
    );
}
