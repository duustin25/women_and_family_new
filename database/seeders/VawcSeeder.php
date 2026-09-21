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
     * Fully aligned with latest RA 9262 statutory features and DILG NBOO flowcharts:
     * - Complete Demographic Profiles (Addresses, Aliases, DOB, Auto-Age, Workplaces, Birthplaces, Nationalities)
     * - Physical Premise & Weapons Threat Assessment (Exact spots, Armed Offender flags, Weapons brandished, Substance abuse)
     * - Emergency Interventions & Alternative Housing (Medical facility targets, Shelter choices, Tanod emergency actions)
     * - Child-Survivor Safeguards & DILG Node B Guardian Consent (Minor victim age < 18, Mother/Guardian BPO consent)
     * - Confidential Informant / Whistleblower Shield (is_anonymous = true, separate complainant home address)
     * - Recidivist Dossier History & Cross-Dossier Serial Perpetrator Detection
     * - Strictly 20-Year Prescriptive Period under RA 9262 Sec. 24 / People v. Purisima
     * - Tender of Service & Acting Kagawad Signatory SLA workflows
     */
    public function run(): void
    {
        // 1. Baseline Models & Officers
        $admin = User::where('role', 'admin')->first() ?? User::first();
        $officer = User::where('email', 'djkhalid2m@gmail.com')->first() ?? (User::where('role', 'head')->first() ?? $admin);
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
        // Demonstrates 3 escalating incidents, weapon brandished, critical lethality.
        // =============================================================
        $d1_incident3_date = Carbon::parse('2026-08-28 20:45:00', $tz);

        $dossier1 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0001',
            'survivor_name' => 'Shane Miller',
            'respondent_name' => 'Lance Dicki',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Shane Miller',
                'alias' => 'Shane',
                'age' => 29,
                'birthdate' => '1997-04-12',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0917-888-1234',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
                'civil_status' => 'Married',
                'educational_attainment' => 'College Graduate',
                'occupation' => 'Online Merchant',
            ],
            'respondent_demographics' => [
                'name' => 'Lance Dicki',
                'alias' => 'Lance',
                'age' => 32,
                'birthdate' => '1994-08-19',
                'birthplace' => 'Manila',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0928-555-6789',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
                'work_address' => 'Metro Logistics Warehouse, Terminal 3 Access Rd., Pasay City',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'educational_attainment' => 'College Undergraduate',
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
            'complainant_address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $cr1_1_date,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
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
            'children_details' => [
                ['name' => 'Liam Miller Dicki', 'age' => '4', 'school_or_daycare' => 'Barangay 183 Daycare']
            ],
            'incident_location_details' => 'Shared living room of the conjugal residence',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
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
            'alias' => 'Shane',
            'birthdate' => '1997-04-12',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 28,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-888-1234',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'civil_status' => 'Married',
            'educational_attainment' => 'College Graduate',
            'occupation' => 'Online Merchant',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Lance Dicki',
            'alias' => 'Lance',
            'birthdate' => '1994-08-19',
            'birthplace' => 'Manila',
            'nationality' => 'Filipino',
            'age' => 31,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0928-555-6789',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'work_address' => 'Metro Logistics Warehouse, Pasay City',
            'civil_status' => 'Married',
            'educational_attainment' => 'College Undergraduate',
            'occupation' => 'Logistics Driver',
            'physical_description' => '5\'9", medium build, scar on left eyebrow',
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

        // Dossier 1 - Incident #2 (Physical Abuse, Resolved Intervention)
        $cr1_2_date = Carbon::parse('2026-05-20 18:30:00', $tz);
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
            'complainant_address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $cr1_2_date,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
            'description' => 'Respondent physically shoved victim against kitchen counter, inflicting contusions to the right upper arm and wrist.',
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
            'children_details' => [
                ['name' => 'Liam Miller Dicki', 'age' => '4', 'school_or_daycare' => 'Barangay 183 Daycare']
            ],
            'incident_location_details' => 'Inside the conjugal kitchen and hallway',
            'is_repeat_offense' => true,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Closed',
            'referral_status' => ['Barangay VAW Desk', 'Hospital / Medico-Legal', 'DSWD / MSWDO'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Medico-Legal Examination & Care'],
            'witness_info' => 'Responding Tanod Corporal Perez documented arm contusions on site.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent complied with 15-day protective stay-away order and attended MSWDO counseling sessions.',
            'closed_at' => Carbon::parse('2026-06-05 17:00:00', $tz),
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_2->id,
            'role' => 'Victim',
            'name' => 'Shane Miller',
            'alias' => 'Shane',
            'birthdate' => '1997-04-12',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 29,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-888-1234',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Online Merchant',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_2->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Lance Dicki',
            'alias' => 'Lance',
            'birthdate' => '1994-08-19',
            'birthplace' => 'Manila',
            'nationality' => 'Filipino',
            'age' => 32,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0928-555-6789',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'work_address' => 'Metro Logistics Warehouse, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Logistics Driver',
        ]);
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

        $po1_2 = VawcProtectionOrder::create([
            'vawc_case_id' => $c1_2->id,
            'type' => 'BPO',
            'order_number' => 'BPO-2026-0001-02',
            'status' => 'Expired',
            'application_datetime' => Carbon::parse('2026-05-21 08:30:00', $tz),
            'issued_datetime' => Carbon::parse('2026-05-21 10:30:00', $tz),
            'expiration_date' => Carbon::parse('2026-06-05 23:59:59', $tz),
            'is_sla_breached' => false,
            'issued_by_id' => $admin->id,
        ]);

        VawcBpoServiceRecord::create([
            'protection_order_id' => $po1_2->id,
            'service_method' => 'Personally Received',
            'served_datetime' => Carbon::parse('2026-05-21 13:45:00', $tz),
            'served_by_id' => $officer->id,
            'receiver_name' => 'Lance Dicki',
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
            'complainant_address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d1_incident3_date,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
            'description' => 'Respondent arrived intoxicated, brandished an 8-inch kitchen knife threatening victim and child. Tanod responded to emergency 911 dispatch and disarmed respondent.',
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
            'children_details' => [
                ['name' => 'Liam Miller Dicki', 'age' => '4', 'school_or_daycare' => 'Barangay 183 Daycare']
            ],
            'incident_location_details' => 'Kitchen doorway and shared master bedroom entryway',
            'is_repeat_offense' => true,
            'has_weapon_involved' => true,
            'is_offender_armed' => true,
            'weapons_used' => ['Bladed Weapon / Knife'],
            'weapons_confiscated' => true,
            'substance_abuse' => ['Alcohol / Drunkenness', 'Illegal Drugs / Narcotics'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => true,
            'victim_shelter_choice' => 'Relatives / Friends (Private Haven)',
            'immediate_emergency_actions' => ['Tactical Rescue by Tanods / PNP', 'Weapon Confiscated on Site'],
            'is_bpo_consented_by_guardian' => true,
            'perpetrator_present' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['DSWD / MSWDO', 'PNP WCPD', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Temporary Custody / Emergency Shelter', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Barangay Tanod Patrol Officer Roberto Perez responded directly to distress call and disarmed respondent.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_3->id,
            'role' => 'Victim',
            'name' => 'Shane Miller',
            'alias' => 'Shane',
            'birthdate' => '1997-04-12',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 29,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-888-1234',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Online Merchant',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c1_3->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Lance Dicki',
            'alias' => 'Lance',
            'birthdate' => '1994-08-19',
            'birthplace' => 'Manila',
            'nationality' => 'Filipino',
            'age' => 32,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0928-555-6789',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'work_address' => 'Metro Logistics Warehouse, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Logistics Driver',
            'physical_description' => '5\'9", medium build, scar on left eyebrow',
        ]);
        
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
        // Survivor: Catherine Santos vs. Respondent: Eduardo Santos (Spouse)
        // Incident 2: Live Lapsed BPO ready for real-time closure testing in Step 5
        // =============================================================
        $d2_lastIncident = Carbon::parse('2026-08-24 19:30:00', $tz);

        $dossier2 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0002',
            'survivor_name' => 'Catherine Santos',
            'respondent_name' => 'Eduardo Santos',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Catherine Santos',
                'alias' => 'Cathy',
                'age' => 26,
                'birthdate' => '2000-05-14',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0919-111-2233',
                'address' => 'Purok 3, Riverside, Zone 2, Pasay City',
                'civil_status' => 'Married',
                'occupation' => 'Barangay Health Worker',
            ],
            'respondent_demographics' => [
                'name' => 'Eduardo Santos',
                'alias' => 'Eddie',
                'age' => 28,
                'birthdate' => '1998-02-10',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0920-444-5566',
                'address' => 'Purok 3, Riverside, Zone 2, Pasay City',
                'work_address' => 'Zone 2 Mechanical Workshop, Pasay City',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'occupation' => 'Auto Mechanic',
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
            'victim_name' => 'Catherine Santos',
            'victim_age' => 25,
            'victim_gender' => 'Female',
            'complainant_name' => 'Catherine Santos',
            'complainant_contact' => '0919-111-2233',
            'complainant_address' => 'Purok 3, Riverside, Zone 2, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $cr2_1_date,
            'incident_location' => 'Purok 3, Riverside, Zone 2',
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
            'children_details' => [
                ['name' => 'Mikayla Santos', 'age' => '2', 'school_or_daycare' => 'Home']
            ],
            'incident_location_details' => 'Family dining table and living area',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => [],
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
            'status' => 'Closed',
            'referral_status' => ['PAO / Legal Aid', 'Barangay VAW Desk'],
            'action_sought' => ['Psychosocial Support & Counseling'],
            'witness_info' => 'Neighbor corroborated repeated deprivation of child sustenance funds.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent agreed to formal voluntary child support agreement via PAO intervention.',
            'closed_at' => Carbon::parse('2026-03-26 17:00:00', $tz),
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c2_1->id,
            'role' => 'Victim',
            'name' => 'Catherine Santos',
            'alias' => 'Cathy',
            'birthdate' => '2000-05-14',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 25,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0919-111-2233',
            'address' => 'Purok 3, Riverside, Zone 2, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Barangay Health Worker',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c2_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Eduardo Santos',
            'alias' => 'Eddie',
            'birthdate' => '1998-02-10',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 27,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0920-444-5566',
            'address' => 'Purok 3, Riverside, Zone 2, Pasay City',
            'work_address' => 'Zone 2 Mechanical Workshop, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Auto Mechanic',
        ]);
        VawcAssessment::create(['vawc_case_id' => $c2_1->id, 'requires_medical' => false, 'risk_score' => 4, 'risk_level' => 'LOW']);

        $cr2_2 = CaseReport::create([
            'user_id' => $admin->id,
            'zone_id' => $zone2->id,
            'abuse_type_id' => $physicalAbuse?->id ?? 1,
            'type' => 'VAWC',
            'case_number' => 'VAWC-2026-0002-02',
            'victim_name' => 'Catherine Santos',
            'victim_age' => 26,
            'victim_gender' => 'Female',
            'complainant_name' => 'Catherine Santos',
            'complainant_contact' => '0919-111-2233',
            'complainant_address' => 'Purok 3, Riverside, Zone 2, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d2_lastIncident,
            'incident_location' => 'Purok 3, Riverside, Zone 2',
            'description' => 'Slapping and verbal assault following argument over household finances, causing facial swelling.',
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
            'children_details' => [
                ['name' => 'Mikayla Santos', 'age' => '2', 'school_or_daycare' => 'Home']
            ],
            'incident_location_details' => 'Living room and porch area',
            'is_repeat_offense' => true,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Barangay 183 Health Center',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['Barangay VAW Desk', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Purok leader intervened after hearing screams and observed victim with facial bruising.',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c2_2->id,
            'role' => 'Victim',
            'name' => 'Catherine Santos',
            'alias' => 'Cathy',
            'birthdate' => '2000-05-14',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 26,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0919-111-2233',
            'address' => 'Purok 3, Riverside, Zone 2, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Barangay Health Worker',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c2_2->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Eduardo Santos',
            'alias' => 'Eddie',
            'birthdate' => '1998-02-10',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 28,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0920-444-5566',
            'address' => 'Purok 3, Riverside, Zone 2, Pasay City',
            'work_address' => 'Zone 2 Mechanical Workshop, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Auto Mechanic',
        ]);
        VawcAssessment::create([
            'vawc_case_id' => $c2_2->id,
            'requires_medical' => true,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

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
            'receiver_name' => 'Eduardo Santos',
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
            'notes' => 'Day 8 Check: Survivor Catherine Santos reports zero threats or physical appearances. Respondent attending counseling sessions.',
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
        // Survivor: Maria Teresa Roxas vs. Respondent: Danilo Roxas (Spouse)
        // =============================================================
        $d3_lastIncident = Carbon::parse('2026-08-26 22:15:00', $tz);

        $dossier3 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0003',
            'survivor_name' => 'Maria Teresa Roxas',
            'respondent_name' => 'Danilo Roxas',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Maria Teresa Roxas',
                'alias' => 'Tess',
                'age' => 34,
                'birthdate' => '1992-03-20',
                'birthplace' => 'Quezon City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0918-333-7788',
                'address' => 'House 12, Sampaguita St., Zone 3, Pasay City',
                'civil_status' => 'Married',
                'occupation' => 'Teacher',
            ],
            'respondent_demographics' => [
                'name' => 'Danilo Roxas',
                'alias' => 'Danny',
                'age' => 36,
                'birthdate' => '1990-11-05',
                'birthplace' => 'Cavite',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0919-999-0011',
                'address' => 'House 12, Sampaguita St., Zone 3, Pasay City',
                'work_address' => 'Grand Security Agency, Roxas Blvd., Pasay City',
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
            'victim_name' => 'Maria Teresa Roxas',
            'victim_age' => 34,
            'victim_gender' => 'Female',
            'complainant_name' => 'Maria Teresa Roxas',
            'complainant_contact' => '0918-333-7788',
            'complainant_address' => 'House 12, Sampaguita St., Zone 3, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d3_lastIncident,
            'incident_location' => 'House 12, Sampaguita St., Zone 3',
            'description' => 'Severe physical battery and violation of issued BPO. Respondent entered victim\'s temporary residence with weapon brandished.',
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
            'children_details' => [
                ['name' => 'Angelo Roxas', 'age' => '9', 'school_or_daycare' => 'Zone 3 Elementary'],
                ['name' => 'Grace Roxas', 'age' => '6', 'school_or_daycare' => 'Zone 3 Daycare']
            ],
            'incident_location_details' => 'Driveway gate and front entrance',
            'is_repeat_offense' => true,
            'has_weapon_involved' => true,
            'is_offender_armed' => true,
            'weapons_used' => ['Bladed Weapon / Knife'],
            'warrantless_arrest_made' => true,
            'weapons_confiscated' => true,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => true,
            'victim_shelter_choice' => 'CSWDO / DSWD Crisis Center / LGU Safehouse',
            'immediate_emergency_actions' => ['Tactical Rescue by Tanods / PNP', 'Weapon Confiscated on Site'],
            'is_bpo_consented_by_guardian' => true,
            'status' => 'Escalated',
            'referral_status' => ['PNP WCPD', 'PAO / Legal Aid', 'Hospital / Medico-Legal'],
            'action_sought' => ['Criminal Investigation & Case Filing', 'Barangay Protection Order (BPO)', 'Temporary Custody / Emergency Shelter'],
            'witness_info' => 'Subdivision gate guard on duty logged respondent forcibly breaching gate with bladed tool.',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c3_1->id,
            'role' => 'Victim',
            'name' => 'Maria Teresa Roxas',
            'alias' => 'Tess',
            'birthdate' => '1992-03-20',
            'birthplace' => 'Quezon City',
            'nationality' => 'Filipino',
            'age' => 34,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0918-333-7788',
            'address' => 'House 12, Sampaguita St., Zone 3, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Teacher',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c3_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Danilo Roxas',
            'alias' => 'Danny',
            'birthdate' => '1990-11-05',
            'birthplace' => 'Cavite',
            'nationality' => 'Filipino',
            'age' => 36,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0919-999-0011',
            'address' => 'House 12, Sampaguita St., Zone 3, Pasay City',
            'work_address' => 'Grand Security Agency, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Security Guard',
            'physical_description' => '6\'0", muscular build',
        ]);
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
            'referral_target' => 'Family Court / RTC Branch 108',
            'violation_datetime' => Carbon::parse('2026-08-27 09:00:00', $tz),
            'violation_description' => 'Respondent committed grave BPO violation by entering safehouse perimeter with weapon. Warrantless arrest executed by Tanod Patrol and PNP WCPD. Transmitted to RTC Branch 108 Pasay Family Court under Docket TPO-2026-0889-PASAY.',
            'status' => 'Pending',
            'escorted_by_pb' => true,
        ]);

        $dossier3->syncDossierAggregates();

        // =============================================================
        // DOSSIER 4: Single Incident Fresh Intake (Pending Assessment / Triage)
        // Survivor: Kimberly Reyes vs. Respondent: Jason Valderama (Dating / Romantic / Sexual Partner)
        // NOTICE: NO VawcAssessment is seeded here intentionally so that the user
        // can immediately test "Step 1: Perform Triage Assessment" in Show.tsx!
        // =============================================================
        $d4_lastIncident = Carbon::parse('2026-08-31 16:30:00', $tz);

        $dossier4 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0004',
            'survivor_name' => 'Kimberly Reyes',
            'respondent_name' => 'Jason Valderama',
            'relationship_type' => 'Dating / Romantic / Sexual Partner',
            'survivor_demographics' => [
                'name' => 'Kimberly Reyes',
                'alias' => 'Kim',
                'age' => 22,
                'birthdate' => '2004-03-15',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0935-777-8899',
                'address' => 'Corner Rizal St., Zone 1, Pasay City',
                'civil_status' => 'Single',
                'occupation' => 'College Student',
            ],
            'respondent_demographics' => [
                'name' => 'Jason Valderama',
                'alias' => 'Jase',
                'age' => 25,
                'birthdate' => '2001-07-22',
                'birthplace' => 'Makati City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0921-333-4455',
                'address' => '12 Mabini St., Barangay 183, Pasay City',
                'work_address' => 'Express Logistics Hub, Taguig City',
                'relationship' => 'Dating / Romantic / Sexual Partner',
                'civil_status' => 'Single',
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
            'victim_name' => 'Kimberly Reyes',
            'victim_age' => 22,
            'victim_gender' => 'Female',
            'complainant_name' => 'Kimberly Reyes',
            'complainant_contact' => '0935-777-8899',
            'complainant_address' => 'Corner Rizal St., Zone 1, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d4_lastIncident,
            'incident_location' => 'Corner Rizal St., Zone 1',
            'description' => 'Victim was stalked and harassed outside boarding house by dating partner threatening non-consensual image distribution and intimidation.',
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
            'incident_location_details' => 'Outside boarding house gate and adjacent sidewalk',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => [],
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Intake', // Ready for Phase 1 Triage Assessment in Show.tsx!
            'referral_status' => ['PNP WCPD', 'Barangay VAW Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Barangay Tanod Security & Patrols'],
            'witness_info' => 'Boarding house landlady Aling Nena witnessed respondent circling the premises on a black motorcycle and shouting threats.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c4_1->id,
            'role' => 'Victim',
            'name' => 'Kimberly Reyes',
            'alias' => 'Kim',
            'birthdate' => '2004-03-15',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 22,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0935-777-8899',
            'address' => 'Corner Rizal St., Zone 1, Pasay City',
            'civil_status' => 'Single',
            'occupation' => 'College Student',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c4_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Dating / Romantic / Sexual Partner',
            'name' => 'Jason Valderama',
            'alias' => 'Jase',
            'birthdate' => '2001-07-22',
            'birthplace' => 'Makati City',
            'nationality' => 'Filipino',
            'age' => 25,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0921-333-4455',
            'address' => '12 Mabini St., Barangay 183, Pasay City',
            'work_address' => 'Express Logistics Hub, Taguig City',
            'civil_status' => 'Single',
            'physical_description' => '5\'8", slim build, rides black motorcycle',
        ]);
        // Note: No VawcAssessment is created here to leave case in Step 1 Triage Assessment!

        $dossier4->syncDossierAggregates();

        // =============================================================
        // DOSSIER 5: Dormant / Safely Closed Master Dossier
        // Survivor: Elena Dela Cruz vs. Respondent: Roberto Dela Cruz (Former Live-in Partner)
        // =============================================================
        $d5_lastIncident = Carbon::parse('2026-02-14 14:00:00', $tz);

        $dossier5 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0005',
            'survivor_name' => 'Elena Dela Cruz',
            'respondent_name' => 'Roberto Dela Cruz',
            'relationship_type' => 'Former Live-in Partner',
            'survivor_demographics' => [
                'name' => 'Elena Dela Cruz',
                'alias' => 'Elena',
                'age' => 38,
                'birthdate' => '1988-06-10',
                'birthplace' => 'Bataan',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0922-333-4455',
                'address' => 'Purok 5, Maligaya Compound, Zone 2, Pasay City',
                'civil_status' => 'Separated',
                'occupation' => 'Store Owner',
            ],
            'respondent_demographics' => [
                'name' => 'Roberto Dela Cruz',
                'alias' => 'Berting',
                'age' => 41,
                'birthdate' => '1985-09-18',
                'birthplace' => 'Manila',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0922-888-9900',
                'address' => 'Purok 5, Maligaya Compound, Zone 2, Pasay City',
                'work_address' => 'Pasay Electrical Services, Zone 2',
                'relationship' => 'Former Live-in Partner',
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
            'victim_name' => 'Elena Dela Cruz',
            'victim_age' => 38,
            'victim_gender' => 'Female',
            'complainant_name' => 'Elena Dela Cruz',
            'complainant_contact' => '0922-333-4455',
            'complainant_address' => 'Purok 5, Maligaya Compound, Zone 2, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d5_lastIncident,
            'incident_location' => 'Purok 5, Maligaya Compound',
            'description' => 'Unsolicited late-night knocking and nuisance at victim\'s store premises causing psychological distress.',
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
            'children_details' => [
                ['name' => 'Carlo Dela Cruz', 'age' => '11', 'school_or_daycare' => 'Zone 2 Elementary'],
                ['name' => 'Joy Dela Cruz', 'age' => '8', 'school_or_daycare' => 'Zone 2 Elementary']
            ],
            'incident_location_details' => 'Front porch and store roll-up shutter',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => [],
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
            'status' => 'Closed',
            'referral_status' => ['Barangay VAW Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)'],
            'witness_info' => 'Store assistant witnessed respondent aggressively banging on metal roll-up door after operating hours.',
            'closure_reason' => '15-Day Protection Order Lapsed Successfully (No Violation)',
            'closure_remarks' => 'Respondent complied with 15-day stay away order and agreed to sustainable child custody arrangement.',
            'closed_at' => Carbon::parse('2026-03-02 17:00:00', $tz),
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c5_1->id,
            'role' => 'Victim',
            'name' => 'Elena Dela Cruz',
            'alias' => 'Elena',
            'birthdate' => '1988-06-10',
            'birthplace' => 'Bataan',
            'nationality' => 'Filipino',
            'age' => 38,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0922-333-4455',
            'address' => 'Purok 5, Maligaya Compound, Zone 2, Pasay City',
            'civil_status' => 'Separated',
            'occupation' => 'Store Owner',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c5_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Live-in Partner',
            'name' => 'Roberto Dela Cruz',
            'alias' => 'Berting',
            'birthdate' => '1985-09-18',
            'birthplace' => 'Manila',
            'nationality' => 'Filipino',
            'age' => 41,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0922-888-9900',
            'address' => 'Purok 5, Maligaya Compound, Zone 2, Pasay City',
            'work_address' => 'Pasay Electrical Services, Zone 2',
            'civil_status' => 'Separated',
            'occupation' => 'Electrician',
        ]);
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
            'receiver_name' => 'Roberto Dela Cruz',
        ]);

        VawcComplianceLog::create([
            'vawc_case_id' => $c5_1->id,
            'monitor_date' => Carbon::parse('2026-02-18 10:00:00', $tz),
            'is_compliant' => true,
            'notes' => 'Day 3 Check: Respondent complied with 15-day stay-away mandate. Did not approach store premises.',
        ]);

        $dossier5->syncDossierAggregates();

        // =============================================================
        // DOSSIER 6: Cross-Dossier Serial Perpetrator Case
        // Survivor: Patricia Cruz vs. Respondent: Lance Dicki (Former Dating Partner)
        // (Cross-linked to Dossier 1: Shane Miller vs Lance Dicki)
        // =============================================================
        $d6_lastIncident = Carbon::parse('2026-08-30 18:45:00', $tz);

        $dossier6 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0006',
            'survivor_name' => 'Patricia Cruz',
            'respondent_name' => 'Lance Dicki',
            'relationship_type' => 'Former Dating Partner',
            'survivor_demographics' => [
                'name' => 'Patricia Cruz',
                'alias' => 'Patty',
                'age' => 27,
                'birthdate' => '1999-01-25',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0918-999-3344',
                'address' => 'Purok 7, Sampaguita St., Zone 3, Pasay City',
                'civil_status' => 'Single',
                'occupation' => 'Call Center Agent',
            ],
            'respondent_demographics' => [
                'name' => 'Lance Dicki',
                'alias' => 'Lance',
                'age' => 32,
                'birthdate' => '1994-08-19',
                'birthplace' => 'Manila',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0928-555-6789',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
                'work_address' => 'Metro Logistics Warehouse, Pasay City',
                'relationship' => 'Former Dating Partner',
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
            'victim_name' => 'Patricia Cruz',
            'victim_age' => 27,
            'victim_gender' => 'Female',
            'complainant_name' => 'Patricia Cruz',
            'complainant_contact' => '0918-999-3344',
            'complainant_address' => 'Purok 7, Sampaguita St., Zone 3, Pasay City',
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
            'incident_location_details' => 'Front lobby and sidewalk outside call center building',
            'is_repeat_offense' => true, // Serial cross-dossier repeat offender
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['PNP WCPD', 'Barangay VAW Desk'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Criminal Investigation & Case Filing'],
            'witness_info' => 'Building security logged respondent attempting unauthorized entry 4 times in 3 days.',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c6_1->id,
            'role' => 'Victim',
            'name' => 'Patricia Cruz',
            'alias' => 'Patty',
            'birthdate' => '1999-01-25',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 27,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0918-999-3344',
            'address' => 'Purok 7, Sampaguita St., Zone 3, Pasay City',
            'civil_status' => 'Single',
            'occupation' => 'Call Center Agent',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c6_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Dating Partner',
            'name' => 'Lance Dicki',
            'alias' => 'Lance',
            'birthdate' => '1994-08-19',
            'birthplace' => 'Manila',
            'nationality' => 'Filipino',
            'age' => 32,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0928-555-6789',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'work_address' => 'Metro Logistics Warehouse, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Logistics Driver',
            'physical_description' => '5\'9", medium build, scar on left eyebrow',
        ]);
        
        VawcAssessment::create([
            'vawc_case_id' => $c6_1->id,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 3, // Elevated to 3 because perpetrator has prior incidents under Shane Miller
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 8,
            'risk_level' => 'HIGH',
        ]);

        $dossier6->syncDossierAggregates();

        // =============================================================
        // DOSSIER 7: Compound Victimization Case
        // Survivor: Shane Miller vs. Respondent: Victor Magno (Former Dating Partner)
        // (Cross-linked to Dossier 1: Shane Miller vs Lance Dicki)
        // =============================================================
        $d7_lastIncident = Carbon::parse('2026-08-31 13:15:00', $tz);

        $dossier7 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0007',
            'survivor_name' => 'Shane Miller',
            'respondent_name' => 'Victor Magno',
            'relationship_type' => 'Former Dating Partner',
            'survivor_demographics' => [
                'name' => 'Shane Miller',
                'alias' => 'Shane',
                'age' => 29,
                'birthdate' => '1997-04-12',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0917-888-1234',
                'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
                'civil_status' => 'Married',
                'educational_attainment' => 'College Graduate',
                'occupation' => 'Online Merchant',
            ],
            'respondent_demographics' => [
                'name' => 'Victor Magno',
                'alias' => 'Vic',
                'age' => 33,
                'birthdate' => '1993-06-11',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0919-222-7788',
                'address' => 'Zone 1 Commercial Center, Pasay City',
                'work_address' => 'Magno Auto Repair, Zone 1',
                'relationship' => 'Former Dating Partner',
                'civil_status' => 'Single',
                'occupation' => 'Mechanic Shop Owner',
                'physical_description' => '5\'6", heavy build',
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
            'complainant_contact' => '0917-888-1234',
            'complainant_address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d7_lastIncident,
            'incident_location' => 'Block 4 Lot 12, Sunrise Village, Zone 1',
            'description' => 'Respondent (Former Dating Partner) engaged in verbal harassment, persistent stalking, and aggressive intimidation outside victim\'s residence.',
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
            'incident_location_details' => 'Front gate perimeter of Sunrise Village',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => [],
            'requires_medical' => false,
            'requires_alternative_housing' => true, // Compound threat triggers emergency shelter option
            'victim_shelter_choice' => 'Relatives / Friends (Private Haven)',
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['DSWD / MSWDO', 'LGU Crisis Center'],
            'action_sought' => ['Temporary Custody / Emergency Shelter', 'Barangay Protection Order (BPO)'],
            'witness_info' => 'Adjacent compound neighbor testified hearing respondent yelling threats outside residence.',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c7_1->id,
            'role' => 'Victim',
            'name' => 'Shane Miller',
            'alias' => 'Shane',
            'birthdate' => '1997-04-12',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 29,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-888-1234',
            'address' => 'Block 4 Lot 12, Sunrise Village, Zone 1, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Online Merchant',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c7_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Dating Partner',
            'name' => 'Victor Magno',
            'alias' => 'Vic',
            'birthdate' => '1993-06-11',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 33,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0919-222-7788',
            'address' => 'Zone 1 Commercial Center, Pasay City',
            'work_address' => 'Magno Auto Repair, Zone 1',
            'civil_status' => 'Single',
            'occupation' => 'Mechanic Shop Owner',
            'physical_description' => '5\'6", heavy build',
        ]);
        
        VawcAssessment::create([
            'vawc_case_id' => $c7_1->id,
            'requires_medical' => false,
            'requires_alternative_housing' => true,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 3, // Elevated due to Compound Multi-Perpetrator Threat
            'risk_score' => 8,
            'risk_level' => 'HIGH',
        ]);

        $dossier7->syncDossierAggregates();

        // =============================================================
        // DOSSIER 8: Whistleblower / Confidential Third-Party Informant Case
        // Demonstrates RA 9262 Section 44 Sealed Confidential Informant Feature
        // Survivor: Carmela Bautista vs. Respondent: Danilo Bautista (Spouse)
        // Complainant: Aling Remedios (Concerned Neighbor - Separate Address & Shielded by Law)
        // =============================================================
        $d8_lastIncident = Carbon::parse('2026-08-31 23:30:00', $tz);

        $dossier8 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0008',
            'survivor_name' => 'Carmela Bautista',
            'respondent_name' => 'Danilo Bautista',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Carmela Bautista',
                'alias' => 'Carmel',
                'age' => 31,
                'birthdate' => '1995-07-08',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0917-444-9988',
                'address' => 'Apartment 3B, San Jose St., Zone 1, Pasay City',
                'civil_status' => 'Married',
                'educational_attainment' => 'High School',
                'occupation' => 'Housewife',
            ],
            'respondent_demographics' => [
                'name' => 'Danilo Bautista',
                'alias' => 'Danny',
                'age' => 35,
                'birthdate' => '1991-04-14',
                'birthplace' => 'Batangas',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0918-222-1133',
                'address' => 'Apartment 3B, San Jose St., Zone 1, Pasay City',
                'work_address' => 'San Jose Tricycle Terminal, Zone 1',
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
            'complainant_address' => 'Apartment 3A, San Jose St., Zone 1, Pasay City',
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
            'children_details' => [
                ['name' => 'Paolo Bautista', 'age' => '7', 'school_or_daycare' => 'Zone 1 Elementary'],
                ['name' => 'Mia Bautista', 'age' => '4', 'school_or_daycare' => 'Zone 1 Daycare']
            ],
            'incident_location_details' => 'Inside master bedroom behind barricaded door',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => true,
            'victim_shelter_choice' => 'CSWDO / DSWD Crisis Center / LGU Safehouse',
            'immediate_emergency_actions' => ['Tactical Rescue by Tanods / PNP', 'Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
            'perpetrator_present' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['DSWD / MSWDO', 'PNP WCPD', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Temporary Custody / Emergency Shelter', 'Medico-Legal Examination & Care'],
            'witness_info' => 'Reporting neighbor Aling Remedios (Apartment 3A) corroborated hearing blunt impacts and distress cries through the wall.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c8_1->id,
            'role' => 'Victim',
            'name' => 'Carmela Bautista',
            'alias' => 'Carmel',
            'birthdate' => '1995-07-08',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 31,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-444-9988',
            'address' => 'Apartment 3B, San Jose St., Zone 1, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Housewife',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c8_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Danilo Bautista',
            'alias' => 'Danny',
            'birthdate' => '1991-04-14',
            'birthplace' => 'Batangas',
            'nationality' => 'Filipino',
            'age' => 35,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0918-222-1133',
            'address' => 'Apartment 3B, San Jose St., Zone 1, Pasay City',
            'work_address' => 'San Jose Tricycle Terminal, Zone 1',
            'civil_status' => 'Married',
            'occupation' => 'Tricycle Driver',
            'physical_description' => '5\'7", stout build, tattoo on right forearm',
        ]);
        VawcInvolvedParty::create([
            'vawc_case_id' => $c8_1->id,
            'role' => 'Reporter',
            'relationship_to_victim' => 'Concerned Neighbor (Whistleblower)',
            'name' => 'Aling Remedios',
            'alias' => 'Remedios',
            'birthdate' => '1975-10-02',
            'birthplace' => 'Pangasinan',
            'nationality' => 'Filipino',
            'age' => 50,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0918-777-6655',
            'address' => 'Apartment 3A, San Jose St., Zone 1, Pasay City',
            'civil_status' => 'Widowed',
            'occupation' => 'Sari-Sari Store Owner',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c8_1->id,
            'requires_medical' => true,
            'requires_alternative_housing' => true,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

        $dossier8->syncDossierAggregates();

        // =============================================================
        // DOSSIER 9: Historical / Cold Case (Incident Occurred 2 Years Ago)
        // Survivor: Elena Manalo vs. Respondent: Eduardo Santos (Former Live-in Partner)
        // Tests RA 9262 Section 14 (Imminent Danger requirement for BPO) vs.
        // Section 24 (Strict 20-Year Prescriptive Period for Criminal Complaints per People v. Purisima).
        // Sits on Step 2 (BPO Application) with no prior BPO filed yet.
        // =============================================================
        $d9_incident_date = Carbon::parse('2024-08-15 14:30:00', $tz);

        $dossier9 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0009',
            'survivor_name' => 'Elena Manalo',
            'respondent_name' => 'Eduardo Santos',
            'relationship_type' => 'Former Live-in Partner',
            'survivor_demographics' => [
                'name' => 'Elena Manalo',
                'alias' => 'Elena',
                'age' => 34,
                'birthdate' => '1992-05-18',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0922-333-7744',
                'address' => 'House 55, Mabini Extension, Zone 2, Pasay City',
                'civil_status' => 'Single',
                'educational_attainment' => 'Vocational',
                'occupation' => 'Freelance Seamstress',
            ],
            'respondent_demographics' => [
                'name' => 'Eduardo Santos',
                'alias' => 'Eddie',
                'age' => 38,
                'birthdate' => '1988-08-22',
                'birthplace' => 'Bulacan',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0919-888-2211',
                'address' => 'Barangay San Isidro, Pasay City',
                'work_address' => 'San Isidro Construction Depot',
                'relationship' => 'Former Live-in Partner',
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
            'complainant_address' => 'House 55, Mabini Extension, Zone 2, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d9_incident_date,
            'incident_location' => 'Former shared apartment, Zone 2',
            'description' => 'Historical Report: Severe physical assault and economic deprivation occurring approximately two years ago before victim escaped and relocated. Survivor now seeks formal criminal prosecution under the 20-year prescriptive period of RA 9262.',
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
            'children_details' => [
                ['name' => 'Tristan Santos', 'age' => '5', 'school_or_daycare' => 'Zone 2 Daycare']
            ],
            'incident_location_details' => 'Master bedroom of former rented apartment',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'perpetrator_present' => false,
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
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
            'alias' => 'Elena',
            'birthdate' => '1992-05-18',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 34,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0922-333-7744',
            'address' => 'House 55, Mabini Extension, Zone 2, Pasay City',
            'civil_status' => 'Single',
            'occupation' => 'Freelance Seamstress',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c9_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Live-in Partner',
            'name' => 'Eduardo Santos',
            'alias' => 'Eddie',
            'birthdate' => '1988-08-22',
            'birthplace' => 'Bulacan',
            'nationality' => 'Filipino',
            'age' => 38,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0919-888-2211',
            'address' => 'Barangay San Isidro, Pasay City',
            'work_address' => 'San Isidro Construction Depot',
            'civil_status' => 'Single',
            'occupation' => 'Construction Foreman',
            'physical_description' => '5\'10", heavily tattooed arms, muscular build',
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
        // Demonstrates RA 9262 Sec. 14 Completed 15-Day BPO with Zero Violations
        // =============================================================
        $d10_incident_date = Carbon::parse('2026-08-18 19:30:00', $tz);

        $dossier10 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0010',
            'survivor_name' => 'Giselle Ramirez',
            'respondent_name' => 'Carlito Ramirez',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Giselle Ramirez',
                'alias' => 'Gigi',
                'age' => 30,
                'birthdate' => '1996-02-28',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0917-234-5678',
                'address' => 'Lot 8 Block 3, Rosal St., Zone 1, Pasay City',
                'civil_status' => 'Married',
                'educational_attainment' => 'College Graduate',
                'occupation' => 'High School Teacher',
            ],
            'respondent_demographics' => [
                'name' => 'Carlito Ramirez',
                'alias' => 'Lito',
                'age' => 33,
                'birthdate' => '1993-10-12',
                'birthplace' => 'Rizal',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0928-876-5432',
                'address' => 'Lot 8 Block 3, Rosal St., Zone 1, Pasay City',
                'work_address' => 'Rosal Auto Service Center, Zone 1',
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
            'complainant_address' => 'Lot 8 Block 3, Rosal St., Zone 1, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d10_incident_date,
            'incident_location' => 'Lot 8 Block 3, Rosal St., Zone 1',
            'description' => 'Respondent arrived home intoxicated, smashed dinnerware, hurled profanities, and violently grabbed victim\'s arms causing bilateral contusions.',
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
            'children_details' => [
                ['name' => 'Joshua Ramirez', 'age' => '6', 'school_or_daycare' => 'Zone 1 Elementary']
            ],
            'incident_location_details' => 'Dining area and kitchen doorway',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Barangay 183 Health Center',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true,
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
            'alias' => 'Gigi',
            'birthdate' => '1996-02-28',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 30,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-234-5678',
            'address' => 'Lot 8 Block 3, Rosal St., Zone 1, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'High School Teacher',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c10_1->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Carlito Ramirez',
            'alias' => 'Lito',
            'birthdate' => '1993-10-12',
            'birthplace' => 'Rizal',
            'nationality' => 'Filipino',
            'age' => 33,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0928-876-5432',
            'address' => 'Lot 8 Block 3, Rosal St., Zone 1, Pasay City',
            'work_address' => 'Rosal Auto Service Center, Zone 1',
            'civil_status' => 'Married',
            'occupation' => 'Auto Mechanic',
            'physical_description' => '5\'7", athletic build, eagle tattoo on right shoulder',
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
        // SCENARIO A: CHILD-SURVIVOR CASE UNDER RA 9262 SEC. 3(a) & DILG FLOWCHART NODE B
        // Dossier 11: Luna Garcia (17 yrs old, Minor) vs. Larry Garcia (Former Dating Partner)
        // Features: Age < 18 Child Safeguard Badge + DILG Node B Guardian Consent Confirmed
        // =============================================================
        $d11_date = Carbon::parse('2026-09-08 11:30:00', $tz);

        $dossier11 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0011',
            'survivor_name' => 'Luna Garcia',
            'respondent_name' => 'Larry Garcia',
            'relationship_type' => 'Former Dating Partner',
            'survivor_demographics' => [
                'name' => 'Luna Garcia',
                'alias' => 'Luna',
                'age' => 17,
                'birthdate' => '2009-02-14',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0917-888-1122',
                'address' => 'Block 4 Lot 12, Mahogany Ave., Zone 2, Pasay City',
                'civil_status' => 'Single',
                'occupation' => 'Senior High Student',
            ],
            'respondent_demographics' => [
                'name' => 'Larry Garcia',
                'alias' => 'Larry',
                'age' => 31,
                'birthdate' => '1995-04-10',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0922-444-9988',
                'address' => 'Block 4 Lot 14, Mahogany Ave., Zone 2, Pasay City',
                'work_address' => 'Garcia Construction Depot, Zone 2',
                'relationship' => 'Former Dating Partner',
                'civil_status' => 'Single',
                'occupation' => 'Freelance Contractor',
            ],
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
            'victim_age' => 17,
            'victim_gender' => 'Female',
            'complainant_name' => 'Mrs. Teresa Garcia (Mother / Legal Guardian)',
            'complainant_contact' => '0917-888-1122',
            'complainant_address' => 'Block 4 Lot 12, Mahogany Ave., Zone 2, Pasay City',
            'relation_to_victim' => 'Mother / Legal Guardian',
            'incident_date' => $d11_date,
            'incident_location' => 'Block 4 Lot 12, Mahogany Ave., Zone 2',
            'description' => 'Child survivor (17 yrs old) assaulted by adult former dating partner Larry Garcia following persistent stalking and harassment. Mother consented to BPO application and PNP transmittal.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c11 = VawcCase::create([
            'dossier_id' => $dossier11->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0011-01',
            'case_report_id' => $cr11->id,
            'intake_type' => 'Third-Party',
            'children_count' => 0,
            'incident_location_details' => 'Front porch and exterior driveway',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true, // Enforces DILG Flowchart Node B
            'incident_veracity' => true,
            'status' => 'Escalated',
            'referral_status' => ['Barangay VAW Desk', 'PNP WCPD (Women & Children Protection Desk)', 'Public Attorney\'s Office (PAO)'],
            'action_sought' => ['Police Inquest Referral', 'Medico-Legal Examination', 'Legal Aid Assistance'],
            'witness_info' => 'Mother Teresa Garcia and neighbor Romeo Reyes witnessed respondent Larry Garcia confronting and shoving the 17-year-old survivor.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c11->id,
            'role' => 'Victim',
            'name' => 'Luna Garcia',
            'alias' => 'Luna',
            'birthdate' => '2009-02-14',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 17,
            'is_minor' => true, // Triggers RA 9262 Sec. 3(a) Child-Victim Safeguard Badge
            'gender' => 'Female',
            'contact_number' => '0917-888-1122',
            'address' => 'Block 4 Lot 12, Mahogany Ave., Zone 2, Pasay City',
            'civil_status' => 'Single',
            'occupation' => 'Senior High Student',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c11->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Dating Partner',
            'name' => 'Larry Garcia',
            'alias' => 'Larry',
            'birthdate' => '1995-04-10',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 31,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0922-444-9988',
            'address' => 'Block 4 Lot 14, Mahogany Ave., Zone 2, Pasay City',
            'work_address' => 'Garcia Construction Depot, Zone 2',
            'civil_status' => 'Single',
            'occupation' => 'Freelance Contractor',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c11->id,
            'role' => 'Reporter',
            'relationship_to_victim' => 'Mother / Legal Guardian',
            'name' => 'Mrs. Teresa Garcia',
            'alias' => 'Teresa',
            'birthdate' => '1976-08-11',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 50,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-888-1122',
            'address' => 'Block 4 Lot 12, Mahogany Ave., Zone 2, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Accountant',
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
            'violation_description' => 'Physical battery and stalking committed by adult former dating partner against minor survivor under RA 9262 Section 3(a), 5(a), and 5(i). Formally transmitted to PNP WCPD for criminal inquest.',
            'escorted_by_pb' => true,
        ]);

        $dossier11->syncDossierAggregates();

        // =============================================================
        // SCENARIO A (CONTINUED): MULTI-VICTIM SERIAL DATING PERPETRATOR
        // Dossier 12: Jamie Perez (24 yrs old) vs. Larry Garcia (Same Perpetrator!)
        // Triggers Cross-Dossier Serial Perpetrator Alert (2 Dating Victims Linked to Larry Garcia)
        // =============================================================
        $dossier12 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0012',
            'survivor_name' => 'Jamie Perez',
            'respondent_name' => 'Larry Garcia',
            'relationship_type' => 'Former Live-in Partner',
            'survivor_demographics' => [
                'name' => 'Jamie Perez',
                'alias' => 'Jamie',
                'age' => 24,
                'birthdate' => '2002-01-19',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0917-888-3344',
                'address' => 'Block 8 Lot 3, Sampaguita St., Zone 2, Pasay City',
                'civil_status' => 'Single',
                'occupation' => 'Bank Teller',
            ],
            'respondent_demographics' => [
                'name' => 'Larry Garcia',
                'alias' => 'Larry',
                'age' => 31,
                'birthdate' => '1995-04-10',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0922-444-9988',
                'address' => 'Block 4 Lot 14, Mahogany Ave., Zone 2, Pasay City',
                'work_address' => 'Garcia Construction Depot, Zone 2',
                'relationship' => 'Former Live-in Partner',
                'civil_status' => 'Single',
                'occupation' => 'Freelance Contractor',
            ],
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
            'victim_name' => 'Jamie Perez',
            'victim_age' => 24,
            'victim_gender' => 'Female',
            'complainant_name' => 'Jamie Perez',
            'complainant_contact' => '0917-888-3344',
            'complainant_address' => 'Block 8 Lot 3, Sampaguita St., Zone 2, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d11_date,
            'incident_location' => 'Block 8 Lot 3, Sampaguita St., Zone 2',
            'description' => 'Former live-in partner of Larry Garcia assaulted during a heated argument when victim ended cohabitation, triggering the Cross-Dossier Serial Perpetrator Alert linking Larry Garcia across multiple survivor dossiers.',
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
            'incident_location_details' => 'Inside living room and kitchen area',
            'is_repeat_offense' => true, // Serial cross-dossier repeat offender
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Escalated',
            'referral_status' => ['Barangay VAW Desk', 'PNP WCPD (Women & Children Protection Desk)'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'PNP Criminal Prosecution'],
            'witness_info' => 'Boarding house landlord heard loud commotion and physical struggle inside unit.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c12->id,
            'role' => 'Victim',
            'name' => 'Jamie Perez',
            'alias' => 'Jamie',
            'birthdate' => '2002-01-19',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 24,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0917-888-3344',
            'address' => 'Block 8 Lot 3, Sampaguita St., Zone 2, Pasay City',
            'civil_status' => 'Single',
            'occupation' => 'Bank Teller',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c12->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Former Live-in Partner',
            'name' => 'Larry Garcia',
            'alias' => 'Larry',
            'birthdate' => '1995-04-10',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 31,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0922-444-9988',
            'address' => 'Block 4 Lot 14, Mahogany Ave., Zone 2, Pasay City',
            'work_address' => 'Garcia Construction Depot, Zone 2',
            'civil_status' => 'Single',
            'occupation' => 'Freelance Contractor',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c12->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 3, // Elevated to 3 due to cross-dossier serial history
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 8,
            'risk_level' => 'HIGH',
        ]);

        VawcLegalEscalation::create([
            'vawc_case_id' => $c12->id,
            'referral_target' => 'PNP Women and Children Protection',
            'violation_datetime' => Carbon::parse('2026-09-08 15:00:00', $tz),
            'violation_description' => 'Serial perpetrator battery by Larry Garcia under RA 9262 Sec. 5(a). Transmitted to PNP WCPD with cross-dossier alert docket attached.',
            'escorted_by_pb' => true,
        ]);

        $dossier12->syncDossierAggregates();

        // =============================================================
        // SCENARIO B: MINOR CHILDREN COVERED UNDER RA 7610 & RA 9262
        // Dossier 13: Clarisse Mendoza vs. Rodrigo Mendoza (Spouse)
        // Features: 2 Minor Children Covered with School/Daycare Stay-Away & Tender of Service
        // =============================================================
        $d13_date = Carbon::parse('2026-09-07 09:00:00', $tz);

        $dossier13 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0013',
            'survivor_name' => 'Clarisse Mendoza',
            'respondent_name' => 'Rodrigo Mendoza',
            'relationship_type' => 'Spouse (Legal Husband)',
            'survivor_demographics' => [
                'name' => 'Clarisse Mendoza',
                'alias' => 'Claire',
                'age' => 32,
                'birthdate' => '1994-06-18',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0919-555-7788',
                'address' => 'Unit 3B, Sunshine Residences, Zone 2, Pasay City',
                'civil_status' => 'Married',
                'occupation' => 'High School Teacher',
            ],
            'respondent_demographics' => [
                'name' => 'Rodrigo Mendoza',
                'alias' => 'Rod',
                'age' => 35,
                'birthdate' => '1991-03-24',
                'birthplace' => 'Laguna',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0920-111-2233',
                'address' => 'Unit 3B, Sunshine Residences, Zone 2, Pasay City',
                'work_address' => 'Pasay Logistics Hub, Terminal 3, Pasay City',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'occupation' => 'Logistics Driver',
            ],
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
            'complainant_address' => 'Unit 3B, Sunshine Residences, Zone 2, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d13_date,
            'incident_location' => 'Unit 3B, Sunshine Residences, Zone 2',
            'description' => 'Respondent engaged in violent emotional and physical terrorization in the presence of their two minor children (ages 8 and 5), threatening to abduct the children from their elementary school and daycare center.',
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
                ['name' => 'Bea Mendoza', 'age' => '8', 'school_or_daycare' => 'Zone 2 Elementary School'],
                ['name' => 'Lucas Mendoza', 'age' => '5', 'school_or_daycare' => 'Zone 2 Daycare Center'],
            ],
            'incident_location_details' => 'Living room and residential hallway of Unit 3B',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => false,
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['Temporary Safe Custody at Barangay Hall'],
            'is_bpo_consented_by_guardian' => true,
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
            'alias' => 'Claire',
            'birthdate' => '1994-06-18',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 32,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0919-555-7788',
            'address' => 'Unit 3B, Sunshine Residences, Zone 2, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'High School Teacher',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c13->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Rodrigo Mendoza',
            'alias' => 'Rod',
            'birthdate' => '1991-03-24',
            'birthplace' => 'Laguna',
            'nationality' => 'Filipino',
            'age' => 35,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0920-111-2233',
            'address' => 'Unit 3B, Sunshine Residences, Zone 2, Pasay City',
            'work_address' => 'Pasay Logistics Hub, Terminal 3, Pasay City',
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
            'survivor_demographics' => [
                'name' => 'Jessie Lucia',
                'alias' => 'Jess',
                'age' => 26,
                'birthdate' => '2000-08-03',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0918-333-5566',
                'address' => 'House #45, Narra St., Zone 3, Pasay City',
                'civil_status' => 'Married',
                'occupation' => 'Administrative Assistant',
            ],
            'respondent_demographics' => [
                'name' => 'Marco Alcantara',
                'alias' => 'Marco',
                'age' => 29,
                'birthdate' => '1997-01-15',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0929-777-4455',
                'address' => 'House #45, Narra St., Zone 3, Pasay City',
                'work_address' => 'Alcantara Auto Sales, Pasay City',
                'relationship' => 'Spouse (Legal Husband)',
                'civil_status' => 'Married',
                'occupation' => 'Sales Executive',
            ],
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
            'complainant_address' => 'House #45, Narra St., Zone 3, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d14_date,
            'incident_location' => 'House #45, Narra St., Zone 3',
            'description' => 'Respondent husband engaged in severe domestic physical assault against wife Jessie Lucia inside their shared home, inflicting lacerations and severe bruising.',
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
            'incident_location_details' => 'Inside master bedroom of the conjugal residence',
            'is_repeat_offense' => false,
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Pasay City General Hospital',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Monitoring',
            'referral_status' => ['Barangay VAW Desk', 'Barangay Tanod Patrol Outpost', 'Hospital / Medico-Legal'],
            'action_sought' => ['Barangay Protection Order (BPO)', 'Order to Vacate Shared Residence', 'Tanod Security Patrols'],
            'witness_info' => 'Next-door neighbor witnessed the domestic violence and heard loud distress calls at House #45 Narra St.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c14->id,
            'role' => 'Victim',
            'name' => 'Jessie Lucia',
            'alias' => 'Jess',
            'birthdate' => '2000-08-03',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 26,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0918-333-5566',
            'address' => 'House #45, Narra St., Zone 3, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Administrative Assistant',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c14->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Spouse (Legal Husband)',
            'name' => 'Marco Alcantara',
            'alias' => 'Marco',
            'birthdate' => '1997-01-15',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 29,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0929-777-4455',
            'address' => 'House #45, Narra St., Zone 3, Pasay City',
            'work_address' => 'Alcantara Auto Sales, Pasay City',
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
        // SCENARIO C (CONTINUED): CROSS-DOSSIER SERIAL ABUSER (TRACK 2 - COMMON CHILD CO-PARENT)
        // Dossier 15: Rina Gomez (25 yrs old) vs. Marco Alcantara (Parent of Common Child)
        // Qualifying Intimate Relationship under RA 9262 Sec. 3 -> Transmitted for Criminal Prosecution
        // =============================================================
        $dossier15 = VawcDossier::create([
            'dossier_number' => 'DOS-2026-0015',
            'survivor_name' => 'Rina Gomez',
            'respondent_name' => 'Marco Alcantara',
            'relationship_type' => 'Parent of Common Child',
            'survivor_demographics' => [
                'name' => 'Rina Gomez',
                'alias' => 'Rina',
                'age' => 25,
                'birthdate' => '2001-04-20',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Female',
                'contact' => '0918-333-9900',
                'address' => 'Block 12 Lot 5, Camia St., Zone 3, Pasay City',
                'civil_status' => 'Single',
                'occupation' => 'Freelance Accountant',
            ],
            'respondent_demographics' => [
                'name' => 'Marco Alcantara',
                'alias' => 'Marco',
                'age' => 29,
                'birthdate' => '1997-01-15',
                'birthplace' => 'Pasay City',
                'nationality' => 'Filipino',
                'gender' => 'Male',
                'contact' => '0929-777-4455',
                'address' => 'House #45, Narra St., Zone 3, Pasay City',
                'work_address' => 'Alcantara Auto Sales, Pasay City',
                'relationship' => 'Parent of Common Child',
                'civil_status' => 'Married',
                'occupation' => 'Sales Executive',
            ],
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
            'victim_name' => 'Rina Gomez',
            'victim_age' => 25,
            'victim_gender' => 'Female',
            'complainant_name' => 'Rina Gomez',
            'complainant_contact' => '0918-333-9900',
            'complainant_address' => 'Block 12 Lot 5, Camia St., Zone 3, Pasay City',
            'relation_to_victim' => 'Self (Victim)',
            'incident_date' => $d14_date,
            'incident_location' => 'Block 12 Lot 5, Camia St., Zone 3',
            'description' => 'Survivor Rina Gomez, mother of common child with Marco Alcantara, assaulted when respondent aggressively confronted her regarding child financial support demands and custody claims.',
            'lifecycle_status' => 'Under Investigation',
            'handled_by_id' => $officer->id,
        ]);

        $c15 = VawcCase::create([
            'dossier_id' => $dossier15->id,
            'incident_sequence' => 1,
            'sub_case_number' => 'VAWC-2026-0015-01',
            'case_report_id' => $cr15->id,
            'intake_type' => 'Direct',
            'children_count' => 1,
            'children_details' => [
                ['name' => 'Leo Gomez Alcantara', 'age' => '3', 'school_or_daycare' => 'Zone 3 Barangay Daycare Center']
            ],
            'incident_location_details' => 'Front porch and exterior driveway',
            'is_repeat_offense' => true, // Serial cross-dossier repeat offender
            'has_weapon_involved' => false,
            'is_offender_armed' => false,
            'substance_abuse' => ['Alcohol / Drunkenness'],
            'requires_medical' => true,
            'medical_facility_name' => 'Barangay 183 Health Center',
            'requires_alternative_housing' => false,
            'immediate_emergency_actions' => ['First-Aid Rendered / EMS Responded'],
            'is_bpo_consented_by_guardian' => true,
            'incident_veracity' => true,
            'status' => 'Escalated',
            'referral_status' => ['Barangay VAW Desk', 'PNP WCPD (Women & Children Protection Desk)', 'Hospital / Medico-Legal'],
            'action_sought' => ['PNP Inquest Referral', 'Medico-Legal Certificate', 'PAO Legal Representation'],
            'witness_info' => 'Daycare staff and neighbor witnessed respondent Marco Alcantara aggressively confronting and striking survivor Rina Gomez.',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c15->id,
            'role' => 'Victim',
            'name' => 'Rina Gomez',
            'alias' => 'Rina',
            'birthdate' => '2001-04-20',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 25,
            'is_minor' => false,
            'gender' => 'Female',
            'contact_number' => '0918-333-9900',
            'address' => 'Block 12 Lot 5, Camia St., Zone 3, Pasay City',
            'civil_status' => 'Single',
            'occupation' => 'Freelance Accountant',
        ]);

        VawcInvolvedParty::create([
            'vawc_case_id' => $c15->id,
            'role' => 'Respondent',
            'relationship_to_victim' => 'Parent of Common Child',
            'name' => 'Marco Alcantara',
            'alias' => 'Marco',
            'birthdate' => '1997-01-15',
            'birthplace' => 'Pasay City',
            'nationality' => 'Filipino',
            'age' => 29,
            'is_minor' => false,
            'gender' => 'Male',
            'contact_number' => '0929-777-4455',
            'address' => 'House #45, Narra St., Zone 3, Pasay City',
            'work_address' => 'Alcantara Auto Sales, Pasay City',
            'civil_status' => 'Married',
            'occupation' => 'Sales Executive',
        ]);

        VawcAssessment::create([
            'vawc_case_id' => $c15->id,
            'requires_medical' => true,
            'requires_alternative_housing' => false,
            'abuse_frequency' => 2,
            'abuse_severity' => 2,
            'weapon_access' => 1,
            'life_threat_level' => 2,
            'risk_score' => 7,
            'risk_level' => 'MODERATE',
        ]);

        VawcLegalEscalation::create([
            'vawc_case_id' => $c15->id,
            'referral_target' => 'PNP Women and Children Protection',
            'violation_datetime' => Carbon::parse('2026-09-09 09:00:00', $tz),
            'violation_description' => 'Physical battery and economic abuse committed by respondent Marco Alcantara against the mother of his common child, Rina Gomez, under RA 9262 Sec. 5(a) and 5(e). Docket formally transmitted to PNP WCPD and City Prosecutor for criminal investigation and child support enforcement.',
            'escorted_by_pb' => true,
        ]);

        $dossier15->syncDossierAggregates();
    }
}
