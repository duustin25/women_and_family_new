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
use App\Models\VawcComplianceLog;
use App\Models\VawcLegalEscalation;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class VawcSeeder extends Seeder
{
    /**
     * Run the database seeds with precise Philippine Standard Time (Asia/Manila) dates and processes.
     */
    public function run(): void
    {
        // 1. Baseline Models & Officers
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $officer = User::where('email', 'vawc@gmail.com')->first() ?? $admin;
        $zones = Zone::all();
        $physicalAbuse = CaseAbuseType::where('name', 'Physical')->first();
        $psychAbuse = CaseAbuseType::where('name', 'Psychological')->first();
        $economicAbuse = CaseAbuseType::where('name', 'Economic')->first();
        $sexualAbuse = CaseAbuseType::where('name', 'Sexual')->first();

        $defaultZone = $zones->first() ?? Zone::create(['name' => 'Zone 1 - Poblacion', 'is_active' => true]);
        $zone2 = $zones->skip(1)->first() ?? $defaultZone;
        $zone3 = $zones->skip(2)->first() ?? $defaultZone;

        $year = '2026';
        $tz = 'Asia/Manila';

        // Clean out existing VAWC tables for fresh mock data
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        VawcComplianceLog::truncate();
        VawcLegalEscalation::truncate();
        VawcBpoServiceRecord::truncate();
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
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
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
            'closure_reason' => 'Referred to Social Welfare for Sustained Intervention (Monitoring Complete)',
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
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
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
            'highest_threat_level' => 'HIGH',
            'current_lifecycle' => 'Under Monitoring',
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
            'status' => 'Assessment',
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c4_1->id, 'role' => 'Victim', 'name' => 'Ana Reyes', 'age' => 22]);
        VawcInvolvedParty::create(['vawc_case_id' => $c4_1->id, 'role' => 'Respondent', 'name' => 'Marco Valderama', 'relationship_to_victim' => 'Former Dating Partner', 'physical_description' => '5\'8", slim build, rides black motorcycle']);
        VawcAssessment::create([
            'vawc_case_id' => $c4_1->id,
            'requires_medical' => false,
            'requires_alternative_housing' => true,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

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
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent complied with 15-day stay away order and agreed to sustainable child custody arrangement.',
            'closed_at' => Carbon::parse('2026-03-02 17:00:00', $tz),
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c5_1->id, 'role' => 'Victim', 'name' => 'Clarissa Diaz', 'age' => 38]);
        VawcInvolvedParty::create(['vawc_case_id' => $c5_1->id, 'role' => 'Respondent', 'name' => 'Juan Diaz', 'age' => 41]);
        VawcAssessment::create(['vawc_case_id' => $c5_1->id, 'requires_medical' => false, 'risk_score' => 4, 'risk_level' => 'LOW']);

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
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c6_1->id, 'role' => 'Victim', 'name' => 'Elena Cruz', 'age' => 27]);
        VawcInvolvedParty::create(['vawc_case_id' => $c6_1->id, 'role' => 'Respondent', 'name' => 'Lance Dicki', 'relationship_to_victim' => 'Former Live-in Partner', 'age' => 32]);
        
        $assessment6 = VawcAssessment::create([
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
        ]);
        VawcInvolvedParty::create(['vawc_case_id' => $c7_1->id, 'role' => 'Victim', 'name' => 'Shane Miller', 'age' => 29, 'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1']);
        VawcInvolvedParty::create(['vawc_case_id' => $c7_1->id, 'role' => 'Respondent', 'name' => 'Larry Dicki', 'relationship_to_victim' => 'Other Household Relative (with custody/care)', 'age' => 54, 'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1']);
        
        $assessment7 = VawcAssessment::create([
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
    }
}
