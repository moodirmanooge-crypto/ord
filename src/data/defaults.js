import { DEFAULT_MENU } from './defaultMenu'

// Xogta asalka ah ee website-ka — waxaa laga qaaday RDA Organizational Profile (2026).
// Admin panel-ka ayaa wax walba ka beddeli kara; xogtan waa "fallback" marka Firestore madhan yahay.

export const DEFAULT_SITE = {
  orgName: 'Rural Development Aid',
  country: 'Somalia',
  tagline: 'Empowering Communities, Transforming Futures',
  logo: '',
  heroTitle: 'Empowering communities, transforming futures',
  heroText:
    'Rural Development Aid is an independent, Somali-led, multisectoral non-profit delivering integrated humanitarian and development programming across the Federal Republic of Somalia.',

  phones: '+252 617125933\n+252 615556306\n+252 615931926',
  email: 'info@rda-somalia.org',
  website: 'www.rda-somalia.org',
  address: 'Head Office: Mogadishu, Banadir Region, Somalia',
  executiveDirector: 'Ali Isack Ali',
  facebook: '',
  twitter: '',
  linkedin: '',
  instagram: '',
  youtube: '',

  summary:
    'Founded by a team of experienced, university-trained Somali public health, education, governance, environmental and humanitarian professionals, RDA was established on the conviction that durable change in Somalia must be Somali-led, in genuine partnership with government, UN agencies, international and national organizations, donors and communities.\n\nRDA’s programming is built around four thematic pillars — Human Development, Social Protection & Community Resilience, Environment & Natural Resources, and Governance & Policy Systems — anchored in the Humanitarian–Development–Peace (HDP) Nexus, so that life-saving assistance is deliberately linked to sustainable development outcomes rather than delivered as a parallel track.',

  glance: [
    'Legal status | Independent, Somali-led national NGO; non-profit and non-partisan; registered in the Federal Republic of Somalia',
    'Headquarters | Mogadishu, Banadir Region, Somalia',
    'Operational reach | Puntland, Jubaland, South West State, Hirshabelle, Galmudug and Banadir',
    'Programming approach | Humanitarian–Development–Peace (HDP) Nexus',
    'Governance | Board of Directors, Executive Director and eight technical Directorates',
  ].join('\n'),

  aboutImage: '',
  whoWeAre:
    'Rural Development Aid (RDA) is an independent, Somali-led, non-profit, non-partisan and multidisciplinary humanitarian and development organization committed to advancing sustainable development, resilience-building and the protection of vulnerable populations across Somalia. RDA was founded by a group of experienced, highly educated Somali professionals — practitioners with advanced training in public health, nutrition, education, governance, environmental science, protection and humanitarian coordination — united by the conviction that Somalia’s recovery must be driven by Somali expertise and Somali institutions, working hand-in-hand with the international community.\n\nSince its establishment, RDA has grown into a nationwide organization implementing integrated programs that improve human well-being, strengthen community resilience, promote environmental sustainability and enhance governance systems, applying a Humanitarian–Development–Peace Nexus approach that links emergency response to long-term development outcomes. The organization invests deliberately in local capacity so that the systems it strengthens continue to function long after any single project ends.',
  foundingRationale:
    'RDA was established to close a persistent gap in Somalia’s aid architecture: the need for a technically strong, professionally governed national organization capable of operating at the same standard of institutional rigor as international actors, while retaining the contextual knowledge, community trust and long-term presence that only a national organization can offer. The founding team built RDA around three pillars of credibility donors look for in a national partner: technical depth, institutional systems, and contextual legitimacy.',
  legalStatus:
    'RDA is registered as a national non-governmental organization in the Federal Republic of Somalia, governed by a Board of Directors and managed day-to-day by an Executive Director and senior management team, with the statutory registrations and operating agreements required to work lawfully across Somalia’s Federal Member States and the Banadir Regional Administration.',
  geographicIntro:
    'From its Mogadishu head office, RDA maintains regional and field presence across five Federal Member States, combining the responsiveness of a locally rooted organization with the coordination discipline required for multi-region, multi-donor programming.',

  vision:
    'To become a leading national organization in humanitarian response and sustainable development, recognized for strengthening resilient communities, promoting inclusive growth, and improving the well-being of vulnerable populations across Somalia.',
  mission:
    'To deliver integrated humanitarian and development interventions that improve access to essential services, protect vulnerable populations, strengthen community resilience, and support inclusive governance systems through evidence-based and community-driven approaches.',
  values: [
    'Respect: Recognizing the dignity, agency and rights of every community RDA serves.',
    'Professionalism: Rigorous technical, managerial and ethical standards in every program.',
    'Integrity: Honest, transparent management of donor resources and institutional relationships.',
    'Accountability: Responsibility for results and resource stewardship to donors, government and communities.',
    'Equity and Inclusion: Reaching the most marginalized women, children, persons with disabilities, minority clans and displacement-affected communities without discrimination.',
  ].join('\n'),

  strategicGoal:
    'To position RDA as a leading Somali-led implementing partner capable of delivering multisectoral humanitarian and development programming at national scale, in full compliance with international donor standards, while building the resilience, institutions and human capital that progressively reduce Somalia’s dependence on external humanitarian assistance.',
  objectives: [
    'Position RDA as a leading national organization in humanitarian and development programming.',
    'Improve access to essential services including health, nutrition and education.',
    'Strengthen community resilience and social protection systems.',
    'Promote environmental sustainability and climate adaptation.',
    'Deliver emergency humanitarian assistance and sustainable livelihoods programming.',
    'Strengthen child protection, GBV prevention, and WASH access.',
    'Enhance governance systems, policy engagement and institutional capacity.',
  ].join('\n'),
  theoryIf:
    'vulnerable communities receive timely humanitarian assistance deliberately linked to investments in health, education, livelihoods, protection, WASH, climate adaptation and local governance,',
  theoryAndIf:
    'this is delivered through community-driven, evidence-based, gender-responsive approaches in genuine partnership with government,',
  theoryThen:
    'affected populations will experience reduced vulnerability, strengthened resilience and greater agency over their own development —',
  theoryBecause:
    'sustainable change requires meeting immediate needs while actively building the local systems on which long-term recovery depends.',
  alignment:
    'RDA’s four pillars map directly onto the Sustainable Development Goals (notably SDGs 1–6, 13 and 16), Somalia’s national development priorities, the Somalia Humanitarian Response Plan and recurrent drought/flood response frameworks, and the Grand Bargain’s localization commitments — making RDA a natural vehicle for donors seeking to meet locally-led response objectives.',

  coreServices: [
    'Humanitarian Response: Emergency relief, rapid needs assessments, protection services in emergencies.',
    'Development Programs: Health/education systems strengthening, livelihoods, climate resilience.',
    'Social Protection Services: Child protection, GBV prevention and response, community-based protection systems.',
    'Capacity Building: Technical training, institutional strengthening, community empowerment.',
  ].join('\n'),
  crossCutting: [
    'Gender Equality & Social Inclusion (GESI): Equitable participation, benefit and protection for women, men, girls, boys and persons with disabilities.',
    'Accountability to Affected Populations (AAP): Community consultation and confidential feedback/complaints mechanisms in every program.',
    'Protection Mainstreaming & Do No Harm: Systematic identification and mitigation of protection and conflict-sensitivity risks.',
    'Environmental Sustainability & Localization: Climate-smart design across all sectors, local procurement and transfer of skills and leadership to national actors.',
  ].join('\n'),
  methodology:
    'RDA applies a disciplined program cycle — assessment, evidence-based design, community-driven implementation, and continuous MEAL and adaptive learning — combined with the Humanitarian–Development Nexus approach, gender and inclusion mainstreaming, and localization/partnership strengthening to ensure effective, sustainable delivery through field-based teams and strong community engagement.',
  meal:
    'A dedicated Directorate of MEAL & Research oversees performance tracking against output, outcome and impact indicators, using routine monitoring, periodic surveys and rigorous baseline, mid-term and end-line evaluations aligned with donor and international evaluation standards. Structured data quality assurance, verification, spot-checks and triangulation ensure information used for decision making and donor reporting is accurate and disaggregated by sex, age and disability.\n\nCommunity feedback and complaints mechanisms — hotlines, suggestion boxes, community committees — allow beneficiaries to raise concerns confidentially, feeding into after-action reviews and adaptive program redesign.',
  climate:
    'Recognizing that recurrent droughts, floods and environmental degradation are among the principal drivers of humanitarian need in Somalia, RDA integrates climate adaptation into its programming by supporting community preparedness for environmental shocks, promoting sustainable natural resource and rangeland management, strengthening climate-resilient livelihoods, and enhancing disaster risk reduction through early warning systems and contingency planning.',
  policy:
    'RDA promotes policy engagement and knowledge sharing through research, stakeholder dialogue and dissemination of evidence-based findings, convening workshops, forums and community dialogues with government institutions, development partners and civil society. The organization produces technical reports, policy briefs and program documentation that support planning, implementation and sector-wide learning.',

  partnerships:
    'RDA works through multi-stakeholder partnerships with federal and state government institutions, United Nations agencies, international and national NGOs, institutional and private donors, and community-based organizations — and actively participates in sectoral cluster mechanisms (Health, Nutrition, WASH, Education, Protection, Food Security & Livelihoods) and government-led coordination forums, ensuring complementary, non-duplicative programming. A structured resource mobilization strategy diversifies RDA’s funding base across bilateral, multilateral, pooled-fund and private sources to support predictable, multi-year programming.',
  governanceText:
    'The Board of Directors provides non-executive strategic oversight — approving strategy and budgets, appointing and overseeing the Executive Director, and reviewing performance and audit findings — while day-to-day management sits with the Executive Director and senior team. Management comprises the Executive Director, an Internal Audit Unit, a Legal & Compliance Unit, a Safety, Security & Risk Management Unit, a Communications Unit, and eight technical Directorates (Strategic & Planning; Human Development; Social Protection & Community Resilience; Environment & Climate; Governance & Policy; MEAL & Research; Partnerships & Resource Mobilization; Finance, Administration & Compliance) delivering through Regional Offices and field/project sites.',
  orgChartImage: '',
  leadershipIntro:
    'RDA’s institutional credibility rests on a senior leadership team of experienced, formally trained Somali professionals, each bringing sector-specific technical expertise and field experience — the Executive Director and eight Directors recruited through transparent, merit-based processes.',
  boardText:
    'In accordance with RDA’s constitution, the Board of Directors serves as the principal governance and oversight body responsible for providing strategic direction, ensuring institutional accountability, and safeguarding the mission, vision and values of the organization. The Board is composed of experienced Somali professionals spanning development, public health, finance, law and governance.\n\nThe Board operates in a non-executive capacity and does not engage in day-to-day management, which is carried out by the Executive Director and the senior management team under the Board’s strategic guidance. Its principal responsibilities include approving RDA’s strategic plan and annual budgets, appointing and overseeing the performance of the Executive Director, reviewing organizational performance and audit findings, and maintaining sub-committees — including Finance & Audit and Governance — to provide focused oversight of key institutional risk areas.',
  staffing:
    'RDA engages skilled and experienced professionals through transparent, merit-based recruitment processes, prioritizing the employment and development of local staff as part of its commitment to localization. Effective performance is sustained through continuous professional development, structured performance management systems, and capacity-building initiatives for both national staff and partner organizations.',
  safeguarding:
    'A Code of Conduct binds all staff, consultants, partners and Board members, underpinned by dedicated organizational policies on Protection from Sexual Exploitation and Abuse (PSEA) — a zero-tolerance policy with mandatory training and confidential reporting channels aligned with IASC minimum operating standards — child safeguarding, anti-fraud and anti-corruption, and anti-terrorism and sanctions compliance, including vendor and partner screening.',

  financeText:
    'The Directorate of Finance, Administration & Compliance maintains a computerized financial management system with documented internal controls, segregation of duties and multi-level expenditure authorization. Transparent, competitive procurement — including vendor pre-qualification and procurement committees for major purchases and structured sub-grant due diligence — ensures donor resources are managed with integrity.',
  auditText:
    'Annual independent external audits and an Internal Audit Unit reporting to the Executive Director and Board provide ongoing assurance and early identification of control weaknesses.',
  riskText:
    'A dedicated Safety, Security & Risk Management Unit conducts regular context and security analysis and maintains operational risk registers and business continuity plans, while a Legal & Compliance Unit ensures operations remain consistent with Somali law and donor regulatory requirements — safeguarding staff, assets and program continuity in a complex operating environment.',
  compliance: [
    'United Nations Agencies | Partner agreement standards, HACT assurance, results-based reporting',
    'Bilateral Donors | Cost principles, procurement integrity, branding and marking, sanctions screening',
    'Multilateral and Pooled Funds | Risk-tiered due diligence, transparent sub-award management, third-party monitoring readiness',
    'Private Foundations and Corporate Partners | Tailored reporting, outcome measurement, flexible grant stewardship',
  ].join('\n'),

  trackRecord: [
    'Emergency response for drought-affected communities: water trucking, cash assistance, emergency health and nutrition services.',
    'WASH infrastructure: boreholes, shallow wells and sanitation facilities in underserved rural and peri-urban areas.',
    'Livelihoods and economic recovery: livestock restocking, cash-for-work and vocational skills training.',
    'Community-based protection systems: child protection networks and GBV referral pathways.',
    'Institutional capacity building for local governance actors through training, mentoring and systems support.',
  ].join('\n'),
  impactSectors: [
    'Health & Nutrition | Primary facility support & outpatient malnutrition treatment | Facility support with community outreach and referral',
    'Education | Learning space rehabilitation & teacher training | Community education committees, accelerated learning',
    'Protection | Case management & GBV response | Survivor-centered, confidential referral pathways',
    'Livelihoods | Cash assistance & livestock/agricultural support | Market-based, seasonally responsive programming',
    'WASH | Water point rehabilitation & hygiene promotion | Community-managed, sustainability-focused',
    'Governance | District administration capacity building | Mentoring, systems strengthening, civic engagement',
  ].join('\n'),
  priorities: [
    'Geographic Expansion: Extending consistent field presence into additional underserved districts across all Federal Member States.',
    'Systems Strengthening: Continued investment in finance, MEAL and safeguarding systems toward direct access to pooled and multilateral funding mechanisms.',
    'Climate Financing Readiness: Building the technical and institutional capacity required to access dedicated climate adaptation and resilience financing.',
    'Localization Leadership: Positioning RDA as a model for locally-led response, including as a mentoring partner to smaller community-based organizations.',
    'Data and Digital Systems: Expanding digital data collection and program monitoring platforms to strengthen evidence generation and real-time decision-making.',
    'Diversified, Multi-Year Funding: Growing a diversified portfolio of multi-year institutional and private partnerships for more predictable programming.',
  ].join('\n'),
  whyPartner: [
    'Strong local presence and contextual expertise: A genuinely Somali-led organization with the trust, access and cultural fluency to operate safely and effectively across complex environments.',
    'Integrated humanitarian and development programming: A four-pillar, multisectoral model that links immediate relief to sustainable development outcomes.',
    'Compliance with international donor standards: Financial, procurement, safeguarding and reporting systems designed to meet UN, bilateral and multilateral donor standards.',
    'Evidence-based, results-oriented delivery: A dedicated MEAL and Research function ensuring programming is grounded in evidence and continuously adapted based on results.',
    'Accountability and transparency: Independent audit, internal audit oversight, and accessible community feedback and complaints mechanisms.',
  ].join('\n'),
  offers: [
    'A technically specialized, multisectoral implementation partner capable of managing complex, multi-region programming, with nationwide operational reach and genuine community trust and access.',
    'Institutional systems that meet donor due-diligence and compliance requirements, alongside a demonstrated commitment to localization, capacity building and sustainable, locally-owned outcomes.',
  ].join('\n'),
  contactIntro:
    'We welcome the opportunity to discuss partnership, funding and collaboration with government counterparts, United Nations agencies, institutional donors, private foundations and civil society partners.',
}

export const DEFAULT_PROGRAMS = [
  {
    id: 'human-development',
    slug: 'human-development',
    title: 'Human Development',
    subtitle: 'Health · Nutrition · Education',
    color: 'blue',
    icon: 'heart',
    description:
      'Breaking the cycle of preventable illness, malnutrition and lost learning through integrated service delivery.',
    image: '',
    sectors: [
      {
        name: 'Health',
        interventions:
          'Primary & reproductive health support\nMaternal, newborn & child health\nDisease surveillance & outbreak response\nCommunity health worker networks',
      },
      {
        name: 'Nutrition',
        interventions:
          'Management of acute malnutrition (MAM/SAM)\nIYCF counselling\nSupplementary feeding\nNutrition surveillance & early warning',
      },
      {
        name: 'Education',
        interventions:
          'Learning space rehabilitation\nTeacher training & incentives\nAccelerated basic education\nSchool feeding & education in emergencies',
      },
    ],
  },
  {
    id: 'social-protection',
    slug: 'social-protection',
    title: 'Social Protection & Community Resilience',
    subtitle: 'Protection · Livelihoods',
    color: 'red',
    icon: 'shield',
    description:
      'Safeguarding vulnerable populations while building the economic foundations for shock resilience.',
    image: '',
    sectors: [
      {
        name: 'Protection',
        interventions:
          'Child protection case management\nGBV prevention & response\nCommunity-based protection networks\nReferral pathway strengthening',
      },
      {
        name: 'Livelihoods',
        interventions:
          'Cash & voucher assistance\nLivestock restocking & animal health\nClimate-smart agricultural support\nVocational skills & MSME development',
      },
    ],
  },
  {
    id: 'environment',
    slug: 'environment',
    title: 'Environment & Natural Resources',
    subtitle: 'WASH · Environment & Climate Change',
    color: 'green',
    icon: 'leaf',
    description:
      'Addressing immediate WASH needs alongside the environmental and climate pressures driving recurrent crises.',
    image: '',
    sectors: [
      {
        name: 'WASH',
        interventions:
          'Water source construction/rehabilitation\nEmergency water trucking\nSanitation facilities\nCommunity-led total sanitation & hygiene promotion',
      },
      {
        name: 'Environment & Climate',
        interventions:
          'Climate adaptation planning\nNatural resource management\nReforestation & soil/water conservation\nDisaster risk reduction & early warning',
      },
    ],
  },
  {
    id: 'governance',
    slug: 'governance',
    title: 'Governance & Policy Systems',
    subtitle: 'Governance · Public Policy',
    color: 'indigo',
    icon: 'landmark',
    description:
      'Strengthening the institutions and accountability mechanisms that underpin durable recovery.',
    image: '',
    sectors: [
      {
        name: 'Governance',
        interventions:
          'District/state institutional capacity building\nCommunity governance & dispute resolution\nCivic engagement\nPublic financial management support',
      },
      {
        name: 'Public Policy',
        interventions:
          'Policy research & evidence generation\nMulti-stakeholder policy dialogue\nSectoral strategy support\nRights-based advocacy',
      },
    ],
  },
]

export const DEFAULT_REGIONS = [
  {
    id: 'banadir',
    name: 'Banadir Regional Administration',
    kind: 'Head Office · Mogadishu',
    description: 'Head Office (Mogadishu); national coordination, technical, finance and compliance functions.',
    image: '',
  },
  {
    id: 'puntland',
    name: 'Puntland State',
    kind: 'Regional office',
    description: 'Regional office supporting health, WASH, livelihoods and governance programming.',
    image: '',
  },
  {
    id: 'jubaland',
    name: 'Jubaland State',
    kind: 'Field presence',
    description: 'Field presence supporting humanitarian response, protection and resilience.',
    image: '',
  },
  {
    id: 'south-west',
    name: 'South West State',
    kind: 'Field presence',
    description: 'Field presence supporting nutrition, education and livelihoods.',
    image: '',
  },
  {
    id: 'hirshabelle',
    name: 'Hirshabelle State',
    kind: 'Field presence',
    description: 'Field presence supporting WASH, climate resilience and protection.',
    image: '',
  },
  {
    id: 'galmudug',
    name: 'Galmudug State',
    kind: 'Field presence',
    description: 'Field presence supporting drought response and governance strengthening.',
    image: '',
  },
]

export const DEFAULT_TEAM = [
  {
    id: 'ali-isack-ali',
    name: 'Ali Isack Ali',
    position: 'Executive Director',
    specialty: 'Development & Humanitarian Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Ali Isack Ali brings over ten years of progressive experience in program leadership, institutional development and strategic management across fragile and development contexts, with expertise spanning humanitarian response coordination, resilience programming and multi-sectoral development planning aligned with international standards. As Executive Director, she provides strategic leadership and oversight for RDA’s vision, mission and operational performance, ensures compliance with donor and regulatory frameworks, and strengthens institutional partnerships with government, UN agencies and civil society actors.',
  },
  {
    id: 'mohamud-bashir-omar',
    name: 'Mohamud Bashir Omar',
    position: 'Strategic & Planning Advisor',
    specialty: 'Strategic Planning & Organizational Development Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Mohamud Bashir Omar brings expertise in institutional strategy formulation, results-based management, policy alignment, organizational development, and performance management systems. His experience includes the development of strategic plans, program design frameworks, institutional policies, and quality assurance systems aligned with national and international standards.\n\nAs Strategic & Planning Advisor, he provides strategic guidance to RDA on institutional planning, organizational development, program design, quality assurance, and performance management. He supports the alignment of RDA’s interventions with its institutional objectives, strategic priorities, and relevant donor and partner requirements, while contributing to organizational learning, effectiveness, and long-term sustainability.',
  },
  {
    id: 'ahmed-nur-osman',
    name: 'Dr. Ahmed Nur Osman',
    position: 'Director of Human Development',
    specialty: 'Public Health & Human Development Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Dr. Ahmed Nur Osman brings expertise in health systems strengthening, nutrition programming and education service delivery in humanitarian and development contexts, including the design of integrated health, nutrition and education programs. As Director, he oversees implementation of health, nutrition and education programming, ensuring quality service delivery and alignment with national and international standards.',
  },
  {
    id: 'hodan-ibrahim-farah',
    name: 'Hodan Ibrahim Farah',
    position: 'Director of Social Protection & Community Resilience',
    specialty: 'Protection & Resilience Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Hodan Ibrahim Farah brings expertise in child protection, gender-based violence (GBV) prevention and response, safeguarding systems and livelihoods programming, including rights-based interventions to protect vulnerable populations. As Director, she leads protection and livelihoods programs and safeguarding systems, ensuring interventions are inclusive, gender-responsive and internationally aligned.',
  },
  {
    id: 'abdullahi-mohamed-warsame',
    name: 'Abdullahi Mohamed Warsame',
    position: 'Director of Environment & Climate',
    specialty: 'Environmental & Climate Resilience Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Abdullahi Mohamed Warsame brings expertise in water, sanitation and hygiene (WASH), natural resource management, climate adaptation and disaster risk reduction (DRR), including sustainable environmental and resilience-building programs. As Director, he oversees WASH, environmental sustainability and climate resilience interventions across RDA’s programming.',
  },
  {
    id: 'fadumo-abdi-hassan',
    name: 'Fadumo Abdi Hassan',
    position: 'Director of Governance & Policy',
    specialty: 'Governance & Public Policy Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Fadumo Abdi Hassan brings expertise in institutional strengthening, policy development, stakeholder engagement and accountability systems, including support to governance reforms and policy dialogue. As Director, she leads governance and policy programs and facilitates engagement between government institutions and communities.',
  },
  {
    id: 'yusuf-abdullahi-hubow',
    name: 'Yusuf Abdullahi Hubow',
    position: 'Director of MEAL & Research',
    specialty: 'MEAL Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Yusuf Abdullahi Hubow brings expertise in performance measurement systems, impact evaluations, data analytics and research methodologies, including MEAL frameworks aligned with donor and international evaluation standards. As Director, he oversees monitoring and evaluation systems and research activities, ensuring methodological rigor and evidence-based decision-making.',
  },
  {
    id: 'safiya-mohamed-aden',
    name: 'Safiya Mohamed Aden',
    position: 'Director of Partnerships, Grants & Resource Mobilization',
    specialty: 'Partnerships & Resource Mobilization Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Safiya Mohamed Aden brings expertise in donor engagement, grant acquisition, proposal development and strategic collaboration, including building partnerships with international organizations. As Director, she leads resource mobilization strategy, donor relations and partnership development, ensuring sustainable, compliant funding streams.',
  },
  {
    id: 'abdiqadir-hassan-ali',
    name: 'Abdiqadir Hassan Ali',
    position: 'Director of Finance, Administration & Compliance',
    specialty: 'Finance & Compliance Specialist',
    group: 'leadership',
    photo: '',
    bio: 'Abdiqadir Hassan Ali brings expertise in financial management, grant administration, procurement systems, human resource management and regulatory compliance, including implementing financial controls for donor-funded projects. As Director, he oversees financial systems, administrative operations and compliance frameworks, ensuring transparency and adherence to donor requirements.',
  },
]

export const DEFAULTS = {
  rda_programs: DEFAULT_PROGRAMS,
  rda_regions: DEFAULT_REGIONS,
  rda_team: DEFAULT_TEAM,
  rda_menu: DEFAULT_MENU,
}