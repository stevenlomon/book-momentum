import ReadingTracksSection from '@/components/home/ReadingTracksSection'; // Adjust the import path based on your folder structure

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FCF9F2] px-8 py-12">
      
      {/* The header is pure HTML, zero JavaScript shipped to the client */}
      <header className="mb-12 border-b border-[#E5E0D8] pb-6">
        <h1 className="text-4xl font-heading text-[#2C302E]">Your Reading Tracks</h1>
        <p className="text-[#5C613E] mt-2 font-serif text-lg">
          Focused immersion. One active book, one follow-up. 
        </p>
      </header>

      {/* The grid and its state as an imported interactive client component */}
      <ReadingTracksSection />

    </div>
  )
};