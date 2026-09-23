# 🧮 BCPC Module: Logics, Rules & Mathematical Algorithms

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Standards:** World Health Organization (WHO) Child Growth Standards (2006) & National Nutrition Council (NNC) e-OPT Plus

---

## 📐 1. Child Chronological Age Calculation

To adhere strictly to NNC and WHO standards, child age is computed in fractional months rather than rounded integer years:

$$\text{Age}_{\text{days}} = \text{Date}_{\text{weighed}} - \text{Date}_{\text{birth}}$$

$$\text{Age}_{\text{months}} = \left\lfloor \frac{\text{Age}_{\text{days}}}{30.4375} \right\rfloor$$

*(Where $30.4375$ represents the average number of days per month: $365.25 / 12$)*

### 60-Month Statutory Lockout
$$\text{Lockout Trigger} = \begin{cases}
\mathbf{Permitted} & \text{if } \text{Age}_{\text{months}} \le 59 \\
\mathbf{Locked / Age-Out} & \text{if } \text{Age}_{\text{months}} \ge 60 \implies \text{Transition to DepEd SBFP}
\end{cases}$$

---

## 📊 2. WHO 3-Axis Growth Diagnostics

The system categorizes children across three separate, orthogonal clinical axes:

### Axis 1: Weight-for-Age (WFA) — General Nutritional Status
* **Severely Underweight:** $Z < -3\text{ SD}$
* **Underweight:** $-3\text{ SD} \le Z < -2\text{ SD}$
* **Normal:** $-2\text{ SD} \le Z \le +2\text{ SD}$
* **Overweight:** $Z > +2\text{ SD}$

### Axis 2: Height-for-Age (HFA) — Linear Growth & Stunting
* **Severely Stunted:** $Z < -3\text{ SD}$
* **Stunted:** $-3\text{ SD} \le Z < -2\text{ SD}$
* **Normal:** $-2\text{ SD} \le Z \le +2\text{ SD}$
* **Tall:** $Z > +2\text{ SD}$

### Axis 3: Weight-for-Length/Height (WFL/H) — Acute Malnutrition & Wasting
* **Severe Acute Malnutrition (SAM):** $Z < -3\text{ SD}$ OR presence of **Bilateral Pitting Oedema**
* **Moderate Acute Malnutrition (MAM):** $-3\text{ SD} \le Z < -2\text{ SD}$
* **Normal:** $-2\text{ SD} \le Z \le +2\text{ SD}$
* **Overweight:** $+2\text{ SD} < Z \le +3\text{ SD}$
* **Obese:** $Z > +3\text{ SD}$

---

## 🔬 3. Continuous Linear Interpolation Algorithm

Because real-world children are weighed on arbitrary calendar days between discrete monthly milestones, the system applies **linear interpolation** across the WHO reference vector.

Let $a$ be the exact decimal age in months, where $m_1 \le a \le m_2$ and $m_2 = m_1 + 1$.  
Let $Y_{m_1}$ and $Y_{m_2}$ be the reference standard values at integer months $m_1$ and $m_2$ for a specific standard deviation:

$$Y(a) = Y_{m_1} + \left( \frac{a - m_1}{m_2 - m_1} \right) \cdot (Y_{m_2} - Y_{m_1})$$

```php
// app/Services/NutritionCalculatorService.php
public function interpolate(float $exactAge, array $table, string $sdKey): float
{
    $m1 = (int) floor($exactAge);
    $m2 = $m1 + 1;
    
    $val1 = $table[$m1][$sdKey];
    $val2 = $table[$m2][$sdKey] ?? $val1;
    
    $fraction = $exactAge - $m1;
    return $val1 + ($fraction * ($val2 - $val1));
}
```

---

## ⚠️ 4. Biological Range Sanity Interceptor ($\pm 5\text{ SD}$)

To prevent field typographical errors from contaminating public health census statistics, measurements outside biological limits trigger an automated pause prompt:

$$\text{Valid Weight Range} = [1.50\text{ kg}, \; 35.00\text{ kg}]$$
$$\text{Valid Height/Length Range} = [40.00\text{ cm}, \; 125.00\text{ cm}]$$

$$\text{Outlier Check} = \begin{cases}
\mathbf{True} & \text{if } W < \text{SD}_{-5}(a) \;\lor\; W > \text{SD}_{+5}(a) \;\lor\; H < \text{SD}_{-5}(a) \;\lor\; H > \text{SD}_{+5}(a) \\
\mathbf{False} & \text{otherwise}
\end{cases}$$

When `Outlier Check = True`, the frontend blocks immediate submission and displays:
`[CONFIRMATION REQUIRED]: The entered value deviates over 5 standard deviations from WHO biological norms. Verify measurement before saving.`

---

## 🍲 5. 120-Day SFP Lifecycle & Velocity Tracking

When a child is triaged as **SAM**, **MAM**, or **Wasted**, they are enrolled into the 120-Day Supplemental Feeding Program (RA 11037).

### 5.1 Milestone Schedule
$$T_{\text{baseline}} = \text{Day 1 (Intake)}$$
$$T_{\text{day30}} = T_{\text{baseline}} + 30\text{ days}$$
$$T_{\text{day60}} = T_{\text{baseline}} + 60\text{ days (Midterm)}$$
$$T_{\text{day90}} = T_{\text{baseline}} + 90\text{ days}$$
$$T_{\text{day120}} = T_{\text{baseline}} + 120\text{ days (Graduation Evaluation)}$$

### 5.2 Weight Gain Velocity Formulation
Weight recovery velocity ($V$) is calculated in grams per day:

$$V = \left( \frac{W_{\text{current}} - W_{\text{baseline}}}{\Delta t_{\text{days}}} \right) \times 1000 \quad [\text{g/day}]$$

* **Normal Response:** $V \ge 5.0\text{ g/day}$ (Positive clinical trajectory).
* **Non-Responder Warning:** $V < 2.0\text{ g/day}$ after Day 60 (Triggers clinical reassessment referral).

### 5.3 Relapse Engine Logic
```php
// Single Master Profile Relapse Check
if ($existingChild->hasCompletedSfp() && in_array($currentAssessment->wfl_status, ['sam', 'mam', 'severely_wasted', 'wasted'])) {
    $newCycleNumber = $existingChild->latest_sfp_cycle + 1;
    
    // Enroll into Cycle 2 under same master ID
    $currentAssessment->update([
        'sfp_cycle_number' => $newCycleNumber,
        'sfp_milestone'    => 'baseline',
    ]);
}
```
