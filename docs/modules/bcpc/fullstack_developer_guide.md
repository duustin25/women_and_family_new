# 💻 BCPC Module: Fullstack Developer Guide

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module

---

## 🌐 1. HTTP Route & Controller Matrix

All BCPC routes are prefixed under `/admin/bcpc` and protected by the `auth` and `role:admin,bns,head` middleware stack.

| HTTP Method | Route URI | Action / Method | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/bcpc` | `BcpcMonitoringController@index` | Lists registered 0–59 month children with zone filters and malnutrition stats. |
| `GET` | `/admin/bcpc/create` | `BcpcMonitoringController@create` | Renders the child registration & baseline intake form. |
| `POST` | `/admin/bcpc` | `BcpcMonitoringController@store` | Validates demographics and creates child profile with baseline assessment. |
| `GET` | `/admin/bcpc/{id}` | `BcpcMonitoringController@show` | Longitudinal growth card, clinical history, and SFP timeline. |
| `POST` | `/admin/bcpc/{id}/assessment` | `BcpcMonitoringController@storeAssessment` | Records new follow-up weighing, computes WHO z-scores, checks outliers. |
| `GET` | `/admin/bcpc/dashboard` | `BcpcMonitoringController@dashboard` | Public health analytics dashboard and zone prevalence breakdowns. |
| `GET` | `/admin/bcpc/print` | `BcpcMonitoringController@printMasterlist` | Official printable DOH/NNC e-OPT Plus Masterlist. |

---

## ⚡ 2. Backend Implementation (`NutritionCalculatorService.php`)

### 2.1 Calculating Status
```php
// app/Services/NutritionCalculatorService.php
namespace App\Services;

class NutritionCalculatorService
{
    /**
     * Compute WHO 3-Axis status from clinical inputs.
     */
    public function evaluate(float $weightKg, float $heightCm, float $ageMonths, string $gender, bool $hasEdema): array
    {
        // 1. Check Biological Range Sanity
        $isOutlier = $this->isBiologicalOutlier($weightKg, $heightCm, $ageMonths);

        // 2. Weight-for-Age (WFA)
        $wfaStatus = $this->calculateWfa($weightKg, $ageMonths, $gender);

        // 3. Height-for-Age (HFA)
        $hfaStatus = $this->calculateHfa($heightCm, $ageMonths, $gender);

        // 4. Weight-for-Length/Height (WFL/H)
        $wflStatus = $hasEdema ? 'sam' : $this->calculateWfl($weightKg, $heightCm, $ageMonths, $gender);

        return [
            'wfa_status' => $wfaStatus,
            'hfa_status' => $hfaStatus,
            'wfl_status' => $wflStatus,
            'is_outlier' => $isOutlier,
        ];
    }
}
```

### 2.2 Form Validation Rules
```php
public function rules(): array
{
    return [
        'first_name'         => 'required|string|max:100',
        'last_name'          => 'required|string|max:100',
        'gender'             => 'required|in:male,female',
        'birth_date'         => 'required|date|before_or_equal:today',
        'zone'               => 'required|string|in:Zone 1,Zone 2,Zone 3,Zone 4,Zone 5,Zone 6,Zone 7,Zone 8,Zone 9,Zone 10',
        'assessment_date'    => 'required|date|before_or_equal:today',
        'weight_kg'          => 'required|numeric|between:1.50,35.00',
        'height_cm'          => 'required|numeric|between:40.0,125.0',
        'measurement_type'   => 'required|in:lying,standing',
        'has_edema'          => 'boolean',
    ];
}
```

---

## ⚛️ 3. Frontend Implementation & Outlier Interceptor

```typescript
// In resources/js/pages/Admin/Bcpc/Show.tsx
const handleAssessmentSubmit = (data: AssessmentPayload) => {
  // Check if server or client-side calculation indicates outlier (> 5 SD)
  if (isOutlierMeasurement(data.weight_kg, data.height_cm, data.age_months)) {
    setShowOutlierModal(true);
    return; // Block immediate dispatch until user confirms
  }
  
  router.post(`/admin/bcpc/${child.id}/assessment`, data, {
    onSuccess: () => toast.success('Weighing assessment recorded successfully.'),
  });
};
```

---

## 🧪 4. Testing Suite (PHPUnit)

```php
public function test_60_month_age_out_lockout_blocks_registration()
{
    $birthDate = Carbon::now()->subMonths(61);
    
    $response = $this->actingAs($this->bnsUser)->post('/admin/bcpc', [
        'first_name' => 'John',
        'last_name'  => 'Doe',
        'birth_date' => $birthDate->toDateString(),
        'zone'       => 'Zone 1',
    ]);

    $response->assertSessionHasErrors(['birth_date']);
}

public function test_linear_interpolation_between_months_is_precise()
{
    $calc = app(NutritionCalculatorService::class);
    // Boy aged 12.5 months with weight 9.6 kg
    $result = $calc->evaluate(9.6, 75.7, 12.5, 'male', false);

    $this->assertEquals('normal', $result['wfa_status']);
}
```
