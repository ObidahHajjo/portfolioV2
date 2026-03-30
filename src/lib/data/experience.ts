import { db } from '@/lib/db';
import type { ExperienceData } from '@/types/portfolio';

export async function getExperienceEntries(): Promise<ExperienceData[]> {
  try {
    const entries = await db.experience.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      orderBy: {
        displayOrder: 'desc',
      },
    });

    return entries.map((entry) => ({
      company: entry.company,
      role: entry.role,
      startDate: entry.startDate,
      endDate: entry.endDate,
      description: entry.description,
      highlights: entry.highlights,
      displayOrder: entry.displayOrder,
    }));
  } catch (error) {
    console.error('Failed to fetch experience entries:', error);
    return [];
  }
}
