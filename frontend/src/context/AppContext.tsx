'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InventoryItem } from '../types/inventory';
import { Recommendation, RecommendationStatus } from '../types/recommendation';
import { ScenarioComparisonData } from '../types/scenario';
import { AuditEvent } from '../types/audit';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { MOCK_RECOMMENDATIONS } from '../data/mockRecommendations';
import { MOCK_SCENARIOS } from '../data/mockScenarios';
import { MOCK_AUDIT_LOGS } from '../data/mockAudit';
import { apiClient, CoordinatorRunResponse } from '../services/apiClient';
import { supabaseService, isSupabaseConfigured, SupabaseConnectionStatus } from '../services/supabaseClient';

interface AppContextType {
  isLiveMode: boolean;
  backendError: string | null;
  isLoading: boolean;
  supabaseStatus: SupabaseConnectionStatus;
  selectedStore: string;
  setSelectedStore: (store: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  products: InventoryItem[];
  recommendations: Recommendation[];
  auditLogs: AuditEvent[];
  scenarios: ScenarioComparisonData[];
  selectedScenarioId: string;
  setSelectedScenarioId: (id: string) => void;
  isSubmittingReview: boolean;
  isEvaluatingScenario: boolean;
  evaluationError: string | null;
  evaluationSource: 'LIVE' | 'DEMO' | 'INITIAL';
  runScenarioEvaluation: (scenarioId?: string) => Promise<ScenarioComparisonData | null>;
  resetScenarioToDefault: () => void;
  approveRecommendation: (id: string, notes?: string) => Promise<void>;
  editAndApproveRecommendation: (
    id: string,
    editedDetails: {
      actionType?: string;
      quantity?: number;
      discountPct?: number;
      notes?: string;
    }
  ) => Promise<void>;
  rejectRecommendation: (id: string, reason: string) => Promise<void>;
  runAnalysis: () => Promise<CoordinatorRunResponse | null>;
  retryBackendConnection: () => Promise<void>;
  getProductById: (id: string) => InventoryItem | undefined;
  getRecommendationById: (id: string) => Recommendation | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [isEvaluatingScenario, setIsEvaluatingScenario] = useState<boolean>(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [evaluationSource, setEvaluationSource] = useState<'LIVE' | 'DEMO' | 'INITIAL'>('INITIAL');
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseConnectionStatus>({
    configured: isSupabaseConfigured,
    connected: false,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    tablesFound: false,
    message: isSupabaseConfigured ? 'Connecting to Supabase...' : 'Not configured'
  });

  const [selectedStore, setSelectedStore] = useState<string>('STORE-01');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-09');

  const [products, setProducts] = useState<InventoryItem[]>(MOCK_PRODUCTS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(MOCK_RECOMMENDATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(MOCK_AUDIT_LOGS);
  const [scenarios, setScenarios] = useState<ScenarioComparisonData[]>(MOCK_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioIdState] = useState<string>('SCENARIO-01');

  const setSelectedScenarioId = (id: string) => {
    setSelectedScenarioIdState(id);
    setEvaluationError(null);
    setEvaluationSource('INITIAL');
  };

  // Load live data from FastAPI backend
  const loadLiveData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Health check
      await apiClient.checkHealth();

      // 2. Fetch products, recommendations, and audit logs in parallel
      const [fetchedProducts, fetchedRecs, fetchedAudit] = await Promise.all([
        apiClient.getProducts({ store_id: selectedStore }),
        apiClient.getRecommendations(),
        apiClient.getAuditLogs()
      ]);

      // Enrich products with fallback telemetry if any property is empty
      const enrichedProducts = fetchedProducts.map((p) => {
        const mockMatch = MOCK_PRODUCTS.find(
          (m) =>
            m.id.toLowerCase() === p.id.toLowerCase() ||
            m.sku.toLowerCase() === p.sku.toLowerCase() ||
            m.id.replace(/-/g, ' ').toLowerCase() === p.id.replace(/-/g, ' ').toLowerCase()
        );
        return {
          ...p,
          cohorts: (p.cohorts && p.cohorts.length > 0) ? p.cohorts : (mockMatch?.cohorts || []),
          demandHistory: (p.demandHistory && p.demandHistory.length > 0) ? p.demandHistory : (mockMatch?.demandHistory || []),
          evidence: (p.evidence && p.evidence.length > 0) ? p.evidence : (mockMatch?.evidence || [])
        };
      });

      setProducts(enrichedProducts);
      setRecommendations(fetchedRecs);
      setAuditLogs(fetchedAudit);
      setIsLiveMode(true);
      setBackendError(null);
    } catch (err: any) {
      console.warn('Backend unavailable, falling back to verified demo fixtures:', err.message);
      setIsLiveMode(false);
      setBackendError(err.message || 'FastAPI service offline at http://localhost:8000');
      // Keep mock data as stable fallback
      setProducts(MOCK_PRODUCTS);
      setRecommendations(MOCK_RECOMMENDATIONS);
      setAuditLogs(MOCK_AUDIT_LOGS);
    } finally {
      setIsLoading(false);
      // Asynchronously test Supabase cloud database connection
      if (isSupabaseConfigured) {
        supabaseService.testConnection().then((status) => {
          setSupabaseStatus(status);
        });
      }
    }
  }, [selectedStore]);

  useEffect(() => {
    loadLiveData();
  }, [loadLiveData]);

  const retryBackendConnection = async () => {
    if (isSupabaseConfigured) {
      supabaseService.testConnection().then(setSupabaseStatus);
    }
    await loadLiveData();
  };

  const getProductById = (id: string) => {
    if (!id) return undefined;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const normalizedId = cleanId.replace(/\s+/g, '-');
    const dehyphenatedId = cleanId.replace(/-/g, ' ');

    return (
      products.find(
        (p) =>
          p.id.toLowerCase() === cleanId ||
          p.id.toLowerCase() === normalizedId ||
          p.id.replace(/-/g, ' ').toLowerCase() === cleanId ||
          p.id.replace(/-/g, ' ').toLowerCase() === dehyphenatedId ||
          p.sku.toLowerCase() === cleanId
      ) ||
      MOCK_PRODUCTS.find(
        (p) =>
          p.id.toLowerCase() === cleanId ||
          p.id.toLowerCase() === normalizedId ||
          p.id.replace(/-/g, ' ').toLowerCase() === cleanId ||
          p.id.replace(/-/g, ' ').toLowerCase() === dehyphenatedId ||
          p.sku.toLowerCase() === cleanId
      )
    );
  };
  const getRecommendationById = (id: string) => recommendations.find((r) => r.id === id);

  // Approve recommendation with persistence
  const approveRecommendation = async (id: string, notes?: string) => {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec || isSubmittingReview) return;
    setIsSubmittingReview(true);

    try {
      if (isLiveMode) {
        try {
          await apiClient.reviewRecommendation(id, {
            decision: 'APPROVED',
            reviewer_id: 'Store Manager Alex',
            reviewer_note: notes || 'Approved recommendation as proposed.'
          });
          // Refresh live data from SQLite
          const [refreshedRecs, refreshedAudit] = await Promise.all([
            apiClient.getRecommendations(),
            apiClient.getAuditLogs()
          ]);
          setRecommendations(refreshedRecs);
          setAuditLogs(refreshedAudit);
          return;
        } catch (err: any) {
          console.error('Failed to submit review to backend:', err);
          alert(`Failed to save review to backend: ${err.message}`);
          return;
        }
      }

      // Demo Mode local fallback
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'APPROVED' as RecommendationStatus,
                reviewedBy: 'Store Manager Alex',
                reviewedAt: nowStr,
                reviewerNotes: notes || 'Approved recommendation as proposed.'
              }
            : r
        )
      );

      const newAudit: AuditEvent = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: nowStr,
        recommendationId: rec.id,
        productId: rec.productId,
        productName: rec.productName,
        proposedAction: rec.title,
        decision: 'APPROVED',
        status: 'APPROVED',
        reviewer: 'Store Manager Alex',
        notes: notes || 'Manager confirmed action in local demo review.',
        source: 'LOCAL_DEMO'
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Edit and approve recommendation with persistence
  const editAndApproveRecommendation = async (
    id: string,
    editedDetails: {
      actionType?: string;
      quantity?: number;
      discountPct?: number;
      notes?: string;
    }
  ) => {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec || isSubmittingReview) return;
    setIsSubmittingReview(true);

    try {
      if (isLiveMode) {
        try {
          await apiClient.reviewRecommendation(id, {
            decision: 'EDITED_APPROVED',
            edited_action: editedDetails.actionType,
            edited_quantity: editedDetails.quantity,
            edited_discount_pct: editedDetails.discountPct,
            reviewer_id: 'Store Manager Alex',
            reviewer_note: editedDetails.notes || 'Modified action parameters before approval.'
          });
          // Refresh live data from SQLite
          const [refreshedRecs, refreshedAudit] = await Promise.all([
            apiClient.getRecommendations(),
            apiClient.getAuditLogs()
          ]);
          setRecommendations(refreshedRecs);
          setAuditLogs(refreshedAudit);
          return;
        } catch (err: any) {
          console.error('Failed to submit edit to backend:', err);
          alert(`Failed to save edit to backend: ${err.message}`);
          return;
        }
      }

      // Demo Mode local fallback
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'EDITED' as RecommendationStatus,
                suggestedQuantity: editedDetails.quantity ?? r.suggestedQuantity,
                suggestedDiscountPct: editedDetails.discountPct ?? r.suggestedDiscountPct,
                reviewedBy: 'Store Manager Alex',
                reviewedAt: nowStr,
                reviewerNotes: editedDetails.notes || 'Modified action parameters before approval.',
                editedAction: editedDetails.actionType,
                editedQuantity: editedDetails.quantity,
                editedDiscountPct: editedDetails.discountPct
              }
            : r
        )
      );

      const newAudit: AuditEvent = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: nowStr,
        recommendationId: rec.id,
        productId: rec.productId,
        productName: rec.productName,
        proposedAction: rec.title,
        decision: 'EDITED_APPROVED',
        status: 'EDITED',
        reviewer: 'Store Manager Alex',
        notes: editedDetails.notes || `Edited: qty=${editedDetails.quantity ?? rec.suggestedQuantity}, discount=${editedDetails.discountPct ?? rec.suggestedDiscountPct}%`,
        source: 'LOCAL_DEMO'
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Reject recommendation with persistence
  const rejectRecommendation = async (id: string, reason: string) => {
    const rec = recommendations.find((r) => r.id === id);
    if (!rec || isSubmittingReview) return;
    setIsSubmittingReview(true);

    try {
      if (isLiveMode) {
        try {
          await apiClient.reviewRecommendation(id, {
            decision: 'REJECTED',
            reviewer_id: 'Store Manager Alex',
            reviewer_note: reason || 'Proposal deemed impractical for current store operations.'
          });
          // Refresh live data from SQLite
          const [refreshedRecs, refreshedAudit] = await Promise.all([
            apiClient.getRecommendations(),
            apiClient.getAuditLogs()
          ]);
          setRecommendations(refreshedRecs);
          setAuditLogs(refreshedAudit);
          return;
        } catch (err: any) {
          console.error('Failed to submit rejection to backend:', err);
          alert(`Failed to save rejection to backend: ${err.message}`);
          return;
        }
      }

      // Demo Mode local fallback
      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'REJECTED' as RecommendationStatus,
                reviewedBy: 'Store Manager Alex',
                reviewedAt: nowStr,
                reviewerNotes: reason || 'Proposal deemed impractical for current store operations.'
              }
            : r
        )
      );

      const newAudit: AuditEvent = {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: nowStr,
        recommendationId: rec.id,
        productId: rec.productId,
        productName: rec.productName,
        proposedAction: rec.title,
        decision: 'REJECTED',
        status: 'REJECTED',
        reviewer: 'Store Manager Alex',
        notes: reason || 'Proposal deemed impractical for current store operations.',
        source: 'LOCAL_DEMO'
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Run Coordinator multi-agent analysis
  const runAnalysis = async (): Promise<CoordinatorRunResponse | null> => {
    if (isLiveMode) {
      try {
        const res = await apiClient.runCoordinatorAnalysis(selectedStore);
        const [refreshedRecs, refreshedAudit] = await Promise.all([
          apiClient.getRecommendations(),
          apiClient.getAuditLogs()
        ]);
        setRecommendations(refreshedRecs);
        setAuditLogs(refreshedAudit);
        return res;
      } catch (err: any) {
        console.error('Failed to run coordinator analysis:', err);
        return null;
      }
    }
    return null;
  };

  // Run scenario evaluation (live API or fallback simulation)
  const runScenarioEvaluation = async (scenarioId?: string): Promise<ScenarioComparisonData | null> => {
    const targetId = scenarioId || selectedScenarioId;
    if (isEvaluatingScenario) return null;
    setIsEvaluatingScenario(true);
    setEvaluationError(null);

    try {
      if (isLiveMode) {
        const liveResult = await apiClient.runScenarioEvaluation(targetId);
        setScenarios((prev) => prev.map((s) => (s.id === targetId ? liveResult : s)));
        setEvaluationSource('LIVE');
        return liveResult;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
        const demoResult = MOCK_SCENARIOS.find((s) => s.id === targetId) || MOCK_SCENARIOS[0];
        setScenarios((prev) => prev.map((s) => (s.id === targetId ? demoResult : s)));
        setEvaluationSource('DEMO');
        return demoResult;
      }
    } catch (err: any) {
      console.error('Failed to evaluate scenario:', err);
      const msg = err.message || 'Scenario evaluation failed';
      setEvaluationError(msg);
      return null;
    } finally {
      setIsEvaluatingScenario(false);
    }
  };

  const resetScenarioToDefault = () => {
    setSelectedScenarioIdState('SCENARIO-01');
    setEvaluationError(null);
    setEvaluationSource('INITIAL');
  };

  return (
    <AppContext.Provider
      value={{
        isLiveMode,
        backendError,
        isLoading,
        supabaseStatus,
        selectedStore,
        setSelectedStore,
        selectedDate,
        setSelectedDate,
        products,
        recommendations,
        auditLogs,
        scenarios,
        selectedScenarioId,
        setSelectedScenarioId,
        isSubmittingReview,
        isEvaluatingScenario,
        evaluationError,
        evaluationSource,
        runScenarioEvaluation,
        resetScenarioToDefault,
        approveRecommendation,
        editAndApproveRecommendation,
        rejectRecommendation,
        runAnalysis,
        retryBackendConnection,
        getProductById,
        getRecommendationById
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
