const skills = {
  Frontend: [
    "HTML/CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Redux",
    "Vue.js",
  ],
  Backend: ["Node.js", "Express", "Python", "Django"],
  "Tools & Others": ["Git", "Docker", "AWS", "Firebase", "Figma"],
};

export function Skills() {
  return (
    <section className="py-24" id="skills">
      <h2 className="text-3xl font-bold mb-12 text-center">Skills</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(skills).map(([category, skillList]) => (
          <div key={category} className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {skillList.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
