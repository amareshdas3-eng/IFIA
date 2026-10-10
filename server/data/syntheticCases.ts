import { RCACase } from '../schemas/rcaContract.js';

export const syntheticCases: RCACase[] = [
  {
    case_id: 'RCA-2026-33KV-001',
    title: '33 kV Incomer Switchgear Flashover & Blackout Investigation',
    equipment_tag: '33KV-SWG-INC-01',
    equipment_class: 'Medium Voltage Air-Insulated Switchgear (33 kV AIS)',
    plant: 'Petrochemical Complex - Substation 04B',
    event_timestamp: '2026-04-12T04:12:08.412Z',
    failure_symptoms: 'Incomer VCB tripped on Master Trip 86 lockout; Phase B instantaneous overcurrent (50) and earth fault (50N); station wide 24 MW blackout; arc chute pressure flap released; distinct ozone and scorched resin odor.',
    operational_impact: 'Total loss of 33 kV Distribution Bus B; emergency diesel generators auto-started; downstream cracker feed pumps lost power for 182 minutes; estimated production loss $420,000.',
    case_status: 'AWAITING_ENGINEERING_REVIEW',
    data_mode: 'SYNTHETIC_DEMO',
    evidence_register: [
      {
        evidence_id: 'EV-001',
        source_type: 'RELAY_RECORD',
        title: 'SEL-751 Numerical Feeder Protection Relay Event Record',
        raw_content: 'Timestamp: 2026-04-12T04:12:08.412Z. Trigger: 50P2 / 50G. Phase Currents: Ia=412 A, Ib=18,420 A, Ic=398 A, In=17,910 A. Fault duration: 71.4 ms before breaker contacts parted. Trip signal asserted: Instantaneous.',
        timestamp: '2026-04-12T04:12:08.412Z',
        reliability: 'HIGH',
        tags: ['relay', 'fault-current', 'protection'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Relay COMTRADE file / Substation 04B / SEL-751_Slot2.dat'
      },
      {
        evidence_id: 'EV-002',
        source_type: 'ALARM_LOG',
        title: 'SCADA Sequence of Events (SOE) Log 1ms Resolution',
        raw_content: '04:12:08.410Z - 33kV Bus B VT Phase B voltage sag to 4.2 kV.\n04:12:08.412Z - 33KV-SWG-INC-01 TRIP Asserted.\n04:12:08.484Z - 33KV-SWG-INC-01 VCB 52a contact opened (Aux contact confirmation).\n04:12:08.510Z - Substation 04B Fire Alarm Zone 2 (Optical Smoke) activated.',
        timestamp: '2026-04-12T04:12:08.410Z',
        reliability: 'HIGH',
        tags: ['scada', 'soe', 'breaker-timing'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'SCADA SOE Server Node-Alpha Event Table'
      },
      {
        evidence_id: 'EV-003',
        source_type: 'INSPECTION_RECORD',
        title: 'Post-Trip Physical Inspection & Borescope Examination',
        raw_content: 'Post-trip cubicle entry performed under verified isolation. Heavy dendritic carbon tracking observed on Phase B post-insulator in the cable spoot compartment. High moisture droplets clinging to interior enclosure sidewalls. Space heater miniature circuit breaker (MCB-HTR-1) was in TRIPPED position. Heater element cold to touch.',
        timestamp: '2026-04-12T06:30:00Z',
        reliability: 'HIGH',
        tags: ['physical-evidence', 'insulator', 'moisture', 'heater-mcb'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Substation Electrical Lead Technical Inspection Memo 2026-04-12-01'
      },
      {
        evidence_id: 'EV-004',
        source_type: 'MAINTENANCE_HISTORY',
        title: 'CMMS Historical Work Order WO-2025-8841 (6 Months Prior)',
        raw_content: 'Routine 2-yearly PM on 33KV-SWG-INC-01. Technician note: "Anti-condensation panel heater thermostat defective (contacts welded open). Spare not in stock. Work order closed with deferral tag DEF-2025-09; replacement scheduled for annual turnaround."',
        timestamp: '2025-10-18T14:00:00Z',
        reliability: 'HIGH',
        tags: ['maintenance', 'deferred-defect', 'heater-thermostat'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Enterprise CMMS Record WO-2025-8841'
      },
      {
        evidence_id: 'EV-005',
        source_type: 'OPERATOR_LOG',
        title: 'Control Room Weather and Environmental Log',
        raw_content: 'Heavy tropical monsoon downpour commenced 02:00Z. Ambient temperature dropped from 34.2°C to 23.8°C within 45 minutes. Relative humidity reached 99.4%. Substation basement positive pressure HVAC unit tripped on high filter differential pressure at 03:15Z.',
        timestamp: '2026-04-12T03:30:00Z',
        reliability: 'MEDIUM',
        tags: ['environment', 'dew-point', 'hvac-trip'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Operations Shift Logbook Page 441'
      },
      {
        evidence_id: 'EV-006',
        source_type: 'OPERATOR_LOG',
        title: 'Initial Operator Verbal Log - Claimed Overhead Lightning Strike',
        raw_content: 'Shift operator noted: "Fault was likely triggered by external lightning strike on overhead line span entering Substation 04B due to loud thunderclap at 04:12Z."',
        timestamp: '2026-04-12T04:25:00Z',
        reliability: 'QUESTIONABLE',
        tags: ['operator-hypothesis', 'unsubstantiated'],
        is_unreliable_timestamp: false,
        contradiction_flag: true,
        source_reference: 'Initial Incident Flash Report Draft'
      },
      {
        evidence_id: 'EV-007',
        source_type: 'COMMISSIONING_TEST',
        title: 'Surge Arrester Inspection & Discharge Counter Audit',
        raw_content: 'Surge arresters on 33 kV incomer feeder (SA-33-INC-B) inspected at 07:15Z. Surge counter reading: 14 (identical to baseline reading of 14 recorded during last quarterly round). Leakage current monitor reading within normal range (0.32 mA). Zero indication of external transient surge.',
        timestamp: '2026-04-12T07:15:00Z',
        reliability: 'HIGH',
        tags: ['surge-arrester', 'counter', 'contradiction-evidence'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Substation Protection Tech Report 2026-04-12-02'
      }
    ],
    event_timeline: [
      {
        timestamp: '2025-10-18T14:00:00Z',
        event: 'Routine maintenance WO-2025-8841 identifies failed cubicle anti-condensation heater thermostat; replacement deferred to next turnaround without risk mitigation.',
        evidence_ids: ['EV-004'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 1
      },
      {
        timestamp: '2026-04-12T02:00:00Z',
        event: 'Severe tropical storm commences; rapid temperature plunge causes ambient air in substation room to cross dew point (relative humidity 99.4%).',
        evidence_ids: ['EV-005'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 2
      },
      {
        timestamp: '2026-04-12T03:15:00Z',
        event: 'Substation basement pressurization HVAC fan trips on filter differential pressure, allowing high-humidity air into cable basement and switchgear plenum.',
        evidence_ids: ['EV-005'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 3
      },
      {
        timestamp: '2026-04-12T03:45:00Z',
        event: 'Moisture condenses inside unheated cable spoot box on Phase B post-insulator; airborne dust deposits form conductive electrolyte film.',
        evidence_ids: ['EV-003', 'EV-004'],
        fact_or_inference: 'INFERRED',
        timestamp_quality: 'ESTIMATED',
        sequence_index: 4
      },
      {
        timestamp: '2026-04-12T04:12:08.410Z',
        event: 'Phase B busbar voltage collapses to 4.2 kV as surface partial discharge transitions into full flashover to ground.',
        evidence_ids: ['EV-001', 'EV-002'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 5
      },
      {
        timestamp: '2026-04-12T04:12:08.412Z',
        event: 'SEL-751 relay detects 18.42 kA earth fault current and issues instantaneous trip command to Master Trip 86 lockout.',
        evidence_ids: ['EV-001'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 6
      },
      {
        timestamp: '2026-04-12T04:12:08.484Z',
        event: 'Incomer VCB 52a main contacts part in 71.4 ms; arc cleared successfully, preventing breaker cubicle destruction.',
        evidence_ids: ['EV-001', 'EV-002'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 7
      }
    ],
    hypotheses: [
      {
        hypothesis_id: 'H-001',
        title: 'Moisture Condensation & Creepage Tracking Flashover',
        description: 'Atmospheric moisture condensed onto Phase B epoxy post-insulator due to inactive anti-condensation space heater; conductive electrolyte path formed across dust deposits, initiating scintillation partial discharge that escalated into an 18.4 kA flashover to ground.',
        status: 'RETAINED',
        supporting_evidence_ids: ['EV-001', 'EV-003', 'EV-004', 'EV-005'],
        contradicting_evidence_ids: [],
        missing_evidence: [
          'Spectrographic / FTIR chemical analysis of residue on damaged post-insulator to verify exact contaminant makeup',
          'Megger insulation resistance test records of unfailed Phase A and Phase C insulators under dry conditions'
        ],
        physical_rationale: 'In air-insulated switchgear per IEC 62271-200, when temperature drops below dew point without cubicle heating, relative humidity reaches 100%, causing water condensation. Dielectric creepage strength of contaminated epoxy drops from >3.0 kV/cm to <0.6 kV/cm, triggering surface flashover under normal 33 kV phase-to-ground voltage (19 kV rms).',
        confidence: {
          label: 'HIGH',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 92
        },
        falsification_test: 'Measure insulation resistance and surface profile of undamaged adjacent Phase A/C insulators. If Phase B insulator shows mechanical fracture prior to electrical arc, hypothesis is falsified.',
        next_diagnostic_step: 'Perform 5 kV DC insulation resistance and Tan Delta dielectric dissipation factor testing on all three phases post-cleaning.'
      },
      {
        hypothesis_id: 'H-002',
        title: 'External Lightning Surge Overvoltage Flashover',
        description: 'An atmospheric lightning discharge struck the 33 kV incomer line, propagating a steep-front overvoltage travelling wave into the switchgear busbar that exceeded the 170 kV Basic Impulse Insulation Level (BIL).',
        status: 'REJECTED',
        supporting_evidence_ids: ['EV-006'],
        contradicting_evidence_ids: ['EV-007'],
        missing_evidence: ['Regional lightning detection network strike location and kA amplitude timestamp log'],
        physical_rationale: 'If lightning entered the substation, the line surge arresters would divert the surge energy to earth, incrementing their mechanical discharge counters and exhibiting residual heating.',
        confidence: {
          label: 'LOW',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 8
        },
        falsification_test: 'Surge arrester counter check and relay waveform FFT. Confirmed: Surge counter remained at 14 (zero discharges), directly falsifying this hypothesis.',
        next_diagnostic_step: 'Archive lightning detection network timestamps for formal insurance documentation.'
      },
      {
        hypothesis_id: 'H-003',
        title: 'Cable Termination Bolted Joint Thermal Runaway',
        description: 'High contact resistance at Phase B cable lug connection generated localized overheating, degrading the cable heat-shrink stress cone until dielectric insulation punctured.',
        status: 'DOWNGRADED',
        supporting_evidence_ids: [],
        contradicting_evidence_ids: ['EV-003'],
        missing_evidence: ['Pre-incident thermal imaging thermogram records of the cable terminations under peak load'],
        physical_rationale: 'A loose bolted joint causes I²R Joule heating, which leaves distinct discoloration on copper palms and melts stress relief mastic long before insulator tracking.',
        confidence: {
          label: 'LOW',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 14
        },
        falsification_test: 'Inspect Phase B cable lug and palm bolted joint torque. Borescope and physical exam revealed lug was tight with zero thermal oxidation; arc originated on insulator support bracket.',
        next_diagnostic_step: 'Verify micro-ohm contact resistance using digital low-resistance ohmmeter (DLRO/Ductor).'
      }
    ],
    fault_tree: {
      id: 'FT-TOP',
      label: '33 kV Incomer Phase B Busbar Flashover (18.4 kA Trip)',
      type: 'TOP_EVENT',
      gate: 'AND',
      evidence_ids: ['EV-001', 'EV-002'],
      children: [
        {
          id: 'FT-COND-1',
          label: 'Loss of Dielectric Surface Creepage Strength',
          type: 'INTERMEDIATE',
          gate: 'AND',
          evidence_ids: ['EV-003'],
          children: [
            {
              id: 'FT-BE-1',
              label: 'Moisture Condensation Inside Enclosure',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-003', 'EV-005'],
              children: []
            },
            {
              id: 'FT-BE-2',
              label: 'Conductive Industrial Dust Deposition on Post Insulator',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-003'],
              children: []
            }
          ]
        },
        {
          id: 'FT-COND-2',
          label: 'Failure of Environmental Defense Barriers',
          type: 'INTERMEDIATE',
          gate: 'OR',
          evidence_ids: ['EV-004'],
          children: [
            {
              id: 'FT-BE-3',
              label: 'Anti-Condensation Heater De-energized (Defective Thermostat Deferred 6 Mo)',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-004'],
              children: []
            },
            {
              id: 'FT-BE-4',
              label: 'Substation HVAC Positive Pressure Fan Tripped',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-005'],
              children: []
            }
          ]
        }
      ]
    },
    root_cause_conclusion: {
      status: 'PROBABLE',
      approved_by_human: false,
      statement: 'The immediate failure mechanism was Phase-B-to-earth dielectric surface tracking flashover across the epoxy post-insulator in the cable compartment under normal operating voltage (19 kV phase-to-ground). The primary technical root cause was heavy moisture condensation resulting from an unheated enclosure caused by a defective panel heater thermostat. The systemic organizational root cause was the deferred maintenance protocol (WO-2025-8841 deferred 6 months without interim atmospheric monitoring or risk assessment), combined with the failure of the substation HVAC room pressurization system during extreme monsoon weather.',
      immediate_mechanism: 'Phase B epoxy support insulator surface tracking flashover initiated by conductive moisture-dust film.',
      contributing_factors: [
        'Sudden 10.4°C ambient temperature plunge during monsoon thunderstorm exceeding air dew point',
        'Substation basement pressurization HVAC trip due to choked particulate filters',
        'Dust accumulation on insulator surface over 24-month maintenance interval'
      ],
      systemic_factors: [
        'Defect deferral process lacked formal engineering risk evaluation for critical anti-condensation heating in high-humidity climates',
        'Lack of SCADA alarming/monitoring for cubicle space heater circuit breaker trip or thermostat failure'
      ],
      equipment_standards_referenced: [
        'IEC 62271-200: High-voltage switchgear and controlgear - Part 200: AC metal-enclosed switchgear',
        'IEEE C37.20.2: IEEE Standard for Metal-Clad Switchgear',
        'NFPA 70B: Standard for Electrical Equipment Maintenance (2023)'
      ]
    },
    recommended_actions: [
      {
        action_id: 'ACT-001',
        type: 'CORRECTIVE',
        description: 'Replace Phase B damaged epoxy post-insulator and busbar spoot boots; perform solvent cleaning on Phase A & C insulators.',
        priority: 'SAFETY_CRITICAL',
        responsible_role: 'High Voltage Electrical Specialist',
        dependencies: ['Approved LOTO Permit', 'Verified Zero-Energy & Busbar Grounding'],
        verification_criteria: '5 kV DC Insulation Resistance > 2,000 MΩ; Power Factor / Tan Delta < 0.5% at 10 kV test voltage.',
        target_date: '2026-04-14',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-002',
        type: 'CORRECTIVE',
        description: 'Install new heavy-duty PTC ceramic anti-condensation panel heaters (200W) with independent digital humidistats and auxiliary trip alarm contacts.',
        priority: 'HIGH',
        responsible_role: 'Substation Maintenance Lead',
        dependencies: ['ACT-001'],
        verification_criteria: 'Thermal imaging verification of active heating surface (45°C - 55°C) and SCADA alarm verification upon MCB trip test.',
        target_date: '2026-04-15',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-003',
        type: 'PREVENTIVE',
        description: 'Modify plant defect management procedure: Prohibit unilateral deferral of anti-condensation heating defects in coastal/monsoon zones without Chief Electrical Engineer MOC approval.',
        priority: 'HIGH',
        responsible_role: 'Plant Reliability Engineering Director',
        dependencies: [],
        verification_criteria: 'Management of Change (MOC) procedure updated in Document Management System with mandatory engineering sign-off.',
        target_date: '2026-04-30',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-004',
        type: 'VERIFICATION',
        description: 'Conduct comprehensive Tan Delta and Partial Discharge (TEV / Ultrasonic) baseline survey across all remaining 33 kV switchgear cubicles in Substation 04B.',
        priority: 'MEDIUM',
        responsible_role: 'Condition Monitoring Specialist',
        dependencies: ['ACT-001', 'ACT-002'],
        verification_criteria: 'Zero detectable partial discharge (>10 pC equivalent) and valid baseline benchmark report signed off.',
        target_date: '2026-04-20',
        approval_status: 'DRAFT'
      }
    ],
    qa_review: {
      decision: 'READY_FOR_AUTHORIZED_REVIEW',
      traceability_score_pct: 94.2,
      findings: [
        {
          severity: 'MINOR',
          claim: 'Estimated 100% relative humidity inside cable spoot box',
          reason: 'Calculated from ambient psychrometric dew point drop; direct internal humidity sensor not installed in cubicle.',
          remediation: 'Marked as engineering thermodynamic inference rather than direct telemetry observation.'
        },
        {
          severity: 'INFORMATIONAL',
          claim: 'Operator initial lightning hypothesis contradicted',
          reason: 'Line surge arrester counter EV-007 verified at 14 with zero discharges, providing conclusive falsification.',
          remediation: 'Fully documented in hypothesis comparison table.'
        }
      ],
      hallucination_detected: false,
      safety_policy_passed: true,
      audited_at: '2026-04-12T08:15:00Z',
      auditor_engine: 'IFIA-RedTeam-Audit-v2.4'
    },
    cmms: {
      work_order_id: 'WO-DRAFT-33KV-9021',
      mode: 'SANDBOX',
      equipment_tag: '33KV-SWG-INC-01',
      problem_statement: 'Phase B busbar flashover trip under humid atmospheric conditions; damaged post-insulator and inoperative space heating.',
      failure_findings: [
        'Epoxy post-insulator tracking breakdown to earth (EV-003)',
        'Heater MCB tripped and thermostat defective since deferred WO-2025-8841 (EV-004)',
        'Fault current of 18.42 kA cleared in 71.4 ms by SEL-751 (EV-001)'
      ],
      work_description: 'Replace Phase B 33 kV support insulator; install 2x 200W PTC anti-condensation heaters with digital humidistat; test insulation resistance and Tan Delta; verify heater trip telemetry to SCADA.',
      safety_prerequisites: [
        'Approved Electrical Permit to Work (PTW-HV-33KV)',
        'Lockout/Tagout (LOTO) on upstream GSU Transformer 33 kV breaker and downstream bus coupler',
        'Visible earth switch closed and portable earthing clusters applied to busbar phases A, B, C',
        'Verify zero voltage with calibrated high-voltage proving unit prior to touch'
      ],
      inspection_hold_points: [
        'HOLD POINT 1: Chief Electrical Engineer inspection of stripped busbar compartment before insulator mounting',
        'HOLD POINT 2: Witnessed 5 kV DC Megger test (>2000 MΩ) and 10 kV Tan Delta (<0.5%)',
        'HOLD POINT 3: Commissioning sign-off on new heater circuit current draw and SCADA alarm test'
      ],
      parts_requiring_verification: [
        '1x 33 kV Cycloaliphatic Epoxy Post Insulator (OEM Part #ABB-UNI-33-04) - REQUIRES STORES STOCK VERIFICATION',
        '2x PTC 200W DIN-Rail Heaters (Part #STEGO-CS060) - IN STOCK',
        '1x Digital Electronic Humidistat 24-240V AC/DC - IN STOCK',
        '1x Set Silver-plated Busbar Hardware & Belleville Spring Washers (M12 grade 8.8)'
      ],
      idempotency_key: 'IDEMP-RCA-2026-33KV-001-REV1',
      work_order_status: 'DRAFT_NOT_SUBMITTED',
      submitted_at: null,
      cmms_system_reference: null
    },
    approvals: [],
    metrics: {
      investigation_start_time: '2026-04-12T04:30:00Z',
      investigation_end_time: '2026-04-12T07:22:00Z',
      elapsed_ai_minutes: 42,
      manual_baseline_days: 14,
      engineer_review_minutes: 0,
      evidence_coverage_pct: 96.5
    },
    created_at: '2026-04-12T04:35:00Z',
    updated_at: '2026-04-12T08:20:00Z'
  },
  {
    case_id: 'RCA-2026-TR-40MVA-02',
    title: '132/33 kV 40 MVA Transformer DGA Gas Spike & Differential Trip',
    equipment_tag: 'TR-40MVA-02',
    equipment_class: 'High Voltage Power Transformer (132/33 kV ONAN/ONAF)',
    plant: 'Power Transmission & Distribution Hub North',
    event_timestamp: '2026-03-28T14:45:10.000Z',
    failure_symptoms: 'Buchholz relay gas alarm followed 4 hours later by 87T transformer differential protection trip; significant combustible gas in Buchholz chamber.',
    operational_impact: 'Shutdown of 132 kV primary substation feed; partial grid load shedding (18 MW) for 240 minutes.',
    case_status: 'AWAITING_ENGINEERING_REVIEW',
    data_mode: 'SYNTHETIC_DEMO',
    evidence_register: [
      {
        evidence_id: 'EV-TR-01',
        source_type: 'DGA_ANALYSIS',
        title: 'Dissolved Gas Analysis (DGA) Lab Report (ASTM D3612)',
        raw_content: 'Acetylene (C2H2): 412 ppm (historical baseline: <2 ppm). Hydrogen (H2): 890 ppm. Ethylene (C2H4): 780 ppm. Methane (CH4): 310 ppm. Carbon monoxide (CO): 450 ppm. Duval Triangle 1 diagnosis: Zone D2 (High Energy Arcing).',
        timestamp: '2026-03-28T15:30:00Z',
        reliability: 'HIGH',
        tags: ['dga', 'acetylene', 'duval-triangle', 'arcing'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Certified Oil Testing Lab Certificate #DGA-2026-904'
      },
      {
        evidence_id: 'EV-TR-02',
        source_type: 'RELAY_RECORD',
        title: 'Siemens 7UT63 Transformer Differential Relay 87T Trip',
        raw_content: 'Differential current Idiff on Phase W peaked at 4.8 x Inom. Restraint current Irest=2.1 x Inom. Trip time: 24 ms. Zero harmonic restraint block (2nd harmonic inrush was below 15%).',
        timestamp: '2026-03-28T18:45:10.120Z',
        reliability: 'HIGH',
        tags: ['relay', 'differential-87T', 'internal-fault'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Relay 7UT63 COMTRADE Oscillography / Substation Main'
      },
      {
        evidence_id: 'EV-TR-03',
        source_type: 'INSPECTION_RECORD',
        title: 'On-Load Tap Changer (OLTC) Diverter Switch Oil Sampling',
        raw_content: 'OLTC barrier board seal inspection: Oil level in OLTC compartment normal, but oil sample showed C2H2 = 12 ppm (diverter compartment within normal parameters). Arcing was located inside main tank, NOT tap changer.',
        timestamp: '2026-03-29T08:00:00Z',
        reliability: 'HIGH',
        tags: ['oltc', 'main-tank-discrimination'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Transformer Specialist Site Inspection Report TR-2026-03-29'
      }
    ],
    event_timeline: [
      {
        timestamp: '2026-03-28T14:45:10.000Z',
        event: 'Buchholz relay alarm contact 63 asserts on gas accumulation.',
        evidence_ids: ['EV-TR-01'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 1
      },
      {
        timestamp: '2026-03-28T15:30:00Z',
        event: 'Emergency oil sample taken from main tank drain valve for fast-track DGA testing.',
        evidence_ids: ['EV-TR-01'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 2
      },
      {
        timestamp: '2026-03-28T18:45:10.120Z',
        event: 'Inter-turn winding dielectric barrier fails completely, resulting in high-energy internal arc and 87T differential trip.',
        evidence_ids: ['EV-TR-02'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 3
      }
    ],
    hypotheses: [
      {
        hypothesis_id: 'H-TR-01',
        title: 'HV Winding Inter-Turn Insulation Breakdown Arcing',
        description: 'Localized insulation aging or mechanical distortion under past through-fault stresses compromised paper insulation between turns on Phase W, initiating localized sparking that rapidly escalated into high-energy power arcing in oil.',
        status: 'RETAINED',
        supporting_evidence_ids: ['EV-TR-01', 'EV-TR-02', 'EV-TR-03'],
        contradicting_evidence_ids: [],
        missing_evidence: [
          'Sweep Frequency Response Analysis (SFRA) comparison against commissioning finger-print',
          'Winding resistance measurement across all tap positions'
        ],
        physical_rationale: 'Generation of over 400 ppm Acetylene (C2H2) requires oil decomposition temperatures exceeding 1000°C, typical only of electrical arcing in liquid per IEEE C57.104 and IEC 60599.',
        confidence: {
          label: 'HIGH',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 95
        },
        falsification_test: 'SFRA and DC winding resistance test. A variation >2% in Phase W resistance compared to U & V confirms turn-to-turn short.',
        next_diagnostic_step: 'Carry out SFRA (IEC 60076-18) and transformer turns ratio (TTR) testing under de-energized isolation.'
      }
    ],
    fault_tree: {
      id: 'FT-TR-TOP',
      label: '40 MVA Transformer Differential Trip 87T',
      type: 'TOP_EVENT',
      gate: 'OR',
      evidence_ids: ['EV-TR-02'],
      children: [
        {
          id: 'FT-TR-ARC',
          label: 'High-Energy Internal Arcing in Main Tank (Zone D2)',
          type: 'INTERMEDIATE',
          gate: 'SINGLE',
          evidence_ids: ['EV-TR-01'],
          children: [
            {
              id: 'FT-TR-WINDING',
              label: 'Phase W Inter-turn Paper Insulation Breakdown',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-TR-01', 'EV-TR-02'],
              children: []
            }
          ]
        }
      ]
    },
    root_cause_conclusion: {
      status: 'PROBABLE',
      approved_by_human: false,
      statement: 'Internal high-energy electrical arcing (Duval Triangle Zone D2) occurring within the main oil tank between turns of the 132 kV Phase W winding. High acetylene (412 ppm) and ethylene confirms oil temperatures >1000°C. Do not re-energize under any circumstances.',
      immediate_mechanism: 'Dielectric failure of winding inter-turn paper insulation leading to high-energy arc in mineral oil.',
      contributing_factors: [
        'Accumulated electromechanical forces from historical downstream grid through-faults',
        'Thermal degradation of cellulose paper insulation over 18 years in service'
      ],
      systemic_factors: [
        'Condition-based online DGA monitor was scheduled for installation next financial year'
      ],
      equipment_standards_referenced: [
        'IEEE C57.104: Guide for the Interpretation of Gases Generated in Mineral Oil-Immersed Transformers',
        'IEC 60599: Mineral oil-filled electrical equipment in service - Guidance on the interpretation of dissolved and free gases analysis',
        'IEC 60076-18: Power transformers - Part 18: Measurement of frequency response'
      ]
    },
    recommended_actions: [
      {
        action_id: 'ACT-TR-01',
        type: 'VERIFICATION',
        description: 'Perform de-energized SFRA, Transformer Turns Ratio (TTR), and winding resistance test on all tap positions.',
        priority: 'SAFETY_CRITICAL',
        responsible_role: 'Transformer Testing Specialist',
        dependencies: ['HV Isolation & Grounding'],
        verification_criteria: 'SFRA deviation curve identifies exact physical winding deformation pocket.',
        target_date: '2026-03-31',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-TR-02',
        type: 'CORRECTIVE',
        description: 'Initiate factory workshop internal inspection and untanking for winding rewind or core rebuild.',
        priority: 'HIGH',
        responsible_role: 'Plant Asset Engineering Manager',
        dependencies: ['ACT-TR-01'],
        verification_criteria: 'Commercial vendor untanking quote and rewind scope approved.',
        target_date: '2026-04-15',
        approval_status: 'DRAFT'
      }
    ],
    qa_review: {
      decision: 'READY_FOR_AUTHORIZED_REVIEW',
      traceability_score_pct: 98.0,
      findings: [],
      hallucination_detected: false,
      safety_policy_passed: true,
      audited_at: '2026-03-29T10:00:00Z',
      auditor_engine: 'IFIA-RedTeam-Audit-v2.4'
    },
    cmms: {
      work_order_id: 'WO-DRAFT-TR-8812',
      mode: 'SANDBOX',
      equipment_tag: 'TR-40MVA-02',
      problem_statement: 'High Acetylene DGA spike (412 ppm) and 87T differential trip; severe internal arcing in main oil tank.',
      failure_findings: [
        'Acetylene 412 ppm, Ethylene 780 ppm, Zone D2 high energy arcing (EV-TR-01)',
        'Siemens 7UT63 trip in 24 ms with 4.8x Inom fault current on Phase W (EV-TR-02)',
        'OLTC diverter oil confirmed clean (EV-TR-03)'
      ],
      work_description: 'Strict Lockout/Tagout. Perform SFRA, TTR, and DC winding resistance; prepare oil drainage and internal inspection rigging.',
      safety_prerequisites: [
        'Complete 132 kV and 33 kV isolation with double lock and tag',
        'Solid busbar and transformer neutral earthing connected',
        'Nitrogen blanket purge hazard assessment if tank is entered'
      ],
      inspection_hold_points: [
        'HOLD POINT 1: Witness SFRA and TTR test results with Senior Electrical Authority',
        'HOLD POINT 2: Formal decision point for on-site repair vs transport to OEM rewind facility'
      ],
      parts_requiring_verification: [
        'OEM Phase W winding coil set (Requires factory fabrication)',
        '30,000 Liters uninhibited mineral insulating oil (IEC 60296)',
        'Full tank perimeter nitrile gasket kit'
      ],
      idempotency_key: 'IDEMP-RCA-2026-TR-40MVA-02-REV1',
      work_order_status: 'DRAFT_NOT_SUBMITTED',
      submitted_at: null,
      cmms_system_reference: null
    },
    approvals: [],
    metrics: {
      investigation_start_time: '2026-03-28T19:00:00Z',
      investigation_end_time: '2026-03-29T10:30:00Z',
      elapsed_ai_minutes: 55,
      manual_baseline_days: 14,
      engineer_review_minutes: 0,
      evidence_coverage_pct: 98.2
    },
    created_at: '2026-03-28T19:10:00Z',
    updated_at: '2026-03-29T10:35:00Z'
  },
  {
    case_id: 'RCA-2026-MTR-1200KW-03',
    title: '6.6 kV 1200 kW Boiler Feed Pump Motor High Vibration & Stator Earth Fault',
    equipment_tag: 'BFP-MTR-01B',
    equipment_class: 'Medium Voltage Squirrel Cage Induction Motor (6.6 kV, 1200 kW, 2-Pole)',
    plant: 'Thermal Generation Station Unit 2',
    event_timestamp: '2026-02-14T09:22:15.000Z',
    failure_symptoms: 'Sudden vibration spike on non-drive end (NDE) bearing to 11.2 mm/s RMS, followed 18 minutes later by 64R stator earth fault relay trip.',
    operational_impact: 'Trip of boiler feed water supply; boiler turbine unit ramped down by 50% capacity for 14 hours; unit de-rating cost $185,000.',
    case_status: 'AWAITING_ENGINEERING_REVIEW',
    data_mode: 'SYNTHETIC_DEMO',
    evidence_register: [
      {
        evidence_id: 'EV-MTR-01',
        source_type: 'VIBRATION_SPECTRUM',
        title: 'Bently Nevada 3500 Online Vibration Spectrum (FFT)',
        raw_content: 'NDE Bearing Overall: 11.2 mm/s RMS (ISO 10816 Zone D Danger). FFT spectrum revealed dominant peak at 2X line frequency (100 Hz) and bearing outer race ball pass frequency (BPFO) harmonics with sidebands.',
        timestamp: '2026-02-14T09:05:00Z',
        reliability: 'HIGH',
        tags: ['vibration', 'fft', 'bearing-defect'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'System 1 Online Condition Monitoring Database'
      },
      {
        evidence_id: 'EV-MTR-02',
        source_type: 'RELAY_RECORD',
        title: 'ABB REF615 Feeder Relay Residual Overvoltage / Earth Fault 64R',
        raw_content: 'Residual neutral voltage Uo reached 38% of rated phase-to-neutral voltage. Trip time: 100 ms. Stator phase U to earth insulation breakdown.',
        timestamp: '2026-02-14T09:22:15.105Z',
        reliability: 'HIGH',
        tags: ['relay', 'ground-fault', 'stator-puncture'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'ABB REF615 Disturbance Record File #DR-0214'
      },
      {
        evidence_id: 'EV-MTR-03',
        source_type: 'INSPECTION_RECORD',
        title: 'NDE Bearing Housing & Stator Visual Disassembly Inspection',
        raw_content: 'NDE insulated bearing sleeve was bridged by carbonized conductive grease mixed with metal spalling particles. Fluting / washboard markings visible on bearing outer raceway, indicating electrical bearing currents.',
        timestamp: '2026-02-15T11:00:00Z',
        reliability: 'HIGH',
        tags: ['bearing-fluting', 'shaft-current', 'insulation-damage'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Mechanical Maintenance Lead Teardown Report 2026-02-15'
      }
    ],
    event_timeline: [
      {
        timestamp: '2026-02-14T09:05:00Z',
        event: 'NDE bearing vibration alarms at 7.1 mm/s RMS, climbing rapidly to 11.2 mm/s RMS.',
        evidence_ids: ['EV-MTR-01'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 1
      },
      {
        timestamp: '2026-02-14T09:22:15.105Z',
        event: 'Severe mechanical bearing eccentricity causes stator-rotor air gap eccentricity, resulting in stator coil thermal rub and phase-to-ground flashover.',
        evidence_ids: ['EV-MTR-02'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 2
      }
    ],
    hypotheses: [
      {
        hypothesis_id: 'H-MTR-01',
        title: 'Shaft Voltage Bearing Fluting & Stator Air-Gap Eccentricity Rub',
        description: 'VFD induced common-mode voltage discharged through the NDE bearing due to degraded bearing insulation, generating electrical fluting wear. The resulting radial play caused rotor air gap eccentricity, high vibration, and eventual stator coil mechanical insulation puncture.',
        status: 'RETAINED',
        supporting_evidence_ids: ['EV-MTR-01', 'EV-MTR-02', 'EV-MTR-03'],
        contradicting_evidence_ids: [],
        missing_evidence: ['Shaft voltage and shaft grounding brush continuity log prior to trip'],
        physical_rationale: 'Electrical discharge machining (EDM) currents through rolling elements cause microscopic pitting and fluting per NEMA MG1 Part 31, rapidly destroying bearing clearance within 200 hours.',
        confidence: {
          label: 'HIGH',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 91
        },
        falsification_test: 'Inspect bearing raceway under magnification for electrical fluting ridges. Confirmed present (EV-MTR-03).',
        next_diagnostic_step: 'Measure shaft grounding brush resistance and install dual insulated hybrid ceramic bearings.'
      }
    ],
    root_cause_conclusion: {
      status: 'PROBABLE',
      approved_by_human: false,
      statement: 'NDE bearing failure caused by electrical shaft discharge currents (bearing fluting), leading to catastrophic bearing clearance collapse, rotor eccentricity, and mechanical damage to stator winding insulation resulting in 64R ground fault trip.',
      immediate_mechanism: 'Bearing mechanical destruction and stator winding ground puncture.',
      contributing_factors: [
        'Common-mode high-frequency shaft voltages from upstream pulse-width modulated (PWM) inverter',
        'Contaminated grease bridging the NDE bearing insulation barrier'
      ],
      systemic_factors: [
        'Shaft grounding brush routine maintenance inspection was not included in monthly PM checklist'
      ],
      equipment_standards_referenced: [
        'NEMA MG 1-2016 Part 31: Inverter Fed Polyphase Motors',
        'IEC 60034-14: Mechanical vibration of certain machines with shaft heights 56 mm and higher',
        'IEEE 841: Standard for Petroleum and Chemical Industry Premium-Efficiency Severe-Duty Motors'
      ]
    },
    recommended_actions: [
      {
        action_id: 'ACT-MTR-01',
        type: 'CORRECTIVE',
        description: 'Rewind stator winding with Class H VPI insulation and replace NDE bearing with hybrid ceramic ball bearing.',
        priority: 'SAFETY_CRITICAL',
        responsible_role: 'Motor Workshop Superintendent',
        dependencies: ['Motor Uncoupling and Rigging Permit'],
        verification_criteria: 'Surge comparison test 1.2/50 μs at 14 kV and core loss flux test pass within IEEE 1068 tolerances.',
        target_date: '2026-02-28',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-MTR-02',
        type: 'PREVENTIVE',
        description: 'Install AEGIS circumferential shaft grounding ring on drive end and verify NDE bearing housing insulation resistance >1 MΩ.',
        priority: 'HIGH',
        responsible_role: 'Plant Reliability Engineer',
        dependencies: ['ACT-MTR-01'],
        verification_criteria: 'Oscilloscope shaft voltage measurement < 5V peak-to-peak under full variable frequency drive load.',
        target_date: '2026-03-05',
        approval_status: 'DRAFT'
      }
    ],
    qa_review: {
      decision: 'READY_FOR_AUTHORIZED_REVIEW',
      traceability_score_pct: 95.0,
      findings: [],
      hallucination_detected: false,
      safety_policy_passed: true,
      audited_at: '2026-02-15T14:00:00Z',
      auditor_engine: 'IFIA-RedTeam-Audit-v2.4'
    },
    cmms: {
      work_order_id: 'WO-DRAFT-MTR-7741',
      mode: 'SANDBOX',
      equipment_tag: 'BFP-MTR-01B',
      problem_statement: 'High NDE bearing vibration spike (11.2 mm/s) followed by 64R stator ground fault trip.',
      failure_findings: [
        'Bearing raceway electrical fluting and loss of clearance (EV-MTR-03)',
        'FFT dominant 100 Hz and BPFO bearing defect frequencies (EV-MTR-01)',
        '64R stator earth fault trip on Phase U (EV-MTR-02)'
      ],
      work_description: 'Remove motor to certified workshop. Complete stator rewind and surge test. Install insulated NDE bearing and shaft grounding brush.',
      safety_prerequisites: [
        'LOTO on 6.6 kV vacuum contactor/breaker cubicle',
        'Verify zero mechanical energy (Boiler feed water pump suction/discharge valves isolated & tagged)',
        'Motor space heater isolated'
      ],
      inspection_hold_points: [
        'HOLD POINT 1: Factory witness of core loss test and stator surge comparison test',
        'HOLD POINT 2: Alignment laser measurement (<0.05 mm offset/angular) prior to coupling'
      ],
      parts_requiring_verification: [
        '1x SKF Hybrid Ceramic Deep Groove Ball Bearing (Insulated)',
        '1x AEGIS High-Frequency Shaft Grounding Ring Kit',
        '1x Set Class H Form-wound stator coils'
      ],
      idempotency_key: 'IDEMP-RCA-2026-MTR-03-REV1',
      work_order_status: 'DRAFT_NOT_SUBMITTED',
      submitted_at: null,
      cmms_system_reference: null
    },
    approvals: [],
    metrics: {
      investigation_start_time: '2026-02-14T10:00:00Z',
      investigation_end_time: '2026-02-15T14:30:00Z',
      elapsed_ai_minutes: 38,
      manual_baseline_days: 14,
      engineer_review_minutes: 0,
      evidence_coverage_pct: 95.0
    },
    created_at: '2026-02-14T10:15:00Z',
    updated_at: '2026-02-15T15:00:00Z'
  },
  {
    case_id: 'RCA-2026-GIS-145KV-04',
    title: '145 kV GIS SF6 Gas Pressure Lockout & UHF Partial Discharge Investigation',
    equipment_tag: '145KV-GIS-BAY03',
    equipment_class: 'High Voltage Gas-Insulated Switchgear (145 kV GIS, SF6)',
    plant: 'Coastal Grid Bulk Supply Substation West',
    event_timestamp: '2026-05-02T11:18:22.000Z',
    failure_symptoms: 'Stage 1 SF6 gas density alarm (0.58 MPa abs) escalated to Stage 2 trip/lockout (0.52 MPa abs) within 72 hours; UHF online partial discharge sensors detected continuous phase-resolved PRPD pulse clustering; circuit breaker electrical close/trip lockout asserted per IEC 62271-203.',
    operational_impact: 'Forced outage of 145 kV transmission interconnector line 3; grid N-1 security contingency breach; 45 MW generation redispatch required for 48 hours; estimated operational cost $280,000.',
    case_status: 'AWAITING_ENGINEERING_REVIEW',
    data_mode: 'SYNTHETIC_DEMO',
    evidence_register: [
      {
        evidence_id: 'EV-GIS-01',
        source_type: 'ALARM_LOG',
        title: 'WIKA Electronic SF6 Gas Density Transmitter SCADA Trend',
        raw_content: 'Bay 03 Circuit Breaker compartment gas density trend: 0.64 MPa (nominal) on 2026-04-28 -> 0.58 MPa (Stage 1 Alarm) on 2026-04-30 08:00Z -> 0.52 MPa (Stage 2 Lockout) on 2026-05-02 11:18Z. Temperature compensation active; confirmed genuine molecular loss of SF6 mass.',
        timestamp: '2026-05-02T11:18:22Z',
        reliability: 'HIGH',
        tags: ['sf6-density', 'pressure-drop', 'lockout'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'SCADA Historian Point 145KV-GIS-BAY03-DENS.PV'
      },
      {
        evidence_id: 'EV-GIS-02',
        source_type: 'RELAY_RECORD',
        title: 'Online UHF Partial Discharge Monitoring Spectrum (UHF PD)',
        raw_content: 'Internal UHF coupler sensor U-03 recorded continuous PRPD pulse activity at -42 dBm. Phase-resolved pattern shows dominant clusters at 45° and 225° on the 50 Hz voltage sine wave, typical of fixed metallic particle protrusion on interior enclosure wall.',
        timestamp: '2026-05-02T11:30:00Z',
        reliability: 'HIGH',
        tags: ['uhf-pd', 'prpd', 'insulation-monitoring'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Doble / DMS Continuous UHF PD Server Node-4'
      },
      {
        evidence_id: 'EV-GIS-03',
        source_type: 'INSPECTION_RECORD',
        title: 'SF6 Decomposition Gas Chemical Analysis (IEC 60480)',
        raw_content: 'Gas sampling tube test results: SO2 = 28.4 ppmv (limit <12 ppmv), SOF2 = 18.2 ppmv, HF = 6.1 ppmv, Moisture = 142 ppmv (dew point -28.5°C vs IEC limit 150 ppmv). Purity of SF6 dropped to 98.1%. Chemical breakdown confirms active low-energy partial discharge electrical arcing in gas.',
        timestamp: '2026-05-02T14:00:00Z',
        reliability: 'HIGH',
        tags: ['sf6-byproducts', 'so2', 'moisture', 'dielectric-breakdown'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Substation Analytical Gas Chromatography Lab Cert #SF6-2026-44'
      },
      {
        evidence_id: 'EV-GIS-04',
        source_type: 'INSPECTION_RECORD',
        title: 'Ultrasonic & Laser SF6 Optical Gas Imaging (OGI) Survey',
        raw_content: 'FLIR GF306 Optical Gas Imaging camera detected visible plume of SF6 gas emitting from Phase Y main rupture disk housing perimeter seal. Ultrasonic acoustic stethoscope (40 kHz) recorded 34 dB leak sound at lower flange gasket interface.',
        timestamp: '2026-05-02T16:30:00Z',
        reliability: 'HIGH',
        tags: ['ogi-camera', 'ultrasonic', 'flange-leak'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'High Voltage Specialist Field Leak Inspection Memo GIS-2026-05-02'
      },
      {
        evidence_id: 'EV-GIS-05',
        source_type: 'MAINTENANCE_HISTORY',
        title: 'CMMS GIS Bay Expansion Overhaul Record (18 Months Prior)',
        raw_content: 'Bay 03 assembly inspection note: "During busbar extension, OEM EPDM O-ring gasket kit was out of stock. Contractor technician installed commercially sourced fluorosilicone gasket as interim substitution. Torque wrench calibration tag expired."',
        timestamp: '2024-11-12T09:00:00Z',
        reliability: 'HIGH',
        tags: ['maintenance', 'non-conforming-part', 'gasket-substitution'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'SAP PM Work Order 40019283 - GIS Bay Extension'
      },
      {
        evidence_id: 'EV-GIS-06',
        source_type: 'OPERATOR_LOG',
        title: 'Initial Shift Operator Log - Claimed Internal Power Arc Burst',
        raw_content: 'Shift operator noted: "Loud bang heard in GIS room; suspected internal power arc flashover or rupture disk blowout."',
        timestamp: '2026-05-02T11:25:00Z',
        reliability: 'QUESTIONABLE',
        tags: ['operator-hypothesis', 'unsubstantiated'],
        is_unreliable_timestamp: false,
        contradiction_flag: true,
        source_reference: 'Control Desk Shift Handover Log'
      },
      {
        evidence_id: 'EV-GIS-07',
        source_type: 'COMMISSIONING_TEST',
        title: 'Protection Relay Fault Oscillography & Rupture Disk Inspection',
        raw_content: 'Busbar differential (87B) and breaker failure (50BF) relays inspected: Zero trip signal assertion. COMTRADE files show zero fault current. Visual and physical check of Phase Y rupture disk confirmed graphite bursting membrane is 100% intact with zero overpressure rupture.',
        timestamp: '2026-05-02T13:00:00Z',
        reliability: 'HIGH',
        tags: ['protection-audit', 'falsification-evidence', 'rupture-disk'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Protection Engineering Incident Verification Memo #PR-2026-05-02'
      }
    ],
    event_timeline: [
      {
        timestamp: '2024-11-12T09:00:00Z',
        event: 'GIS Bay expansion overhaul installs unapproved fluorosilicone O-ring gasket instead of certified EPDM seal with uncalibrated bolt torque.',
        evidence_ids: ['EV-GIS-05'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 1
      },
      {
        timestamp: '2026-04-28T00:00:00Z',
        event: 'Repeated thermal expansion cycles degrade non-conforming gasket, initiating microscopic SF6 gas leak channel across Phase Y flange.',
        evidence_ids: ['EV-GIS-01', 'EV-GIS-04'],
        fact_or_inference: 'INFERRED',
        timestamp_quality: 'ESTIMATED',
        sequence_index: 2
      },
      {
        timestamp: '2026-04-30T08:00:00Z',
        event: 'Bay 03 gas density drops to 0.58 MPa abs, asserting Stage 1 low-pressure warning to DCS SCADA.',
        evidence_ids: ['EV-GIS-01'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 3
      },
      {
        timestamp: '2026-05-02T04:00:00Z',
        event: 'Reduced SF6 gas density lowers local dielectric breakdown threshold; metallic protrusion initiates surface scintillation partial discharge.',
        evidence_ids: ['EV-GIS-02', 'EV-GIS-03'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 4
      },
      {
        timestamp: '2026-05-02T11:18:22Z',
        event: 'Compartment gas density breaches 0.52 MPa abs lockout limit; density relay asserts Stage 2 breaker tripping/closing electrical lockout.',
        evidence_ids: ['EV-GIS-01'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 5
      }
    ],
    hypotheses: [
      {
        hypothesis_id: 'H-GIS-01',
        title: 'Flange Gasket Compression Set & SF6 Micro-Leakage with UHF PD',
        description: 'Non-conforming fluorosilicone O-ring gasket suffered accelerated compression set and thermal relaxation, venting SF6 into atmosphere. The loss of gas density lowered dielectric withstand below design margin, allowing internal metallic micro-protrusions to ignite partial discharge.',
        status: 'RETAINED',
        supporting_evidence_ids: ['EV-GIS-01', 'EV-GIS-02', 'EV-GIS-03', 'EV-GIS-04', 'EV-GIS-05'],
        contradicting_evidence_ids: [],
        missing_evidence: [
          'Tensile and durometer hardness test on removed gasket to verify polymer degradation curve',
          'Internal borescopic inspection of Phase Y busbar conductor for micro-pitting'
        ],
        physical_rationale: 'In SF6 gas per Paschen curve and IEC 62271-203, dielectric breakdown voltage is directly proportional to gas density (molecular number per volume). When pressure falls from 0.64 to 0.52 MPa, dielectric strength drops by 19%, lowering the partial discharge inception voltage (PDIV) below peak operating voltage (118 kV peak phase-to-ground).',
        confidence: {
          label: 'HIGH',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 95
        },
        falsification_test: 'Recover gas and pressure-test flange with dry nitrogen at 0.7 MPa. If Phase Y rupture disk flange leaks under bubble test, hypothesis is confirmed. Disproven if flange holds vacuum < 1 mbar.',
        next_diagnostic_step: 'Perform vacuum hold test (< 1 mbar for 12 hours) and SF6 recovery using closed-loop cart.'
      },
      {
        hypothesis_id: 'H-GIS-02',
        title: 'High-Energy Internal Power Arc Flashover',
        description: 'An internal flashover between 145 kV busbar conductor and grounded aluminum enclosure occurred, generating explosive overpressure that ruptured the containment.',
        status: 'REJECTED',
        supporting_evidence_ids: ['EV-GIS-06'],
        contradicting_evidence_ids: ['EV-GIS-07'],
        missing_evidence: [],
        physical_rationale: 'An internal power arc generates fault currents >20 kA and instantly bursts the graphite rupture disk. Protection COMTRADE files confirm zero fault current and intact bursting disc, conclusively falsifying this hypothesis.',
        confidence: {
          label: 'LOW',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 5
        },
        falsification_test: 'Inspection of protection relays and rupture disk membrane. Confirmed zero trip current and intact disk (EV-GIS-07).',
        next_diagnostic_step: 'Archive relay disturbance records.'
      }
    ],
    fault_tree: {
      id: 'FT-GIS-TOP',
      label: '145 kV GIS Bay 03 Low-Pressure Lockout & UHF PD Escalation',
      type: 'TOP_EVENT',
      gate: 'AND',
      evidence_ids: ['EV-GIS-01'],
      children: [
        {
          id: 'FT-GIS-LEAK',
          label: 'Loss of SF6 Gas Containment Integrity',
          type: 'INTERMEDIATE',
          gate: 'AND',
          evidence_ids: ['EV-GIS-01', 'EV-GIS-04'],
          children: [
            {
              id: 'FT-GIS-BE1',
              label: 'Non-Conforming Gasket Material Substituted During Prior Expansion',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-GIS-05'],
              children: []
            },
            {
              id: 'FT-GIS-BE2',
              label: 'Flange Bolt Relaxation Under Thermal Cycling',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-GIS-04'],
              children: []
            }
          ]
        },
        {
          id: 'FT-GIS-DIELECTRIC',
          label: 'Degradation of Dielectric Gap Insulation Strength',
          type: 'INTERMEDIATE',
          gate: 'SINGLE',
          evidence_ids: ['EV-GIS-02', 'EV-GIS-03'],
          children: [
            {
              id: 'FT-GIS-BE3',
              label: 'Reduced Gas Density Lowers Partial Discharge Inception Voltage',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-GIS-02'],
              children: []
            }
          ]
        }
      ]
    },
    root_cause_conclusion: {
      status: 'PROBABLE',
      approved_by_human: false,
      statement: 'The immediate mechanism was SF6 gas leakage across the Phase Y rupture disk flange perimeter seal, reducing gas density to 0.52 MPa abs and initiating internal UHF partial discharge. The technical root cause was non-conforming gasket material (fluorosilicone substituted for OEM EPDM) combined with uncalibrated flange bolt torque during prior overhaul. Systemic root cause was the lack of vendor-approved gasket parts inventory and insufficient quality control hold points during GIS maintenance.',
      immediate_mechanism: 'Flange O-ring seal extrusion and slow SF6 leakage reducing dielectric density to lockout threshold.',
      contributing_factors: [
        'Seasonal thermal expansion/contraction of outdoor GIS ductwork',
        'Contaminated SF6 gas containing elevated SO2 and SOF2 decomposition products',
        'Absence of automated continuous mass-leakage rate alarming in SCADA'
      ],
      systemic_factors: [
        'Maintenance parts substitution procedure allowed uncertified gasket material without Chief Electrical Engineer MOC approval',
        'GIS torque wrench calibration governance lapsed'
      ],
      equipment_standards_referenced: [
        'IEC 62271-203: High-voltage switchgear - Gas-insulated metal-enclosed switchgear',
        'IEC 60480: Specifications for the reuse of sulfur hexafluoride (SF6) and its mixtures',
        'IEEE C37.122: IEEE Standard for High Voltage Gas-Insulated Substations'
      ]
    },
    recommended_actions: [
      {
        action_id: 'ACT-GIS-01',
        type: 'CORRECTIVE',
        description: 'Evacuate and reclaim SF6 gas using certified DILO recovery cart; replace Phase Y rupture disk flange gasket with certified OEM EPDM seal; torque to OEM specification (45 Nm).',
        priority: 'SAFETY_CRITICAL',
        responsible_role: 'Certified High Voltage GIS Specialist',
        dependencies: ['Approved LOTO Permit', 'SF6 Gas Handling Certification'],
        verification_criteria: 'Vacuum hold test < 1.0 mbar for 12 hours with zero rise; 24-hour SF6 pressure hold test at 0.64 MPa abs with zero measurable leakage.',
        target_date: '2026-05-06',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-GIS-02',
        type: 'VERIFICATION',
        description: 'Conduct comprehensive UHF partial discharge survey and gas purity test post-gas replenishment.',
        priority: 'HIGH',
        responsible_role: 'Substation Condition Monitoring Lead',
        dependencies: ['ACT-GIS-01'],
        verification_criteria: 'UHF PD activity below -65 dBm noise floor; SF6 gas purity > 99.5% with SO2 < 1 ppmv.',
        target_date: '2026-05-08',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-GIS-03',
        type: 'PREVENTIVE',
        description: 'Audit spare gasket inventory across all GIS substations; institute strict barcode tracking prohibiting non-OEM elastomeric seal substitutions.',
        priority: 'HIGH',
        responsible_role: 'Plant Asset Management Lead',
        dependencies: [],
        verification_criteria: 'Zero non-compliant seals in warehouse inventory and ERP bill of materials locked.',
        target_date: '2026-05-30',
        approval_status: 'DRAFT'
      }
    ],
    qa_review: {
      decision: 'READY_FOR_AUTHORIZED_REVIEW',
      traceability_score_pct: 97.2,
      findings: [],
      hallucination_detected: false,
      safety_policy_passed: true,
      audited_at: '2026-05-02T18:00:00Z',
      auditor_engine: 'IFIA-RedTeam-Audit-v2.4'
    },
    cmms: {
      work_order_id: 'WO-DRAFT-GIS-9914',
      mode: 'SANDBOX',
      equipment_tag: '145KV-GIS-BAY03',
      problem_statement: 'Stage 2 SF6 low-pressure density lockout (0.52 MPa) and active UHF partial discharge (-42 dBm); Phase Y flange seal leaking.',
      failure_findings: [
        'SF6 density drop from 0.64 to 0.52 MPa abs (EV-GIS-01)',
        'Optical gas imaging verified SF6 leak at Phase Y flange (EV-GIS-04)',
        'SO2 decomposition gas measured at 28.4 ppmv confirming low-energy electrical discharge (EV-GIS-03)'
      ],
      work_description: 'Strict LOTO. Reclaim SF6 gas to recovery cylinders. Replace Phase Y flange O-ring with certified OEM EPDM gasket. Pull vacuum < 1 mbar for 12 hours. Refill virgin SF6 to 0.64 MPa abs. Perform UHF PD baseline.',
      safety_prerequisites: [
        'Electrical Permit to Work on 145 kV GIS Bay 03',
        'Double electrical isolation on incoming transmission line and busbar disconnectors',
        'Earthing switches closed and locked on both sides of circuit breaker compartment',
        'Personal SF6 / SO2 oxygen depletion and toxic gas detector worn by all personnel'
      ],
      inspection_hold_points: [
        'HOLD POINT 1: Certified Inspector witness of removed O-ring seal inspection and flange groove cleaning',
        'HOLD POINT 2: Witness vacuum drop test (<1 mbar for 12 hours)',
        'HOLD POINT 3: Final torque check verification with calibrated torque wrench (45 Nm)'
      ],
      parts_requiring_verification: [
        '1x OEM EPDM Flange O-Ring Seal Kit (Part #ABB-ELK-145-GSK) - REQUIRES VERIFICATION',
        '100 kg Virgin SF6 Gas Cylinder (IEC 60376 compliant) - IN STOCK',
        '1x Molecular Sieve Desiccant Filter Cartridge'
      ],
      idempotency_key: 'IDEMP-RCA-2026-GIS-145KV-04-REV1',
      work_order_status: 'DRAFT_NOT_SUBMITTED',
      submitted_at: null,
      cmms_system_reference: null
    },
    approvals: [],
    metrics: {
      investigation_start_time: '2026-05-02T12:00:00Z',
      investigation_end_time: '2026-05-02T18:30:00Z',
      elapsed_ai_minutes: 48,
      manual_baseline_days: 14,
      engineer_review_minutes: 0,
      evidence_coverage_pct: 97.2
    },
    created_at: '2026-05-02T12:15:00Z',
    updated_at: '2026-05-02T18:35:00Z'
  },
  {
    case_id: 'RCA-2026-CBL-11KV-05',
    title: '11 kV XLPE Feeder Cable Termination Stress Cone Thermal Runaway & Flashover',
    equipment_tag: '11KV-FDR-CBL-04',
    equipment_class: '11 kV 3-Core 300 mm² XLPE Underground Cable & Cold-Shrink Termination',
    plant: 'Chemical Processing Plant - Substation Sub-C',
    event_timestamp: '2026-06-18T16:40:05.110Z',
    failure_symptoms: 'Feeder vacuum breaker tripped on instantaneous earth fault 50N (6.84 kA in 68 ms); cable compartment explosion relief flap operated; Red Phase cable termination completely carbonized and fractured; heavy fire damage inside cable spoot box.',
    operational_impact: 'Total loss of 11 kV power to polymer extrusion line 02; critical molten polymer solidified in extrusion barrels; production restart delayed by 36 hours; estimated plant downtime loss $310,000.',
    case_status: 'AWAITING_ENGINEERING_REVIEW',
    data_mode: 'SYNTHETIC_DEMO',
    evidence_register: [
      {
        evidence_id: 'EV-CBL-01',
        source_type: 'RELAY_RECORD',
        title: 'Schneider Micom P142 Feeder Management Relay Fault COMTRADE Record',
        raw_content: 'Timestamp: 2026-06-18T16:40:05.110Z. Trip assertion: 50N instantaneous ground fault. Fault Current: Ir=6,840 A, Iy=280 A, Ib=275 A, In=6,790 A. Duration to primary contact parting: 68.2 ms.',
        timestamp: '2026-06-18T16:40:05.110Z',
        reliability: 'HIGH',
        tags: ['relay', 'ground-fault', '6.8ka-trip'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Relay Waveform COMTRADE Archive Sub-C_Bay4.cfg'
      },
      {
        evidence_id: 'EV-CBL-02',
        source_type: 'THERMOGRAPHY_REPORT',
        title: 'Quarterly Infrared Thermography Survey Report (3 Weeks Prior)',
        raw_content: 'Thermogram IR-2026-05-28 recorded Red Phase cable stress cone at 88.4°C while Yellow/Blue phases operated at 42.1°C (ambient 29.5°C) under 62% rated load. Temperature delta = +46.3°C. Report classified condition as "Priority 1 Severe Critical Hotspot - Immediate Work Order Required".',
        timestamp: '2026-05-28T14:15:00Z',
        reliability: 'HIGH',
        tags: ['thermography', 'hotspot', 'thermal-runaway'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Certified Condition Monitoring Thermography Audit #CM-2026-05'
      },
      {
        evidence_id: 'EV-CBL-03',
        source_type: 'INSPECTION_RECORD',
        title: 'Forensic Teardown & Stress Cone Dissection Examination',
        raw_content: 'Teardown of failed Red Phase termination revealed semiconductor screen cutback edge was jagged with utility knife score marks penetrating 0.8 mm into virgin XLPE insulation. Stress control mastic sleeve was mispositioned 25 mm below the semi-con step, leaving an unshielded high electric field gradient pocket.',
        timestamp: '2026-06-19T10:00:00Z',
        reliability: 'HIGH',
        tags: ['forensic', 'workmanship-defect', 'semi-con-cutback'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Cable Failure Forensic Specialist Teardown Memo #CF-2026-06-19'
      },
      {
        evidence_id: 'EV-CBL-04',
        source_type: 'MAINTENANCE_HISTORY',
        title: 'CMMS Work Order WO-2026-3810 (Thermography Follow-Up)',
        raw_content: 'CMMS task created following Priority 1 thermogram alert on 2026-05-29. Maintenance planner note: "Cable termination re-termination parts kit not in stock; deferred to upcoming plant turnaround scheduled in 6 weeks."',
        timestamp: '2026-05-29T11:00:00Z',
        reliability: 'HIGH',
        tags: ['maintenance', 'deferred-work', 'stockout'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Enterprise CMMS Record WO-2026-3810'
      },
      {
        evidence_id: 'EV-CBL-05',
        source_type: 'OPERATOR_LOG',
        title: 'Initial Shift Log - Claimed Rodent Intrusion Flashover',
        raw_content: 'Shift electrician initial note: "Flashover was probably caused by a rat or squirrel entering through cable trench gland plate."',
        timestamp: '2026-06-18T17:15:00Z',
        reliability: 'QUESTIONABLE',
        tags: ['operator-hypothesis', 'unsubstantiated'],
        is_unreliable_timestamp: false,
        contradiction_flag: true,
        source_reference: 'Substation Shift Log Sheet Page 104'
      },
      {
        evidence_id: 'EV-CBL-06',
        source_type: 'INSPECTION_RECORD',
        title: 'Cable Compartment Gland Plate & Enclosure Integrity Audit',
        raw_content: 'Physical inspection of cable entry box: Brass gland plate, neoprene transit frames, and stainless steel rodent mesh were 100% intact with zero gaps or chewing marks. Zero animal carcass or biological debris present. Rodent hypothesis conclusively disproven.',
        timestamp: '2026-06-18T18:30:00Z',
        reliability: 'HIGH',
        tags: ['falsification-evidence', 'enclosure-audit', 'rodent-disproven'],
        is_unreliable_timestamp: false,
        contradiction_flag: false,
        source_reference: 'Lead Electrical Safety Inspector Inspection Report 2026-06-18'
      }
    ],
    event_timeline: [
      {
        timestamp: '2025-08-14T11:00:00Z',
        event: 'Contractor installs 11 kV cold-shrink termination with scored XLPE insulation and displaced stress control mastic.',
        evidence_ids: ['EV-CBL-03'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 1
      },
      {
        timestamp: '2026-05-28T14:15:00Z',
        event: 'Infrared thermography detects severe 88.4°C thermal hotspot (+46.3°C delta) on Red Phase stress cone, categorized Priority 1.',
        evidence_ids: ['EV-CBL-02'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 2
      },
      {
        timestamp: '2026-05-29T11:00:00Z',
        event: 'Maintenance work order WO-2026-3810 is deferred 6 weeks due to parts stockout without derating cable current.',
        evidence_ids: ['EV-CBL-04'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 3
      },
      {
        timestamp: '2026-06-18T16:35:00Z',
        event: 'Intense dielectric heating and partial discharge erosion puncture through degraded XLPE core insulation.',
        evidence_ids: ['EV-CBL-02', 'EV-CBL-03'],
        fact_or_inference: 'INFERRED',
        timestamp_quality: 'ESTIMATED',
        sequence_index: 4
      },
      {
        timestamp: '2026-06-18T16:40:05.110Z',
        event: 'Red Phase dielectric breakdown initiates 6.84 kA earth fault arc; Schneider relay asserts trip in 68.2 ms.',
        evidence_ids: ['EV-CBL-01'],
        fact_or_inference: 'OBSERVED',
        timestamp_quality: 'SOURCE_RECORDED',
        sequence_index: 5
      }
    ],
    hypotheses: [
      {
        hypothesis_id: 'H-CBL-01',
        title: 'Improper Semi-Con Cutback & Stress Cone Thermal Runaway',
        description: 'Mechanical scoring of the XLPE core and longitudinal mispositioning of the stress control mastic concentrated electrical field lines at the semiconductor step. Continuous partial discharge at the geometric singularity caused localized I²R/dielectric heating (88.4°C), accelerating thermal aging until dielectric breakdown occurred.',
        status: 'RETAINED',
        supporting_evidence_ids: ['EV-CBL-01', 'EV-CBL-02', 'EV-CBL-03', 'EV-CBL-04'],
        contradicting_evidence_ids: [],
        missing_evidence: [
          'VLF Tan Delta (IEEE 400.2) historical baseline records for the cable circuit'
        ],
        physical_rationale: 'In medium-voltage extruded cables, the electric field at the earth screen termination must be smoothly graded using high-permittivity mastic or geometric stress cones per IEEE 48. When the mastic is displaced by 25 mm, the longitudinal stress field exceeds the 3.0 kV/mm air ionization limit, triggering destructive slot discharge and thermal runaway.',
        confidence: {
          label: 'HIGH',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 96
        },
        falsification_test: 'Dissect termination and examine semi-con screen cutback. Verified: 0.8 mm knife scores and 25 mm mastic displacement confirmed by forensic inspection (EV-CBL-03).',
        next_diagnostic_step: 'Carry out 0.1 Hz Very Low Frequency (VLF) Withstand and Tan Delta test on Yellow and Blue unaffected phases.'
      },
      {
        hypothesis_id: 'H-CBL-02',
        title: 'Vermin / Rodent Intrusion Phase Flashover',
        description: 'A rodent entered the cable compartment and bridged the Red Phase termination to the grounded steel frame.',
        status: 'REJECTED',
        supporting_evidence_ids: ['EV-CBL-05'],
        contradicting_evidence_ids: ['EV-CBL-06'],
        missing_evidence: [],
        physical_rationale: 'Rodent flashovers leave biological skeletal remains and require compromised enclosure entry seals. Inspection EV-CBL-06 verified 100% intact vermin proofing and zero biological contamination.',
        confidence: {
          label: 'LOW',
          type: 'QUALITATIVE_MODEL_ASSESSMENT',
          calibrated: false,
          heuristic_score: 4
        },
        falsification_test: 'Inspection of gland plate and enclosure seals. Intact seals conclusively falsify rodent intrusion (EV-CBL-06).',
        next_diagnostic_step: 'None required.'
      }
    ],
    fault_tree: {
      id: 'FT-CBL-TOP',
      label: '11 kV Feeder Cable Red Phase Termination Flashover (6.84 kA Trip)',
      type: 'TOP_EVENT',
      gate: 'AND',
      evidence_ids: ['EV-CBL-01'],
      children: [
        {
          id: 'FT-CBL-FIELD',
          label: 'High Electrical Field Concentration at Termination Step',
          type: 'INTERMEDIATE',
          gate: 'AND',
          evidence_ids: ['EV-CBL-03'],
          children: [
            {
              id: 'FT-CBL-BE1',
              label: 'Utility Knife Scoring into XLPE Core During Stripping',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-CBL-03'],
              children: []
            },
            {
              id: 'FT-CBL-BE2',
              label: 'Stress Relief Mastic Mispositioned by 25 mm',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-CBL-03'],
              children: []
            }
          ]
        },
        {
          id: 'FT-CBL-SYSTEMIC',
          label: 'Deferred Defect Management Failure',
          type: 'INTERMEDIATE',
          gate: 'SINGLE',
          evidence_ids: ['EV-CBL-02', 'EV-CBL-04'],
          children: [
            {
              id: 'FT-CBL-BE3',
              label: 'Priority 1 Thermography Hotspot Deferred Due to Parts Stockout',
              type: 'BASIC_EVENT',
              evidence_ids: ['EV-CBL-04'],
              children: []
            }
          ]
        }
      ]
    },
    root_cause_conclusion: {
      status: 'PROBABLE',
      approved_by_human: false,
      statement: 'The immediate mechanism was dielectric puncture and phase-to-ground flashover across the Red Phase cold-shrink cable termination. The technical root cause was severe electric field stress concentration resulting from improper semiconductor cutback (utility knife score marks) and longitudinal mispositioning of the stress control mastic. The systemic root cause was the deferral of Priority 1 thermography alert WO-2026-3810 (88.4°C hotspot) without current load de-rating or interim monitoring.',
      immediate_mechanism: 'Thermal runaway and dielectric puncture of XLPE core insulation at stress cone boundary.',
      contributing_factors: [
        'Prolonged operation under 60% rated current load with active 88.4°C localized thermal hotspot',
        'Use of uncalibrated manual cutting blade instead of precision rotary semi-con peeling tool'
      ],
      systemic_factors: [
        'Lack of mandatory jointer competency certification and independent quality witness hold points during cable termination',
        'Defect management policy allowed unilateral deferral of Priority 1 thermal anomalies'
      ],
      equipment_standards_referenced: [
        'IEEE 48: Standard Test Procedures and Requirements for Alternating-Current Cable Terminations',
        'IEEE 400.2: Guide for Field Testing of Shielded Power Cable Systems Using VLF',
        'IEC 60502-2: Power cables with extruded insulation for rated voltages from 6 kV up to 30 kV'
      ]
    },
    recommended_actions: [
      {
        action_id: 'ACT-CBL-01',
        type: 'CORRECTIVE',
        description: 'Cut back damaged 11 kV cable by 1.5 meters; dress and prepare cable ends using approved rotary peeling tools; install new certified 11 kV 3-core cold-shrink termination kit.',
        priority: 'SAFETY_CRITICAL',
        responsible_role: 'Certified High Voltage Cable Jointer',
        dependencies: ['Approved LOTO Isolation Permit', 'Gas Testing in Cable Spoot'],
        verification_criteria: 'VLF Withstand Test at 19 kV rms (3x Uo) for 15 minutes with zero breakdown; VLF Tan Delta < 1.2 x 10⁻³.',
        target_date: '2026-06-22',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-CBL-02',
        type: 'PREVENTIVE',
        description: 'Mandate rotary semi-con peeling tools and ban utility knife scoring across all company cable termination procedures.',
        priority: 'HIGH',
        responsible_role: 'Plant Reliability Engineering Director',
        dependencies: [],
        verification_criteria: 'Updated Electrical Standard Operating Procedure SOP-HV-CBL-01 approved and circulated.',
        target_date: '2026-07-05',
        approval_status: 'DRAFT'
      },
      {
        action_id: 'ACT-CBL-03',
        type: 'VERIFICATION',
        description: 'Perform baseline infrared thermography inspection at 24 hours and 7 days post-energization under full load.',
        priority: 'MEDIUM',
        responsible_role: 'Condition Monitoring Specialist',
        dependencies: ['ACT-CBL-01'],
        verification_criteria: 'Termination surface temperature < 45°C and phase-to-phase delta T < 3.0°C.',
        target_date: '2026-06-29',
        approval_status: 'DRAFT'
      }
    ],
    qa_review: {
      decision: 'READY_FOR_AUTHORIZED_REVIEW',
      traceability_score_pct: 98.4,
      findings: [],
      hallucination_detected: false,
      safety_policy_passed: true,
      audited_at: '2026-06-19T14:00:00Z',
      auditor_engine: 'IFIA-RedTeam-Audit-v2.4'
    },
    cmms: {
      work_order_id: 'WO-DRAFT-CBL-8190',
      mode: 'SANDBOX',
      equipment_tag: '11KV-FDR-CBL-04',
      problem_statement: 'Red Phase 11 kV cable termination dielectric puncture and 6.84 kA ground fault flashover following unaddressed 88.4°C hotspot.',
      failure_findings: [
        'Red Phase stress cone flashover cleared by relay in 68.2 ms (EV-CBL-01)',
        'Forensic confirmation of semi-con cutback score marks and 25 mm mastic displacement (EV-CBL-03)',
        'Unaddressed Priority 1 hotspot deferred 3 weeks prior (EV-CBL-02, EV-CBL-04)'
      ],
      work_description: 'Strict LOTO. Cut back cable. Install new 11 kV cold-shrink termination kit using rotary peeling tool. Perform VLF withstand and Tan Delta tests. Reconnect and torque to 45 Nm.',
      safety_prerequisites: [
        'Electrical Permit to Work on 11 kV Feeder 04',
        'Upstream breaker racked out and locked in test/disconnected position',
        'Earthing truck / ground switch racked in and locked',
        'Confirm zero voltage on cable tails with calibrated high-voltage proximity wand'
      ],
      inspection_hold_points: [
        'HOLD POINT 1: Certified Inspector witness of semi-con screen cutback before mastic application (zero knife scores)',
        'HOLD POINT 2: Witness VLF 19 kV withstand test for 15 minutes',
        'HOLD POINT 3: Witness calibrated torque wrench tightening on copper palm connection'
      ],
      parts_requiring_verification: [
        '1x 11 kV 3-Core 300 mm² Cold-Shrink Indoor Termination Kit (3M / Raychem) - IN STOCK',
        '3x High-Conductivity Shear-Bolt Mechanical Cable Lugs (M12)',
        '1x Cold-Shrink Trifurcating Breakout Boot'
      ],
      idempotency_key: 'IDEMP-RCA-2026-CBL-11KV-05-REV1',
      work_order_status: 'DRAFT_NOT_SUBMITTED',
      submitted_at: null,
      cmms_system_reference: null
    },
    approvals: [],
    metrics: {
      investigation_start_time: '2026-06-18T17:00:00Z',
      investigation_end_time: '2026-06-19T14:30:00Z',
      elapsed_ai_minutes: 40,
      manual_baseline_days: 14,
      engineer_review_minutes: 0,
      evidence_coverage_pct: 98.4
    },
    created_at: '2026-06-18T17:15:00Z',
    updated_at: '2026-06-19T14:35:00Z'
  }
];

