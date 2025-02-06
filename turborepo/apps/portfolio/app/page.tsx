import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Hero } from "@/components/hero";
import { Navigation } from "@/components/navigation";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";

export default function Page() {
  return (
    <main className="grid min-h-screen w-full">
      <Navigation />
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
