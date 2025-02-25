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
import Image from 'next/image'
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
    tech: ['React', 'OpenAI API', 'TailwindCSS', 'Vercel'],
    image: 'https://picsum.photos/800/600?random=4',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
  {
    title: '일정 관리 앱',
    description: '드래그 앤 드롭 기능을 갖춘 모던한 일정 관리 애플리케이션입니다.',
    tech: ['Vue.js', 'Vuex', 'Firebase', 'DnD Kit'],
    image: 'https://picsum.photos/800/600?random=5',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
  {
    title: '포트폴리오 웹사이트',
    description:
      'Next.js와 TypeScript를 활용한 개인 포트폴리오 웹사이트입니다. 반응형 디자인과 모던한 UI를 구현했습니다.',
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    image: 'https://picsum.photos/800/600?random=1',
    demoUrl: 'https://demo.com',
    githubUrl: 'https://github.com',
  },
]

export function Projects() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const isVisible = useIntersectionObserver(sectionRef)

  return (
    <section ref={sectionRef} className="relative py-24 px-4 w-full" id="projects">
      <h2
        className={`text-4xl mb-16 font-bold text-center transition-all duration-1000 transform
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        Projects
      </h2>

      <div className="relative max-w-[1400px] mx-auto">
        <div className="overflow-x-auto hide-scrollbar relative w-full" style={{ scrollSnapType: 'x mandatory' }}>
          <div className="flex gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="min-w-[300px] max-w-[500px] flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <Card className="group h-full bg-card/50 backdrop-blur-sm hover:backdrop-blur-lg border-border/40 hover:border-primary/20 transition-all duration-500 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                  <CardContent className="p-6">
                    <div className="aspect-video relative overflow-hidden rounded-lg mb-6">
                      <Image
                        src={project.image}
                        alt={project.title}
                        className="object-cover w-full h-full transition-all duration-700 ease-in-out group-hover:scale-110"
                        layout="responsive"
                        width={500}
                        height={300}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6">
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transform -translate-y-8 group-hover:translate-y-0 transition-transform duration-500 p-3 bg-white/10 rounded-full hover:bg-white/25 hover:scale-110"
                        >
                          <DemoIcon className="w-6 h-6 text-white" />
                        </a>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 p-3 bg-white/10 rounded-full hover:bg-white/25 hover:scale-110"
                        >
                          <GithubProjectIcon className="w-6 h-6 text-white" />
                        </a>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground/90 group-hover:text-primary transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-2 group-hover:text-muted-foreground transition-colors duration-300">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {project.tech.map((tech) => {
                          const IconComponent = techStackIcons[tech]?.icon
                          return IconComponent ? (
                            <div
                              key={tech}
                              className="p-2 rounded-lg bg-secondary/20 hover:bg-secondary/40 transform hover:scale-110 transition-all duration-300"
                            >
                              <IconComponent className="w-5 h-5 text-secondary-foreground/60 hover:text-secondary-foreground transition-colors duration-300" />
                            </div>
                          ) : null
                        })}
                      </div>
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
