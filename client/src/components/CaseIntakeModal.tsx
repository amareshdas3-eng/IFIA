import React, { useState } from 'react';
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface CaseIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    equipment_tag: string;
    equipment_class: string;
    plant: string;
    event_timestamp: string;
    failure_symptoms: string;
    operational_impact: string;
    raw_evidence?: any[];
  }) => Promise<void>;
}

export const CaseIntakeModal: React.FC<CaseIntakeModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [equipmentTag, setEquipmentTag] = useState<string>('6.6KV-SWG-BAY02');
  const [equipmentClass, setEquipmentClass] = useState<string>('Medium Voltage Switchgear (6.6 kV AIS)');
  const [plant, setPlant] = useState<string>('Petrochemical Complex - Substation 01');
  const [title, setTitle] = useState<string>('6.6 kV Feeder Breaker Trip & Partial Discharge Investigation');
  const [symptoms, setSymptoms] = useState<string>(
    'Feeder breaker tripped on 51 overcurrent and 50N earth fault; abnormal ozone odor detected in cable compartment; transient earth voltage (TEV) sensor reading exceeded 32 dBmV prior to lockout.'
  );
  const [impact, setImpact] = useState<string>(
    'Loss of primary cooling water pump 02; standby pump auto-started within 8 seconds; unit load curtailed by 15%.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        equipment_tag: equipmentTag,
        equipment_class: equipmentClass,
        plant,
        event_timestamp: new Date().toISOString(),
        failure_symptoms: symptoms,
        operational_impact: impact,
        raw_evidence: [
          {
            evidence_id: 'EV-INT-001',
            source_type: 'RELAY_RECORD',
            title: 'Feeder Relay Trip Event Log',
            raw_content: 'Relay asserting 50N instantaneous earth fault with 4,200 A peak current.',
            timestamp: new Date().toISOString(),
            reliability: 'HIGH',
            tags: ['relay', 'trip'],
            source_reference: 'Relay Log File Bay 02'
          },
          {
            evidence_id: 'EV-INT-002',
            source_type: 'ALARM_LOG',
            title: 'DCS Partial Discharge Alarm',
            raw_content: 'TEV sensor recorded 32 dBmV spike at 10 minutes prior to trip assertion.',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            reliability: 'HIGH',
            tags: ['partial-discharge', 'tev'],
            source_reference: 'Substation Online Condition Monitor'
          }
        ]
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card-panel w-full max-w-2xl p-6 bg-slate-900 border-sky-500/50 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-sky-400" />
            <h3 className="text-base font-bold text-white">Intake New Industrial Failure Case</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Equipment Tag</label>
              <input
                type="text"
                value={equipmentTag}
                onChange={(e) => setEquipmentTag(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Equipment Class</label>
              <input
                type="text"
                value={equipmentClass}
                onChange={(e) => setEquipmentClass(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Plant Location / Unit</label>
              <input
                type="text"
                value={plant}
                onChange={(e) => setPlant(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Investigation Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Observed Failure Symptoms & Alarms</label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Operational & Production Impact</label>
            <textarea
              rows={2}
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800 text-sky-200 text-[11px] flex items-start gap-2">
            <AlertCircle size={14} className="text-sky-400 mt-0.5 flex-shrink-0" />
            <div>
              The intake pipeline will normalize timestamps, extract evidence records, build an event timeline, generate competing hypotheses, execute Prompt 6 Red-Team QA, and stage a draft CMMS work order.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-sky-900/30"
            >
              <Plus size={14} />
              {isSubmitting ? 'Running Investigation...' : 'Initiate AI Investigation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
