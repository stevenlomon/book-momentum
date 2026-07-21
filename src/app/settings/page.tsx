import LogoutButton from '@/components/settings/LogoutButton';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center">
      {/* The cheeky stub */}
      <h1 className="text-4xl font-heading text-[#2C302E] mb-4">404</h1>
      <p className="text-[#5C613E] font-serif italic text-lg mb-12">
        This page could not be found. <br/> (Just kidding. Real settings are coming soon.)
      </p>

      {/* Account Info & Logout */}
      <div className="w-full p-8 border border-[#E5E0D8] rounded-lg bg-white/50 flex flex-col items-center gap-6">
        <div>
          <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#5C613E] mb-1">
            Logged in as
          </p>
          <p className="font-heading text-2xl text-[#2C302E]">
            {user.username}
          </p>
        </div>
        
        <LogoutButton />
      </div>
    </div>
  );
}