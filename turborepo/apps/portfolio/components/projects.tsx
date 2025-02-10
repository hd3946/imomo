import { Button } from "@repo/ui/components/ui/button";

const projects = [
  {
    title: "프로젝트 1",
    description: "프로젝트에 대한 상세 설명입니다.",
    tech: ["Next.js", "TypeScript", "Tailwind"],
    image: "/project1.png",
  },
  // 더 많은 프로젝트...
];

export function Projects() {
  return (
    <section className="p-24" id="projects">
      <h2 className="text-3xl font-bold mb-12 text-center">프로젝트</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <div
            key={i}
            className="group rounded-lg border p-4 hover:border-foreground/20 transition-colors"
          >
            <div className="aspect-video rounded-lg bg-muted mb-4 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="font-semibold text-xl mb-2">{project.title}</h3>
            <p className="text-muted-foreground mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-1 rounded-full bg-secondary"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Demo
              </Button>
              <Button variant="outline" size="sm">
                GitHub
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
