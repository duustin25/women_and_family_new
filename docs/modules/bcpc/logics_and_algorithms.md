# 🧮 BCPC Module: Logics, Rules & Mathematical Algorithms

> **Municipal & Barangay Women and Family Protection Information System (WFPIS)**  
> **Module:** Barangay Council for the Protection of Children (BCPC) Child Nutrition Module  
> **Standards:** World Health Organization (WHO) Child Growth Standards (2006) & National Nutrition Council (NNC) e-OPT Plus  
> **Statutory Basis:** Republic Act No. 11037 (*Masustansyang Pagkain para sa Batang Pilipino Act*)

---

## ⚠️ Important Advisory Disclaimer & Clinical Scope

> [!IMPORTANT]
> **Advisory Disclaimer:**  
> *"The system generates a preliminary nutritional-status result for verification by authorized nutrition or health personnel. It does not provide a medical diagnosis or automatically enroll a child in a feeding program."*  
> All mathematical formulations, interpolated standard deviations, and triage classifications computed by this module are decision-support telemetry designed to guide certified health personnel (BNS/BHW/CHO) during field operations.

---

## 📐 1. Child Chronological Age Calculation

To adhere strictly to NNC and WHO e-OPT Plus standards, child age is computed in exact days and fractional months rather than calendar years:

$$\text{Age}_{\text{days}} = \text{Date}_{\text{weighed}} - \text{Date}_{\text{birth}}$$

$$\text{Age}_{\text{months}} = \left\lfloor \frac{\text{Age}_{\text{days}}}{30.4375} \right\rfloor$$

*(Where $30.4375$ represents the mean Gregorian month duration: $365.25 / 12$ days)*

### Statutory 60-Month Lockout Boundary (RA 11037)
$$\text{Intake Status} = \begin{cases}
\mathbf{Eligible} & \text{if } \text{Age}_{\text{months}} \le 59 \quad (\text{Barangay BCPC Nutrition Scope}) \\
\mathbf{Locked / Age\text{-}Out} & \text{if } \text{Age}_{\text{months}} \ge 60 \implies \text{Transfer to DepEd SBFP}
\end{cases}$$

When a child attains 60 months, new assessment entries are blocked and the record is flagged as `Aged Out` (non-destructive archival compliant with COA retention rules).

---

## 📊 2. WHO 3-Axis Growth Diagnostics

The system categorizes children across three independent, standardized clinical axes:

### Axis 1: Weight-for-Age (WFA) — General Underweight Assessment
* **Severely Underweight:** $Z < -3\text{ SD}$
* **Underweight:** $-3\text{ SD} \le Z < -2\text{ SD}$
* **Normal:** $-2\text{ SD} \le Z \le +2\text{ SD}$
* **Overweight:** $Z > +2\text{ SD}$

### Axis 2: Height-for-Age (HFA) — Linear Stunting Assessment
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

Field weighings occur on arbitrary calendar days between discrete monthly milestone dates. To calculate decimal-precise reference baselines, the system performs **piecewise linear interpolation** across the WHO reference vector.

Let $a$ be the exact decimal age in months, where $m_1 \le a \le m_2$ and $m_2 = m_1 + 1$.  
Let $Y_{m_1}$ and $Y_{m_2}$ be the reference standard deviation cutoff values at integer months $m_1$ and $m_2$ for a given sex:

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

> [!NOTE]
> Per the adviser's evaluation, while this interpolation provides an immediate mathematical approximation in field environments, it is presented as a **preliminary result** subject to verification by certified BNS using authorized NNC e-OPT Plus reference charts.

---

## ⚠️ 4. Biological Range Sanity Interceptor ($\pm 5\text{ SD}$)

To prevent field typographical errors (e.g. typing `120 kg` instead of `12.0 kg`, or `750 cm` instead of `75.0 cm`) from corrupting health records, inputs outside physiological limits trigger an interactive confirmation dialog:

$$\text{Plausibility Weight Range} = [1.50\text{ kg}, \; 35.00\text{ kg}]$$
$$\text{Plausibility Height/Length Range} = [40.00\text{ cm}, \; 125.00\text{ cm}]$$

$$\text{Outlier Condition} = \begin{cases}
\mathbf{True} & \text{if } W < \text{SD}_{-5}(a) \;\lor\; W > \text{SD}_{+5}(a) \;\lor\; H < \text{SD}_{-5}(a) \;\lor\; H > \text{SD}_{+5}(a) \\
\mathbf{False} & \text{otherwise}
\end{cases}$$

When an extreme outlier is detected, the UI prompts:
> **Extreme Outlier Detected:** The entered value deviates over 5 standard deviations from WHO biological norms. Re-weigh child and confirm measurement before saving.

---

## 🍲 5. 120-Day SFP Lifecycle & Velocity Tracking

In compliance with Republic Act No. 11037, undernourished children identified by screening may be enrolled into the barangay's 120-Day Supplemental Feeding Program (SFP).

### 5.1 Enrollment Protocol (Human-in-the-Loop)
- Enrollment is **never automatic**.
- Once a preliminary assessment identifies MAM, SAM, Underweight, or Stunting, the BNS discusses the intervention with the guardian.
- Upon receiving guardian consent and clinical confirmation, the encoder activates the SFP enrollment toggle.

### 5.2 Milestone Schedule
$$T_{\text{baseline}} = \text{Day 1 (Intake Weighing)}$$
$$T_{\text{day30}} = T_{\text{baseline}} + 30\text{ days}$$
$$T_{\text{day60}} = T_{\text{baseline}} + 60\text{ days (Midterm)}$$
$$T_{\text{day90}} = T_{\text{baseline}} + 90\text{ days}$$
$$T_{\text{day120}} = T_{\text{baseline}} + 120\text{ days (Graduation Evaluation)}$$

### 5.3 Weight Gain Velocity Formulation
Weight recovery velocity ($V$) evaluates therapeutic response in grams per day:

$$V = \left( \frac{W_{\text{current}} - W_{\text{baseline}}}{\Delta t_{\text{days}}} \right) \times 1000 \quad [\text{g/day}]$$

* **Positive Response:** $V \ge 5.0\text{ g/day}$ (Adequate nutritional response).
* **Non-Responder Flag:** $V < 2.0\text{ g/day}$ at or after Day 60 (Prompts medical investigation referral to CHO).

### 5.4 Relapse & Longitudinal Re-entry
If a child who previously graduated from SFP exhibits nutritional relapse during a future census cycle, the system creates a new feeding cycle (Cycle 2, 3, etc.) under the **same Master Child ID (`bcpc_children`)**, maintaining an unbroken longitudinal audit history.
