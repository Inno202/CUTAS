import { 
  User, StudyDetails, Publication, Challenge, 
  GrowthSuggestion, FundingOpportunity, Award, 
  Workshop, InstitutionalContent, AuditLogItem 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'prof_mthembu',
    email: 'kmthembu@cut.ac.za',
    firstName: 'Khanyisile',
    lastName: 'Mthembu',
    role: 'ADMINISTRATOR',
    title: 'Prof.',
    category: 'CAT_A',
    faculty: 'Faculty of Engineering, Built Environment & Information Technology',
    department: 'Department of Civil & Mechanical Engineering',
    studentNumber: 'EMP-90214',
    phone: '+27 (0)51 507 3911',
    bio: 'Professor of Structural Mechanics and Convenor of the Central University of Technology Academic Society. Leading institutional interventions for postgraduate research capacity across Universities of Technology.',
    cvSummaryText: 'BSc Eng (Natal), MSc (Wits), PhD (UCT). Pr.Eng, FSAAE, NRF B-rated researcher. Over 85 Scopus-indexed journal papers, 12 PhD completions supervised. Editorial Board Member of the African Journal of Science and Technology.',
  },
  {
    id: 'user_cat_a',
    username: 'naledi_dlamini',
    email: 'naledi.dlamini@postgrad.cut.ac.za',
    firstName: 'Naledi',
    lastName: 'Dlamini',
    role: 'SCHOLAR',
    title: 'Dr.',
    category: 'CAT_A',
    faculty: 'Faculty of Health & Environmental Sciences',
    department: 'Department of Life Sciences & Biotechnology',
    studentNumber: '201984210',
    phone: '+27 (0)82 555 0192',
    bio: 'Senior Postdoctoral Fellow researching green nanobiotechnology and endemic botanical extracts for overcoming multi-drug antimicrobial resistance in clinical settings.',
    cvSummaryText: 'PhD in Health Sciences (CUT, 2024), MTech Biomedical Technology (CUT, 2021). Recipient of the South African Medical Research Council Doctoral Fellowship. 6 peer-reviewed journal articles, 2 provisional patents filed with CUT Technology Transfer Office.',
  },
  {
    id: 'user_cat_b',
    username: 'sipho_molefe',
    email: 'smolefe@postgrad.cut.ac.za',
    firstName: 'Sipho',
    lastName: 'Molefe',
    role: 'SCHOLAR',
    title: 'Mr.',
    category: 'CAT_B',
    faculty: 'Faculty of Engineering, Built Environment & Information Technology',
    department: 'Department of Electrical & Computer Systems Engineering',
    studentNumber: '202119044',
    phone: '+27 (0)73 441 9023',
    bio: 'Master of Engineering candidate developing reinforcement learning controls for islanded rural agricultural microgrids in the Free State province.',
    cvSummaryText: 'BEng Tech Hons (Electrical Engineering, CUT, 2022). Certified Energy Manager Associate. Lead author of 1 IEEE AfricaCon proceeding. Student Chair of IEEE CUT Student Branch.',
  },
  {
    id: 'user_cat_c',
    username: 'thabo_motloung',
    email: 'tmotloung@postgrad.cut.ac.za',
    firstName: 'Thabo',
    lastName: 'Motloung',
    role: 'SCHOLAR',
    title: 'Mr.',
    category: 'CAT_C',
    faculty: 'Faculty of Management Sciences',
    department: 'Department of Business Support Studies & Entrepreneurship',
    studentNumber: '202400392',
    phone: '+27 (0)71 992 4100',
    bio: 'Honours researcher investigating digital financial payment adoption barriers and transaction fee frictions in Mangaung township informal economies.',
    cvSummaryText: 'Advanced Diploma in Financial Management (CUT, 2023, cum laude). Dean’s Merit List Awardee. CUTAS Junior Scholar Peer Tutor.',
  }
];

export const INITIAL_STUDIES: Record<string, StudyDetails> = {
  user_cat_a: {
    userId: 'user_cat_a',
    programme: 'Doctor of Health Sciences in Biomedical Technology',
    university: 'Central University of Technology, Free State',
    yearOfStarting: 2021,
    anticipatedYearOfCompletion: 2024,
    supervisor: 'Prof. S. R. Ramaphosa',
    coSupervisor: 'Dr. M. Van der Merwe',
    funding: 'SAMRC Precision Medicine Grant & NRF SARChI Chair',
    researchTopic: 'Green Synthesis of Silver Nanoparticles from Endemic Highveld Flora against Multi-Drug Resistant Clinical Pathogens',
    researchAbstract: 'This doctoral investigation evaluates the biogenic green synthesis of noble metal nanoparticles utilizing aqueous extracts of endemic South African medicinal plants. Phytochemical reducing agents were characterized through HPLC and GC-MS. Synthesized nanoparticles underwent physical characterization using XRD, FTIR, HR-TEM, and dynamic light scattering. In vitro antimicrobial susceptibility assays demonstrated potent minimum inhibitory concentrations against ESKAPE pathogens, while mammalian cytotoxicity screens confirmed high therapeutic selectivity indices.',
  },
  user_cat_b: {
    userId: 'user_cat_b',
    programme: 'Master of Engineering in Electrical Engineering',
    university: 'Central University of Technology, Free State',
    yearOfStarting: 2023,
    anticipatedYearOfCompletion: 2025,
    supervisor: 'Prof. K. Mthembu',
    coSupervisor: 'Eng. J. K. Botha',
    funding: 'CUT Innovation & Technology Transfer Bursary (ITTB)',
    researchTopic: 'Adaptive Reinforcement Learning Inverter Controllers for High-Penetration Agro-Solar Microgrids',
    researchAbstract: 'Investigating decentralized reactive power dispatch and frequency stabilization in hybrid photovoltaic-battery microgrids experiencing severe transient step-loads from agricultural submersible pumps. A Deep Q-Network agent is trained to autonomously orchestrate droop parameters, mitigating voltage sags while preserving battery cycle life.',
  },
  user_cat_c: {
    userId: 'user_cat_c',
    programme: 'Bachelor of Management Sciences Honours in Financial Management',
    university: 'Central University of Technology, Free State',
    yearOfStarting: 2025,
    anticipatedYearOfCompletion: 2025,
    supervisor: 'Dr. P. N. Sithole',
    funding: 'NSFAS Postgraduate Transition Bursary',
    researchTopic: 'Micro-merchant Mobile Payment Penetration and Cash Displacement in Mangaung Informal Settlements',
    researchAbstract: 'Employing the Unified Theory of Acceptance and Use of Technology (UTAUT2) to empirically evaluate behavioral intent among 180 informal spaza shop traders in the Mangaung Metropolitan municipality. Examines network reliability, customer trust, and transaction cost economics.',
  }
};

export const INITIAL_PUBLICATIONS: Publication[] = [
  {
    id: 'pub_1',
    userId: 'user_cat_a',
    publicationType: 'ARTICLE',
    title: 'Green Synthesis and Antimicrobial Evaluation of Endemic Botanical Silver Nanoparticles',
    authors: 'Dlamini, N., Ramaphosa, S. R., & Mthembu, K.',
    outletName: 'Journal of Applied Nanobiotechnology',
    year: 2025,
    volumeIssuePages: 'Vol. 18, pp. 204-219',
    doiOrUrl: 'https://doi.org/10.1016/j.nanobio.2025.04.012',
    status: 'PUBLISHED',
  },
  {
    id: 'pub_2',
    userId: 'user_cat_a',
    publicationType: 'BOOK_CHAPTER',
    title: 'Nanotechnology Interventions for Primary Healthcare in Sub-Saharan Africa',
    authors: 'Dlamini, N. & Ramaphosa, S. R.',
    outletName: 'Innovations in African Biotechnology, Springer Nature',
    year: 2024,
    volumeIssuePages: 'Chapter 7, pp. 145-178',
    doiOrUrl: 'https://doi.org/10.1007/978-3-030-99214-5_7',
    status: 'PUBLISHED',
  },
  {
    id: 'pub_3',
    userId: 'user_cat_b',
    publicationType: 'CONFERENCE',
    title: 'Dynamic Reactive Power Dispatch in High-Penetration Agro-Solar Microgrids',
    authors: 'Molefe, S. & Mthembu, K.',
    outletName: 'Proceedings of the 2024 IEEE PES/IAS PowerAfrica Conference (Johannesburg)',
    year: 2024,
    volumeIssuePages: 'pp. 88-94',
    doiOrUrl: 'https://doi.org/10.1109/PowerAfrica60356.2024.10624890',
    status: 'PUBLISHED',
  },
  {
    id: 'pub_4',
    userId: 'user_cat_b',
    publicationType: 'ARTICLE',
    title: 'Reinforcement Learning State Estimation for Isolated Distribution Feeders',
    authors: 'Molefe, S., Botha, J. K., & Mthembu, K.',
    outletName: 'Electric Power Systems Research',
    year: 2025,
    status: 'UNDER_REVIEW',
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  {
    id: 'ch_1',
    userId: 'user_cat_a',
    scholarName: 'Dr. Naledi Dlamini',
    scholarCategory: 'CAT_A',
    category: 'LAB_ACCESS',
    title: 'High-Resolution Transmission Electron Microscopy (HR-TEM) Beamtime Availability',
    description: 'Experiencing severe 6-week turnaround delays in booking specialized electron beam instruments at regional instrumentation centres, impacting nanoparticle lattice spacing validation.',
    status: 'RESOLVED',
    resolutionNotes: 'CUTAS Executive Committee negotiated dedicated bi-weekly Friday beamtime reservation slots through the reciprocal inter-institutional agreement with the UFS Centre for Microscopy.',
    resolvedBy: 'Prof. Khanyisile Mthembu',
    resolvedAt: '2026-03-12 14:30',
    createdAt: '2026-02-18',
  },
  {
    id: 'ch_2',
    userId: 'user_cat_b',
    scholarName: 'Sipho Molefe',
    scholarCategory: 'CAT_B',
    category: 'TURNITIN',
    title: 'Turnitin Similarity False Positives on Standard Circuit Differential Equations',
    description: 'Turnitin similarity index returned 23% primarily due to verbatim standard IEEE state-space mathematical formulas in Chapter 3. Seeking official advisory waiver letter for Higher Degrees committee.',
    status: 'IN_REVIEW',
    resolutionNotes: 'Under review by CUTAS Postgraduate Advisory Desk. Formulated mathematical exclusion filter guidelines aligned with CUT Higher Degrees Committee policy.',
    resolvedBy: 'Prof. Khanyisile Mthembu',
    createdAt: '2026-04-02',
  },
  {
    id: 'ch_3',
    userId: 'user_cat_c',
    scholarName: 'Thabo Motloung',
    scholarCategory: 'CAT_C',
    category: 'WRITING',
    title: 'Empirical Literature Review Synthesis & Theoretical Framework Structuring',
    description: 'Transitioning from undergraduate technical summaries to critical peer-reviewed literature synthesis. Need structured guidance on constructing a conceptual matrix for UTAUT2 technology adoption variables.',
    status: 'OPEN',
    createdAt: '2026-04-10',
  },
  {
    id: 'ch_4',
    userId: 'user_cat_b',
    scholarName: 'Sipho Molefe',
    scholarCategory: 'CAT_B',
    category: 'FUNDING',
    title: 'Hardware Prototype Consumables Subsidy for Inverter Bench Testing',
    description: 'Shortfall in project funds for procurement of specialized silicon carbide (SiC) MOSFET gate-driver daughterboards and hall-effect current transducers required for laboratory bench validation.',
    status: 'OPEN',
    createdAt: '2026-04-14',
  }
];

export const INITIAL_GROWTH: GrowthSuggestion[] = [
  {
    id: 'gr_1',
    userId: 'user_cat_a',
    area: 'GRANTS',
    growthObjective: 'Secure NRF Y-Rated Emerging Researcher Grant Application',
    milestoneActions: '1. Finalize literature synthesis on highveld biosafety.\n2. Complete CUT grant drafting bootcamp.\n3. Submit full application prospectus to CUTAS internal peer-review panel by June.',
    targetQuarter: 'Q3 2026',
    mentorNotes: 'Outstanding research momentum. Ensure international co-authorship letters are attached.',
    isCompleted: false,
  },
  {
    id: 'gr_2',
    userId: 'user_cat_b',
    area: 'ANALYTICS',
    growthObjective: 'Master OpenDSS Python API for Distribution Network Simulation',
    milestoneActions: '1. Complete IEEE OpenDSS tutorial series.\n2. Interface OpenDSS with PyTorch RL agent for real-time loss optimization.',
    targetQuarter: 'Q2 2026',
    isCompleted: true,
  },
  {
    id: 'gr_3',
    userId: 'user_cat_c',
    area: 'WRITING',
    growthObjective: 'Produce First DHET-Accredited Conference Abstract',
    milestoneActions: '1. Refine questionnaire pilot survey data.\n2. Submit 500-word abstract to 2026 Southern African Institute for Management Scientists (SAIMS).',
    targetQuarter: 'Q4 2026',
    isCompleted: false,
  }
];

export const INITIAL_FUNDING: FundingOpportunity[] = [
  {
    id: 'fund_1',
    title: 'NRF Postgraduate Free-Standing & Innovation Master’s and Doctoral Scholarships',
    funder: 'National Research Foundation (NRF)',
    amountRange: 'R140,000 - R180,000 p.a. + Research Operating Allowance',
    deadline: '2026-07-31',
    eligibility: 'South African citizens and permanent residents registered full-time for Master’s or Doctoral degrees at CUT in STEM, Health, and Social Sciences with minimum 65% aggregate in preceding degree.',
    applicationProcess: 'Step 1: Download institutional endorsement checklist from CUT Research Development Office.\nStep 2: Complete the electronic application dossier on the NRF Connect portal.\nStep 3: Secure supervisor reference report and verified academic transcripts.',
    portalUrl: 'https://nrfconnect.nrf.ac.za',
    featuredOnLanding: true,
    isActive: true,
  },
  {
    id: 'fund_2',
    title: 'CUT Postgraduate Research & Innovation Fund (PRIF)',
    funder: 'Central University of Technology Research Office',
    amountRange: 'Up to R45,000 per scholar for laboratory consumables and field surveys',
    deadline: '2026-08-15',
    eligibility: 'Bona fide registered CUT Honours, Master’s and Doctoral scholars in good academic standing with approved research proposals.',
    applicationProcess: 'Submit itemized project budget, ethical clearance certificate number, and signed supervisor recommendation through the CUTAS portal or Research Development Office.',
    portalUrl: 'https://www.cut.ac.za/research-development',
    featuredOnLanding: true,
    isActive: true,
  },
  {
    id: 'fund_3',
    title: 'DAAD In-Country / In-Region Postgraduate Mobility Grant',
    funder: 'German Academic Exchange Service (DAAD)',
    amountRange: 'EUR 6,500 travel allowance + monthly living stipend',
    deadline: '2026-09-30',
    eligibility: 'Postgraduate scholars carrying out joint experimental fieldwork or laboratory investigations with Southern African partner institutions.',
    applicationProcess: 'Prepare formal research exchange prospectus, host institutional invitation letter, and detailed itinerary.',
    portalUrl: 'https://www.daad.de',
    featuredOnLanding: true,
    isActive: true,
  }
];

export const INITIAL_AWARDS: Award[] = [
  {
    id: 'aw_1',
    userId: 'user_cat_a',
    title: 'CUT Vice-Chancellor Postdoctoral Excellence Award',
    awardingBody: 'Central University of Technology Research Directorate',
    year: 2025,
    description: 'Conferred for highest cumulative citation impact factor and successful technology transfer patent filing in life sciences.',
  },
  {
    id: 'aw_2',
    userId: 'user_cat_b',
    title: 'Best Postgraduate Student Paper Award - PowerAfrica 2024',
    awardingBody: 'IEEE Power & Energy Society / Industry Applications Society',
    year: 2024,
    description: 'Awarded for technical paper on dynamic inverter reactive power dispatch for rural agricultural microgrids.',
  }
];

export const INITIAL_WORKSHOPS: Workshop[] = [
  {
    id: 'ws_1',
    title: 'Mastering Scopus & Web of Science Article Structuring for UoT Scholars',
    facilitator: 'Prof. Khanyisile Mthembu & Senior Research Fellows',
    eventDate: '2026-11-04',
    eventTime: '10:00',
    venueOrLink: 'Library Seminar Room 204, Bloemfontein Campus & MS Teams Hybrid',
    description: 'A comprehensive, hands-on masterclass guiding scholars through the IMRAD format, addressing reviewer critiques, identifying DHET-accredited journals, and detecting predatory publishing traps.',
    category: 'Academic Writing & Publishing',
  },
  {
    id: 'ws_2',
    title: 'Navigating the CUT Health & Environmental Ethics Board Clearance Pipeline',
    facilitator: 'Dr. Naledi Dlamini (Senior Postdoctoral Fellow)',
    eventDate: '2026-11-18',
    eventTime: '14:00',
    venueOrLink: 'Welkom Campus Auditorium A & Virtual Stream',
    description: 'Demystifying National Health Research Ethics Council (NHREC) guidelines, informed consent protocols, participant confidentiality under POPIA, and common reasons for ethics application deferral.',
    category: 'Research Governance & Ethics',
  },
  {
    id: 'ws_3',
    title: 'Quantitative Data Analysis Bootcamp: Jamovi & R for Thesis Verification',
    facilitator: 'Dr. P. N. Sithole (Statistical Methods Consultant)',
    eventDate: '2026-12-02',
    eventTime: '09:30',
    venueOrLink: 'Civil Engineering Computer Lab B, Bloemfontein Campus',
    description: 'Hands-on practical session covering hypothesis testing, two-way ANOVA, multiple regression, normality checks, and generating publication-grade vector charts.',
    category: 'Methodology & Data Analysis',
  }
];

export const INITIAL_CONTENT: Record<string, InstitutionalContent> = {
  about_us: {
    key: 'about_us',
    title: 'About CUT Academic Society (CUTAS)',
    headline: 'Revitalizing Rigorous Intellectualism across Universities of Technology',
    body: `The Central University of Technology Academic Society (CUTAS) is an institutional postgraduate collective founded across the Bloemfontein and Welkom campuses of the Central University of Technology, Free State.

Recognizing that Universities of Technology (UoTs) occupy a distinct, mission-critical position within South African higher education—bridging theoretical inquiry with applied industrial innovation—CUTAS was created under our foundational theme:

"Bringing back intellectualism within the corridors of Higher Education: Creating a new generation of thinkers in UoTs."

Our Core Strategic Pillars:
1. Intellectual Discourse & Defense Culture: Cultivating a community where scholars passionately critique, defend, and refine high-level research.
2. Interdisciplinary Cross-Pollination: Breaking down historic silos between Engineering & Built Environment, Health & Environmental Sciences, Management Sciences, and Humanities.
3. Publication Competence: Accelerating DHET-accredited journal outputs, peer-reviewed book chapters, and indexed conference proceedings.
4. Problem Resolution Advocacy: Directly addressing systemic bottlenecks—from laboratory instrumentation access and Turnitin similarity calibration to bursary disbursements and ethical clearance—working hand-in-hand with university executive leadership.`,
    updatedAt: '2026-10-14 09:15',
  },
  project_leaders: {
    key: 'project_leaders',
    title: 'Project Leaders and Society Administrators',
    headline: 'Academic Stewards, Research Directors, and Student Advisory Executives',
    body: `The CUT Academic Society is governed by an executive steering committee comprising established professors, research directors, and student scholar delegates across CUT faculties.

Steering Committee Portfolios:
• Project Leader & Convenor: Prof. Khanyisile Mthembu (Faculty of Engineering, Built Environment & IT)
• Deputy Convenor & Health Sciences Lead: Dr. Naledi Dlamini (Senior Postdoctoral Fellow)
• Research Ethics & Compliance Advisor: Dr. P. N. Sithole (Faculty of Management Sciences)
• Postgraduate Student Society Liaison: Sipho Molefe (Master’s Scholar Delegate)

Administrators oversee challenge review pipelines, workshop scheduling, institutional reports to Senate, and funding dissemination.`,
    updatedAt: '2026-10-15 11:20',
  }
};

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'log_1',
    action: 'LOGIN',
    actorUsername: 'prof_mthembu',
    actorRole: 'Administrator',
    details: 'Administrator session initiated via institutional credentials',
    ipAddress: '196.21.18.42',
    timestamp: '2026-10-17 19:40',
  },
  {
    id: 'log_2',
    action: 'CHALLENGE_REVIEW',
    actorUsername: 'prof_mthembu',
    actorRole: 'Administrator',
    targetObject: 'Challenge #ch_1 (HR-TEM Access)',
    details: 'Status transitioned to RESOLVED. Added bilateral UFS instrumentation agreement notes.',
    ipAddress: '196.21.18.42',
    timestamp: '2026-10-17 18:25',
  },
  {
    id: 'log_3',
    action: 'CONTENT_EDIT',
    actorUsername: 'prof_mthembu',
    actorRole: 'Administrator',
    targetObject: 'about_us',
    details: 'Updated Society Strategic Pillars in About Us page.',
    ipAddress: '196.21.18.42',
    timestamp: '2026-10-16 14:10',
  },
  {
    id: 'log_4',
    action: 'LOGIN',
    actorUsername: 'naledi_dlamini',
    actorRole: 'Scholar (Category A)',
    details: 'Successful login. Updated Study Abstract.',
    ipAddress: '196.21.18.109',
    timestamp: '2026-10-16 11:05',
  }
];
