'use client'

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { Card, CardContent } from '@repo/ui/card'
import {
  DemoIcon,
  FirebaseIcon,
  GithubProjectIcon,
  MongoDBIcon,
  NextjsIcon,
  NodeIcon,
  OpenAIIcon,
  PostgreSQLIcon,
  PrismaIcon,
  ReactIcon,
  SocketIOIcon,
  StripeIcon,
  TailwindIcon,
  TypeScriptIcon,
  VueIcon,
} from '@repo/ui/icons'
import { useRef } from 'react'

const techStackIcons: Record<string, any> = {
  'Next.js': { icon: NextjsIcon },
  TypeScript: { icon: TypeScriptIcon },
  'Tailwind CSS': { icon: TailwindIcon },
  React: { icon: ReactIcon },
  'Node.js': { icon: NodeIcon },
  'Socket.io': { icon: SocketIOIcon },
  MongoDB: { icon: MongoDBIcon },
  Prisma: { icon: PrismaIcon },
  PostgreSQL: { icon: PostgreSQLIcon },
  Stripe: { icon: StripeIcon },
  'OpenAI API': { icon: OpenAIIcon },
  'Vue.js': { icon: VueIcon },
  Firebase: { icon: FirebaseIcon },
}

const projects = [
  {
    title: '포트폴리오 웹사이트',
    description:
      'Next.js와 TypeScript를 활용한 개인 포트폴리오 웹사이트입니다. 반응형 디자인과 모던한 UI를 구현했습니다.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS'],
    image: 'https://picsum.photos/800/600?random=1',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
  {
    title: '실시간 채팅 앱',
    description: 'Socket.io를 활용한 실시간 채팅 애플리케이션입니다. 그룹 채팅과 개인 메시지 기능을 제공합니다.',
    tech: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    image: 'https://picsum.photos/800/600?random=2',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
  {
    title: '전자상거래 플랫폼',
    description: '풀스택 전자상거래 플랫폼입니다. 결제 시스템과 관리자 대시보드를 포함합니다.',
    tech: ['Next.js', 'Prisma', 'PostgreSQL', 'Stripe'],
    image: 'https://picsum.photos/800/600?random=3',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
  {
    title: 'AI 이미지 생성기',
    description: 'OpenAI API를 활용한 AI 이미지 생성 웹 애플리케이션입니다.',
    tech: ['React', 'OpenAI API', 'Tailwind CSS'],
    image: 'https://picsum.photos/800/600?random=4',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
  {
    title: '일정 관리 앱',
    description: '드래그 앤 드롭 기능을 갖춘 모던한 일정 관리 애플리케이션입니다.',
    tech: ['Vue.js', 'Firebase'],
    image: 'https://picsum.photos/800/600?random=5',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
]

export function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const isVisible = useIntersectionObserver(sectionRef)

  return (
    <section ref={sectionRef} className="relative py-28 px-4 w-full bg-stripe-canvas-soft" id="projects">
      <div className="max-w-[1400px] mx-auto">
        <h2
          className={`stripe-display-lg text-stripe-ink mb-4 font-light text-center transition-all duration-1000 transform
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          Selected Projects
        </h2>
        <p className="text-center text-stripe-ink-mute font-light mb-16 max-w-xl mx-auto stripe-body">
          A showcase of application development combining high-end interactions with production-ready structures.
        </p>

        {/* horizontal snap scroll */}
        <div className="overflow-x-auto hide-scrollbar w-full" style={{ scrollSnapType: 'x mandatory' }}>
          <div className="flex gap-8 p-4">
            {projects.map((project, index) => (
              <div
                key={index}
                className="h-[430px] w-[350px] flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Card className="group h-full bg-white border border-stripe-hairline rounded-[12px] shadow-sm hover:shadow-xl hover:translate-y-[-6px] hover:border-stripe-indigo/40 transition-all duration-500 ease-out hover:animate-stripe-glow">
                  <CardContent className="pt-5 px-5 flex flex-col justify-between h-full pb-6">
                    <div>
                      {/* Image Frame */}
                      <div className="aspect-video relative overflow-hidden rounded-[8px] mb-5 border border-stripe-hairline bg-slate-50">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {/* Hover Link Overlay */}
                        <div className="absolute inset-0 bg-stripe-ink/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/90 rounded-full hover:bg-white text-stripe-indigo hover:scale-110 transition-transform duration-200"
                          >
                            <DemoIcon className="w-5 h-5" />
                          </a>
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/90 rounded-full hover:bg-white text-stripe-indigo hover:scale-110 transition-transform duration-200"
                          >
                            <GithubProjectIcon className="w-5 h-5" />
                          </a>
                        </div>
                      </div>

                      {/* Text details */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-light text-stripe-ink tracking-tight group-hover:text-stripe-indigo transition-colors duration-300 stripe-body">
                          {project.title}
                        </h3>
                        <p className="text-stripe-ink-mute text-sm leading-relaxed line-clamp-3 font-light stripe-body">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Tech Stack Pills (Soft tag style) */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-4">
                      {project.tech.map((tech) => {
                        const IconComponent = techStackIcons[tech]?.icon
                        return (
                          <div
                            key={tech}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stripe-indigo/5 border border-stripe-indigo/10 text-stripe-indigo text-xs font-normal"
                          >
                            {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                            <span className="stripe-body text-[11px] font-medium tracking-tight">{tech}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
