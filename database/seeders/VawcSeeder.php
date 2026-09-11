<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Zone;
use App\Models\CaseAbuseType;
use App\Models\CaseReport;
use App\Models\VawcDossier;
use App\Models\VawcCase;
use App\Models\VawcInvolvedParty;
use App\Models\VawcAssessment;
use App\Models\VawcProtectionOrder;
use App\Models\VawcBpoServiceRecord;
use App\Models\VawcAgencyTransmittal;
use App\Models\VawcComplianceLog;
use App\Models\VawcLegalEscalation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VawcSeeder extends Seeder
{
    /**
     * Run the database seeds with precise Philippine Standard Time (Asia/Manila) dates and processes.
     * Fully aligned with latest RA 9262 statutory features:
     * - Inter-Agency Transmittals (referral_status)
     * - Survivor Desired Actions (action_sought)
     * - Corroborating Witness Statements (witness_info)
     * - Confidential Informant / Whistleblower Shield (is_anonymous = true)
     * - Unassessed Fresh Intake for Triage Assessment testing (status = 'Intake', no assessment)
     * - Full 15-Day BPO Completion without Violation (Expired BPO, Step 7 Case Archival & Closure)
     * - Live Lapsed BPO ready for real-time closure testing in Step 5
     * - Standard statutory closure reasons and active BPO compliance logs
     */
    public function run(): void
    {
        // 1. Baseline Models & Officers
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $officer = User::where('email', 'head_B183@gmail.com')->first() ?? (User::where('role', 'head')->first() ?? $admin);
        $zones = Zone::all();
        $physicalAbuse = CaseAbuseType::where('name', 'Physical')->first();
        $psychAbuse = CaseAbuseType::where('name', 'Psychological')->first();
        $economicAbuse = CaseAbuseType::where('name', 'Economic')->first();
        $sexualAbuse = CaseAbuseType::where('name', 'Sexual')->first();

        $defaultZone = $zones->first() ?? Zone::create(['name' => 'Zone 1 - Poblacion', 'is_active' => true]);
        $zone2 = $zones->skip(1)->first() ?? $defaultZone;
        $zone3 = $zones->skip(2)->first() ?? $defaultZone;

        $tz = 'Asia/Manila';

        // Clean out existing VAWC tables for fresh mock data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        VawcComplianceLog::truncate();
        VawcLegalEscalation::truncate();
        VawcBpoServiceRecord::truncate();
        VawcAgencyTransmittal::truncate();
        VawcProtectionOrder::truncate();
        VawcAssessment::truncate();
        VawcInvolvedParty::truncate();
        VawcCase::truncate();
        VawcDossier::truncate();
        CaseReport::withTrashed()->where('type', 'VAWC')->forceDelete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // =============================================================
        // DOSSIER 1: Multi-Incident Recidivist Case (Active BPO - 3 Incidents)
        // Survivor: Shane Miller vs. Respondent: Lance Dicki (Spouse)
        // =============================================================
        $d1_incident3_date = Carbon::parse('2026-08-28 20:45:00', $tz);

        $dossier1 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0001',
            'survivor_name' => 'Shane Miller',
            'respondent_name' => 'Lance Dicki',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Shane Miller',
                'age' => 29,
                'gender' => 'Female',
                'contact' => '0917-888-1234',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
                'civil_status' => 'Married',
                'educational_attainment' => 'College',
                'occupation' => 'Online Merchant',
            ],
            'respondent_demographics' => [
                'name' => 'Lance Dicki',
                'age' => 32,
                'gender' => 'Male',
                'contact' => '0928-555-6789',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'educational_attainment' => 'College',
                'occupation' => 'Logistics Driver',
                'physical_description' => '5\'9", medium build, scar on left eyebrow',
            ],
            'incident_count' => 3,
            'highest_threat_level' => 'CRITICAL',
            'current_lifecycle' => 'Active BPO',
            'last_incident_at' => $d1_incident3_date,
            'created_by_id' => $admin->id,
        ]);

        // Dossier 1 - Incident #1 (Historical Lapsed Incident)
        $cr1_1_date = Carbon::parse('2026-01-15 20:15:00', $tz);
        $cr1_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $psychAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0001-01',
            'victim_name' => 'Shane Miller',
            'victim_age' => 28,
            'victim_gender' => 'Female',
            'complainant_name' => 'Shane Miller',
            'complainant_contact' => '0917-888-1234',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $cr1_1_date,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village',
            'description' => 'Repeated verbal harassment, threats of kicking victim out of the conjugal home, and public humiliation.',
            'lifecycle_status' => 'Resolved',
            'handled_by_id' => $officer->id,
        ]);

        $c1_1 = VawcCase::create([
            'dossier_id' => $dossier1->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0001-01',
            'case_report_id' => $cr1_1->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Closed',
            'referral_status' => ['Barangay VAW Desk', 'PAO / Legal Aid'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Psychosocial Support & Counseling'],
            'witness_info' => 'Sister-in-law present during verbal altercation corroborated aggressive threats.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent maintained distance during 15-day order with zero reported breaches.',
            'closed_at' => Carbon::parse('2026-01-31 17:00:00', $tz),
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_1->id,
            'role' => 'Victim',
            'name' => 'Shane Miller',
            'age' => 28,
            'gender' => 'Female',
            'contact_number' => '0917-888-1234',
            'address' => 'Block 4 Lot 12, Sunrise Village',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Lance Dicki',
            'age' => 31,
            'gender' => 'Male',
        ]);
        VawcAssessment::create([
            'vawc_case_id' => $c1_1->id,
            'requires_medical' => false,
            'abuse_frequency' => 1,
            'abuse_severity' => 1,
            'weapon_access' => 1,
            'life_threat_level' => 1,
            'risk_score' => 4,
            'risk_level' => 'LOW',
        ]);

        $po1_1 = VawcProtectionOrder::create([
            'vawc_case_id' => $c1_1->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0001-01',
            'status' => 'Expired',
            'application_datetime' => Carbon::parse('2026-01-16 09:00:00', $tz),
            'issued_datetime' => Carbon::parse('2026-01-16 11:00:00', $tz),
            'expiration_date' => Carbon::parse('2026-01-31 23:59:59', $tz),
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po1_1->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-01-16 14:00:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Lance Dicki',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c1_1->id,
            'monitor_date' => Carbon::parse('2026-01-19 10:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 3 Check: Respondent complied with 15-day stay-away mandate. Residing at temporary location.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c1_1->id,
            'monitor_date' => Carbon::parse('2026-01-24 15:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 8 Check: Survivor reported no communication or disturbance from respondent.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c1_1->id,
            'monitor_date' => Carbon::parse('2026-01-31 16:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 15 Check: Final monitoring check. 15-day protective order completed without incident. Survivor expressed security.',
        ]);

        // Dossier 1 - Incident #2 (Physical Abuse, Resolved Intervention)
        $cr1_2_date = Carbon::parse('2026-05-20 21:30:00', $tz);
        $cr1_2 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0001-02',
            'victim_name' => 'Shane Miller',
            'victim_age' => 29,
            'victim_gender' => 'Female',
            'complainant_name' => 'Shane Miller',
            'complainant_contact' => '0917-888-1234',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $cr1_2_date,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village',
            'description' => 'Physical altercation resulting in contusions on arms. Respondent threw household items in presence of minor child.',
            'lifecycle_status' => 'Resolved',
            'handled_by_id' => $officer->id,
        ]);

        $c1_2 = VawcCase::create([
            'dossier_id' => $dossier1->id,
            'incident_sequence' => 2,
            'sub_case_number' => 'VAWC-2026-0001-02',
            'case_report_id' => $cr1_2->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => true,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Closed',
            'referral_status' => ['DSWD / MSWDO', 'Hospital / Medico-Legal'],
            'action_sought' => ['Medico-Legal Examination & Care', 'Temporary Custody / Emergency Shelter'],
            'witness_info' => 'Attending barangay health worker documented bilateral forearm contusions and treated minor abrasion.',
            'closure_reason' => 'Referred to Social Welfare for Sustained Intervention (Monitoring Complete)',
            'closure_remarks' => 'MSWDO social worker conducted 3 home follow-ups and enrolled couple in specialized counseling.',
            'closed_at' => Carbon::parse('2026-06-19 16:30:00', $tz),
        ]);

        VawcInvolvedParty::create(['vawc_case_id' => $c1_2->id, 'role' => 'Victim', 'name' => 'Shane Miller', 'age' => 29]);
        VawcInvolvedParty::create(['vawc_case_id' => $c1_2->id, 'role' => 'Respondent', 'name' => 'Lance Dicki', 'age' => 32]);
        VawcAssessment::create([
            'vawc_case_id' => $c1_2->id,
            'requires_medical' => true,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

        // Dossier 1 - Incident #3 (ACTIVE BPO: Day 4 of 15 Days, Weapon Threat, Critical Risk)
        $cr1_3 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0001-03',
            'victim_name' => 'Shane Miller',
            'victim_age' => 29,
            'victim_gender' => 'Female',
            'complainant_name' => 'Shane Miller',
            'complainant_contact' => '0917-888-1234',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d1_incident3_date,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village',
            'description' => 'Respondent arrived intoxicated, brandished a kitchen knife threatening victim and child. Tanod responded and confiscated weapon.',
            'lifecycle_status' => 'Action Plan',
            'handled_by_id' => $officer->id,
        ]);

        $c1_3 = VawcCase::create([
            'dossier_id' => $dossier1->id,
            'incident_sequence' => 3,
            'sub_case_number' => 'VAWC-2026-0001-03',
            'case_report_id' => $cr1_3->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => true,
            'has_weapon_involved' => true,
            'weapons_confiscated' => true,
            'perpetrator_present' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['DSWD / MSWDO', 'PNP WCPD', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Temporary Custody / Emergency Shelter', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Barangay Tanod Patrol Officer Roberto Perez responded directly to distress call and disarmed respondent.',
        ]);

        VawcInvolvedParty::create(['vawc_case_id' => $c1_3->id, 'role' => 'Victim', 'name' => 'Shane Miller', 'age' => 29, 'contact_number' => '0917-888-1234', 'address' => 'Block 4 Lot 12, Sunrise Village']);
        VawcInvolvedParty::create(['vawc_case_id' => $c1_3->id, 'role' => 'Respondent', 'relationship_to_victim' => 'Spouse (Legal Husband)', 'name' => 'Lance Dicki', 'age' => 32, 'contact_number' => '0928-555-6789', 'address' => 'Block 4 Lot 12, Sunrise Village']);
        
        VawcAssessment::create([
            'vawc_case_id' => $c1_3->id,
            'requires_medical' => true,
            'requires_alternative_housing' => true,
            'abuse_frequency' => 3,
            'abuse_severity' => 3,
            'weapon_access' => 3,
            'life_threat_level' => 3,
            'risk_score' => 12,
            'risk_level' => 'CRITICAL',
        ]);

        $bpo1_apply = Carbon::parse('2026-08-29 09:15:00', $tz);
        $bpo1_issue = Carbon::parse('2026-08-29 11:45:00', $tz); // Same-Day Issuance SLA
        $bpo1_expire = Carbon::parse('2026-09-13 23:59:59', $tz);

        $po1 = VawcProtectionOrder::create([
            'vawc_case_id' => $c1_3->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0001-03',
            'status' => 'Served',
            'application_datetime' => $bpo1_apply,
            'issued_datetime' => $bpo1_issue,
            'expiration_date' => $bpo1_expire,
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po1->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-08-29 15:30:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Lance Dicki',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c1_3->id,
            'monitor_date' => Carbon::parse('2026-08-31 14:30:00', $tz),
            'is_compliant' => true,
            'notes' => 'Respondent is currently staying at his brother\'s residence as mandated by BPO. Victim reports no communication or threats.',
            'referral_type' => 'DSWD (Counseling)',
            'referral_details' => 'Family Counseling and Rehabilitation Assessment',
        ]);

        $dossier1->syncDossierAggregates();

        // =============================================================
        // DOSSIER 2: Under Active Monitoring (2 Incidents)
        // Survivor: Maria Santos vs. Respondent: Roberto Santos (Common-Law Partner)
        // =============================================================
        $d2_lastIncident = Carbon::parse('2026-08-24 19:30:00', $tz);

        $dossier2 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0002',
            'survivor_name' => 'Maria Santos',
            'respondent_name' => 'Roberto Santos',
            'relationship_type' => 'Common-Law / Live-in Partner',
            'survivor_demographics' => [
                'name' => 'Maria Santos',
                'age' => 26,
                'gender' => 'Female',
                'contact' => '0919-111-2233',
                'address' => 'Purok 3, Riverside, Zone 2',
                'civil_status' => 'Live-in',
                'occupation' => 'Barangay Health Worker',
            ],
            'respondent_demographics' => [
                'name' => 'Roberto Santos',
                'age' => 28,
                'gender' => 'Male',
                'contact' => '0920-444-5566',
                'address' => 'Purok 3, Riverside, Zone 2',
                'relationship' => 'Common-Law / Live-in Partner',
                'civil_status' => 'Live-in',
                'occupation' => 'Construction Worker',
            ],
            'incident_count' => 2,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Under Monitoring',
            'last_incident_at' => $d2_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr2_1_date = Carbon::parse('2026-03-10 15:00:00', $tz);
        $cr2_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $economicAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0002-01',
            'victim_name' => 'Maria Santos',
            'victim_age' => 25,
            'victim_gender' => 'Female',
            'complainant_name' => 'Maria Santos',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $cr2_1_date,
            'incident_location' => 'Purok 3, Riverside',
            'description' => 'Withholding of financial support for common child, demanding victim\'s earnings.',
            'lifecycle_status' => 'Resolved',
            'handled_by_id' => $officer->id,
        ]);

        $c2_1 = VawcCase::create([
            'dossier_id' => $dossier2->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0002-01',
            'case_report_id' => $cr2_1->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'status' => 'Closed',
            'referral_status' => ['PAO / Legal Aid', 'Barangay VAW Desk'],
            'action_sought' => ['Psychosocial Support & Counseling'],
            'witness_info' => 'Neighbor corroborated repeated deprivation of child sustenance funds.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent agreed to formal voluntary child support agreement via PAO intervention.',
            'closed_at' => Carbon::parse('2026-03-26 17:00:00', $tz),
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c2_1->id, 'role' => 'Victim', 'name' => 'Maria Santos']);
        VawcInvolvedParty::create(['vawc_case_id' => $c2_1->id, 'role' => 'Respondent', 'name' => 'Roberto Santos']);
        VawcAssessment::create(['vawc_case_id' => $c2_1->id, 'requires_medical' => false, 'risk_score' => 4, 'risk_level' => 'LOW']);

        $cr2_2 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0002-02',
            'victim_name' => 'Maria Santos',
            'victim_age' => 26,
            'victim_gender' => 'Female',
            'complainant_name' => 'Maria Santos',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d2_lastIncident,
            'incident_location' => 'Purok 3, Riverside',
            'description' => 'Slapping and verbal assault following argument over household finances.',
            'lifecycle_status' => 'Action Plan',
            'handled_by_id' => $officer->id,
        ]);

        $c2_2 = VawcCase::create([
            'dossier_id' => $dossier2->id,
            'incident_sequence' => 2,
            'sub_case_number' => 'VAWC-2026-0002-02',
            'case_report_id' => $cr2_2->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['Barangay VAW Desk', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Purok leader intervened after hearing screams and observed victim with facial bruising.',
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c2_2->id, 'role' => 'Victim', 'name' => 'Maria Santos', 'age' => 26]);
        VawcInvolvedParty::create(['vawc_case_id' => $c2_2->id, 'role' => 'Respondent', 'name' => 'Roberto Santos', 'age' => 28]);
        VawcAssessment::create([
            'vawc_case_id' => $c2_2->id,
            'requires_medical' => false,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

        // Dossier 2 - Incident #2 Live Lapsed BPO
        // Expiration was Sep 9, 2026 (15 days from Aug 25).
        // Today is Sep 11, 2026 -> Case stays in 'Monitoring' (Step 5) with '15-Day BPO Lapsed' badge
        // perfectly ready for the user to click 'Close Case File' and test BPO closure!
        $po2_2 = VawcProtectionOrder::create([
            'vawc_case_id' => $c2_2->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0002-02',
            'status' => 'Served',
            'application_datetime' => Carbon::parse('2026-08-25 08:30:00', $tz),
            'issued_datetime' => Carbon::parse('2026-08-25 10:45:00', $tz),
            'expiration_date' => Carbon::parse('2026-09-09 23:59:59', $tz),
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po2_2->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-08-25 14:00:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Roberto Santos',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c2_2->id,
            'monitor_date' => Carbon::parse('2026-08-28 10:30:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 3 Check: Tanod home visit confirmed respondent is staying at his uncle\'s workshop. No contact made with victim.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c2_2->id,
            'monitor_date' => Carbon::parse('2026-09-02 14:15:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 8 Check: Survivor Maria Santos reports zero threats or physical appearances. Respondent attending counseling sessions.',
            'referral_type' => 'DSWD (Counseling)',
            'referral_details' => 'Enrolled in Family Welfare Counseling',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c2_2->id,
            'monitor_date' => Carbon::parse('2026-09-08 16:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 14 Check: Pre-expiration check-in. Respondent completed 14 consecutive days of compliance with zero breaches. BPO expires tomorrow.',
        ]);

        $dossier2->syncDossierAggregates();

        // =============================================================
        // DOSSIER 3: Court Escalation Case (Severe Breach - TPO Filing)
        // Survivor: Elena Cruz vs. Respondent: Mark Cruz (Spouse)
        // =============================================================
        $d3_lastIncident = Carbon::parse('2026-08-26 22:15:00', $tz);

        $dossier3 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0003',
            'survivor_name' => 'Elena Cruz',
            'respondent_name' => 'Mark Cruz',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Elena Cruz',
                'age' => 34,
                'gender' => 'Female',
                'contact' => '0918-333-7788',
                'address' => 'House 12, Sampaguita St., Zone 3',
                'civil_status' => 'Married',
                'occupation' => 'Teacher',
            ],
            'respondent_demographics' => [
                'name' => 'Mark Cruz',
                'age' => 36,
                'gender' => 'Male',
                'contact' => '0919-999-0011',
                'address' => 'House 12, Sampaguita St., Zone 3',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'occupation' => 'Security Guard',
                'physical_description' => '6\'0", muscular build',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'CRITICAL',
            'current_lifecycle' => 'Escalated to Court',
            'last_incident_at' => $d3_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr3_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone3->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0003-01',
            'victim_name' => 'Elena Cruz',
            'victim_age' => 34,
            'victim_gender' => 'Female',
            'complainant_name' => 'Elena Cruz',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d3_lastIncident,
            'incident_location' => 'House 12, Sampaguita St., Zone 3',
            'description' => 'Severe physical battery and violation of issued BPO. Respondent entered victim\'s temporary residence with weapon.',
            'lifecycle_status' => 'Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c3_1 = VawcCase::create([
            'dossier_id' => $dossier3->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0003-01',
            'case_report_id' => $cr3_1->id,
            'intake_type' => 'Direct',
            'children_count' => 2,
            'is_repeat_offense' => true,
            'has_weapon_involved' => true,
            'warrantless_arrest_made' => true,
            'status' => 'Escalated',
            'referral_status' => ['PNP WCPD', 'PAO / Legal Aid', 'Hospital / Medico-Legal'],
            'action_sought' => ['Criminal Investigation & Case Filing', 'Barangay Protection Order (BPO)', 'Temporary Custody / Emergency Shelter'],
            'witness_info' => 'Subdivision gate guard on duty logged respondent forcibly breaching gate with bladed tool.',
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c3_1->id, 'role' => 'Victim', 'name' => 'Elena Cruz', 'age' => 34]);
        VawcInvolvedParty::create(['vawc_case_id' => $c3_1->id, 'role' => 'Respondent', 'name' => 'Mark Cruz', 'age' => 36]);
        VawcAssessment::create([
            'vawc_case_id' => $c3_1->id,
            'requires_medical' => true,
            'requires_alternative_housing' => true,
            'abuse_frequency' => 3,
            'abuse_severity' => 3,
            'weapon_access' => 3,
            'life_threat_level' => 3,
            'risk_score' => 12,
            'risk_level' => 'CRITICAL',
        ]);

        $po3_1 = VawcProtectionOrder::create([
            'vawc_case_id' => $c3_1->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0003-01',
            'status' => 'Violated',
            'application_datetime' => Carbon::parse('2026-08-27 08:00:00', $tz),
            'issued_datetime' => Carbon::parse('2026-08-27 09:30:00', $tz),
            'expiration_date' => Carbon::parse('2026-09-11 23:59:59', $tz),
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po3_1->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-08-27 11:00:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Mark Cruz',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c3_1->id,
            'monitor_date' => Carbon::parse('2026-08-27 21:00:00', $tz),
            'is_compliant' => false,
            'notes' => 'Direct BPO violation: Respondent forcefully entered victim\'s residence brandishing weapon. Tanod disarmed respondent and made warrantless arrest.',
            'referral_type' => 'PNP/Prosecutor (Violation)',
            'referral_details' => 'Immediate Inquest Referral to PNP WCPD & Family Court under RA 9262 Sec. 15',
        ]);

        VawcLegalEscalation::create([
            'vawc_case_id' => $c3_1->id,
            'violation_datetime' => Carbon::parse('2026-08-27 21:00:00', $tz),
            'referral_target' => 'PNP Women and Children Protection Center & RTC Family Court',
            'escorted_by_pb' => true,
            'status' => 'Transmitted',
            'violation_description' => 'Direct violation of BPO Section 15. Inquest filing for criminal offense under RA 9262.',
        ]);

        $dossier3->syncDossierAggregates();

        // =============================================================
        // DOSSIER 4: Single Incident Fresh Intake (Pending Assessment / Triage)
        // Survivor: Ana Reyes vs. Respondent: Marco Valderama (Former Dating Partner)
        // NOTICE: NO VawcAssessment is seeded here intentionally so that the user
        // can immediately test "Step 1: Perform Triage Assessment" in Show.tsx!
        // =============================================================
        $d4_lastIncident = Carbon::parse('2026-08-31 16:30:00', $tz);

        $dossier4 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0004',
            'survivor_name' => 'Ana Reyes',
            'respondent_name' => 'Marco Valderama',
            'relationship_type' => 'Former Dating Partner',
            'survivor_demographics' => [
                'name' => 'Ana Reyes',
                'age' => 22,
                'gender' => 'Female',
                'contact' => '0935-777-8899',
                'address' => 'Corner Rizal St., Zone 1',
                'civil_status' => 'Single',
                'occupation' => 'College Student',
            ],
            'respondent_demographics' => [
                'name' => 'Marco Valderama',
                'age' => 25,
                'gender' => 'Male',
                'relationship' => 'Former Dating Partner',
                'physical_description' => '5\'8", slim build, rides black motorcycle with dark helmet',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'PENDING',
            'current_lifecycle' => 'Intake',
            'last_incident_at' => $d4_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr4_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $psychAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0004-01',
            'victim_name' => 'Ana Reyes',
            'victim_age' => 22,
            'victim_gender' => 'Female',
            'complainant_name' => 'Ana Reyes',
            'complainant_contact' => '0935-777-8899',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d4_lastIncident,
            'incident_location' => 'Corner Rizal St., Zone 1',
            'description' => 'Victim was stalked and harassed outside boarding house by former dating partner threatening non-consensual image distribution.',
            'lifecycle_status' => 'New',
            'handled_by_id' => $officer->id,
        ]);

        $c4_1 = VawcCase::create([
            'dossier_id' => $dossier4->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0004-01',
            'case_report_id' => $cr4_1->id,
            'intake_type' => 'Direct',
            'children_count' => 0,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Intake', // Ready for Phase 1 Triage Assessment in Show.tsx
            'referral_status' => ['PNP WCPD', 'Barangay VAW Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Boarding house landlady Aling Nena witnessed respondent circling the premises on a black motorcycle and shouting threats.',
        ]);

        VawcInvolvedParty::create(['vawc_case_id' => $c4_1->id, 'role' => 'Victim', 'name' => 'Ana Reyes', 'age' => 22, 'contact_number' => '0935-777-8899', 'address' => 'Corner Rizal St., Zone 1']);
        VawcInvolvedParty::create(['vawc_case_id' => $c4_1->id, 'role' => 'Respondent', 'name' => 'Marco Valderama', 'relationship_to_victim' => 'Former Dating Partner', 'physical_description' => '5\'8", slim build, rides black motorcycle']);
        // Note: No VawcAssessment is created here to leave case in Step 1 Triage Assessment!

        $dossier4->syncDossierAggregates();

        // =============================================================
        // DOSSIER 5: Dormant / Safely Closed Master Dossier
        // Survivor: Clarissa Diaz vs. Respondent: Juan Diaz (Former Spouse)
        // =============================================================
        $d5_lastIncident = Carbon::parse('2026-02-14 14:00:00', $tz);

        $dossier5 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0005',
            'survivor_name' => 'Clarissa Diaz',
            'respondent_name' => 'Juan Diaz',
            'relationship_type' => 'Former Spouse (Separated)',
            'survivor_demographics' => [
                'name' => 'Clarissa Diaz',
                'age' => 38,
                'gender' => 'Female',
                'contact' => '0922-333-4455',
                'address' => 'Purok 5, Maligaya Compound, Zone 2',
                'civil_status' => 'Separated',
                'occupation' => 'Store Owner',
            ],
            'respondent_demographics' => [
                'name' => 'Juan Diaz',
                'age' => 41,
                'gender' => 'Male',
                'contact' => '0922-888-9900',
                'address' => 'Purok 5, Maligaya Compound, Zone 2',
                'relationship' => 'Former Spouse (Separated)',
                'civil_status' => 'Separated',
                'occupation' => 'Electrician',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'LOW',
            'current_lifecycle' => 'Dormant/Closed',
            'last_incident_at' => $d5_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr5_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $psychAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0005-01',
            'victim_name' => 'Clarissa Diaz',
            'victim_age' => 38,
            'victim_gender' => 'Female',
            'complainant_name' => 'Clarissa Diaz',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d5_lastIncident,
            'incident_location' => 'Purok 5, Maligaya Compound',
            'description' => 'Unsolicited late-night knocking and nuisance at victim\'s store premises.',
            'lifecycle_status' => 'Closed',
            'handled_by_id' => $officer->id,
        ]);

        $c5_1 = VawcCase::create([
            'dossier_id' => $dossier5->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0005-01',
            'case_report_id' => $cr5_1->id,
            'intake_type' => 'Direct',
            'children_count' => 2,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'status' => 'Closed',
            'referral_status' => ['Barangay VAW Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)'],
            'witness_info' => 'Store assistant witnessed respondent aggressively banging on metal roll-up door after operating hours.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent complied with 15-day stay away order and agreed to sustainable child custody arrangement.',
            'closed_at' => Carbon::parse('2026-03-02 17:00:00', $tz),
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c5_1->id, 'role' => 'Victim', 'name' => 'Clarissa Diaz', 'age' => 38]);
        VawcInvolvedParty::create(['vawc_case_id' => $c5_1->id, 'role' => 'Respondent', 'name' => 'Juan Diaz', 'age' => 41]);
        VawcAssessment::create(['vawc_case_id' => $c5_1->id, 'requires_medical' => false, 'risk_score' => 4, 'risk_level' => 'LOW']);

        $po5_1 = VawcProtectionOrder::create([
            'vawc_case_id' => $c5_1->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0005-01',
            'status' => 'Expired',
            'application_datetime' => Carbon::parse('2026-02-15 09:00:00', $tz),
            'issued_datetime' => Carbon::parse('2026-02-15 11:00:00', $tz),
            'expiration_date' => Carbon::parse('2026-03-02 23:59:59', $tz),
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po5_1->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-02-15 15:00:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Juan Diaz',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c5_1->id,
            'monitor_date' => Carbon::parse('2026-02-18 10:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 3 Check: Respondent complied with 15-day stay-away mandate. Did not approach store premises.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c5_1->id,
            'monitor_date' => Carbon::parse('2026-02-23 14:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 8 Check: Routine check-in. Survivor affirms no disturbance or harassment.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c5_1->id,
            'monitor_date' => Carbon::parse('2026-03-02 16:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 15 Check: 15-day protection order successfully completed with zero violations. Survivor safe.',
        ]);

        $dossier5->syncDossierAggregates();

        // =============================================================
        // DOSSIER 6: Cross-Dossier Serial Perpetrator Case
        // Survivor: Elena Cruz vs. Respondent: Lance Dicki (Former Live-in Partner)
        // (Cross-linked to Dossier 1: Shane Miller vs Lance Dicki)
        // =============================================================
        $d6_lastIncident = Carbon::parse('2026-08-30 18:45:00', $tz);

        $dossier6 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0006',
            'survivor_name' => 'Elena Cruz',
            'respondent_name' => 'Lance Dicki',
            'relationship_type' => 'Former Live-in Partner',
            'survivor_demographics' => [
                'name' => 'Elena Cruz',
                'age' => 27,
                'gender' => 'Female',
                'contact' => '0918-999-3344',
                'address' => 'Purok 7, Sampaguita St., Zone 3',
                'civil_status' => 'Single',
                'occupation' => 'Call Center Agent',
            ],
            'respondent_demographics' => [
                'name' => 'Lance Dicki',
                'age' => 32,
                'gender' => 'Male',
                'contact' => '0928-555-6789',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
                'relationship' => 'Former Live-in Partner',
                'civil_status' => 'Married',
                'occupation' => 'Logistics Driver',
                'physical_description' => '5\'9", medium build, scar on left eyebrow',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Under Monitoring',
            'last_incident_at' => $d6_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr6_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone3->id,
            'abuse_type_id' => $psychAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0006-01',
            'victim_name' => 'Elena Cruz',
            'victim_age' => 27,
            'victim_gender' => 'Female',
            'complainant_name' => 'Elena Cruz',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d6_lastIncident,
            'incident_location' => 'Purok 7, Sampaguita St., Zone 3',
            'description' => 'Respondent repeatedly showed up at victim\'s workplace and boarding house making violent threats.',
            'lifecycle_status' => 'Action Plan',
            'handled_by_id' => $officer->id,
        ]);

        $c6_1 = VawcCase::create([
            'dossier_id' => $dossier6->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0006-01',
            'case_report_id' => $cr6_1->id,
            'intake_type' => 'Direct',
            'children_count' => 0,
            'is_repeat_offense' => true, // Serial cross-dossier repeat offender
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['PNP WCPD', 'Barangay VAW Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Criminal Investigation & Case Filing'],
            'witness_info' => 'Building security logged respondent attempting unauthorized entry 4 times in 3 days.',
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c6_1->id, 'role' => 'Victim', 'name' => 'Elena Cruz', 'age' => 27]);
        VawcInvolvedParty::create(['vawc_case_id' => $c6_1->id, 'role' => 'Respondent', 'name' => 'Lance Dicki', 'relationship_to_victim' => 'Former Live-in Partner', 'age' => 32]);
        
        VawcAssessment::create([
            'vawc_case_id' => $c6_1->id,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 3, // Elevated to 3 because perpetrator has 3 prior incidents under Shane Miller
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 8,
            'risk_level' => 'HIGH',
        ]);

        $dossier6->syncDossierAggregates();

        // =============================================================
        // DOSSIER 7: Compound Victimization Case
        // Survivor: Shane Miller vs. Respondent: Larry Dicki (Other Household Relative / Uncle)
        // (Cross-linked to Dossier 1: Shane Miller vs Lance Dicki)
        // =============================================================
        $d7_lastIncident = Carbon::parse('2026-08-31 13:15:00', $tz);

        $dossier7 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0007',
            'survivor_name' => 'Shane Miller',
            'respondent_name' => 'Larry Dicki',
            'relationship_type' => 'Other Household Relative (with custody/care)',
            'survivor_demographics' => [
                'name' => 'Shane Miller',
                'age' => 29,
                'gender' => 'Female',
                'contact' => '0917-888-1234',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
                'civil_status' => 'Married',
                'educational_attainment' => 'College',
                'occupation' => 'Online Merchant',
            ],
            'respondent_demographics' => [
                'name' => 'Larry Dicki',
                'age' => 54,
                'gender' => 'Male',
                'contact' => '0919-222-7788',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
                'relationship' => 'Other Household Relative (with custody/care)',
                'civil_status' => 'Single',
                'occupation' => 'Unemployed',
                'physical_description' => '5\'6", heavy build, graying hair',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'CRITICAL',
            'current_lifecycle' => 'Under Monitoring',
            'last_incident_at' => $d7_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr7_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $psychAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0007-01',
            'victim_name' => 'Shane Miller',
            'victim_age' => 29,
            'victim_gender' => 'Female',
            'complainant_name' => 'Shane Miller',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d7_lastIncident,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
            'description' => 'Respondent (Uncle of husband) engaged in verbal harassment and aggressive intimidation inside the shared family compound.',
            'lifecycle_status' => 'Action Plan',
            'handled_by_id' => $officer->id,
        ]);

        $c7_1 = VawcCase::create([
            'dossier_id' => $dossier7->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0007-01',
            'case_report_id' => $cr7_1->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['DSWD / MSWDO', 'LGU Crisis Center'],
            'action_sought' => ['Temporary Custody / Emergency Shelter', 'Barangay Protection Order (BPO)'],
            'witness_info' => 'Adjacent compound neighbor testified hearing respondent yelling death threats during property dispute.',
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c7_1->id, 'role' => 'Victim', 'name' => 'Shane Miller', 'age' => 29, 'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1']);
        VawcInvolvedParty::create(['vawc_case_id' => $c7_1->id, 'role' => 'Respondent', 'name' => 'Larry Dicki', 'relationship_to_victim' => 'Other Household Relative (with custody/care)', 'age' => 54, 'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1']);
        
        VawcAssessment::create([
            'vawc_case_id' => $c7_1->id,
            'requires_medical' => false,
            'requires_alternative_housing' => true, // Multi-perpetrator shared household triggers emergency shelter
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 3, // Elevated to 3 due to Compound Multi-Perpetrator Co-Habitation Risk
            'risk_score' => 8,
            'risk_level' => 'HIGH',
        ]);

        $dossier7->syncDossierAggregates();

        // =============================================================
        // DOSSIER 8: Whistleblower / Confidential Third-Party Informant Case
        // Demonstrates RA 9262 Section 44 Sealed Confidential Informant Feature
        // Survivor: Carmela Bautista vs. Respondent: Danilo Bautista (Spouse)
        // Complainant: Aling Remedios (Concerned Neighbor - Shielded by Law)
        // =============================================================
        $d8_lastIncident = Carbon::parse('2026-08-31 23:30:00', $tz);

        $dossier8 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0008',
            'survivor_name' => 'Carmela Bautista',
            'respondent_name' => 'Danilo Bautista',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Carmela Bautista',
                'age' => 31,
                'gender' => 'Female',
                'contact' => '0917-444-9988',
                'address' => 'Apartment 3B, San Jose St., Zone 1',
                'civil_status' => 'Married',
                'educational_attainment' => 'High School',
                'occupation' => 'Housewife',
            ],
            'respondent_demographics' => [
                'name' => 'Danilo Bautista',
                'age' => 35,
                'gender' => 'Male',
                'contact' => '0918-222-1133',
                'address' => 'Apartment 3B, San Jose St., Zone 1',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'educational_attainment' => 'High School',
                'occupation' => 'Tricycle Driver',
                'physical_description' => '5\'7", stout build, tattoo on right forearm',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Under Monitoring',
            'last_incident_at' => $d8_lastIncident,
            'created_by_id' => $admin->id,
        ]);

        $cr8_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0008-01',
            'victim_name' => 'Carmela Bautista',
            'victim_age' => 31,
            'victim_gender' => 'Female',
            'complainant_name' => 'Aling Remedios (Neighbor / Informant)',
            'complainant_contact' => '0918-777-6655',
            'relation_to_victim' => 'Concerned Neighbor (Whistleblower)',
            'is_anonymous' => true, // Triggers Section 44 Confidential Informant Shield
            'incident_date' => $d8_lastIncident,
            'incident_location' => 'Apartment 3B, San Jose St., Zone 1',
            'description' => 'Confidential third-party report: Neighbor heard screaming, physical blows, and victim crying for help through shared wall. Respondent was heard barricading doorway.',
            'lifecycle_status' => 'Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c8_1 = VawcCase::create([
            'dossier_id' => $dossier8->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0008-01',
            'case_report_id' => $cr8_1->id,
            'intake_type' => 'Third-Party',
            'children_count' => 2,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'perpetrator_present' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['DSWD / MSWDO', 'PNP WCPD', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Temporary Custody / Emergency Shelter', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Confidential Informant Aling Remedios and 2 adjacent apartment tenants provided corroborating statements regarding recurring late-night domestic violence.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c8_1->id,
            'role' => 'Victim',
            'name' => 'Carmela Bautista',
            'age' => 31,
            'gender' => 'Female',
            'contact_number' => '0917-444-9988',
            'address' => 'Apartment 3B, San Jose St., Zone 1',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c8_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Danilo Bautista',
            'age' => 35,
            'gender' => 'Male',
            'contact_number' => '0918-222-1133',
            'address' => 'Apartment 3B, San Jose St., Zone 1',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c8_1->id,
            'requires_medical' => true,
            'requires_alternative_housing' => true,
            'abuse_frequency' => 3,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 3,
            'risk_score' => 9,
            'risk_level' => 'HIGH',
        ]);

        $dossier8->syncDossierAggregates();

        // =============================================================
        // DOSSIER 9: Historical / Cold Case (Incident Occurred 2 Years Ago)
        // Survivor: Elena Manalo vs. Respondent: Eduardo Santos (Former Cohabitant)
        // Tests RA 9262 Section 14 (Imminent Danger requirement for BPO) vs.
        // Section 24 (10 to 20-Year Prescriptive Period for Criminal Complaints).
        // Sits on Step 2 (BPO Application) with no prior BPO filed yet.
        // =============================================================
        $d9_incident_date = Carbon::parse('2024-08-15 14:30:00', $tz);

        $dossier9 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0009',
            'survivor_name' => 'Elena Manalo',
            'respondent_name' => 'Eduardo Santos',
            'relationship_type' => 'Former Cohabitant / Ex-Live-in Partner',
            'survivor_demographics' => [
                'name' => 'Elena Manalo',
                'age' => 34,
                'gender' => 'Female',
                'contact' => '0922-333-7744',
                'address' => 'House 55, Mabini Extension, Zone 2',
                'civil_status' => 'Single',
                'educational_attainment' => 'Vocational',
                'occupation' => 'Freelance Seamstress',
            ],
            'respondent_demographics' => [
                'name' => 'Eduardo Santos',
                'age' => 38,
                'gender' => 'Male',
                'contact' => '0919-888-2211',
                'address' => 'Barangay San Isidro (Relocated)',
                'relationship' => 'Former Cohabitant / Ex-Live-in Partner',
                'civil_status' => 'Single',
                'occupation' => 'Construction Foreman',
                'physical_description' => '5\'10", heavily tattooed arms, muscular build',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'MODERATE',
            'current_lifecycle' => 'Application Pending',
            'last_incident_at' => $d9_incident_date,
            'created_by_id' => $admin->id,
        ]);

        $cr9_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0009-01',
            'victim_name' => 'Elena Manalo',
            'victim_age' => 34,
            'victim_gender' => 'Female',
            'complainant_name' => 'Elena Manalo',
            'complainant_contact' => '0922-333-7744',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d9_incident_date,
            'incident_location' => 'Former shared apartment, Zone 2',
            'description' => 'Historical Report: Severe physical assault and economic deprivation occurring approximately two years ago before victim escaped and relocated. Survivor now seeks formal criminal prosecution and documentation for permanent legal remedies.',
            'lifecycle_status' => 'Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c9_1 = VawcCase::create([
            'dossier_id' => $dossier9->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0009-01',
            'case_report_id' => $cr9_1->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'perpetrator_present' => false,
            'incident_veracity' => true,
            'status' => 'Assessment', // Step 1 complete; waiting at Step 2 (BPO Application / Direct Referral)
            'referral_status' => ['PNP WCPD', 'City Prosecutor\'s Office', 'Public Attorney\'s Office (PAO)'],
            'action_sought' => ['Criminal Prosecution (RA 9262 Sec. 24)', 'Barangay Protection Order (BPO)', 'Legal Aid & Counseling'],
            'witness_info' => 'Sister-in-law Teresa Manalo confirmed historical injuries and previous hospital admission record dated August 2024.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c9_1->id,
            'role' => 'Victim',
            'name' => 'Elena Manalo',
            'age' => 34,
            'gender' => 'Female',
            'contact_number' => '0922-333-7744',
            'address' => 'House 55, Mabini Extension, Zone 2',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c9_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Cohabitant / Ex-Live-in Partner',
            'name' => 'Eduardo Santos',
            'age' => 38,
            'gender' => 'Male',
            'contact_number' => '0919-888-2211',
            'address' => 'Barangay San Isidro (Relocated)',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c9_1->id,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 1,
            'abuse_severity' => 2,
            'weapon_access' => 0,
            'life_threat_level' => 1,
            'risk_score' => 4,
            'risk_level' => 'MODERATE',
        ]);

        $dossier9->syncDossierAggregates();

        // =============================================================
        // DOSSIER 10: Successfully Completed & Archived 15-Day BPO Case
        // Survivor: Giselle Ramirez vs. Respondent: Carlito Ramirez (Spouse)
        // Demonstrates RA 9262 Sec. 14 Completed 15-Day BPO with Zero Violations:
        // - Full 15-Day Compliance Cycle (Day 3, Day 8 counseling, Day 15 final check)
        // - BPO Order 'Expired' upon completion
        // - Step 7: Case Closed & Archived with '15-Day Protection Order Lapsed Successfully (No Violation)'
        // =============================================================
        $d10_incident_date = Carbon::parse('2026-08-18 19:30:00', $tz);

        $dossier10 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0010',
            'survivor_name' => 'Giselle Ramirez',
            'respondent_name' => 'Carlito Ramirez',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Giselle Ramirez',
                'age' => 30,
                'gender' => 'Female',
                'contact' => '0917-234-5678',
                'address' => 'Lot 8 Block 3, Rosal St., Zone 1',
                'civil_status' => 'Married',
                'educational_attainment' => 'College Graduate',
                'occupation' => 'High School Teacher',
            ],
            'respondent_demographics' => [
                'name' => 'Carlito Ramirez',
                'age' => 33,
                'gender' => 'Male',
                'contact' => '0928-876-5432',
                'address' => 'Lot 8 Block 3, Rosal St., Zone 1',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'educational_attainment' => 'Vocational',
                'occupation' => 'Auto Mechanic',
                'physical_description' => '5\'7", athletic build, eagle tattoo on right shoulder',
            ],
            'incident_count' => 1,
            'highest_threat_level' => 'MODERATE',
            'current_lifecycle' => 'Dormant/Closed',
            'last_incident_at' => $d10_incident_date,
            'created_by_id' => $admin->id,
        ]);

        $cr10_1 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $defaultZone->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0010-01',
            'victim_name' => 'Giselle Ramirez',
            'victim_age' => 30,
            'victim_gender' => 'Female',
            'complainant_name' => 'Giselle Ramirez',
            'complainant_contact' => '0917-234-5678',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d10_incident_date,
            'incident_location' => 'Lot 8 Block 3, Rosal St., Zone 1',
            'description' => 'Respondent arrived home in an intoxicated state, engaged in destructive behavior by smashing dinnerware, hurled profanities, and violently grabbed victim\'s arms causing bilateral contusions.',
            'lifecycle_status' => 'Resolved',
            'handled_by_id' => $officer->id,
        ]);

        $c10_1 = VawcCase::create([
            'dossier_id' => $dossier10->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0010-01',
            'case_report_id' => $cr10_1->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Closed',
            'referral_status' => ['Barangay VAW Desk', 'DSWD / MSWDO', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Psychosocial Support & Counseling', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Next-door neighbor heard loud commotion and crying, saw respondent leaving on foot, and assisted victim to barangay outpost.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Full 15-day statutory Barangay Protection Order elapsed on September 3, 2026 with 100% respondent compliance and zero violations or breaches. Respondent temporarily relocated to Purok 4 relative residence, surrendered house keys, and actively attended MSWDO anger management counseling. Survivor affirmed safety, emotional stability, and expressed profound gratitude to the VAW Desk. File officially concluded and preserved under Step 7.',
            'closed_at' => Carbon::parse('2026-09-04 09:30:00', $tz),
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c10_1->id,
            'role' => 'Victim',
            'name' => 'Giselle Ramirez',
            'age' => 30,
            'gender' => 'Female',
            'contact_number' => '0917-234-5678',
            'address' => 'Lot 8 Block 3, Rosal St., Zone 1',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c10_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Carlito Ramirez',
            'age' => 33,
            'gender' => 'Male',
            'contact_number' => '0928-876-5432',
            'address' => 'Lot 8 Block 3, Rosal St., Zone 1',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c10_1->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

        $bpo10_apply = Carbon::parse('2026-08-19 08:30:00', $tz);
        $bpo10_issue = Carbon::parse('2026-08-19 10:15:00', $tz);
        $bpo10_expire = Carbon::parse('2026-09-03 23:59:59', $tz);

        $po10 = VawcProtectionOrder::create([
            'vawc_case_id' => $c10_1->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0010-01',
            'status' => 'Expired',
            'application_datetime' => $bpo10_apply,
            'issued_datetime' => $bpo10_issue,
            'expiration_date' => $bpo10_expire,
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po10->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-08-19 14:00:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Carlito Ramirez',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c10_1->id,
            'monitor_date' => Carbon::parse('2026-08-22 10:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 3 Compliance Check: Tanod security patrol conducted unscheduled check. Respondent complied with order to temporarily vacate residence and reside at Purok 4 relative\'s home. No threats communicated.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c10_1->id,
            'monitor_date' => Carbon::parse('2026-08-27 14:30:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 8 Compliance Check: Survivor confirmed zero harassment or digital messages. Respondent attended voluntary anger management and marital counseling intake at MSWDO.',
            'referral_type' => 'DSWD (Counseling)',
            'referral_details' => 'Enrolled in MSWDO Restorative Family Counseling',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c10_1->id,
            'monitor_date' => Carbon::parse('2026-09-03 16:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 15 Final Compliance Inspection: Full 15-day statutory duration concluded with zero violations or breaches. Respondent fully complied with distance and counseling mandates. Survivor affirms personal safety and stability.',
        ]);

        $dossier10->syncDossierAggregates();

        // =============================================================
        // SCENARIO A: MULTI-VICTIM LEGAL-AGE SIBLINGS VS. UNCLE (NON-INTIMATE RELATIVE)
        // Dossier 11: Luna Garcia (23 yrs old) vs. Larry Garcia (Paternal Uncle)
        // Decoupled Master Dossier: Routed to PNP WCPD under Revised Penal Code (Sec. 3 Jurisdictional Boundary)
        // =============================================================
        $d11_date = Carbon::parse('2026-09-08 11:30:00', $tz);

        $dossier11 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0011',
            'survivor_name' => 'Luna Garcia',
            'respondent_name' => 'Larry Garcia',
            'relationship_type' => 'Collateral Relative (Uncle)',
            'incident_count' => 1,
            'highest_threat_level' => 'MODERATE',
            'current_lifecycle' => 'Active',
            'last_incident_at' => $d11_date,
            'created_by_id' => $admin->id,
        ]);

        $cr11 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0011-01',
            'victim_name' => 'Luna Garcia',
            'victim_age' => 23,
            'victim_gender' => 'Female',
            'complainant_name' => 'Luna Garcia',
            'complainant_contact' => '0917-888-1122',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d11_date,
            'incident_location' => 'Block 4 Lot 12, Mahogany Ave., Zone 2',
            'description' => 'Adult survivor assaulted by her paternal uncle Larry Garcia following a family property dispute. Respondent physically shoved victim against a concrete wall, causing contusions to her left shoulder, and issued verbal threats.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c11 = VawcCase::create([
            'dossier_id' => $dossier11->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0011-01',
            'case_report_id' => $cr11->id,
            'intake_type' => 'Direct',
            'children_count' => 0,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Escalated',
            'referral_status' => ['Barangay VAW Desk', 'PNP WCPD (Women & Children Protection Desk)', 'Public Attorney\'s Office (PAO)'],
            'action_sought' => ['Police Inquest Referral', 'Medico-Legal Examination', 'Legal Aid Assistance'],
            'witness_info' => 'Twin sister Jamie Garcia witnessed the assault and attempted to intervene before also being attacked by respondent.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c11->id,
            'role' => 'Victim',
            'name' => 'Luna Garcia',
            'age' => 23,
            'gender' => 'Female',
            'contact_number' => '0917-888-1122',
            'address' => 'Block 4 Lot 12, Mahogany Ave., Zone 2',
            'civil_status' => 'Single',
            'occupation' => 'Customer Support Associate',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c11->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Collateral Relative (Uncle)',
            'name' => 'Larry Garcia',
            'age' => 51,
            'gender' => 'Male',
            'contact_number' => '0922-444-9988',
            'address' => 'Block 4 Lot 14, Mahogany Ave., Zone 2',
            'civil_status' => 'Married',
            'occupation' => 'Freelance Contractor',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c11->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 1,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 6,
            'risk_level' => 'MODERATE',
        ]);

        VawcLegalEscalation::create([
            'vawc_case_id' => $c11->id,
            'referral_target' => 'PNP Women and Children Protection',
            'violation_datetime' => Carbon::parse('2026-09-08 14:00:00', $tz),
            'violation_description' => 'Physical assault and intimidation committed by non-intimate adult relative (paternal uncle). Under RA 9262 Section 3, uncle-niece disputes fall under the Revised Penal Code rather than an intimate-partner BPO. Case formally transmitted to PNP WCPD for criminal inquest.',
            'escorted_by_pb' => true,
        ]);

        $dossier11->syncDossierAggregates();

        // =============================================================
        // SCENARIO A (CONTINUED): MULTI-VICTIM LEGAL-AGE SIBLING 2
        // Dossier 12: Jamie Garcia (23 yrs old) vs. Larry Garcia (Same Uncle!)
        // Triggers Cross-Dossier Serial Perpetrator Alert (2 Victims Linked to Larry Garcia)
        // =============================================================
        $dossier12 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0012',
            'survivor_name' => 'Jamie Garcia',
            'respondent_name' => 'Larry Garcia',
            'relationship_type' => 'Collateral Relative (Uncle)',
            'incident_count' => 1,
            'highest_threat_level' => 'MODERATE',
            'current_lifecycle' => 'Active',
            'last_incident_at' => $d11_date,
            'created_by_id' => $admin->id,
        ]);

        $cr12 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0012-01',
            'victim_name' => 'Jamie Garcia',
            'victim_age' => 23,
            'victim_gender' => 'Female',
            'complainant_name' => 'Jamie Garcia',
            'complainant_contact' => '0917-888-3344',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d11_date,
            'incident_location' => 'Block 4 Lot 12, Mahogany Ave., Zone 2',
            'description' => 'Sister of Luna Garcia assaulted during the same household altercation by uncle Larry Garcia when attempting to protect her sister. Sustained blunt force trauma to wrist and grave threats of recurring violence.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c12 = VawcCase::create([
            'dossier_id' => $dossier12->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0012-01',
            'case_report_id' => $cr12->id,
            'intake_type' => 'Direct',
            'children_count' => 0,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Escalated',
            'referral_status' => ['Barangay VAW Desk', 'PNP WCPD (Women & Children Protection Desk)', 'City Prosecutor\'s Office'],
            'action_sought' => ['Criminal Complaint Assistance', 'Police Protection & Patrols', 'PAO Legal Aid'],
            'witness_info' => 'Sister Luna Garcia and neighbor Romeo Reyes corroborating the sudden assault by Larry Garcia.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c12->id,
            'role' => 'Victim',
            'name' => 'Jamie Garcia',
            'age' => 23,
            'gender' => 'Female',
            'contact_number' => '0917-888-3344',
            'address' => 'Block 4 Lot 12, Mahogany Ave., Zone 2',
            'civil_status' => 'Single',
            'occupation' => 'Graphic Designer',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c12->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Collateral Relative (Uncle)',
            'name' => 'Larry Garcia',
            'age' => 51,
            'gender' => 'Male',
            'contact_number' => '0922-444-9988',
            'address' => 'Block 4 Lot 14, Mahogany Ave., Zone 2',
            'civil_status' => 'Married',
            'occupation' => 'Freelance Contractor',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c12->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 1,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 6,
            'risk_level' => 'MODERATE',
        ]);

        VawcLegalEscalation::create([
            'vawc_case_id' => $c12->id,
            'referral_target' => 'PNP Women and Children Protection',
            'violation_datetime' => Carbon::parse('2026-09-08 14:30:00', $tz),
            'violation_description' => 'Corroborating physical assault against second sibling by same respondent Larry Garcia. Forwarded to PNP WCPD for joint criminal inquest while preserving distinct survivor affidavits.',
            'escorted_by_pb' => true,
        ]);

        $dossier12->syncDossierAggregates();

        // =============================================================
        // SCENARIO B: MINOR SIBLINGS COVERED UNDER RA 7610 & RA 9262
        // Dossier 13: Clarisse Mendoza vs. Rodrigo Mendoza (Spouse)
        // Features: 2 Minor Children Covered with School/Daycare Stay-Away & Tender of Service
        // =============================================================
        $d13_date = Carbon::parse('2026-09-07 09:00:00', $tz);

        $dossier13 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0013',
            'survivor_name' => 'Clarisse Mendoza',
            'respondent_name' => 'Rodrigo Mendoza',
            'relationship_type' => 'Spouse (Legal Husband)',
            'incident_count' => 1,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Active',
            'last_incident_at' => $d13_date,
            'created_by_id' => $admin->id,
        ]);

        $cr13 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $psychAbuse?->id ?? 2,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0013-01',
            'victim_name' => 'Clarisse Mendoza',
            'victim_age' => 32,
            'victim_gender' => 'Female',
            'complainant_name' => 'Clarisse Mendoza',
            'complainant_contact' => '0919-555-7788',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d13_date,
            'incident_location' => 'Unit 3B, Sunshine Residences, Zone 2',
            'description' => 'Respondent engaged in violent emotional and physical terrorization in the presence of their two minor children (ages 8 and 5). Threatening to abduct the children from their elementary school and daycare center.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c13 = VawcCase::create([
            'dossier_id' => $dossier13->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0013-01',
            'case_report_id' => $cr13->id,
            'intake_type' => 'Direct',
            'children_count' => 2,
            'children_details' => [
                [
                    'name' => 'Bea Mendoza',
                    'age' => 8,
                    'school_or_daycare' => 'Zone 2 Elementary School',
                ],
                [
                    'name' => 'Lucas Mendoza',
                    'age' => 5,
                    'school_or_daycare' => 'Zone 2 Daycare Center',
                ],
            ],
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['Barangay VAW Desk', 'BCPC (Child Protection Committee)', 'DepEd Child Protection Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'School & Daycare Stay-Away Perimeter', 'Child Psychosocial Counseling'],
            'witness_info' => 'Building security guard assisted survivor after respondent attempted to force entry into unit while screaming threats.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c13->id,
            'role' => 'Victim',
            'name' => 'Clarisse Mendoza',
            'age' => 32,
            'gender' => 'Female',
            'contact_number' => '0919-555-7788',
            'address' => 'Unit 3B, Sunshine Residences, Zone 2',
            'civil_status' => 'Married',
            'occupation' => 'High School Teacher',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c13->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Rodrigo Mendoza',
            'age' => 35,
            'gender' => 'Male',
            'contact_number' => '0920-111-2233',
            'address' => 'Unit 3B, Sunshine Residences, Zone 2',
            'civil_status' => 'Married',
            'occupation' => 'Logistics Driver',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c13->id,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 3,
            'abuse_severity' => 3,
            'weapon_access' => 1,
            'life_threat_level' => 3,
            'risk_score' => 10,
            'risk_level' => 'HIGH',
        ]);

        $bpo13_apply = Carbon::parse('2026-09-07 09:30:00', $tz);
        $bpo13_issue = Carbon::parse('2026-09-07 11:00:00', $tz);
        $bpo13_expire = Carbon::parse('2026-09-22 23:59:59', $tz);

        $po13 = VawcProtectionOrder::create([
            'vawc_case_id' => $c13->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0013-01',
            'status' => 'Served',
            'application_datetime' => $bpo13_apply,
            'issued_datetime' => $bpo13_issue,
            'expiration_date' => $bpo13_expire,
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
            'signatory_role' => 'Punong Barangay',
            'signatory_name' => 'Hon. Alberto C. Morales',
            'signatory_designation' => 'Punong Barangay',
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po13->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-09-07 14:00:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Rodrigo Mendoza',
            'refused_to_sign' => true,
            'serving_officer_name' => 'Tanod Supervisor Danilo Cruz',
            'witness_tanod_name' => 'Tanod Roberto Diaz',
            'tender_notes' => 'Respondent adamantly refused to accept or affix signature to the BPO document. Tender of Service was formally executed pursuant to SC A.M. No. 04-10-11-SC by leaving physical copy in respondent\'s presence at doorway witnessed by Tanod Diaz.',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c13->id,
            'monitor_date' => Carbon::parse('2026-09-09 11:30:00', $tz),
            'is_compliant' => true,
            'notes' => 'School and Daycare Protection Check: Barangay Tanod roving unit verified respondent was not observed within the 500-meter radius of Zone 2 Elementary School or Daycare Center. Mother affirmed children arrived safely.',
        ]);

        $dossier13->syncDossierAggregates();

        // =============================================================
        // SCENARIO C: DUAL-TRACK HOUSEHOLD SPLIT (TRACK 1 - WIFE)
        // Dossier 14: Jessie Lucia (26 yrs old) vs. Marco Alcantara (Husband)
        // Qualifying Intimate Partner -> RA 9262 Emergency BPO Track (Signed by Acting Kagawad)
        // =============================================================
        $d14_date = Carbon::parse('2026-09-09 07:30:00', $tz);

        $dossier14 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0014',
            'survivor_name' => 'Jessie Lucia',
            'respondent_name' => 'Marco Alcantara',
            'relationship_type' => 'Spouse (Legal Husband)',
            'incident_count' => 1,
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Active',
            'last_incident_at' => $d14_date,
            'created_by_id' => $admin->id,
        ]);

        $cr14 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone3->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0014-01',
            'victim_name' => 'Jessie Lucia',
            'victim_age' => 26,
            'victim_gender' => 'Female',
            'complainant_name' => 'Jessie Lucia',
            'complainant_contact' => '0918-333-5566',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d14_date,
            'incident_location' => 'House #45, Narra St., Zone 3',
            'description' => 'Respondent husband engaged in severe domestic physical assault against wife Jessie Lucia inside their shared home, inflicting lacerations and bruising. Sister-in-law Rina Lucia was also injured while trying to separate them.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c14 = VawcCase::create([
            'dossier_id' => $dossier14->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0014-01',
            'case_report_id' => $cr14->id,
            'intake_type' => 'Direct',
            'children_count' => 0,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['Barangay VAW Desk', 'Barangay Tanod Patrol Outpost', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Order to Vacate Shared Residence', 'Tanod Security Patrols'],
            'witness_info' => 'Sister Rina Lucia and next-door neighbor witnessed the domestic violence at House #45 Narra St.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c14->id,
            'role' => 'Victim',
            'name' => 'Jessie Lucia',
            'age' => 26,
            'gender' => 'Female',
            'contact_number' => '0918-333-5566',
            'address' => 'House #45, Narra St., Zone 3',
            'civil_status' => 'Married',
            'occupation' => 'Administrative Assistant',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c14->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Marco Alcantara',
            'age' => 29,
            'gender' => 'Male',
            'contact_number' => '0929-777-4455',
            'address' => 'House #45, Narra St., Zone 3',
            'civil_status' => 'Married',
            'occupation' => 'Sales Executive',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c14->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 2,
            'abuse_severity' => 3,
            'weapon_access' => 1,
            'life_threat_level' => 3,
            'risk_score' => 8,
            'risk_level' => 'HIGH',
        ]);

        $bpo14_apply = Carbon::parse('2026-09-09 08:30:00', $tz);
        $bpo14_issue = Carbon::parse('2026-09-09 10:00:00', $tz);
        $bpo14_expire = Carbon::parse('2026-09-24 23:59:59', $tz);

        $po14 = VawcProtectionOrder::create([
            'vawc_case_id' => $c14->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0014-01',
            'status' => 'Served',
            'application_datetime' => $bpo14_apply,
            'issued_datetime' => $bpo14_issue,
            'expiration_date' => $bpo14_expire,
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
            'signatory_role' => 'Acting Kagawad',
            'signatory_name' => 'Kag. Elena Bautista',
            'signatory_designation' => 'Barangay Kagawad / Officer-in-Charge',
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po14->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-09-09 13:30:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Marco Alcantara',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c14->id,
            'monitor_date' => Carbon::parse('2026-09-10 15:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 1 Compliance Verification: Respondent complied with directive to vacate House #45 Narra St. and surrendered house keys in presence of Tanod. Survivor affirms no communication attempted.',
        ]);

        $dossier14->syncDossierAggregates();

        // =============================================================
        // SCENARIO C (CONTINUED): DUAL-TRACK HOUSEHOLD SPLIT (TRACK 2 - SISTER-IN-LAW)
        // Dossier 15: Rina Lucia (22 yrs old) vs. Marco Alcantara (Brother-in-Law)
        // Same Household, Non-Intimate Relative -> Routed to PNP WCPD Criminal Transmittal (RPC Battery)
        // Cross-Dossier Intelligence Links Both Sisters to Marco Alcantara at Narra St.
        // =============================================================
        $dossier15 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0015',
            'survivor_name' => 'Rina Lucia',
            'respondent_name' => 'Marco Alcantara',
            'relationship_type' => 'In-Law (Brother-in-Law / Shared Household Relative)',
            'incident_count' => 1,
            'highest_threat_level' => 'MODERATE',
            'current_lifecycle' => 'Active',
            'last_incident_at' => $d14_date,
            'created_by_id' => $admin->id,
        ]);

        $cr15 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone3->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0015-01',
            'victim_name' => 'Rina Lucia',
            'victim_age' => 22,
            'victim_gender' => 'Female',
            'complainant_name' => 'Rina Lucia',
            'complainant_contact' => '0918-333-9900',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d14_date,
            'incident_location' => 'House #45, Narra St., Zone 3',
            'description' => 'Sister-in-law of Marco Alcantara residing in the same household assaulted when intervening to shield her sister Jessie Lucia. Respondent violently shoved victim against furniture and struck her arm, causing soft-tissue trauma.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c15 = VawcCase::create([
            'dossier_id' => $dossier15->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0015-01',
            'case_report_id' => $cr15->id,
            'intake_type' => 'Direct',
            'children_count' => 0,
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'incident_veracity' => true,
            'status' => 'Escalated',
            'referral_status' => ['Barangay VAW Desk', 'PNP WCPD (Women & Children Protection Desk)', 'Hospital / Medico-Legal'],
            'action_sought' => ['PNP Inquest Referral', 'Medico-Legal Certificate', 'PAO Legal Representation'],
            'witness_info' => 'Elder sister Jessie Lucia and neighbor witnessed respondent Marco Alcantara inflicting physical battery on Rina Lucia.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c15->id,
            'role' => 'Victim',
            'name' => 'Rina Lucia',
            'age' => 22,
            'gender' => 'Female',
            'contact_number' => '0918-333-9900',
            'address' => 'House #45, Narra St., Zone 3',
            'civil_status' => 'Single',
            'occupation' => 'College Student',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c15->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'In-Law (Brother-in-Law / Shared Household Relative)',
            'name' => 'Marco Alcantara',
            'age' => 29,
            'gender' => 'Male',
            'contact_number' => '0929-777-4455',
            'address' => 'House #45, Narra St., Zone 3',
            'civil_status' => 'Married',
            'occupation' => 'Sales Executive',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c15->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 1,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 6,
            'risk_level' => 'MODERATE',
        ]);

        VawcLegalEscalation::create([
            'vawc_case_id' => $c15->id,
            'referral_target' => 'PNP Women and Children Protection',
            'violation_datetime' => Carbon::parse('2026-09-09 09:00:00', $tz),
            'violation_description' => 'Assault of non-intimate female household member (sister-in-law) during the same domestic incident as wife Jessie Lucia. While the wife proceeds on the RA 9262 BPO track, this docket is transmitted to PNP WCPD for criminal battery under the Revised Penal Code.',
            'escorted_by_pb' => true,
        ]);

        $dossier15->syncDossierAggregates();
    }
}
