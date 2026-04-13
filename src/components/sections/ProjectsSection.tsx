import TerminalFrame from '@/components/theme/TerminalFrame';
import type { ProjectData } from '@/types/portfolio';

interface ProjectsSectionProps {
  projects: ProjectData[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="terminal-section min-h-[400px]"
    >
      <div className="mx-auto max-w-6xl">
        <TerminalFrame title="~/public/projects.list" label="Projects">
          <h2 id="projects-heading" className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">
            Projects
          </h2>
          <p className="mt-3 max-w-2xl terminal-copy">
            Selected builds, engineering outcomes, and delivery signals presented with
            terminal-style cards.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                className="terminal-shell flex min-h-[280px] flex-col rounded-xl p-6"
                key={`${project.title}-${project.displayOrder}`}
              >
                <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
                <p className="mt-3 flex-1 terminal-copy">{project.summary}</p>
                {project.technologies.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span className="terminal-chip" key={tech}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex min-h-[44px] flex-wrap gap-3">
                  {project.repoUrl && (
                    <a
                      aria-label={`View ${project.title} repository`}
                      className="terminal-button-primary focus-ring"
                      href={project.repoUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Repository
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      aria-label={`View ${project.title} live demo`}
                      className="terminal-button-secondary focus-ring"
                      href={project.demoUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}
