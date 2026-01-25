import { useCallback, useState, useRef, useEffect } from "react";
import { api } from "./api";

interface InstantPreviewState {
    previewUrl: string | null;
    isLoading: boolean;
    error: string | null;
    rateLimitRemaining: number | null;
}

interface UseInstantPreviewOptions {
    /** Debounce delay in milliseconds (default: 800ms) */
    debounceMs?: number;
    /** Minimum prompt length to trigger preview (default: 10) */
    minPromptLength?: number;
    /** Enable/disable the feature (default: true) */
    enabled?: boolean;
}

/**
 * Hook for real-time instant preview generation
 * 
 * Features:
 * - 800ms debounce to avoid excessive API calls
 * - Automatic cancellation of pending requests
 * - Rate limit awareness
 * - Loading and error states
 * 
 * @example
 * ```tsx
 * const { previewUrl, isLoading, generatePreview } = useInstantPreview();
 * 
 * // In TextInput onChangeText
 * const handlePromptChange = (text: string) => {
 *   setPrompt(text);
 *   generatePreview(text);
 * };
 * ```
 */
export function useInstantPreview(options: UseInstantPreviewOptions = {}) {
    const {
        debounceMs = 800,
        minPromptLength = 10,
        enabled = true,
    } = options;

    const [state, setState] = useState<InstantPreviewState>({
        previewUrl: null,
        isLoading: false,
        error: null,
        rateLimitRemaining: null,
    });

    // Refs for debounce and cancellation
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const lastPromptRef = useRef<string>("");

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    /**
     * Generate preview for the given prompt (debounced)
     */
    const generatePreview = useCallback(
        (prompt: string) => {
            // Clear any existing debounce timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Skip if disabled or prompt too short
            if (!enabled || prompt.trim().length < minPromptLength) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: null,
                }));
                return;
            }

            // Skip if prompt hasn't changed significantly
            const trimmedPrompt = prompt.trim();
            if (trimmedPrompt === lastPromptRef.current) {
                return;
            }

            // Start debounce timer
            debounceTimerRef.current = setTimeout(async () => {
                // Cancel any in-flight request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                // Create new abort controller
                abortControllerRef.current = new AbortController();
                lastPromptRef.current = trimmedPrompt;

                setState((prev) => ({
                    ...prev,
                    isLoading: true,
                    error: null,
                }));

                try {
                    const result = await api.instantPreview(trimmedPrompt);

                    // Check if request was cancelled
                    if (abortControllerRef.current?.signal.aborted) {
                        return;
                    }

                    setState({
                        previewUrl: result.imageUrl,
                        isLoading: false,
                        error: null,
                        rateLimitRemaining: result.rateLimitRemaining ?? null,
                    });
                } catch (error) {
                    // Ignore cancelled requests
                    if (error instanceof Error && error.name === "AbortError") {
                        return;
                    }

                    console.error("[InstantPreview] Error:", error);
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: error instanceof Error ? error.message : "Preview failed",
                    }));
                }
            }, debounceMs);
        },
        [enabled, minPromptLength, debounceMs]
    );

    /**
     * Clear the current preview
     */
    const clearPreview = useCallback(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        lastPromptRef.current = "";
        setState({
            previewUrl: null,
            isLoading: false,
            error: null,
            rateLimitRemaining: null,
        });
    }, []);

    return {
        previewUrl: state.previewUrl,
        isLoading: state.isLoading,
        error: state.error,
        rateLimitRemaining: state.rateLimitRemaining,
        generatePreview,
        clearPreview,
    };
}
