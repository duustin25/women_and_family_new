# 💻 BCPC Module: Fullstack Developer Guide

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Standards:** Clean-Partials Architecture (Matching VAWC Pattern), WHO Child Growth Standards 2006, NNC e-OPT Plus

---

## ⚠️ Important Statutory Advisory Disclaimer

> [!IMPORTANT]
> **Advisory Disclaimer (Adviser & NNC Compliance):**  
> *"The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program."*

---

## 🌐 1. HTTP Route & Controller Matrix

All BCPC routes are prefixed under `/admin/bcpc` and protected by the `auth` and `role:admin,bns,head` middleware stack.

| HTTP Method | Route URI | Route Name | Action / Method | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/bcpc/cases` | `bcpc.index` | `BcpcMonitoringController@index` | Lists registered 0–59 month children with triage filters and metrics. |
| `GET` | `/admin/bcpc/cases/create` | `bcpc.create` | `BcpcMonitoringController@create` | Renders 3-step child registration & baseline intake wizard. |
| `POST` | `/admin/bcpc/cases` | `bcpc.store` | `BcpcMonitoringController@store` | Validates demographics & creates child with baseline assessment. |
| `GET` | `/admin/bcpc/cases/{id}` | `bcpc.show` | `BcpcMonitoringController@show` | Longitudinal growth profile, SFP timeline, and clinical records. |
| `PUT` | `/admin/bcpc/cases/{id}` | `bcpc.update` | `BcpcMonitoringController@update` | Records follow-up measurement, updates WHO status & SFP milestones. |
| `POST` | `/admin/bcpc/cases/{id}/photo` | `bcpc.photo` | `BcpcMonitoringController@uploadPhoto` | Uploads and associates child profile photograph. |
| `POST` | `/admin/bcpc/cases/{id}/reenroll-cycle` | `bcpc.reenroll-cycle` | `BcpcMonitoringController@reenrollCycle` | Re-enrolls relapsed child into a new SFP cycle under same master profile. |
| `GET` | `/admin/bcpc/dashboard` | `bcpc.dashboard` | `BcpcMonitoringController@dashboard` | Public health command center with real-time triage queues. |
| `GET` | `/admin/bcpc/print` | `bcpc.print` | `BcpcMonitoringController@print` | Official printable DOH/NNC e-OPT Plus Masterlist. |

---

## ⚡ 2. Backend Implementation (`NutritionCalculatorService.php`)

### 2.1 Calculating Status
```php
// app/Services/NutritionCalculatorService.php
namespace App\Services;

class NutritionCalculatorService
{
    /**
     * Compute preliminary WHO 3-Axis status from clinical inputs.
     */
    public function evaluate(float $weightKg, float $heightCm, float $ageMonths, string $gender, bool $hasEdema): array
    {
        // 1. Check Biological Range Sanity (1.5–35 kg, 40–125 cm)
        $outlierCheck = $this->isExtremeOutlier($ageMonths, $gender, $weightKg, $heightCm);

        // 2. Weight-for-Age (WFA)
        $wfaStatus = $this->evaluateWeightForAge($ageMonths, $gender, $weightKg);

        // 3. Height-for-Age (HFA)
        $hfaStatus = $this->evaluateHeightForAge($ageMonths, $gender, $heightCm);

        // 4. Weight-for-Length/Height (WFL/H)
        $wflStatus = $hasEdema ? 'Severely Wasted' : $this->evaluateWeightForLengthHeight($ageMonths, $gender, $weightKg, $heightCm);

        return [
            'wfa_status' => $wfaStatus,
            'hfa_status' => $hfaStatus,
            'wfl_status' => $wflStatus,
            'is_outlier' => $outlierCheck['is_extreme'],
            'outlier_message' => $outlierCheck['message'] ?? null,
            'disclaimer' => 'The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program.',
        ];
    }
}
```

### 2.2 Form Validation Rules (`store`)
```php
$validated = $request->validate([
    'member_id'        => 'nullable|exists:members,id',
    'zone_id'          => 'nullable|exists:zones,id',
    'guardian_name'    => 'required|string|max:255',
    'address'          => 'required|string|max:255',
    'contact_number'   => 'nullable|string|max:50',
    'bns_name'         => 'nullable|string|max:255',
    'child_first_name' => 'required|string|max:255',
    'child_last_name'  => 'required|string|max:255',
    'child_middle_name'=> 'nullable|string|max:255',
    'photo'            => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
    'date_of_birth'    => 'required|date|before_or_equal:today',
    'sex'              => 'required|in:Male,Female',
    'date_of_weighing' => 'required|date|after_or_equal:date_of_birth|before_or_equal:today',
    'weight_kg'        => 'required|numeric|min:1.5|max:35.0',
    'height_cm'        => 'required|numeric|min:40.0|max:125.0',
    'intervention_logs'=> 'nullable|array',
    'remarks'          => 'nullable|string',
    'bns_assessor'     => 'nullable|string|max:255',
    'sfp_status'       => 'nullable|string|in:None,Enrolled',
    'confirm_outlier'  => 'nullable|boolean',
]);
```

---

## ⚛️ 3. Frontend Architecture (Modular Partials Pattern)

The frontend organizes component responsibilities across dedicated `Partials/` directories:

### 3.1 Directory Structure
- `resources/js/pages/Admin/Bcpc/Partials/Index/`
  - `types.ts`
  - `BcpcIndexHeader.tsx`
  - `BcpcMetricCards.tsx`
  - `BcpcTriageFilterBar.tsx`
  - `BcpcChildrenTable.tsx`
- `resources/js/pages/Admin/Bcpc/Partials/Create/`
  - `types.ts`
  - `CreateHeader.tsx`
  - `CreateAdvisoryBanner.tsx`
  - `Step1GuardianHousehold.tsx`
  - `Step2ChildIdentity.tsx`
  - `Step3BaselineMeasurement.tsx`
- `resources/js/pages/Admin/Bcpc/Partials/Show/`
  - `types.ts`
  - `BcpcProfileHeader.tsx`
  - `BcpcAdvisoryBanner.tsx`
  - `BcpcDemographicsCard.tsx`
  - `BcpcSfpTimelineCard.tsx`
  - `BcpcDiagnosticsCard.tsx`
  - `BcpcGrowthHistoryTable.tsx`
  - `Modals/BcpcMeasurementModal.tsx`
  - `Modals/BcpcPhotoUploadModal.tsx`
  - `Modals/BcpcChoReferralModal.tsx`
  - `Modals/BcpcExtremeOutlierModal.tsx`
- `resources/js/pages/Admin/Bcpc/Partials/Dashboard/`
  - `types.ts`
  - `BcpcDashboardHeader.tsx`
  - `BcpcKpiStrip.tsx`
  - `BcpcTriageQueueSection.tsx`
  - `BcpcSfpRosterSection.tsx`
  - `BcpcZoneHeatmapTable.tsx`
  - `BcpcNutritionalDistributions.tsx`
  - `BcpcBirthdaysWidget.tsx`

### 3.2 Outlier Interception Flow
```typescript
// Example from BcpcMeasurementModal.tsx / Show.tsx
const handleMeasurementSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check biological bounds (Weight: 1.5–35 kg, Height: 40–125 cm)
    if (isBiologicalOutlier(form.weight_kg, form.height_cm, childAgeMonths)) {
        setIsOutlierModalOpen(true);
        return; // Intercept dispatch until confirmed
    }

    form.put(`/admin/bcpc/cases/${child.id}`, {
        onSuccess: () => {
            setIsMeasurementModalOpen(false);
            toast.success('Weighing assessment recorded successfully.');
        },
    });
};
```

---

## 🧪 4. Testing Suite (PHPUnit)

```php
public function test_60_month_age_out_lockout_blocks_registration()
{
    $birthDate = Carbon::now()->subMonths(61);
    
    $response = $this->actingAs($this->bnsUser)->post('/admin/bcpc/cases', [
        'child_first_name' => 'John',
        'child_last_name'  => 'Doe',
        'date_of_birth'    => $birthDate->toDateString(),
        'date_of_weighing' => Carbon::today()->toDateString(),
        'sex'              => 'Male',
        'weight_kg'        => 14.5,
        'height_cm'        => 95.0,
        'guardian_name'    => 'Jane Doe',
        'address'          => 'Zone 1',
    ]);

    $response->assertSessionHasErrors(['date_of_birth']);
}

public function test_sfp_enrollment_is_not_automatic()
{
    $response = $this->actingAs($this->bnsUser)->post('/admin/bcpc/cases', [
        'child_first_name' => 'Ana',
        'child_last_name'  => 'Santos',
        'date_of_birth'    => Carbon::now()->subMonths(18)->toDateString(),
        'date_of_weighing' => Carbon::today()->toDateString(),
        'sex'              => 'Female',
        'weight_kg'        => 6.2, // Underweight/Wasted
        'height_cm'        => 75.0,
        'guardian_name'    => 'Maria Santos',
        'address'          => 'Zone 2',
        'sfp_status'       => 'None', // Explicitly not enrolled
    ]);

    $child = BcpcChild::where('child_first_name', 'Ana')->first();
    $this->assertEquals('None', $child->sfp_status);
}
```
