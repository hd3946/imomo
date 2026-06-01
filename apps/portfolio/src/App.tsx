import { About } from '@/components/about'
import { Contact } from '@/components/contact'
import { Main } from '@/components/main'
import { Navigation } from '@/components/navigation'
import { Projects } from '@/components/projects'
import { Skills } from '@/components/skills'
import { ShowroomWrapper } from '@/components/showroom/ShowroomWrapper'

export default function App() {
  return (
    <main className="grid min-h-screen w-full bg-stripe-canvas-soft">
      <Navigation />
      <Main />
      <section className="py-16 md:py-28 px-4 max-w-[1400px] mx-auto w-full" id="showroom">
        <h2 className="stripe-display-lg text-center text-stripe-ink mb-4 font-light">3D Workspace Tour</h2>
        <p className="text-center text-stripe-ink-mute font-light mb-12 max-w-xl mx-auto stripe-body text-sm md:text-base">
          Explore the immersive virtual development room. Rotate, zoom, and select desk objects to navigate the site.
        </p>
        <ShowroomWrapper />
      </section>
      <About />
      <Projects />
      <Skills />
      <Contact />
    </main>
  )
}
