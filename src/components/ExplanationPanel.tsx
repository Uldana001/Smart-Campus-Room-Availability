import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { AvailabilityResult, Room } from '@/types';
import { mapReasonsToCodes, explainAvailability } from '@/lib/llm/explain';
import { mockAdapter } from '@/lib/llm/mockAdapter';

interface Props {
  result: AvailabilityResult;
  room: Room;
  start: number;
  end: number;
}

export function ExplanationPanel({ result, room, start, end }: Props) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setExplanation(null);
    setUsedFallback(false);
    setLoading(false);
  }, [result, room, start, end]);

  async function handleExplain() {
    setLoading(true);
    setExplanation(null);
    setUsedFallback(false);
    const response = await explainAvailability(
      {
        roomLabel: room.name,
        start,
        end,
        isAvailable: result.available,
        reasonCodes: mapReasonsToCodes(result.reasons),
      },
      mockAdapter
    );
    setExplanation(response.explanation);
    setUsedFallback(response.usedFallback);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          Explanation
        </h3>
        <button
          type="button"
          onClick={handleExplain}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Explaining…' : 'Explain availability'}
        </button>
      </div>

      {explanation !== null && (
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="text-sm text-slate-700">{explanation}</p>
          <p className="mt-2 text-xs font-medium text-amber-700">
            Generated explanation (mock) - not a booking confirmation
          </p>
          {usedFallback && (
            <p className="mt-1 text-xs text-slate-500">
              Generated explanation unavailable, showing standard text.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
