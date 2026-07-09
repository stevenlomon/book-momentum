'use client'

import { useState } from 'react';

// The mathematical shape of our star!
const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

interface StarRatingProps {
  initialRating: number | null;
  onRate: (rating: number | null) => Promise<void>;
}

export default function StarRating({ initialRating, onRate }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const displayRating = hoverRating !== null ? hoverRating : (initialRating || 0);

  const handleRate = async (rating: number | null) => {
    if (isUpdating) return;
    setIsUpdating(true);
    await onRate(rating);
    setIsUpdating(false);
  };

  return (
    <div 
      className={`flex items-center gap-1 transition-opacity ${isUpdating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
      onMouseLeave={() => setHoverRating(null)}
    >
      {initialRating !== null && (
        <button 
          onClick={() => handleRate(null)}
          className="text-[#5C613E]/50 hover:text-[#2C302E] text-xs font-bold mr-1 px-1"
          title="Remove rating"
        >
          ✕
        </button>
      )}

      {[1, 2, 3, 4, 5].map((star) => (
        <div key={star} className="relative w-6 h-6 sm:w-7 sm:h-7 cursor-pointer">
          
          {/* Layer 1: Background Empty Star */}
          <div className="absolute inset-0 text-[#E5E0D8]">
            <StarIcon className="w-full h-full" />
          </div>
          
          {/* Layer 2: Foreground Filled Star */}
          <div 
            className="absolute top-0 left-0 h-full text-[#5C613E] overflow-hidden transition-all duration-100" 
            style={{ 
              width: displayRating >= star ? '100%' : displayRating >= star - 0.5 ? '50%' : '0%' 
            }}
          >
            {/* We force this inner container to stay the exact size of the parent, so the star doesn't squish when the wrapper gets cut in half */}
            <div className="w-6 h-6 sm:w-7 sm:h-7">
              <StarIcon className="w-full h-full" />
            </div>
          </div>

          {/* Layer 3: Invisible Hitboxes */}
          <div className="absolute inset-0 flex z-10">
            <div className="w-1/2 h-full" onMouseEnter={() => setHoverRating(star - 0.5)} onClick={() => handleRate(star - 0.5)} />
            <div className="w-1/2 h-full" onMouseEnter={() => setHoverRating(star)} onClick={() => handleRate(star)} />
          </div>
        </div>
      ))}
    </div>
  );
}