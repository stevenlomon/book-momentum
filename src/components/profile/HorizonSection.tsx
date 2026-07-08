'use client'
import { useState } from 'react'
import HorizonModal from './HorizonModal';

// The only user interactive section (for now) on the Profile page
// Here we'll implement the modal that pops up when adding a Horizon book which will require useState

export default function HorizonSection() {
  const [activeSlot, setActiveSlot] = useState<number | null>(null); // Instead of `const [isModalOpen, setIsModalOpen] = useState(false);`, we track the specific slot clicked (1-5). If it's null, the modal is closed

  // Dummy refresh function for now
  const refreshHorizon = () => {
    console.log("Time to refresh the UI with the newly assigned book!");
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

        {/* Mapping out 5 purely visual, empty slots for now */}
        {[1, 2, 3, 4, 5].map((slot) => (
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
              Slot {slot} of 5
            </p>
          </button>
        ))}

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
