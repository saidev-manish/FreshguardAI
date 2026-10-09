export type AuditEventType = 
  | 'APPROVAL'
  | 'MODIFICATION'
  | 'REJECTION'
  | 'GENERATION'
  | 'SIMULATION';

export interface AuditEvent {
  id: string;
  timestamp: string;
  recommendationId: string;
  productId: string;
  productName: string;
  proposedAction: string;
  decision: string;
  status: 'PENDING' | 'APPROVED' | 'EDITED' | 'REJECTED';
  reviewer: string;
  notes: string;
  source: 'LOCAL_DEMO' | 'COORDINATOR_SIM';
}
