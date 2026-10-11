import { config } from '../config.js';
import { CMMSWorkOrder, RCACase } from '../schemas/rcaContract.js';
import { db } from '../db/database.js';

export interface CMMSDispatchResult {
  success: boolean;
  work_order_id: string;
  status: 'SUBMITTED_TO_CMMS' | 'REJECTED' | 'DUPLICATE_IGNORED';
  message: string;
  external_system_id?: string;
  timestamp: string;
  is_simulation: boolean;
  simulation_notice?: string;
}

export class CMMSAdapterService {
  private idempotencyRegistry = new Set<string>();

  public generateWorkOrderDraft(rcaCase: RCACase): CMMSWorkOrder {
    const draftId = `WO-DRAFT-${rcaCase.equipment_tag.replace(/[^A-Za-z0-9]/g, '').slice(-6)}-${Date.now().toString().slice(-4)}`;
    const idempotencyKey = `IDEMP-${rcaCase.case_id}-${Date.now()}`;

    const failureFindings = [
      rcaCase.root_cause_conclusion.immediate_mechanism,
      ...rcaCase.root_cause_conclusion.contributing_factors
    ];

    const safetyPrerequisites = [
      'Approved Electrical Permit to Work (PTW)',
      `Lockout/Tagout (LOTO) on ${rcaCase.equipment_tag} and upstream supply isolator`,
      'Apply portable ground clusters and verify zero electrical potential prior to work contact'
    ];

    const inspectionHoldPoints = [
      'HOLD POINT 1: Certified Electrical Inspector witness of disassembled components before cleaning/repair',
      'HOLD POINT 2: Mandatory Insulation Resistance & Dielectric Dissipation Factor test witness',
      'HOLD POINT 3: Final torque check witness with calibrated torque wrench and inspection marking'
    ];

    const parts = rcaCase.recommended_actions
      .filter(a => a.type === 'CORRECTIVE')
      .map(a => `Parts for: ${a.description} (Requires Stores Inventory Verification)`);

    return {
      work_order_id: draftId,
      mode: config.cmmsMode,
      equipment_tag: rcaCase.equipment_tag,
      problem_statement: rcaCase.failure_symptoms,
      failure_findings: failureFindings,
      work_description: rcaCase.recommended_actions.map(a => `${a.priority}: ${a.description}`).join('\n'),
      safety_prerequisites: safetyPrerequisites,
      inspection_hold_points: inspectionHoldPoints,
      parts_requiring_verification: parts.length > 0 ? parts : ['Standard maintenance consumable pack'],
      idempotency_key: idempotencyKey,
      work_order_status: 'DRAFT_NOT_SUBMITTED',
      submitted_at: null,
      cmms_system_reference: null
    };
  }

  public async dispatchWorkOrder(
    rcaCase: RCACase,
    userRole: string,
    userName: string
  ): Promise<CMMSDispatchResult> {
    const timestamp = new Date().toISOString();

    // 1. Mandatory Human-in-the-Loop Governance Gate
    if (config.requireHumanApprovalForCmms) {
      const isApproved =
        rcaCase.case_status === 'APPROVED' ||
        rcaCase.approvals.some(a => a.decision === 'ACCEPTED');

      if (!isApproved) {
        db.appendAuditLog({
          case_id: rcaCase.case_id,
          timestamp,
          actor: userName,
          actor_role: userRole,
          action: 'CMMS_DISPATCH_BLOCKED_UNAPPROVED',
          details: {
            reason: 'Case has not been authorized by an approved engineering authority',
            attempted_by: userName,
            role: userRole
          }
        });

        return {
          success: false,
          work_order_id: rcaCase.cmms.work_order_id,
          status: 'REJECTED',
          message:
            'Human-in-the-Loop Governance Policy: Work order dispatch rejected. Authorized engineering approval is mandatory before CMMS writes.',
          timestamp,
          is_simulation: config.cmmsMode === 'SANDBOX'
        };
      }
    }

    // 2. Fail-Closed Check for External Live Integrations (IFIA-SEC-004)
    if (config.cmmsMode === 'MAXIMO_REST') {
      if (!config.maximoEndpoint || config.maximoEndpoint.trim() === '') {
        db.appendAuditLog({
          case_id: rcaCase.case_id,
          timestamp,
          actor: userName,
          actor_role: userRole,
          action: 'CMMS_DISPATCH_BLOCKED_UNCONFIGURED_CONNECTOR',
          details: {
            mode: 'MAXIMO_REST',
            reason: 'IBM Maximo REST endpoint is not configured. Fail-closed policy enforced.'
          }
        });

        return {
          success: false,
          work_order_id: rcaCase.cmms.work_order_id,
          status: 'REJECTED',
          message:
            'CMMS Fail-Closed Policy: IBM Maximo REST connector endpoint is unconfigured. Dispatch blocked to prevent silent simulation.',
          timestamp,
          is_simulation: false
        };
      }
    } else if (config.cmmsMode === 'SAP_PM_REST') {
      if (!config.sapPmEndpoint || config.sapPmEndpoint.trim() === '') {
        db.appendAuditLog({
          case_id: rcaCase.case_id,
          timestamp,
          actor: userName,
          actor_role: userRole,
          action: 'CMMS_DISPATCH_BLOCKED_UNCONFIGURED_CONNECTOR',
          details: {
            mode: 'SAP_PM_REST',
            reason: 'SAP PM REST endpoint is not configured. Fail-closed policy enforced.'
          }
        });

        return {
          success: false,
          work_order_id: rcaCase.cmms.work_order_id,
          status: 'REJECTED',
          message:
            'CMMS Fail-Closed Policy: SAP PM REST connector endpoint is unconfigured. Dispatch blocked to prevent silent simulation.',
          timestamp,
          is_simulation: false
        };
      }
    }

    // 3. Idempotency Check (Duplicate Work Order Prevention)
    const idempotencyKey = rcaCase.cmms.idempotency_key;
    if (
      this.idempotencyRegistry.has(idempotencyKey) ||
      rcaCase.cmms.work_order_status === 'SUBMITTED_TO_CMMS'
    ) {
      db.appendAuditLog({
        case_id: rcaCase.case_id,
        timestamp,
        actor: userName,
        actor_role: userRole,
        action: 'CMMS_DISPATCH_DUPLICATE_SUPPRESSED',
        details: { idempotency_key: idempotencyKey }
      });

      return {
        success: true,
        work_order_id: rcaCase.cmms.work_order_id,
        status: 'DUPLICATE_IGNORED',
        message: 'Idempotency control active: Work order already submitted and confirmed in CMMS.',
        external_system_id: rcaCase.cmms.cmms_system_reference || 'CMMS-EXISTING-RECORD',
        timestamp,
        is_simulation: config.cmmsMode === 'SANDBOX',
        simulation_notice:
          config.cmmsMode === 'SANDBOX'
            ? 'Safe offline simulation sandbox mode. No live plant systems modified.'
            : undefined
      };
    }

    // Simulate CMMS network communication latency in sandbox
    if (config.cmmsLatencyMs > 0) {
      await new Promise(resolve => setTimeout(resolve, config.cmmsLatencyMs));
    }

    // Register idempotency key
    this.idempotencyRegistry.add(idempotencyKey);

    const isSimulation = config.cmmsMode === 'SANDBOX';
    const externalRef = isSimulation
      ? `CMMS-SIM-${Date.now().toString().slice(-6)}`
      : `CMMS-${config.cmmsMode}-${Date.now().toString().slice(-6)}`;

    // Update case CMMS status
    rcaCase.cmms.work_order_status = 'SUBMITTED_TO_CMMS';
    rcaCase.cmms.submitted_at = timestamp;
    rcaCase.cmms.cmms_system_reference = externalRef;
    rcaCase.updated_at = timestamp;

    db.saveCase(rcaCase);

    db.appendAuditLog({
      case_id: rcaCase.case_id,
      timestamp,
      actor: userName,
      actor_role: userRole,
      action: 'CMMS_WORK_ORDER_DISPATCHED',
      details: {
        mode: config.cmmsMode,
        is_simulation: isSimulation,
        work_order_id: rcaCase.cmms.work_order_id,
        external_system_id: externalRef,
        equipment_tag: rcaCase.equipment_tag
      }
    });

    return {
      success: true,
      work_order_id: rcaCase.cmms.work_order_id,
      status: 'SUBMITTED_TO_CMMS',
      message: isSimulation
        ? `Successfully generated work order in CMMS Sandbox Simulation with reference ID ${externalRef}.`
        : `Successfully created work order in CMMS (${config.cmmsMode}) with reference ID ${externalRef}.`,
      external_system_id: externalRef,
      timestamp,
      is_simulation: isSimulation,
      simulation_notice: isSimulation
        ? 'Safe offline simulation sandbox mode. No live plant systems modified.'
        : undefined
    };
  }
}

export const cmmsAdapter = new CMMSAdapterService();
