
My Required Correction/Suggestion
Add a dedicated validation plan containing the number and source of de-identified scenarios, qualifications of
expert assessors, reference classification procedure, system output, confusion matrix, class-specific metrics,
agreement measure, false-negative review, acceptance threshold, and safety action when experts and the
system disagree.
Possible Revised Statement or Output
Possible revised output:
Add a validation table with Case ID, Expert Reference Category, System Category, Match, Error Type, Required
Human Action, and Pass or Fail.
7. AI Chatbot Architecture
My Evaluation/Comment
The chatbot architecture does not adequately explain how the Python NLP component integrates with
Laravel, authenticates requests, stores queries, and protects sensitive information.
My Required Correction/Suggestion
Add an architecture and data-flow diagram showing the Laravel application, chatbot service, knowledge
source, authentication, logging, data retention, sanitization, fallback, and escalation. Prevent names, case
narratives, child information, and other sensitive data from entering the chatbot training or query logs.
Possible Revised Statement or Output
Possible revised output:
Add a data-flow diagram showing User Query → Input Sanitization → Verified Knowledge Base or Classifier →
Confidence Check → Safe Response or Human Referral → Privacy-Controlled Log.
8. Security and Privacy
My Evaluation/Comment
Bcrypt, HTTPS, RBAC, throttling, and audit logs do not by themselves prove full compliance with the Data
Privacy Act. Full data diffs may create another repository of sensitive information.
My Required Correction/Suggestion
Conduct a privacy-impact assessment covering purpose, lawful basis, data categories, authorized users,
notices or consent where applicable, data minimization, retention, deletion, sharing, hosting, third-party
processors, data-subject rights, incident response, breach management, backup encryption, and DPO
coordination.
Exclude or mask passwords, victim narratives, medical details, addresses, contact numbers, child data, and
other sensitive fields from audit logs. Document who may access audit logs and how long they are retained.
Possible Revised Statement or Output
Possible revised statement:
"The system implements selected technical controls, including password hashing, HTTPS, role-based
permissions, session controls, and audit logging. Compliance remains subject to a formal privacy-impact
assessment, organizational policies, legal review, and objective security testing."
9. Backup and Restoration
My Evaluation/Comment
The "single-click restoration" claim is not supported by objective testing and may itself create an overwrite
risk.
My Required Correction/Suggestion
Restrict restoration to specifically authorized administrators and require confirmation, logging, and rollback
controls. Report backup encryption, storage location, recovery-point objective, recovery-time objective,
restoration test records, record-count/hash verification, failures encountered, and pass-or-fail outcomes.
Possible Revised Statement or Output
Possible revised test statement:
"Three restoration trials were performed in an isolated environment. Each trial verified record counts, file
integrity, user access, and transaction consistency. Restoration was considered successful only when all
verification criteria passed."
10. Diagrams and Database Design
My Evaluation/Comment
The expected diagrams and database artifacts are present, but terminology and access flows must be
checked across all models.
My Required Correction/Suggestion
Conduct a traceability audit connecting every objective, stakeholder requirement, process, DFD flow, data
store, database entity, user role, module, test case, and Chapter 4 result. Correct inconsistent names, missing
flows, unauthorized access paths, and entities that do not correspond to an implemented requirement.
Chapter 3 Rating: 62%
Possible Revised Statement or Output
Possible revised output:
Add a Requirements Traceability Matrix connecting Objective → Requirement → Diagram Process → Database
Entity → Module → Test Case → Chapter 4 Result.
Chapter 4 - Research Methodology, Results and Discussion
1. Research Design
My Evaluation/Comment
The descriptive-developmental design is acceptable, but the study claims practical effectiveness, improved
efficiency, monitoring accuracy, risk-assessment accuracy, and improved decision-making without sufficient
objective evidence.
My Required Correction/Suggestion
Clarify that perception surveys measure participant assessment and acceptance. Add controlled comparative
and technical tests for every objective performance claim. Separate perception-based findings, objective
system-performance findings, algorithm-validation findings, and legal/professional validation findings.
Possible Revised Statement or Output
Possible revised statement:
"The study separately evaluated user acceptance, expert perception of software quality, objective task
performance, technical controls, and the accuracy of advisory decision-support outputs. Results from one
evaluation type were not used as substitutes for another."
2. Data-Gathering Instruments and Likert Scale
My Evaluation/Comment
The methodology states that a five-point scale was used, while the actual TAM and ISO results use four-point
scales. The TAM source and adaptation are also insufficiently documented.
My Required Correction/Suggestion
Use the approved four-point scale consistently throughout the manuscript, instruments, appendices, tables,
interpretations, and conclusions. Identify the original TAM source, items adapted, revisions, validators, and
final instrument.
Use consistent TAM ranges:
Mean Range Interpretation
3.26-4.00 Strongly Agree
2.51-3.25 Agree
1.76-2.50 Disagree
1.00-1.75 Strongly Disagree
Under these ranges, the overall TAM mean of 3.20 must be interpreted as Agree, not Strongly Agree.
Possible Revised Statement or Output
Possible revised statement:
"A four-point Likert scale was consistently used: 4 - Strongly Agree, 3 - Agree, 2 - Disagree, and 1 - Strongly
Disagree. Means of 3.26-4.00 were interpreted as Strongly Agree, while 2.51-3.25 were interpreted as Agree."
3. Population and Sampling
My Evaluation/Comment
The seven actual TAM respondents are not adequately allocated by role, and the 20 pilot respondents are not
sufficiently described. The qualifications of the IT raters and validators are also incomplete.
My Required Correction/Suggestion
Present the population, number included, stakeholder category, inclusion criteria, sampling method, and
instrument for each group. Explain whether the seven participants constitute the full qualified user
population. Describe the 20 pilot respondents and prove that they were similar to the intended users but
excluded from actual testing. Present the education, role, years of experience, and relevant expertise of
every validator and IT evaluator.
Possible Revised Statement or Output
Possible revised statement:
"The seven actual users consisted of ___ VAW Desk Officers, ___ BCPC representatives, ___ GAD personnel,
___ administrative staff, and ___ organization heads. They were selected through ___ because ___."
4. Content Validation
My Evaluation/Comment
Chapter 5 reports an I-CVI and S-CVI/Average of 1.00, but Chapter 4 does not present the complete validation
results.
My Required Correction/Suggestion
Move the complete content-validation findings to Chapter 4. Present the validation criteria, individual
ratings, I-CVI per item, S-CVI computation, qualitative comments, revisions made, and final decision. Chapter
5 should only summarize these already presented results.
Possible Revised Statement or Output
Possible revised output:
Present Item, Validator Ratings, I-CVI, Qualitative Comment, Revision Made, and Final Decision. Report S-
CVI/Average only after the complete item-level table.
5. TAM Pilot Testing
My Evaluation/Comment
The Cronbach's alpha values provide preliminary internal-consistency evidence, but the eligibility of the 20
pilot respondents is not established. Reliability does not prove content validity, construct validity, or system
accuracy.
My Required Correction/Suggestion
Identify the pilot respondents, inclusion criteria, recruitment source, administration procedure, and exclusion
from actual testing. Interpret Cronbach's alpha only as internal consistency. Do not use it as evidence that the
system or questionnaire content is automatically accurate.
Possible Revised Statement or Output
Possible revised statement:
"The Cronbach's alpha values indicate the internal consistency of the adapted TAM items among the pilot
respondents. They do not demonstrate system accuracy, technical quality, or construct validity by themselves."
6. ISO/IEC 25010 Pilot Testing
My Evaluation/Comment
I do not accept the statement that a Fleiss' kappa of 0.322 provides a "solid basis" for proceeding without
revision. It indicates only fair agreement, and Fleiss' kappa alone does not establish complete instrument
reliability or validity.
My Required Correction/Suggestion
Identify the items that produced disagreement, obtain the raters' comments, revise ambiguous items, and
document the changes before actual administration. Use content validation for item relevance and Fleiss'
kappa only for rater agreement. Report these as distinct forms of evidence.
Possible Revised Statement or Output
Possible revised statement:
"The fair agreement result prompted a review of items ___, ___, and ___. The wording was clarified based on
the raters' comments before the final instrument was administered."
7. TAM Actual Results
My Evaluation/Comment
The overall mean of 3.20 is inconsistently interpreted as Strongly Agree, while a lower range is used to
interpret 3.08 as Agree. Behavioral Intention is also discussed as though it proves future actual use.
My Required Correction/Suggestion
Recalculate and reinterpret every TAM table using one approved range. Revise 3.20 to Agree if the stated
ranges are adopted. State that Behavioral Intention reflects reported intention at the time of the evaluation
and does not establish sustained actual use.
Possible Revised Statement or Output
Possible revised statement:
"The overall TAM mean was 3.20, interpreted as Agree. This indicates positive acceptance among the seven
respondents during the evaluation period but does not establish sustained actual use."
8. ISO/IEC 25010 Actual Results
My Evaluation/Comment
The overall means are high, but Fleiss' kappa of 0.0683 indicates only slight agreement among the four
experts. Perception ratings do not objectively prove response time, fault tolerance, recovery, security,
compatibility, maintainability, or portability.
My Required Correction/Suggestion
Investigate and report the items with the greatest disagreement. Discuss the low agreement as a limitation.
Use the wording "rated Highly Acceptable by the participating IT experts" and do not claim ISO compliance.
Supplement the ratings with objective technical test tables.
Suggested discussion:
"Although the overall ISO/IEC 25010 mean was high, the Fleiss' kappa result indicated only slight agreement.
Therefore, the mean is interpreted as a perception-based summary of the participating experts' ratings and
not as conclusive proof of objective software quality or ISO compliance."
Possible Revised Statement or Output
Possible revised statement:
"The system was rated Highly Acceptable by the four participating IT experts. However, the Fleiss' kappa value
indicated slight agreement; therefore, the mean is treated as a perception-based summary rather than proof of
ISO compliance."
9. Missing Objective Tests
My Evaluation/Comment
Chapter 4 lacks adequate objective testing for the manual comparison, risk engine, nutrition calculation, legal
workflow, chatbot, access control, security, performance, compatibility, backup, recovery, audit logging,
masking, and session controls.
My Required Correction/Suggestion
Add dedicated result tables containing the test condition, records or trials, expected result, actual result,
numerical measurement, evaluator, evidence, and pass-or-fail outcome. At minimum, test record retrieval,
report generation, record completeness, risk classification, nutrition calculation, BPO/referral workflow,
chatbot performance if retained, role restrictions, unauthorized access, response time, concurrent users,
browsers/devices, backup restoration, audit-log integrity, masking, session expiration, throttling, and
recovery.
Possible Revised Statement or Output
Possible revised output:
Use a test table with Test ID, Quality Area, Scenario, Records or Trials, Expected Result, Actual Result,
Measurement, Evidence, and Pass or Fail.
10. Objectives 1 and 4
My Evaluation/Comment
Objectives 1 and 4 are not adequately answered because no complete manual-versus-system comparison
establishes the claimed improvements.
My Required Correction/Suggestion
Conduct equivalent task trials using the same records and outputs for both manual and digital processes.
Report participants, device, browser, network, timing tool, trial count, mean, median, standard deviation,
minimum, maximum, difference, percentage improvement, and pass-or-fail criterion. Do not claim
improvement until the comparison is completed.
Chapter 4 Rating: 45%
Possible Revised Statement or Output
Possible revised statement:
"The same records and equivalent outputs were used for the manual and digital trials. The comparison reports
the mean, median, standard deviation, range, paired difference, percentage improvement, and test
conditions."
Chapter 5 - Summary, Conclusions and Recommendations
1. Summary
My Evaluation/Comment
Chapter 5 includes content-validation results that were not fully presented in Chapter 4 and summarizes
claims unsupported by complete objective evidence.
My Required Correction/Suggestion
Rewrite the summary only after revising Chapter 4. Follow the sequence of the final objectives and report
only the evidence already presented in Chapter 4. Separate pre-assessment, development output, objective
tests, algorithm validation, expert perceptions, user acceptance, and limitations.
Possible Revised Statement or Output
Possible revised opening:
"This chapter summarizes the findings in the same sequence as the revised objectives. It distinguishes pre-
assessment findings, system-development outputs, objective test results, advisory-model validation, expert
ratings, user acceptance, and study limitations."
2. Conclusions
My Evaluation/Comment
Several conclusions exceed the available evidence. Positive respondent ratings do not prove objective
efficiency, accurate risk classification, effective data protection, or ISO compliance.
My Required Correction/Suggestion
Use evidence-bounded conclusions. Replace "met ISO requirements" with: "The system was rated Highly
Acceptable by the four participating IT evaluators based on the perception-based ISO/IEC 25010
questionnaire."
Replace "the system improved administrative efficiency" with: "The respondents perceived that the system
could support administrative activities; the extent of improvement must be determined through objective
manual-versus-system testing."
Replace any accuracy claim for the risk model with: "The system includes a preliminary advisory risk indicator
whose accuracy and operational safety require independent validation by qualified VAWC professionals."
Replace "fully compliant with the Data Privacy Act" with: "The system incorporates selected privacy and
security controls; formal legal review, privacy-impact assessment, organizational policies, and objective
security testing remain necessary."
Possible Revised Statement or Output
Possible revised conclusion:
"The system received positive perception-based evaluations from the participating users and IT experts. These
ratings do not independently establish legal compliance, technical security, risk-classification accuracy, or
objective process improvement."
3. Recommendations
My Evaluation/Comment
The recommendations prioritize additional features even though the existing high-risk functions remain
insufficiently validated.
My Required Correction/Suggestion
Prioritize validation and risk reduction before feature expansion. Complete the risk-model validation,
nutrition verification, legal-workflow review, privacy-impact assessment, security testing, backup/recovery
testing, and controlled pilot implementation before recommending mobile applications, GIS, SMS, cross-
agency integration, or broader deployment.
Recommend continued limited pilot use only with de-identified/simulated data or formally authorized
records, controlled access, professional oversight, and documented incident-response procedures.
Chapter 5 Rating: 54%
Possible Revised Statement or Output
Possible revised recommendation:
"Before full deployment, the researchers recommend a controlled and formally authorized pilot
implementation, completion of the privacy-impact assessment, expert validation of the advisory risk indicator,
verification of nutrition computations, security and recovery testing, and revision of the system based on
documented pilot findings."
Required Priority Sequence
I require the group to complete the revisions in this order:
1. Narrow and authorize the final scope.
2. Correct the title if the risk model remains unvalidated.
3. Complete and present the pre-assessment.
4. Correct the research questions and objectives.
5. Validate or remove the VAWC-RAVE mechanism.
6. Correct the BPO roles and obtain legal workflow validation.
7. Validate the nutrition computation or remove automatic classification/enrollment.
8. Remove or fully validate the AI legal chatbot.
9. Complete the privacy-impact assessment and revise audit logging.
10. Correct the ISO edition, Likert scale, sampling, and instrument-validation discussion.
11. Conduct the objective manual-versus-system and technical tests.
12. Verify and correct every reference.
13. Rewrite Chapter 4 based on the completed evidence.
14. Rewrite Chapter 5 so every conclusion is directly supported by Chapter 4.
15. Conduct a controlled and formally authorized pilot before recommending operational adoption.
Suggested Revised Title
If the risk model remains unvalidated:
A Web-Based Women and Family Protection and Support Management System for Barangay 183, Villamor
Airbase, Pasay City
If it is independently validated:
A Web-Based Women and Family Protection and Support Management System with an Expert-Validated
Vulnerability Risk-Assessment Tool for Barangay 183, Villamor Airbase, Pasay City
Overall Adviser's Comment
I find the study socially relevant and potentially useful to Barangay 183. However, the system processes
highly sensitive VAWC, child, health, and family information and therefore requires a much higher level of
legal, ethical, security, and technical validation. The current results mainly establish positive perceptions from
a small group of users and IT experts. They do not yet establish the accuracy of the vulnerability risk
assessment, correctness of the nutrition computation, safety of the chatbot, effectiveness of the legal
workflow, objective improvement over the manual process, or full privacy and security compliance. I require
you to complete the matched corrections stated under every chapter and topic, present the missing objective
evidence, verify all references, and revise Chapter 5 based only on findings properly established in Chapter 4.
Until these requirements are satisfied, I do not recommend the system for full operational adoption.