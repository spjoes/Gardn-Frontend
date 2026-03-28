import AgentSupport from "@/components/AgentSupport";
import CTA from "@/components/CTA";
import FeatureSection from "@/components/FeatureSection";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen selection:bg-surface-highest selection:text-ink flex flex-col flex-1">
      <Navbar userEmail={user?.email} />
      <main className="flex-1">
        <Hero />
        <FeatureSection />
        <AgentSupport />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
