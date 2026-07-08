'use client'
import { useState, useEffect } from 'react'
import HorizonModal, { UserBookshelfItem } from './HorizonModal'; // Reusing the modal interface!
import Link from 'next/link';
import Image from 'next/image';

// The only user interactive section (for now) on the Profile page
// Here we'll implement the modal that pops up when adding a Horizon book which will require useState

export default function HorizonSection() {
  const [activeSlot, setActiveSlot] = useState<number | null>(null); // Instead of `const [isModalOpen, setIsModalOpen] = useState(false);`, we track the specific slot clicked (1-5). If it's null, the modal is closed
  const [horizonBooks, setHorizonBooks] = useState<UserBookshelfItem[]>([]); // Needs to be state since for the re-render. It might start as an empty array but receive data from the database the next few milliseconds!
  const [isLoading, setIsLoading] = useState(true);

  // Asynchronous function to fetch the user's active Horizon books. Defined out here rather than in the useEffect since it is also used in the refresh function
  const fetchHorizonBooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookshelf');
      if (res.ok) {
        const data = await res.json();
        // The API returns all active Horizon books. We just save them to our local state
        setHorizonBooks(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching Horizon books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run the fetch once on mount -> empty dependency array
  useEffect(() => {
    fetchHorizonBooks();
  }, []);

  // Not a dummy refresh function anymore; simply calls our fetch function
  const refreshHorizon = () => {
    console.log("Refreshing Horizon UI...");
    fetchHorizonBooks();
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-normal text-[#2C302E]">
          The Horizon
        </h2>
        <p className="text-[#5C613E] mt-1 font-serif">
          The dense masterpieces that we're building momentum towards. Capped strictly at five to ensure intent over accumulation.
        </p>
      </div>

      {/* Grid layout for the 5 slots. 
          On mobile: 2 columns. On tablet: 3 columns. On large screens: 5 columns.
        */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {[1, 2, 3, 4, 5].map((slot) => {
          // Not 5 purely visual empty slots anymore; now we need actually some logic haha!
          // Check if any book in our state is assigned to this specific slot
          const assignedBook = horizonBooks.find(book => book.horizon_slot === slot);

          if (assignedBook) {
            // SCENARIO A: THE SLOT IS FILLED (Letterboxd Style)
            return (
              <Link
                key={slot}
                href={'/'} // Not sure if I want this to lead to the Detailed View Page (would require extra plumbing to let the GET Route Handler get hold of external_id) or somewhere else. Root for now
                className="group relative block aspect-2/3 rounded-md overflow-hidden border border-[#E5E0D8] hover:border-[#5C613E] hover:shadow-md transition-all shadow-sm w-full bg-[#FCF9F2]"
              >
                {assignedBook.cover_image_url ? (
                  <Image
                    src={assignedBook.cover_image_url}
                    alt={`Cover of ${assignedBook.title}`}
                    fill // This replaces width/height and forces the image to perfectly fill the aspect-2/3 container
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    priority={true}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" // A very subtle, premium zoom effect on hover
                  />
                ) : (
                  // The elegant fallback for books with no cover (like "My book!")
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#EFEBE1]/50 border-4 border-transparent group-hover:border-white/20 transition-all">
                    <h3 className="font-heading text-lg text-[#2C302E] leading-tight line-clamp-3 mb-2">
                      {assignedBook.title}
                    </h3>
                    <p className="font-sans text-xs text-[#5C613E] line-clamp-2">
                      {assignedBook.author}
                    </p>
                  </div>
                )}
              </Link>
            );
          }

          // SCENARIO B: THE SLOT IS EMPTY (The original UI)
          return (
            <button // Changed from <div> to <button> for semantic HTML and accessibility
              key={slot}
              type='button' // So it doesn't accidentally trigger forms
              className="group relative flex flex-col items-center justify-center aspect-2/3 border-2 border-dashed border-[#E5E0D8] rounded-md bg-white/30 hover:bg-[#EFEBE1]/50 hover:border-[#5C613E]/40 transition-all cursor-pointer w-full" // Added w-full to ensure the button perfectly fills the grid column space
              onClick={() => setActiveSlot(slot)} // onClick intentionally put here for better UX! Don't force the user to specifically click the "+"! Apparently this is in line with what is called Fitt's Law in UX haha! Never heard of it but it makes perfect intuitive sense
            >
              {/* The Plus Button */}
              <div className="w-10 h-10 flex items-center justify-center border border-[#E5E0D8] rounded bg-white text-[#5C613E] group-hover:text-[#2C302E] group-hover:border-[#5C613E] transition-colors mb-4 shadow-sm">
                <span className="text-xl font-light">+</span>
              </div>

              {/* The Labels */}
              <p className="text-xs font-serif text-[#5C613E]/70 italic mb-1 text-center px-2">
                Awaiting a masterpiece
              </p>
              <p className="text-[10px] font-sans font-semibold tracking-widest text-[#5C613E] uppercase mt-2">
                Slot {slot}
              </p>
            </button>
          );
        })}

      </div>

      { /* The new Horizon Modal! */}
      <HorizonModal
        isOpen={activeSlot !== null} // Only open if activeSlot is a number between 1-5
        onClose={() => setActiveSlot(null)}
        targetSlot={activeSlot}
        onSuccess={refreshHorizon}
      />
    </section>
  )
}



