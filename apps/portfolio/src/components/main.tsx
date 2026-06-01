'use client'

import { cn } from '@repo/ui/lib/utils'
import { useEffect, useState } from 'react'

export const HoverTextEffect = ({ className, text }: { className?: string; text: string }) => {
  const [visibleChars, setVisibleChars] = useState<number[]>([])

  useEffect(() => {
    const lines = text.split('\n')
    const initialVisibleChars = lines.map(() => 0)
    setVisibleChars(initialVisibleChars)

    const timeouts: NodeJS.Timeout[] = []
    const showLine: (lineIndex: number) => void = (lineIndex) => {
      if (lineIndex < lines.length) {
        const line: string | undefined = lines[lineIndex]
        if (line) {
          const timeout = setInterval(() => {
            setVisibleChars((prev) => {
              const newVisibleChars: number[] = [...prev]
              if (newVisibleChars[lineIndex] === undefined) {
                newVisibleChars[lineIndex] = 0
              }
              if (newVisibleChars[lineIndex] < line.length) {
                newVisibleChars[lineIndex] += 1
              } else {
                clearInterval(timeout)
                showLine(lineIndex + 1)
              }
              return newVisibleChars
            })
          }, 60)
          timeouts.push(timeout)
        }
      }
    }

    showLine(0)

    return () => {
      timeouts.forEach(clearInterval)
    }
  }, [text])

  const lines = text.split('\n')

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <h1 key={lineIndex} className="stripe-display-xl text-white font-light tracking-tight my-2">
          {line?.split('').map((char, index) => (
            <span
              key={index}
              className={cn('inline-block', {
                'opacity-0': index >= (visibleChars[lineIndex] || 0),
                'transition-opacity duration-300': index < (visibleChars[lineIndex] || 0),
              })}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
      ))}
    </div>
  )
}

export function Main() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-stripe-ink" id="home">
      {/* Stripe-style Slanted/Skewed Gradient Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* 기울어진 다채로운 그라데이션 슬라이스 */}
        <div 
          className="absolute top-[-30%] left-[-10%] w-[120%] h-[120%] origin-top-left -rotate-12 transform"
          style={{
            background: `linear-gradient(
              135deg, 
              #533afd 0%, 
              #8b5cf6 25%, 
              #f96bee 50%, 
              #ea2261 75%, 
              #f5e9d4 100%
            )`,
            opacity: 0.85
          }}
        />
        {/* 부드러운 오버레이 블렌딩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-stripe-ink via-transparent to-transparent opacity-80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 max-w-4xl">
        <HoverTextEffect text={`Welcome to my website!\nI'm Imomo\nEnjoy your stay!`} />

        <p className="text-lg md:text-xl font-light text-slate-200/90 max-w-2xl stripe-body leading-relaxed">
          I love building highly interactive, performant, and visually stunning web applications with pixel-perfect details.
        </p>

        {/* Stripe-style Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <a
            href="#showroom"
            className="px-6 py-2.5 bg-white text-stripe-indigo hover:text-stripe-indigo-deep font-medium rounded-full text-sm shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            Start 3D Tour
          </a>
          <a
            href="#projects"
            className="px-6 py-2.5 bg-stripe-brand-dark-900/30 border border-white/20 text-white font-medium rounded-full text-sm hover:bg-white/10 transition-all duration-300"
          >
            View Projects
          </a>
        </div>
      </div>
      
      {/* 하단 사선 매끄러운 그라데이션 연결 경계선 데코 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  )
}
