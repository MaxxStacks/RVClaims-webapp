// client/src/hooks/useSignatures.ts — TanStack Query hooks for Digital Signatures

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredSignature {
  id: string;
  parentType: string;
  parentId: string;
  signerName: string;
  signerRole: string;
  signatureImageUrl: string;
  timestamp: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface SaveSignaturePayload {
  parentType: string;
  parentId: string;
  signerName: string;
  signerRole: string;
  signatureImage: string;  // base64 data URL
  userAgent?: string;
}

// ─── useSignatures — fetch existing signatures for a parent record ────────────

export function useSignatures(parentType: string, parentId: string | undefined | null) {
  return useQuery<StoredSignature[]>({
    queryKey: ["signatures", parentType, parentId],
    queryFn: async () => {
      const data = await apiFetch<{ signatures: StoredSignature[] }>(
        `/api/signatures?parentType=${encodeURIComponent(parentType)}&parentId=${encodeURIComponent(parentId!)}`
      );
      return data.signatures ?? [];
    },
    enabled: Boolean(parentId),
    staleTime: 30_000,
  });
}

// ─── useSaveSignature — POST a new signature ──────────────────────────────────

export function useSaveSignature() {
  const queryClient = useQueryClient();

  return useMutation<StoredSignature, Error, SaveSignaturePayload>({
    mutationFn: async (payload) => {
      const data = await apiFetch<{ signature: StoredSignature }>("/api/signatures", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return data.signature;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["signatures", variables.parentType, variables.parentId],
      });
    },
  });
}
