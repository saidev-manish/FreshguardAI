import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem } from '../types/inventory';
import { Recommendation } from '../types/recommendation';
import { AuditEvent } from '../types/audit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey.length > 10
);

// Singleton Supabase Client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

export interface SupabaseConnectionStatus {
  configured: boolean;
  connected: boolean;
  url: string;
  tablesFound: boolean;
  message: string;
}

export const supabaseService = {
  // Test connectivity against Supabase
  async testConnection(): Promise<SupabaseConnectionStatus> {
    if (!isSupabaseConfigured || !supabase) {
      return {
        configured: false,
        connected: false,
        url: supabaseUrl || 'Not configured',
        tablesFound: false,
        message: 'Supabase credentials not configured in environment variables.'
      };
    }

    try {
      // Test querying products table
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });

      if (error) {
        // Table doesn't exist yet (PGRST205) or RLS policy needed
        if (error.code === 'PGRST205') {
          return {
            configured: true,
            connected: true,
            url: supabaseUrl,
            tablesFound: false,
            message: 'Connected to Supabase endpoint! Schema tables (products, recommendations) pending migration.'
          };
        }
        return {
          configured: true,
          connected: false,
          url: supabaseUrl,
          tablesFound: false,
          message: `Supabase responded with code ${error.code}: ${error.message}`
        };
      }

      return {
        configured: true,
        connected: true,
        url: supabaseUrl,
        tablesFound: true,
        message: 'Successfully connected to Supabase PostgreSQL database!'
      };
    } catch (err: any) {
      return {
        configured: true,
        connected: false,
        url: supabaseUrl,
        tablesFound: false,
        message: `Network error connecting to Supabase: ${err.message}`
      };
    }
  },

  // Fetch products from Supabase
  async getProducts(): Promise<InventoryItem[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('products').select('*');
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.product_id,
      sku: item.sku,
      name: item.name,
      category: item.category,
      storeId: item.store_id || 'STORE-01',
      storeName: item.store_name || 'Downtown Supercenter',
      onHandQty: item.on_hand_qty || 50,
      unitCost: item.unit_cost,
      unitPrice: item.unit_price,
      shelfLifeDays: item.shelf_life_days || 7,
      nextExpiryDate: item.next_expiry_date || '2026-10-14',
      daysToExpiry: item.days_to_expiry ?? 3,
      estimatedDemand7d: item.estimated_demand_7d || 25,
      expectedUnsoldQty: item.expected_unsold_qty || 0,
      riskLevel: item.risk_level || 'LOW',
      stockoutRisk: Boolean(item.stockout_risk),
      recommendedAction: item.recommended_action || 'Maintain display',
      cohorts: item.cohorts || [],
      demandHistory: item.demand_history || [],
      evidence: item.evidence || [],
      dataQualityWarning: item.data_quality_warning
    }));
  },

  // Fetch recommendations from Supabase
  async getRecommendations(): Promise<Recommendation[] | null> {
    if (!supabase) return null;
    const { data, error } = await supabase.from('recommendations').select('*');
    if (error || !data) return null;

    return data.map((r: any) => {
      let tradeoffs = { marginImpact: 0, avoidedWasteCost: 0, netEstimatedBenefit: 0 };
      if (typeof r.tradeoffs_json === 'string') {
        try {
          const parsed = JSON.parse(r.tradeoffs_json);
          tradeoffs = {
            marginImpact: parsed.margin_impact ?? 0,
            avoidedWasteCost: parsed.avoided_waste_cost ?? 0,
            netEstimatedBenefit: parsed.net_estimated_benefit ?? 0
          };
        } catch {}
      } else if (r.tradeoffs_json) {
        tradeoffs = {
          marginImpact: r.tradeoffs_json.margin_impact ?? 0,
          avoidedWasteCost: r.tradeoffs_json.avoided_waste_cost ?? 0,
          netEstimatedBenefit: r.tradeoffs_json.net_estimated_benefit ?? 0
        };
      }

      let evidence: string[] = [];
      if (typeof r.evidence_json === 'string') {
        try {
          evidence = JSON.parse(r.evidence_json);
        } catch {}
      } else if (Array.isArray(r.evidence_json)) {
        evidence = r.evidence_json;
      }

      return {
        id: r.recommendation_id,
        productId: r.product_id,
        productName: r.product_name || r.product_id,
        sku: r.sku || 'SKU-UNKNOWN',
        category: r.category || 'General',
        storeId: r.store_id || 'STORE-01',
        riskLevel: r.risk_level,
        actionType: r.action_type,
        title: r.title,
        details: r.details,
        suggestedQuantity: r.quantity || 0,
        suggestedDiscountPct: r.discount_pct || 0,
        timing: r.timing,
        confidence: r.confidence || 0.9,
        rationale: r.rationale,
        evidence,
        tradeoffs,
        status: r.status,
        reviewedBy: r.reviewed_by,
        reviewedAt: r.reviewed_at,
        reviewerNotes: r.reviewer_notes
      };
    });
  },

  // Record review in Supabase
  async recordReview(recommendationId: string, payload: {
    decision: string;
    targetStatus: string;
    reviewerId: string;
    reviewerNote?: string;
    editedQuantity?: number;
    editedDiscountPct?: number;
  }): Promise<boolean> {
    if (!supabase) return false;

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // 1. Update recommendation status
    const updatePayload: any = {
      status: payload.targetStatus,
      reviewed_by: payload.reviewerId,
      reviewed_at: nowStr,
      reviewer_notes: payload.reviewerNote
    };
    if (payload.editedQuantity !== undefined) updatePayload.quantity = payload.editedQuantity;
    if (payload.editedDiscountPct !== undefined) updatePayload.discount_pct = payload.editedDiscountPct;

    const { error: recError } = await supabase
      .from('recommendations')
      .update(updatePayload)
      .eq('recommendation_id', recommendationId);

    if (recError) {
      console.warn('Failed to update recommendation in Supabase:', recError);
    }

    // 2. Append audit event
    const { error: auditError } = await supabase.from('audit_events').insert({
      event_id: `AUD-${Date.now().toString().slice(-4)}`,
      entity_type: 'recommendation',
      entity_id: recommendationId,
      event_type: `REVIEW_${payload.targetStatus}`,
      actor: payload.reviewerId,
      product_name: recommendationId,
      proposed_action: `Review decision: ${payload.targetStatus}`,
      status: payload.targetStatus,
      notes: payload.reviewerNote || 'Confirmed review in Supabase',
      source: 'SUPABASE_CLOUD',
      created_at: nowStr
    });

    if (auditError) {
      console.warn('Failed to record audit event in Supabase:', auditError);
    }

    return !recError && !auditError;
  }
};
