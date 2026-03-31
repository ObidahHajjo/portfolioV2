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
      className="bg-gray-50 px-6 py-16 min-h-[400px]"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="projects-heading" className="mb-8 text-3xl font-bold text-gray-900">
          Projects
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              className="flex min-h-[280px] flex-col rounded-lg border border-gray-200 bg-white p-6"
              key={`${project.title}-${project.displayOrder}`}
            >
              <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
              <p className="mt-2 flex-1 text-gray-700">{project.summary}</p>
              {project.technologies.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
                      key={tech}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-3 min-h-[44px]">
                {project.repoUrl && (
                  <a
                    aria-label={`View ${project.title} repository`}
                    className="inline-flex min-h-11 items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                    className="inline-flex min-h-11 items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
      </div>
    </section>
  );
}
