import { About } from '@/components/about';
import { Contact } from '@/components/contact';
import { Main } from '@/components/main';
import { Navigation } from '@/components/navigation';
import { Projects } from '@/components/projects';
import { Skills } from '@/components/skills';

export default function Home() {
  return (
    <main className="grid min-h-screen w-full">
      <Navigation />
      <Main />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  );
}
