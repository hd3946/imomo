import { cn } from '@repo/ui/lib/utils'

const HoverTextEffect = ({ className, text }: { className?: string; text: string }) => {
  return (
    <h1 className={cn(className, 'text-4xl font-bold tracking-tight sm:text-6xl text-white')}>
      {text.split(' ').map((char, index) => (
        <span key={index} className={cn('inline-block text-bounce-hover', className)}>
          {char}
          {index !== text.length - 1 && <span>&nbsp;&nbsp;</span>} {/* 공백 추가 */}
        </span>
      ))}
    </h1>
  )
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-black">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-purple-500 blur-3xl opacity-20"></div>
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        <HoverTextEffect text="Hi there~!!" />
        <HoverTextEffect text="I'm Imomo" />
        <HoverTextEffect text="Welcome to my Website!" />

        <p className="text-lg text-gray-300">I love building interactive and visually appealing UIs.</p>
      </div>
    </section>
  )
}
