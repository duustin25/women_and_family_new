# 💻 VAWC Module: Fullstack Developer Guide

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Violence Against Women and Their Children (VAWC) Management

---

## 🌐 1. HTTP Route & Endpoint Matrix

All VAWC routes are prefixed under `/admin/vawc` and protected by the `auth` and `role:admin,head` middleware stack.

| HTTP Method | Route URI | Action / Method | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/vawc` | `VawcController@index` | Renders case blotter listing with search, risk filters, and status pagination. |
| `GET` | `/admin/vawc/create` | `VawcController@create` | Renders the 4-step modular case intake wizard. |
| `POST` | `/admin/vawc/search-dossier` | `VawcController@searchDossier` | API endpoint for "Search First" matching against `vawc_dossiers`. |
| `POST` | `/admin/vawc` | `VawcController@store` | Persists case, dossier, parties, abuse types, and initial RAVE score. |
| `GET` | `/admin/vawc/{id}` | `VawcController@show` | Renders case control center with progression stepper, logs, and BPO stage. |
| `POST` | `/admin/vawc/{id}/bpo/apply` | `VawcController@applyBpo` | Initiates ex-parte BPO application and starts 24-hour countdown. |
| `POST` | `/admin/vawc/{id}/bpo/issue` | `VawcController@issueBpo` | Punong Barangay approval and digital signing of BPO. |
| `POST` | `/admin/vawc/{id}/bpo/serve` | `VawcController@recordService` | Logs peace officer personal service and triggers 15-day relief countdown. |
| `POST` | `/admin/vawc/{id}/compliance-logs`| `VawcController@addComplianceLog`| Appends home visit, follow-up, or respondent hearing log. |
| `POST` | `/admin/vawc/{id}/escalate` | `VawcController@escalateCase` | Compiles transmittal and dispatches to PNP WCPD or Family Court. |
| `GET` | `/admin/vawc/{id}/print/bpo` | `VawcController@printBpo` | Generates official printable BPO legal certificate. |
| `GET` | `/admin/vawc/{id}/print/transmittal` | `VawcController@printTransmittal`| Generates formal transmittal cover for PNP WCPD. |

---

## ⚡ 2. Backend Implementation (Controller & Service Integration)

### 2.1 Atomic Case Storage (`VawcController.php` & `VawcCaseService.php`)

```php
// app/Http/Controllers/Admin/VawcController.php
public function store(VawcCaseCreateRequest $request, VawcCaseService $caseService)
{
    $validated = $request->validated();
    
    // Wrapped in DB::transaction within service layer
    $case = $caseService->createIncidentCase($validated, auth()->user());
    
    return redirect()->route('admin.vawc.show', $case->id)
        ->with('success', "VAWC Case {$case->case_number} recorded successfully.");
}
```

### 2.2 Form Validation Rules (`VawcCaseCreateRequest.php`)
```php
public function rules(): array
{
    return [
        'dossier_id'               => 'nullable|exists:vawc_dossiers,id',
        'survivor.first_name'      => 'required|string|max:100',
        'survivor.last_name'       => 'required|string|max:100',
        'survivor.contact_number'  => 'required|string|regex:/^(\+?63|0)9\d{9}$/',
        'incident.incident_date'   => 'required|date|before_or_equal:today',
        'incident.incident_purok'  => 'required|string|in:Purok 1,Purok 2,Purok 3,Purok 4,Purok 5,Purok 6,Purok 7,Purok 8,Purok 9,Purok 10',
        'incident.abuse_types'     => 'required|array|min:1',
        'incident.abuse_types.*'   => 'in:physical,sexual,psychological,economic',
        'incident.narrative'       => 'required|string|min:20',
        'respondent.full_name'     => 'required|string|max:200',
        'respondent.relationship'  => 'required|string|max:100',
        'rave_answers'             => 'required|array|size:12',
    ];
}
```

---

## ⚛️ 3. Frontend Architecture (React 19 & Custom Hooks)

### 3.1 Custom Hook: `useVawcCreateWorkflow.ts`
Coordinates multi-step validation and state isolation across atomic wizard panels:

```typescript
// resources/js/hooks/useVawcCreateWorkflow.ts
export function useVawcCreateWorkflow() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [dossierState, setDossierState] = useState<DossierMatch | null>(null);
  
  const form = useForm<VawcCreatePayload>({
    dossier_id: null,
    survivor: initialSurvivorState,
    incident: initialIncidentState,
    respondent: initialRespondentState,
    rave_answers: defaultRaveArray,
  });

  const nextStep = () => {
    // Validates current step before moving forward
    if (validateStep(currentStep, form.data)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  return { form, currentStep, nextStep, prevStep: () => setCurrentStep(p => p - 1), dossierState };
}
```

---

## 🧪 4. Testing & Quality Assurance

### 4.1 Unit Testing the BPO Statutory Timer (PHPUnit / Pest)
```php
public function test_bpo_24h_sla_deadline_is_accurately_calculated()
{
    $applicationTime = Carbon::parse('2026-09-22 10:00:00');
    Carbon::setTestNow($applicationTime);

    $bpo = app(VawcBpoService::class)->createApplication($vawcCase);

    $this->assertEquals(
        '2026-09-23 10:00:00',
        $bpo->sla_deadline->toDateTimeString(),
        'BPO SLA deadline must equal exactly T_apply + 24 hours.'
    );
}
```

### 4.2 Conciliation Prohibition Assertion
```php
public function test_vawc_case_cannot_be_closed_via_amicable_settlement()
{
    $this->expectException(\DomainException::class);
    
    $caseService = app(VawcCaseService::class);
    $caseService->closeCase($activeCase, 'Parties reached amicable settlement at barangay hall');
}
```
