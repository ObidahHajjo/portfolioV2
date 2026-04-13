import TerminalFrame from '@/components/theme/TerminalFrame';
import type { SkillGroup } from '@/types/portfolio';

interface SkillsSectionProps {
  groups: SkillGroup[];
}

export default function SkillsSection({ groups }: SkillsSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section id="skills" aria-labelledby="skills-heading" className="terminal-section">
      <div className="mx-auto max-w-6xl">
        <TerminalFrame title="~/public/skills.json" label="Skills">
          <h2 id="skills-heading" className="terminal-heading text-[clamp(1.9rem,3vw,3rem)]">
            Skills
          </h2>
          <p className="mt-3 max-w-2xl terminal-copy">
            Stacks, tools, and delivery capabilities presented in a terminal-inspired grouping
            system.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <div className="terminal-shell rounded-xl p-5" key={group.category}>
                <h3 className="font-mono text-sm uppercase tracking-[0.22em] text-accent">
                  {group.category}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span className="terminal-chip" key={skill.name}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TerminalFrame>
      </div>
    </section>
  );
}
