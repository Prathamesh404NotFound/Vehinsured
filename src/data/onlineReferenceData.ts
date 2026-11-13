/**
 * Online-researched reference datasets for Indian Motor Insurance Claims,
 * IRDAI documentation checklists, popular Indian vehicle catalogs, and
 * regional repair cost benchmarks.
 */

export interface InsurerInfo {
  id: string;
  name: string;
  tollFree: string;
  whatsapp?: string;
  email?: string;
  roadsideAssistance?: string;
  claimPortalNote: string;
}

export const INDIAN_MOTOR_INSURERS: InsurerInfo[] = [
  {
    id: 'icici-lombard',
    name: 'ICICI Lombard General Insurance',
    tollFree: '1800 2666',
    whatsapp: '7738282666',
    claimPortalNote: '24x7 motor claim intimation via toll-free or IL TakeCare portal.',
  },
  {
    id: 'hdfc-ergo',
    name: 'HDFC ERGO General Insurance',
    tollFree: '022 6234 6234 / 0120 6234 6234',
    whatsapp: '8169 500 500',
    claimPortalNote: 'Notify within 24–48 hours; cashless inspection via network garages.',
  },
  {
    id: 'bajaj-allianz',
    name: 'Bajaj Allianz General Insurance',
    tollFree: '1800 209 5858',
    roadsideAssistance: '1800 103 5858',
    email: 'careforyou@bajajgeneral.com',
    claimPortalNote: 'Supports Motor On-The-Spot self-inspection for minor damages.',
  },
  {
    id: 'tata-aig',
    name: 'Tata AIG General Insurance',
    tollFree: '022 6489 8282',
    email: 'customersupport@tataaig.com',
    claimPortalNote: 'Senior citizen helpline: 1800 267 1955.',
  },
  {
    id: 'new-india',
    name: 'The New India Assurance Co. Ltd.',
    tollFree: '1800 209 1415',
    whatsapp: '98333 19191',
    claimPortalNote: 'Public sector insurer; submit claim form & RC/DL copies to nearest branch.',
  },
];

export const POPULAR_INDIAN_VEHICLES: Record<string, string[]> = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Brezza', 'WagonR', 'Fronx', 'Ertiga', 'Alto K10'],
  Hyundai: ['Creta', 'i20', 'Venue', 'Verna', 'Grand i10 Nios', 'Exter', 'Alcazar'],
  Tata: ['Nexon', 'Punch', 'Tiago', 'Altroz', 'Harrier', 'Safari', 'Tigor'],
  Honda: ['City', 'Amaze', 'Elevate', 'Activa 6G', 'Shine 125'],
  Mahindra: ['Scorpio-N', 'XUV700', 'XUV 3XO', 'Thar', 'Bolero'],
  Kia: ['Seltos', 'Sonet', 'Carens'],
  Toyota: ['Innova Crysta', 'Innova Hycross', 'Fortuner', 'Urban Cruiser Hyryder', 'Glanza'],
  'Royal Enfield': ['Classic 350', 'Hunter 350', 'Meteor 350'],
  TVS: ['Jupiter', 'Apache RTR 160', 'iQube'],
  Bajaj: ['Pulsar 150', 'Pulsar N160', 'Chetak'],
};

export interface ChecklistDefinition {
  id: string;
  category: 'own_damage' | 'third_party' | 'deceased_nominee';
  title: string;
  whyNeeded: string;
  requirementNote: string;
}

export const IRDAI_DOCUMENT_CHECKLIST: ChecklistDefinition[] = [
  {
    id: 'doc-claim-form',
    category: 'own_damage',
    title: 'Duly Filled & Signed Motor Claim Form',
    whyNeeded: 'Official request authorizing the insurer to open a survey and process repairs.',
    requirementNote: 'Usually required by all insurers.',
  },
  {
    id: 'doc-rc',
    category: 'own_damage',
    title: 'Vehicle Registration Certificate (RC) Copy',
    whyNeeded: 'Establishes vehicle ownership, chassis/engine numbers, and registration validity.',
    requirementNote: 'Required for all claims.',
  },
  {
    id: 'doc-policy',
    category: 'own_damage',
    title: 'Motor Insurance Policy Schedule',
    whyNeeded: 'Confirms active coverage period, IDV, Zero-Dep add-on, and compulsory deductible.',
    requirementNote: 'Required for all claims.',
  },
  {
    id: 'doc-dl',
    category: 'own_damage',
    title: 'Driving Licence (DL) of Driver at Time of Incident',
    whyNeeded: 'Verifies the driver held a valid licence for the vehicle class during the incident.',
    requirementNote: 'Required for road accident claims.',
  },
  {
    id: 'doc-kyc',
    category: 'own_damage',
    title: 'Policyholder KYC (PAN Card & Aadhaar Card)',
    whyNeeded: 'Mandatory under IRDAI/AML guidelines especially when claim value exceeds Rs. 1,00,000.',
    requirementNote: 'May be required based on claim amount.',
  },
  {
    id: 'doc-fir',
    category: 'third_party',
    title: 'Police FIR / Station Diary Entry',
    whyNeeded: 'Establishes official incident record for third-party injury, hit-and-run, theft, or major damage.',
    requirementNote: 'May be required depending on severity or third-party involvement.',
  },
  {
    id: 'doc-garage-est',
    category: 'own_damage',
    title: 'Workshop Repair Estimate & Final Tax Invoice',
    whyNeeded: 'Used by the licensed surveyor to assess approved parts, depreciation, and settlement payout.',
    requirementNote: 'Required before final settlement (reimbursement or cashless).',
  },
  {
    id: 'doc-neft',
    category: 'own_damage',
    title: 'Cancelled Cheque / NEFT Bank Mandate',
    whyNeeded: 'Enables direct electronic transfer for reimbursement claims.',
    requirementNote: 'Required for reimbursement claims.',
  },
  {
    id: 'nom-death-cert',
    category: 'deceased_nominee',
    title: 'Municipal Death Certificate of Policyholder',
    whyNeeded: 'Official proof of demise required for nominee claim or PA cover processing.',
    requirementNote: 'Required in deceased policyholder cases.',
  },
  {
    id: 'nom-legal-heir',
    category: 'deceased_nominee',
    title: 'Nomination Proof / Legal Heir / Succession Certificate',
    whyNeeded: 'Establishes claimant relationship or legal authority to receive proceeds.',
    requirementNote: 'Exact document depends on insurer policy terms and state law.',
  },
  {
    id: 'nom-rc-transfer',
    category: 'deceased_nominee',
    title: 'RTO Ownership Transfer Application Note (Within 3 Months)',
    whyNeeded: 'Under Indian motor rules, vehicle ownership should be transferred to the legal heir within 3 months.',
    requirementNote: 'Advisory note; confirm exact RTO & insurer procedure.',
  },
];

export const IRDAI_CLAIM_ADVISORIES = [
  'Inform your insurer within 24–48 hours of the incident with policy number and photos.',
  'Do not begin major workshop repairs before an authorized surveyor inspects the vehicle.',
  'For minor single-panel scratches under Rs. 4,000–5,000, compare out-of-pocket cost against losing your No Claim Bonus (NCB).',
  'For deceased policyholder cases, check Personal Accident (PA) Owner-Driver cover (up to Rs. 15 Lakhs under IRDAI norms).',
];
