import { db } from '@/lib/db';
import type { ProjectData } from '@/types/portfolio';

export async function getProjects(): Promise<ProjectData[]> {
  try {
    const projects = await db.project.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      orderBy: {
        displayOrder: 'desc',
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return projects.map((project) => ({
      title: project.title,
      summary: project.summary,
      technologies: project.skills.map((ps) => ps.skill.name),
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      displayOrder: project.displayOrder,
    }));
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}
