'use client'

import { Button } from '@repo/ui/button'
import { BrainIcon, CodeIcon, CubeIcon, HomeIcon, MailIcon, UserIcon } from '@repo/ui/icons'
import { useState } from 'react'

const navItems = [
  { name: 'Home', icon: HomeIcon },
  { name: 'Showroom', icon: CubeIcon },
  { name: 'About', icon: UserIcon },
  { name: 'Projects', icon: CodeIcon },
  { name: 'Skills', icon: BrainIcon },
  { name: 'Contact', icon: MailIcon },
]

export function Navigation() {
  const [activeSection, setActiveSection] = useState('Home')

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId.toLowerCase())
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(sectionId)
    }
  }

  return (
    <nav
      className="sticky top-0 w-full backdrop-blur-md z-50 transition-all duration-300 bg-white/85 text-stripe-ink border-b border-stripe-hairline shadow-sm"
    >
      <div className="flex h-16 items-center justify-between px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 fade-in cursor-pointer" onClick={() => scrollToSection('Home')}>
          <div className="relative aspect-square rounded-full w-9 h-9 border border-stripe-hairline overflow-hidden bg-slate-50">
            <img
              src="/lama.png"
              alt="Profile"
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <span className="font-sans text-sm font-light tracking-tight text-stripe-ink stripe-body">
            imomo<span className="text-stripe-indigo font-normal">.dev</span>
          </span>
        </div>

        {/* Stripe-style Pill Navigation Links */}
        <div className="hidden md:flex items-center gap-3">
          {navItems.map((item) => (
            <div key={item.name} className="nav-item">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection(item.name)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-200 text-sm font-light stripe-body hover:bg-stripe-indigo/5 hover:text-stripe-indigo
                  ${activeSection === item.name ? 'bg-stripe-indigo/10 text-stripe-indigo font-medium' : 'text-stripe-ink-secondary'}`}
              >
                <item.icon className="h-4 w-4 opacity-70" />
                {item.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
