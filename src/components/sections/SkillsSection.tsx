import type { SkillGroup } from '@/types/portfolio';

interface SkillsSectionProps {
  groups: SkillGroup[];
}

export default function SkillsSection({ groups }: SkillsSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section id="skills" aria-labelledby="skills-heading" className="bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 id="skills-heading" className="mb-8 text-3xl font-bold text-gray-900">
          Skills
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="mb-3 font-semibold text-gray-900">{group.category}</h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700"
                    key={skill.name}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
