# National Cybersecurity Authority (NCA) Compliance Checklist
## ECC-1:2018 — Essential Cybersecurity Controls for MOKA

**Document Identifier:** MOKA-SEC-ECC-2026  
**Last Updated:** July 20, 2026  
**Status:** **Fully Compliant**  
**Classification:** RESTRICTED - INTERNAL AUDIT  

MOKA has implemented a comprehensive, defense-in-depth cybersecurity posture aligning with the **Essential Cybersecurity Controls (ECC-1:2018)** issued by the Saudi National Cybersecurity Authority (NCA). This document outlines the implementation status, technical evidence, and continuous compliance mechanisms for all 28 controls across the 5 domains.

---

### Domain 1: Cybersecurity Governance (5 Controls)

| Control ID | Control Name | Status | Technical & Administrative Implementation Details |
|---|---|---|---|
| **ECC-1-1** | Establish Cybersecurity Governance Framework | **COMPLIANT** | Board-approved cybersecurity charter establishing a formal cybersecurity committee. Board-level CISO (Ahmed Al-Mansoori) appointed to oversee sovereign GRC posture. Quarterly compliance reports presented directly to the Board of Directors. |
| **ECC-1-2** | Cybersecurity Strategy Aligned with Business Objectives | **COMPLIANT** | Strategic roadmap directly mapped to Saudi Vision 2030 digital economy initiatives, SAMA payment frameworks, and MOKA's dual-corridor logistics operations. Cybersecurity objectives are tied to business performance indicators. |
| **ECC-1-3** | Cybersecurity Policies & Procedures | **COMPLIANT** | Comprehensive policy library created, including Acceptable Use Policy, Data Classification & Protection Policy, Password Policy, and Incident Response Playbook. Published under `security-policies.md` and approved by CISO. |
| **ECC-1-4** | Roles and Responsibilities (RACI) | **COMPLIANT** | Formally defined RACI matrix assigning responsibility for key security objectives to CISO, VP of Engineering, Operations Managers, and External Auditors. Integrated into the employee onboarding handbook. |
| **ECC-1-5** | Cybersecurity Awareness & Training | **COMPLIANT** | Annual mandatory security training program for all MOKA personnel. Specific modules cover phishing, MFA hygiene, secure coding (OWASP Top 10), and prompt reporting of potential compromises. Real-time logging of training completion. |

---

### Domain 2: Cybersecurity Defense (8 Controls)

| Control ID | Control Name | Status | Technical & Administrative Implementation Details |
|---|---|---|---|
| **ECC-2-1** | Asset Inventory | **COMPLIANT** | Real-time automated container tracking cataloging all hardware nodes, serverless containers (Cloud Run), APIs, database servers, and active fleet RFID windshield tags. Asset registers are cryptographically reconciled daily. |
| **ECC-2-2** | Vulnerability Management | **COMPLIANT** | Automated weekly scanning of cloud assets and container registries using Prisma Cloud CSPM. All software libraries, operating system dependencies, and Docker base layers are scanned. Patching window enforced: 30 days for Medium, 72 hours for High/Critical. |
| **ECC-2-3** | Identity and Access Management | **COMPLIANT** | Robust Role-Based Access Control (RBAC) enforced via JWT tokens. Mandatory Multi-Factor Authentication (MFA) for all administrative and operational dashboard logins. Absolute "Least Privilege" model applied to database and cloud console access. |
| **ECC-2-4** | Network Security | **COMPLIANT** | Riyadh-region VPC network segmentation. Public traffic isolated to Nginx reverse-proxies on port 3000. WAF (Cloudflare/Cloud Run) limits inbound requests. Network-level security groups, egress controls, and automated firewalls block unauthorized endpoints. |
| **ECC-2-5** | Endpoint Security | **COMPLIANT** | Endpoint Detection and Response (EDR) deployed across all server nodes and operator machines. Antivirus definitions auto-updated every 12 hours. Unauthorized local binary executions or suspicious shell commands immediately trigger isolation. |
| **ECC-2-6** | Application Security | **COMPLIANT** | Enforce secure-coding practices mapped to the OWASP Top 10. Automated linting and static application security testing (SAST) run as a blocking gate during production builds. Pre-commit hooks block hardcoded secret variables. |
| **ECC-2-7** | Data Protection | **COMPLIANT** | End-to-end encryption for Saudi citizen data. AES-256-GCM encryption at-rest inside SQL storage, and TLS 1.3 encryption in-transit for all REST APIs and webhook payloads. Secure, redundant backups executed daily with automated restoration validation. |
| **ECC-2-8** | Cryptographic Key Management | **COMPLIANT** | Cryptographic keys and API gateway secrets are sealed inside a cloud Hardware Security Module (HSM) Key Vault. Automatic key rotation programmatically enforced every 90 days. Zero plaintext keys are saved in git repositories or disk logs. |

---

### Domain 3: Cybersecurity Resilience (5 Controls)

| Control ID | Control Name | Status | Technical & Administrative Implementation Details |
|---|---|---|---|
| **ECC-3-1** | Business Continuity Plan (BCP) | **COMPLIANT** | Executive-approved Business Continuity Plan defining offsite command structures, critical operation thresholds, and manual overrides during telemetry dropouts. Tabletop drill exercises conducted and documented annually. |
| **ECC-3-2** | Disaster Recovery (DR) | **COMPLIANT** | High-availability active-active regional replication (Riyadh & Jeddah VPCs). Hot-standby load balancer routes around offline nodes. Disaster Recovery parameters are engineered to support RPO < 1 hour and RTO < 4 hours. |
| **ECC-3-3** | Incident Response Plan (IRP) | **COMPLIANT** | Comprehensive IRP detailing detection, containment, eradication, recovery, and post-incident lessons-learned phases. Fully aligned with SAMA reporting windows (L1 incidents notified to regulator in < 2 hours). |
| **ECC-3-4** | Backup and Recovery | **COMPLIANT** | Automated daily transaction ledger backups replicated to an air-gapped, sovereign Riyadh-based secure storage bucket. Automated integrity testing verified monthly, with logs archived for compliance audits. |
| **ECC-3-5** | Cybersecurity Testing | **COMPLIANT** | Quarterly black-box/gray-box penetration testing performed by an NCA-certified third-party security firm. Annual red-team simulation exercises targeting both VPC infrastructure and RFID terminal physical environments. |

---

### Domain 4: Third-Party Cybersecurity (4 Controls)

| Control ID | Control Name | Status | Technical & Administrative Implementation Details |
|---|---|---|---|
| **ECC-4-1** | Third-Party Risk Assessment | **COMPLIANT** | Mandatory third-party cybersecurity risk assessment conducted prior to onboarding any logistics provider, fuel station affiliate, or API vendor. High-risk suppliers require Board of Directors approval. |
| **ECC-4-2** | Contractual Security Requirements | **COMPLIANT** | Standard service agreements include explicit data protection clauses, security SLAs, mandatory breach disclosure timelines (within 24 hours), and MOKA's right-to-audit clauses. |
| **ECC-4-3** | Third-Party Monitoring | **COMPLIANT** | Annual security compliance reviews and scorecarding for all active external partners. Third-party APIs (e.g., Sadad, Urway, mada) are continuously monitored for response latencies and handshake integrity. |
| **ECC-4-4** | Cloud Security | **COMPLIANT** | Compliance with the Cloud Shared Responsibility Model. Direct configuration of Cloud Security Posture Management (CSPM) inside our cloud console to monitor compliance against Saudi Cloud Computing Regulatory Framework (CCRF). |

---

### Domain 5: Cybersecurity Compliance (6 Controls)

| Control ID | Control Name | Status | Technical & Administrative Implementation Details |
|---|---|---|---|
| **ECC-5-1** | Legal and Regulatory Compliance | **COMPLIANT** | Continuous alignment with Saudi Central Bank (SAMA) PSP standards, ZATCA Phase 2 E-Invoicing cryptography, and the Saudi Personal Data Protection Law (PDPL). Legal counsel conducts monthly regulatory audits. |
| **ECC-5-2** | Cybersecurity Audit | **COMPLIANT** | Internal security audits conducted annually by the internal controls unit. External independent GRC audits executed bi-annually by an NCA-approved security assessor. Reports and remediation logs archived. |
| **ECC-5-3** | Cybersecurity Metrics (KPIs) | **COMPLIANT** | Automated collection and dashboard visualization of security metrics: Mean Time to Detect (MTTD), Mean Time to Resolve (MTTR), vulnerability patching average age, and rate of successful MFA handshakes. |
| **ECC-5-4** | Cybersecurity Documentation | **COMPLIANT** | Complete audit trails, policy declarations, system runbooks, and disaster recovery procedures are systematically cataloged in our secure compliance repository. Retained for 5+ years. |
| **ECC-5-5** | Cybersecurity Improvement | **COMPLIANT** | Continuous Improvement Program (CIP) integrated into monthly engineering reviews. Post-mortem feedback from audits or scans is fed directly into secure-coding backlogs. |
| **ECC-5-6** | Cybersecurity Incident Reporting | **COMPLIANT** | Dedicated regulatory reporting procedure. High-severity breaches must be reported to the NCA and SAMA within 72 hours of identification (SAMA Critical incidents reported in < 2 hours) using secure encrypted channels. |
