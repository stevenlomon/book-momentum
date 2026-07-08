'use client' // Client component since we need to use `useState`, `useEffect`, etc etc

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // This replaces useNavigate
import { useBookSearch } from '@/hooks/useBookSearch';

export default function Navbar() {
  // With the hook now, the only local state the Navbar needs to manage itself is whether its own dropdown is visible
  const [isOpen, setIsOpen] = useState(false);

  // Our hook variables! `results` gets the alias `previews` here in the Navbar
  const { searchTerm, setSearchTerm, isSearching, results: previews } = useBookSearch("Navbar Search Error:");

  const router = useRouter();

  // We still need a form submission function; now typed
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) { //FormEvent, not SubmitEvent. React.FormEvent is *not* deprecated.
    e.preventDefault();

    if (!searchTerm.trim()) return; // Return early if there is no search term
    // if (timeoutRef.current) clearTimeout(timeoutRef.current); // Not needed here anymore

    setIsOpen(false); // Local state management to prevent the curtains from staying open when we return
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`); // Also upgraded to use encodeURIComponent, see comment in useBookSearch
  };

  // A new handler specifically for when the user types in the input box; this is the one that handles setIsOpen now, not the useEffect
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // If they type enough characters, immediately open the dropdown
    if (e.target.value.trim().length >= 3) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Vibe coded render block modeling the Pokémon project and styling for now
  return (
    <header className="sticky top-0 z-50 flex items-center justify-end px-8 py-4 bg-[#FCF9F2]">
      
      <div className="relative flex items-center gap-6">
        {/* SEARCH FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center rounded-md bg-[#EFEBE1] px-4 py-2 border border-transparent transition-all focus-within:border-[#424B2E] focus-within:ring-1 focus-within:ring-[#424B2E]"
        >
          {/* Simple search icon to be replaced by a proper SVG later */}
          <span className="text-[#5C613E] mr-3 opacity-70">
            {isSearching ? '⏳' : '🔍'}
          </span>
          <input
            className="w-72 bg-transparent text-sm font-sans text-[#2C302E] outline-none placeholder:text-[#5C613E]"
            type="text"
            placeholder="Search library..."
            value={searchTerm}
            onChange={handleInputChange} // Not `(e) => setSearchTerm(e.target.value)` anymore, but our new handler
          />
          {/* Hidden submit button to allow Enter key to work */}
          <button type="submit" className="sr-only">Search</button>
        </form>

        {/* PROFILE BUTTON */}
        <Link 
          href='/profile'
          className="h-9 w-9 rounded-full bg-[#424B2E] text-[#FCF9F2] flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
          title="Profile"
        >
          <span className="text-sm font-sans">👤</span>
        </Link>

        {/* THE DROPDOWN */}
        {isOpen && (
          <div className="absolute right-14 top-[calc(100%+10px)] z-100 w-96 overflow-hidden rounded-md border border-[#E5E0D8] bg-white shadow-lg">
            {isSearching ? (
              <p className="m-0 p-4 text-center font-sans text-sm text-[#5C613E]">Searching the archives...</p>
            ) : previews.length > 0 ? (
              <ul className="m-0 flex flex-col p-0 list-none">

                {previews.map((book) => (
                  <li key={book.id} className="border-b border-[#E5E0D8] last:border-b-0">
                    <Link
                      href={`/book/${book.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-col p-3 transition-colors hover:bg-[#FCF9F2]"
                    >
                      {/* Book Title in EB Garamond */}
                      <strong className="text-[#2C302E] font-heading font-normal text-lg leading-tight">
                        {book.title}
                      </strong>
                      {/* Author in Inter */}
                      <small className="text-[#5C613E] font-sans text-xs mt-1">
                        {book.authors?.[0]?.name || 'Unknown Author'}
                        {book.page_count && ` • ${book.page_count} pages`}
                      </small>
                    </Link>
                  </li>
                ))}

                {/* The "See all results" footer */}
                <li className="bg-[#EFEBE1]/50 text-center">
                  <Link
                    href={`/search?q=${encodeURIComponent(searchTerm)}`} // And here to! Upgraded to use encodeURIComponent, see comment in useBookSearch
                    onClick={() => setIsOpen(false)}
                    className="block p-3 font-sans text-sm font-medium text-[#424B2E] transition-colors hover:bg-[#E5E0D8]"
                  >
                    See all results for "{searchTerm}"
                  </Link>
                </li>
              </ul>
            ) : (
              <p className="m-0 p-4 text-center font-sans text-sm text-[#5C613E]">No works found in the catalog.</p>
            )}
          </div>
        )}
      </div>
    </header>
  );
};