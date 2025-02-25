'use client'

import { Button } from '@repo/ui/button'
import { BrainIcon, CodeIcon, HomeIcon, MailIcon, UserIcon } from '@repo/ui/icons'
import Image from 'next/image'
import { useState } from 'react'

const navItems = [
  { name: 'Home', icon: HomeIcon },
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
      className={`sticky top-0 w-full backdrop-blur-sm z-50 transition-all duration-300
        bg-gray-900 text-white shadow-lg`}
    >
      <div className="flex h-16 items-center justify-between px-10">
        <div className="flex items-center gap-2 fade-in cursor-pointer" onClick={() => scrollToSection('Home')}>
          <div className="relative aspect-square rounded-full w-12 h-12">
            <Image
              src="/lama.png"
              alt="Profile"
              className="rounded-full object-cover"
              layout="responsive"
              width={48}
              height={48}
            />
          </div>
          <span className="font-mono text-sm font-medium tracking-tight">Imomo-Portfolio</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <div key={item.name} className="nav-item">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollToSection(item.name)}
                className={`flex items-center gap-2 transition-all duration-200 hover:bg-primary/10
                  ${activeSection === item.name ? 'bg-primary/15 text-primary font-medium' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
