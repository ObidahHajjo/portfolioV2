import { db } from '@/lib/db';
import type { SkillGroup } from '@/types/portfolio';

export async function getSkillGroups(): Promise<SkillGroup[]> {
  try {
    const skills = await db.skill.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    if (skills.length === 0) {
      return [];
    }

    const grouped = new Map<string, { name: string }[]>();

    for (const skill of skills) {
      const existing = grouped.get(skill.category) ?? [];
      existing.push({ name: skill.name });
      grouped.set(skill.category, existing);
    }

    return Array.from(grouped.entries()).map(([category, skills]) => ({
      category,
      skills,
    }));
  } catch (error) {
    console.error('Failed to fetch skill groups:', error);
    return [];
  }
}
