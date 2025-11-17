import { useEffect, useRef } from 'react';
import { useWorkflowStore } from './useWorkflowStore';

// Auto-save interval in milliseconds (30 seconds)
const AUTO_SAVE_INTERVAL = 30000;

// LocalStorage key for draft
const DRAFT_KEY = 'workflow-builder-draft';

export function useAutoSave(enabled: boolean = true) {
  const { nodes, edges } = useWorkflowStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!enabled || nodes.length === 0) {
      return;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      const draft = {
        nodes,
        edges,
        savedAt: new Date().toISOString(),
        version: 1,
      };

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        lastSaveTimeRef.current = new Date();
        console.log('[Auto-Save] Draft saved at', new Date().toLocaleTimeString());
      } catch (error) {
        console.error('[Auto-Save] Failed to save draft:', error);
      }
    }, AUTO_SAVE_INTERVAL);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, enabled]);

  return {
    lastSaveTime: lastSaveTimeRef.current,
  };
}

interface WorkflowDraft {
  nodes: any[];
  edges: any[];
  savedAt: string;
  version: number;
}

/**
 * Load draft from localStorage
 */
export function loadDraft(): WorkflowDraft | null {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      return JSON.parse(draft) as WorkflowDraft;
    }
  } catch (error) {
    console.error('[Auto-Save] Failed to load draft:', error);
  }
  return null;
}

/**
 * Clear draft from localStorage
 */
export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
    console.log('[Auto-Save] Draft cleared');
  } catch (error) {
    console.error('[Auto-Save] Failed to clear draft:', error);
  }
}

/**
 * Check if draft exists
 */
export function hasDraft(): boolean {
  try {
    return localStorage.getItem(DRAFT_KEY) !== null;
  } catch {
    return false;
  }
}

/**
 * Get draft metadata without parsing full content
 */
export function getDraftMetadata() {
  try {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const parsed = JSON.parse(draft) as { savedAt: string; nodes?: any[]; edges?: any[] };
      return {
        savedAt: parsed.savedAt,
        nodeCount: parsed.nodes?.length || 0,
        edgeCount: parsed.edges?.length || 0,
      };
    }
  } catch (error) {
    console.error('[Auto-Save] Failed to get draft metadata:', error);
  }
  return null;
}
