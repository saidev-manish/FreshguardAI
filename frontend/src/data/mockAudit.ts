import { AuditEvent } from '../types/audit';

export const MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'AUD-901',
    timestamp: '2026-10-09 10:45:12 AM',
    recommendationId: 'REC-2026-104',
    productId: 'PROD-BRD-002',
    productName: 'Artisan Sourdough Loaf 500g',
    proposedAction: '50% Flash Evening Markdown',
    decision: 'APPROVED',
    status: 'APPROVED',
    reviewer: 'Store Manager Alex',
    notes: 'Approved for 16:00 evening bakery section special.',
    source: 'LOCAL_DEMO'
  },
  {
    id: 'AUD-902',
    timestamp: '2026-10-09 09:15:40 AM',
    recommendationId: 'REC-2026-105',
    productId: 'PROD-YOG-004',
    productName: 'Greek Plain Yogurt 500g',
    proposedAction: 'Maintain Standard Shelf Display',
    decision: 'APPROVED',
    status: 'APPROVED',
    reviewer: 'Assistant Manager Sarah',
    notes: 'Verified during morning inventory walk.',
    source: 'LOCAL_DEMO'
  },
  {
    id: 'AUD-903',
    timestamp: '2026-10-09 08:30:22 AM',
    recommendationId: 'REC-2026-098',
    productId: 'PROD-BRD-002',
    productName: 'Artisan Sourdough Loaf 500g',
    proposedAction: '30% Morning Markdown',
    decision: 'EDITED_APPROVED',
    status: 'EDITED',
    reviewer: 'Store Manager Alex',
    notes: 'Increased discount from 30% to 50% to clear complete evening batch.',
    source: 'LOCAL_DEMO'
  },
  {
    id: 'AUD-904',
    timestamp: '2026-10-08 06:12:05 PM',
    recommendationId: 'REC-2026-089',
    productId: 'PROD-MLK-001',
    productName: 'Fresh Whole Organic Milk 1L',
    proposedAction: 'Transfer 40 units to Store 03',
    decision: 'REJECTED',
    status: 'REJECTED',
    reviewer: 'Operations Lead Marcus',
    notes: 'Store 03 refrigeration unit undergoing maintenance until Friday.',
    source: 'LOCAL_DEMO'
  }
];
