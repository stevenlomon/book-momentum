import { type ReadingJourney } from '@/lib/types';

interface JourneyTimelineProps {
  journeys: ReadingJourney[];
}

export default function JourneyTimeline({ journeys = [] }: JourneyTimelineProps) {
  if (!journeys || journeys.length === 0) {
    return (
      <div className="w-full p-6 border-2 border-dashed border-[#E5E0D8] rounded-md bg-white/50 text-sm font-sans text-[#5C613E]/70 flex flex-col items-center justify-center">
        <span className="text-2xl opacity-30 mb-2">⏳</span>
        <span>No reading history logged yet.</span>
      </div>
    );
  }

  // Sort journeys by iteration (1st read, 2nd read, etc.)
  const sortedJourneys = [...journeys].sort((a, b) => a.iteration - b.iteration);

  // Helper to format Postgres timestamp strings (e.g., "2026-07-12 14:39:30")
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Present';

    // Quick parse for Postgres string formats to ensure cross-browser compatibility
    const d = new Date(dateString.replace(' ', 'T'));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* The vertical timeline spine */}
      <div className="absolute left-3.75 top-4 bottom-4 w-px bg-[#E5E0D8] z-0" />

      {sortedJourneys.map((journey) => {
        const isFinished = journey.finished_at !== null;

        return (
          <div key={journey.id} className="relative z-10 flex items-start gap-4">

            {/* The Timeline Node */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 mt-1 shadow-sm transition-colors
              ${isFinished
                ? 'bg-[#EFEBE1] border-[#424B2E] text-[#424B2E]'
                : 'bg-white border-[#5C613E]/50 text-[#5C613E]'}`}
            >
              <span className="font-sans text-[10px] font-bold">
                {journey.iteration}
              </span>
            </div>

            {/* The Timeline Card */}
            <div className="flex-1 bg-white/60 border border-[#E5E0D8] rounded-md p-4">

              {/* Header Row */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-sans text-xs font-bold tracking-widest uppercase text-[#2C302E]">
                  {isFinished ? 'Completed Read' : 'Active Read'}
                </h4>
                <span className={`text-xs font-serif italic ${isFinished ? 'text-[#5C613E]' : 'text-[#424B2E] font-medium'}`}>
                  {formatDate(journey.started_at)} — {formatDate(journey.finished_at)}
                </span>
              </div>

              {/* Raw Thoughts / Notes on its own line */}
              {journey.notes && (
                <p className="font-serif italic text-sm text-[#5C613E]/90 mt-3 whitespace-pre-wrap">
                  "{journey.notes}"
                </p>
              )}

              {/* Active Page Progress */}
              {!isFinished && (
                <p className="font-sans text-xs text-[#5C613E]/80 mt-3">
                  Currently on page {journey.current_page}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}