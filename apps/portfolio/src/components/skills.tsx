'use client'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import {
  AwsIcon,
  DjangoIcon,
  DockerIcon,
  FigmaIcon,
  FirebaseIcon,
  GitIcon,
  HtmlIcon,
  JavaScriptIcon,
  NextjsIcon,
  NodeIcon,
  PythonIcon,
  ReactIcon,
  ReduxIcon,
  TailwindIcon,
  TypeScriptIcon,
  VueIcon,
} from '@repo/ui/icons'
import { useEffect, useRef, useState } from 'react'

const categoryThemes = {
  Frontend: {
    cardBg: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    hoverBorderColor: 'hover:border-blue-500/50',
    shadowColor: 'shadow-blue-500/5',
    hoverShadowColor: 'hover:shadow-blue-500/10',
    chipBg: 'bg-blue-500/5',
    chipHoverBg: 'hover:bg-blue-500/10',
    chipBorder: 'border-blue-500/20',
    chipHoverBorder: 'hover:border-blue-500/30',
  },
  Backend: {
    cardBg: 'bg-green-500/5',
    borderColor: 'border-green-500/20',
    hoverBorderColor: 'hover:border-green-500/50',
    shadowColor: 'shadow-green-500/5',
    hoverShadowColor: 'hover:shadow-green-500/10',
    chipBg: 'bg-green-500/5',
    chipHoverBg: 'hover:bg-green-500/10',
    chipBorder: 'border-green-500/20',
    chipHoverBorder: 'hover:border-green-500/30',
  },
  'Tools & Others': {
    cardBg: 'bg-purple-500/5',
    borderColor: 'border-purple-500/20',
    hoverBorderColor: 'hover:border-purple-500/50',
    shadowColor: 'shadow-purple-500/5',
    hoverShadowColor: 'hover:shadow-purple-500/10',
    chipBg: 'bg-purple-500/5',
    chipHoverBg: 'hover:bg-purple-500/10',
    chipBorder: 'border-purple-500/20',
    chipHoverBorder: 'hover:border-purple-500/30',
  },
}

const skills = {
  Frontend: [
    { name: 'HTML/CSS', icon: <HtmlIcon className="text-[#E34F26]" /> },
    { name: 'JavaScript', icon: <JavaScriptIcon className="text-[#F7DF1E]" /> },
    { name: 'TypeScript', icon: <TypeScriptIcon className="text-[#3178C6]" /> },
    { name: 'React', icon: <ReactIcon className="text-[#61DAFB]" /> },
    { name: 'Next.js', icon: <NextjsIcon /> },
    { name: 'Tailwind CSS', icon: <TailwindIcon className="text-[#06B6D4]" /> },
    { name: 'Redux', icon: <ReduxIcon className="text-[#764ABC]" /> },
    { name: 'Vue.js', icon: <VueIcon className="text-[#4FC08D]" /> },
  ],
  Backend: [
    { name: 'Node.js', icon: <NodeIcon className="text-[#339933]" /> },
    { name: 'Express', icon: <NodeIcon className="text-[#000000]" /> },
    { name: 'Python', icon: <PythonIcon className="text-[#3776AB]" /> },
    { name: 'Django', icon: <DjangoIcon className="text-[#092E20]" /> },
  ],
  'Tools & Others': [
    { name: 'Git', icon: <GitIcon className="text-[#F05032]" /> },
    { name: 'Docker', icon: <DockerIcon className="text-[#2496ED]" /> },
    { name: 'AWS', icon: <AwsIcon className="text-[#232F3E]" /> },
    { name: 'Firebase', icon: <FirebaseIcon className="text-[#FFCA28]" /> },
    { name: 'Figma', icon: <FigmaIcon className="text-[#F24E1E]" /> },
  ],
}

export function Skills() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const isVisible = useIntersectionObserver(sectionRef)
  const [isAnimationComplete, setIsAnimationComplete] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsAnimationComplete(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isVisible])

  return (
    <section ref={sectionRef} className="p-24" id="skills">
      <div className="mx-auto px-4">
        <h2
          className={`text-4xl font-bold mb-16 text-center transition-all duration-1000 transform
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Technical <span className="text-primary">Skills</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(skills).map(([category, skillList], categoryIndex) => {
            const theme = categoryThemes[category as keyof typeof categoryThemes]

            return (
              <div
                key={category}
                className={`${theme.cardBg} backdrop-blur-sm rounded-xl p-8
                           ${theme.shadowColor} shadow-lg ${theme.hoverShadowColor}
                           border ${theme.borderColor} ${theme.hoverBorderColor}
                           transition-all duration-500 transform
                           ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{
                  transitionDelay: `${categoryIndex * 200}ms`,
                }}
              >
                <h3
                  className="text-2xl font-semibold mb-6 text-center pb-4 
                             border-b border-border/30"
                >
                  {category}
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {skillList.map((skill, index) => (
                    <div
                      key={skill.name}
                      className={`group flex items-center gap-2 px-4 py-2 
                                ${theme.chipBg} ${theme.chipHoverBg}
                                border ${theme.chipBorder} ${theme.chipHoverBorder}
                                rounded-full cursor-pointer
                                transition-all duration-300 transform
                                hover:scale-105 hover:shadow-lg
                                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                      style={{
                        transitionDelay: !isAnimationComplete
                          ? `${(categoryIndex * skillList.length + index) * 100 + 400}ms`
                          : '0ms',
                      }}
                    >
                      <span className="text-lg transition-transform duration-300 group-hover:scale-110">
                        {skill.icon}
                      </span>
                      <span className="text-sm font-medium whitespace-nowrap">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
