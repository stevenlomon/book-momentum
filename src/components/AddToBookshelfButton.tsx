'use client' // The button will need onClick. Is imported onto the Detailed View Page Server Component
import { Book } from '@/lib/types';
import { useState } from 'react';

interface AddToBookshelfButtonProps {
  book: Book;
}

export default function AddToBookshelfButton({ book }: AddToBookshelfButtonProps) {
  const [buttonText, setButtonText] = useState("Add to Bookshelf");
  const [isProcessing, setIsProcessing] = useState(false); // A boolean to lock the button while fetching or showing success

  async function handleAddToBookshelf() {
    console.log(`Preparing to save "${book.title}" to the database...`);
    
    // Lock the button immediately and give visual loading feedback
    setIsProcessing(true);
    setButtonText("Adding...");

    try {
      // Upsert the book into our local Book table
      const res = await fetch('/api/book', {
        'method': 'POST',
        'body': JSON.stringify({
          "title": book.title,
          "author": book.authors.map(a => a.name).join(', ') || 'Unknown Author', // Open Library gives us an object. Extract the names into a clean, comma-separated string
          "external_provider": 'Open Library',
          "external_id": book.id,
          "page_count": book.page_count,
          "cover_image_url": book.cover_image
        })
      });

      const addedBookResponse = await res.json(); // Extracting the id of the added book is now possible thanks to the change in the Route Handler!

      // Safety check just in case the upsert failed
      if (!addedBookResponse.data?.id) {
        throw new Error("Failed to retrieve the local database ID for this book.");
      }

      console.log("Successfully upserted book. Local DB ID:", addedBookResponse.data.id);

      // Create the Bookshelf Item instance and add the relationship to the Bookshelf_Item table
      const itemRes = await fetch('/api/bookshelf', {
        'method': 'POST',
        'body': JSON.stringify({
          "book_id": addedBookResponse.data.id,
          "status_id": 1 // Default to 1:Want to Read for now
        })
      });

      if (!itemRes.ok) throw new Error("Failed to link book to user's bookshelf.");
      
      console.log("Successfully added to Bookshelf!");
      
      // Success state: Change text, wait 1.5 seconds, then reset
      setButtonText("Added ✓");
      setTimeout(() => {
        setButtonText("Add to Bookshelf");
        setIsProcessing(false); // Unlock the button again
      }, 1500);
    } catch (err) {
      console.error("Failed to add book to bookshelf:", err);

      // Error state: Let the user know, then reset
      setButtonText("Error!");
      setTimeout(() => {
        setButtonText("Add to Bookshelf");
        setIsProcessing(false);
      }, 1500);
    }
  }

  return (
    <button
      // We conditionally apply Tailwind classes depending on the isProcessing state
      className={`font-sans text-sm font-medium tracking-wide px-6 py-2.5 rounded transition shadow-sm
        ${isProcessing 
          ? 'bg-[#E5E0D8] text-[#5C613E] cursor-not-allowed opacity-80' 
          : 'bg-[#424B2E] text-[#FCF9F2] hover:bg-[#343b24]'
        }`}
      onClick={handleAddToBookshelf}
      disabled={isProcessing} // Native HTML attribute to completely prevent clicks
    >
      {buttonText}
    </button>
  )
};
