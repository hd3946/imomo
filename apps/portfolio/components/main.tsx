'use client'

import { cn } from '@repo/ui/lib/utils'
import { useEffect, useState } from 'react'

export const HoverTextEffect = ({ className, text }: { className?: string; text: string }) => {
  const [visibleChars, setVisibleChars] = useState<number[]>([])

  useEffect(() => {
    const lines = text.split('\n')
    const initialVisibleChars = lines.map(() => 0)
    setVisibleChars(initialVisibleChars)

    // 각 줄마다 setTimeout을 사용하여 텍스트가 순차적으로 표시되도록 함
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
          }, 100)
          timeouts.push(timeout)
        }
      }
    }

    showLine(0) // 첫 번째 줄부터 시작

    return () => {
      timeouts.forEach(clearInterval)
    }
  }, [text])

  // 텍스트를 줄바꿈 기준으로 나누기
  const lines = text.split('\n')

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => (
        <h1 key={lineIndex} className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
          {line?.split('').map((char, index) => (
            <span
              key={index}
              className={cn('inline-block', className, {
                'opacity-0': index >= (visibleChars[lineIndex] || 0),
                'transition-opacity duration-500': index < (visibleChars[lineIndex] || 0),
                'animate-glow': index < (visibleChars[lineIndex] || 0),
              })}
            >
              {char === ' ' ? '\u00A0' : char} {/* 공백을 유지하기 위해 non-breaking space 사용 */}
            </span>
          ))}
        </h1>
      ))}
    </div>
  )
}

export function Main() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-black" id="home">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-500 blur-3xl opacity-20"></div>
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <HoverTextEffect text={`Welcome to my website!\nI'm Imomo\nEnjoy your stay!`} />

        <p className="text-lg text-gray-300">I love building interactive and visually appealing UIs.</p>
      </div>
    </section>
  )
}
