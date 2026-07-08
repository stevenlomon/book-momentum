'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface TrackBook {
  track_id: string;
  slot_id: number;
  book_id: string;
  external_id: string | null;
  title: string;
  author: string;
  cover_image_url: string | null;
}

const TRACKS = [
  // Hard set in stone as my Reading Tracks for now haha
  { id: 'fiction', title: 'Fiction', description: 'Immersive narratives and alternate realities.' },
  { id: 'non-fiction', title: 'Non-fiction', description: 'Expanding models of reality and actionable knowledge.' },
  { id: 'bedtime', title: 'Before Bedtime', description: 'Wind-down reading. Low stakes, high comfort.' }
];

export default function HomePage() {
  const [activeModalContext, setActiveModalContext] = useState<{ trackId: string, slotId: number } | null>(null);
  const [trackBooks, setTrackBooks] = useState<TrackBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
    // Fetch logic will go here
  }, []);

  return (
    <main className="min-h-screen bg-[#FCF9F2] px-8 py-12">
      <header className="mb-12 border-b border-[#E5E0D8] pb-6">
        <h1 className="text-4xl font-heading text-[#2C302E]">Your Reading Tracks</h1>
        <p className="text-[#5C613E] mt-2 font-serif text-lg">
          Focused immersion. One active book, one follow-up. 
        </p>
      </header>

      {/* 
        CSS Grid with 3 columns and sleek vertical dividers
        On smaller screens (xl and below), it falls back to vertical stacking with horizontal dividers.
      */}
      <div className="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-[#E5E0D8] -mx-4 xl:mx-0">
        
        {TRACKS.map((track) => (
          <section key={track.id} className="py-8 xl:py-0 px-4 xl:px-8 first:xl:pl-0 last:xl:pr-0 flex flex-col">
            
            {/* Track Header */}
            {/* Set a min-height or fixed height here if you want to ensure the grids align perfectly even if descriptions wrap differently! */}
            <div className="mb-8 min-h-20">
              <h2 className="text-2xl font-heading text-[#2C302E]">{track.title}</h2>
              <p className="text-[#5C613E] font-serif italic text-sm mt-1 leading-snug">{track.description}</p>
            </div>

            {/* Track Grid: Exactly 2 slots (Currently Reading + Up Next) */}
            <div className="grid grid-cols-2 gap-4 flex-1">
              {[1, 2].map((slot) => {
                const assignedBook = trackBooks.find(b => b.track_id === track.id && b.slot_id === slot);
                const slotLabel = slot === 1 ? "Currently Reading" : "Up Next";

                if (assignedBook) {
                  // SCENARIO A: THE SLOT IS FILLED
                  return (
                    <div key={`${track.id}-${slot}`} className="flex flex-col gap-3">
                      <Link
                        href={`/book/${assignedBook.external_id || assignedBook.book_id}`}
                        className="group relative block aspect-2/3 rounded-md overflow-hidden border border-[#E5E0D8] hover:border-[#5C613E] hover:shadow-md transition-all shadow-sm w-full bg-[#FCF9F2]"
                      >
                        {assignedBook.cover_image_url ? (
                          <Image
                            src={assignedBook.cover_image_url}
                            alt={`Cover of ${assignedBook.title}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 15vw"
                            priority={true}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#EFEBE1]/50 border-4 border-transparent group-hover:border-white/20 transition-all">
                            <h3 className="font-heading text-base text-[#2C302E] leading-tight line-clamp-3 mb-2">{assignedBook.title}</h3>
                            <p className="font-sans text-[10px] text-[#5C613E] line-clamp-2">{assignedBook.author}</p>
                          </div>
                        )}
                      </Link>
                      <p className="text-[9px] font-sans font-bold tracking-widest text-[#5C613E] uppercase text-center">
                        {slotLabel}
                      </p>
                    </div>
                  );
                }

                // SCENARIO B: THE SLOT IS EMPTY
                return (
                  <button
                    key={`${track.id}-${slot}`}
                    type='button'
                    className="group relative flex flex-col items-center justify-center aspect-2/3 border-2 border-dashed border-[#E5E0D8] rounded-md bg-white/30 hover:bg-[#EFEBE1]/50 hover:border-[#5C613E]/40 transition-all cursor-pointer w-full"
                    onClick={() => setActiveModalContext({ trackId: track.id, slotId: slot })}
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-[#E5E0D8] rounded bg-white text-[#5C613E] group-hover:text-[#2C302E] group-hover:border-[#5C613E] transition-colors mb-3 shadow-sm">
                      <span className="text-lg font-light">+</span>
                    </div>
                    <p className="text-[11px] font-serif text-[#5C613E]/70 italic mb-1 text-center px-1">
                      Assign book
                    </p>
                    <p className="text-[9px] font-sans font-semibold tracking-widest text-[#5C613E] uppercase mt-2">
                      {slotLabel}
                    </p>
                  </button>
                );
              })}
            </div>
            
          </section>
        ))}
      </div>

    </main>
  )
};