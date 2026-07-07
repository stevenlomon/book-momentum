'use client' // The button will need onClick. Is imported onto the Detailed View Page Server Component
import { Book } from '@/lib/types';

interface AddToBookshelfButtonProps {
  book: Book;
}

export default function AddToBookshelfButton({ book }: AddToBookshelfButtonProps) {
  async function handleAddToBookshelf() {
    console.log(`Preparing to save "${book.title}" to the database...`);

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
    } catch (err) {
      console.error("Failed to add book to bookshelf:", err);
    }
  }

  return (
    <button
      className="bg-[#424B2E] text-[#FCF9F2] font-sans text-sm font-medium tracking-wide px-6 py-2.5 rounded hover:bg-[#343b24] transition shadow-sm"
      onClick={handleAddToBookshelf}
    >
      Add to Bookshelf
    </button>
  )
};
