<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->foreignId('dossier_id')->nullable()->after('id')->constrained('vawc_dossiers')->nullOnDelete();
            $table->integer('incident_sequence')->default(1)->after('dossier_id');
            $table->string('sub_case_number')->nullable()->after('incident_sequence');
        });

        // Automated Data Migration: Backfill existing vawc_cases into Master Dossiers
        $cases = DB::table('vawc_cases')
            ->join('case_reports', 'case_reports.id', '=', 'vawc_cases.case_report_id')
            ->select('vawc_cases.*', 'case_reports.victim_name', 'case_reports.case_number', 'case_reports.incident_date', 'case_reports.user_id')
            ->orderBy('vawc_cases.created_at', 'asc')
            ->get();

        $dossierGroups = [];
        $dossierSeq = 1;
        $year = date('Y');

        foreach ($cases as $c) {
            // Find respondent name from involved parties if available
            $respondent = DB::table('vawc_involved_parties')
                ->where('vawc_case_id', $c->id)
                ->where('role', 'Respondent')
                ->first();

            $victimParty = DB::table('vawc_involved_parties')
                ->where('vawc_case_id', $c->id)
                ->where('role', 'Victim')
                ->first();

            $victimName = trim($c->victim_name ?? ($victimParty->name ?? 'Unknown Survivor'));
            $respName = trim($respondent->name ?? 'Unknown Respondent');
            $relationship = $respondent->relationship_to_victim ?? 'Spouse / Partner';

            // Grouping key: Normalized victim name + respondent name
            $groupKey = strtolower($victimName) . '___' . strtolower($respName);

            if (!isset($dossierGroups[$groupKey])) {
                $dossierNumber = sprintf('DOS-%s-%04d', $year, $dossierSeq++);
                
                $survivorDemographics = [
                    'name' => $victimName,
                    'age' => $victimParty->age ?? null,
                    'gender' => $victimParty->gender ?? 'Female',
                    'contact' => $victimParty->contact_number ?? null,
                    'address' => $victimParty->address ?? null,
                    'civil_status' => $victimParty->civil_status ?? null,
                    'educational_attainment' => $victimParty->educational_attainment ?? null,
                    'occupation' => $victimParty->occupation ?? null,
                ];

                $respondentDemographics = [
                    'name' => $respName,
                    'age' => $respondent->age ?? null,
                    'gender' => $respondent->gender ?? 'Male',
                    'contact' => $respondent->contact_number ?? null,
                    'address' => $respondent->address ?? null,
                    'relationship' => $relationship,
                    'physical_description' => $respondent->physical_description ?? null,
                ];

                $dossierId = DB::table('vawc_dossiers')->insertGetId([
                    'dossier_number' => $dossierNumber,
                    'survivor_name' => $victimName,
                    'respondent_name' => $respName,
                    'relationship_type' => $relationship,
                    'survivor_demographics' => json_encode($survivorDemographics),
                    'respondent_demographics' => json_encode($respondentDemographics),
                    'incident_count' => 1,
                    'highest_threat_level' => 'PENDING',
                    'current_lifecycle' => $c->status === 'Closed' ? 'Dormant/Closed' : ($c->status === 'Monitoring' ? 'Under Monitoring' : ($c->status === 'Escalated' ? 'Escalated to Court' : 'Active BPO')),
                    'last_incident_at' => $c->incident_date ?? $c->created_at,
                    'created_by_id' => $c->user_id ?? null,
                    'created_at' => $c->created_at ?? now(),
                    'updated_at' => $c->updated_at ?? now(),
                ]);

                $dossierGroups[$groupKey] = [
                    'id' => $dossierId,
                    'number' => $dossierNumber,
                    'count' => 1,
                    'highest_threat' => 'PENDING',
                ];

                $incidentSeq = 1;
            } else {
                $dossierGroups[$groupKey]['count']++;
                $incidentSeq = $dossierGroups[$groupKey]['count'];

                // Update Master Dossier incident count & last incident date
                DB::table('vawc_dossiers')
                    ->where('id', $dossierGroups[$groupKey]['id'])
                    ->update([
                        'incident_count' => $incidentSeq,
                        'last_incident_at' => $c->incident_date ?? $c->created_at,
                        'updated_at' => now(),
                    ]);
            }

            $dossierId = $dossierGroups[$groupKey]['id'];
            $subCaseNumber = sprintf('%s-%02d', $dossierGroups[$groupKey]['number'], $incidentSeq);

            // Update sub-case with dossier relationship
            DB::table('vawc_cases')
                ->where('id', $c->id)
                ->update([
                    'dossier_id' => $dossierId,
                    'incident_sequence' => $incidentSeq,
                    'sub_case_number' => $subCaseNumber,
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vawc_cases', function (Blueprint $table) {
            $table->dropForeign(['dossier_id']);
            $table->dropColumn(['dossier_id', 'incident_sequence', 'sub_case_number']);
        });
    }
};
