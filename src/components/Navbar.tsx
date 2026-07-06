'use client' // Client component since we need to use `useState`, `useEffect`, etc etc

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // This replaces useNavigate
import type { Author, Book, GutenbergSearchResponse } from '@/lib/types';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [previews, setPreviews] = useState<Book[]>([]); // Array of our type Book
  const [isOpen, setIsOpen] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null); // For the debouncing
  const router = useRouter();

  // Our useEffect to achieve debouncing. Completely untouched compared to the Pokémon project!
  useEffect(() => {
    // Don't navigate to a search result page for an empty string
    if (!searchTerm.trim()) {
      setIsOpen(false);
      setPreviews([]);
      return;
    }

    // If the user stops typing for 500ms, this runs
    timeoutRef.current = setTimeout(async () => {
      // Handle local state
      setIsSearching(true);
      setIsOpen(true);

      // Do the fetching business via our Proxy Route Handler
      try {
        // We want our API key securely on our server, never in the Browser. We don't use searchBooks directly here
        const res = await fetch(`/api/search?q=${searchTerm}`); 
        if (!res.ok) throw new Error("Network response was not ok.");

        const data = await res.json();
        setPreviews(data.results || []);
      } catch (err) {
        console.error("Preview fetch failed", err);
        setPreviews([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    // And then the important cleanup. If the user types again before 500ms, this kills the previous timer
    return () => {
      if (timeoutRef.current) { 
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm]); // Run every time there is a change in the searchTerm state variable
};