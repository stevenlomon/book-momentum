'use client';

import Image from 'next/image';
import { type Edition } from '@/lib/types';

interface EditionSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  editions?: Edition[];
  onSelectEdition: (edition: Edition) => void;
  currentEditionId?: string | null;
}

// This is the first Client Component in our new shared folder because this will be shared by the Detailed View Page and the Bookshelf Item Details Modal!
// A user will be able to switch editions of a work before adding to Bookshelf *and* after adding to the Bookshelf
export default function EditionSwitcherModal({ isOpen, onClose, editions = [], onSelectEdition, currentEditionId }: EditionSwitcherModalProps) {
  if (!isOpen) return null; // early return guard clause

  // The Gatekeeper: Only let through editions that have BOTH a cover and a page count. We aggressively filter out the messy data from Open Library 
  // to ensure that the user only ever interacts with proper editions and not missing-data-Frankenstein editions
  const premiumEditions = editions.filter(ed => ed.cover_image_url && ed.page_count);

  // Fully vibe coded return render statement
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C302E]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#FCF9F2] rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh] border border-[#E5E0D8]">
        
        {/* HEADER */}
        <div className="px-8 pt-8 pb-4 border-b border-[#E5E0D8] bg-white relative flex justify-between items-start shrink-0">
          <div>
            <h2 className="font-heading text-2xl text-[#2C302E] tracking-wide mb-1">
              Select an Edition
            </h2>
            <p className="font-sans text-sm text-[#5C613E]">
              Showing {premiumEditions.length} premium editions with verified page counts and covers.
            </p>
          </div>
          <button onClick={onClose} className="text-[#5C613E] hover:text-[#2C302E] p-2 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CONTENT GRID */}
        <div className="flex-1 overflow-y-auto p-8">
          {premiumEditions.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {premiumEditions.map((edition) => {
                const isSelected = edition.id === currentEditionId;

                return (
                  <button
                    key={edition.id}
                    onClick={() => onSelectEdition(edition)}
                    className="flex flex-col gap-3 group cursor-pointer text-left w-full"
                  >
                    {/* Cover Container */}
                    <div className={`relative aspect-2/3 rounded-md overflow-hidden border transition-all shadow-sm bg-[#EFEBE1] w-full
                      ${isSelected 
                        ? 'border-[#424B2E] ring-2 ring-[#424B2E] ring-offset-2 ring-offset-[#FCF9F2]' 
                        : 'border-[#E5E0D8] hover:border-[#5C613E] hover:shadow-md'
                      }`}
                    >
                      {/* We know the URL exists because of our strict filter, but TS still likes a safe cast */}
                      <Image
                        src={edition.cover_image_url as string}
                        alt={`Cover of ${edition.title}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-[#424B2E] text-[#FCF9F2] p-1 rounded-full shadow-sm z-10">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div>
                      <h3 className="font-heading text-base text-[#2C302E] leading-tight line-clamp-2 group-hover:text-[#424B2E] transition-colors">
                        {edition.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="font-sans text-[11px] text-[#5C613E] font-medium tracking-wide">
                          {edition.page_count} pages
                        </p>
                        {edition.publish_date && (
                          <p className="font-serif italic text-[10px] text-[#5C613E]/70">
                            {edition.publish_date}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center opacity-70 h-full py-12">
              <span className="text-4xl mb-4">🍂</span>
              <p className="text-[#5C613E] font-serif text-lg">No alternative premium editions found.</p>
              <p className="text-[#5C613E] font-sans text-xs mt-2">Open Library data might be sparse for this specific work.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
};