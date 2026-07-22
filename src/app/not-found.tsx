import Link from 'next/link';

// Creating custom 404 pages in Next.js is extremely elegant! We simply create a file in `src/app` with the reserved `not-found.tsx` name!
export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-8 text-center">
      
      {/* Decorative Icon */}
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#EFEBE1] border border-[#E5E0D8] shadow-sm">
        <span className="text-2xl opacity-80">🍂</span>
      </div>
      
      <h1 className="mb-4 text-5xl font-heading text-[#2C302E]">
        Page Not Found
      </h1>
      
      <p className="mb-10 max-w-md text-lg font-serif italic leading-relaxed text-[#5C613E]">
        It seems you&apos;ve wandered past the edges of the garden. The path you are looking for does not exist.
      </p>

      <Link 
        href="/"
        className="rounded-md bg-[#424B2E] px-8 py-3 font-sans text-sm font-medium tracking-wide text-[#FCF9F2] shadow-sm transition hover:bg-[#343b24]"
      >
        Return to the path
      </Link>
      
    </div>
  )
};