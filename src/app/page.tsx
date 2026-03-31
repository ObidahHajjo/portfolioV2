import Header from '@/components/layout/Header';
import ContactSection from '@/components/sections/ContactSection';
import AboutSection from '@/components/sections/AboutSection';
import ExperienceSection from '@/components/sections/ExperienceSection';
import HeroSection from '@/components/sections/HeroSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import SkillsSection from '@/components/sections/SkillsSection';
import { getProfileData } from '@/lib/data/about';
import { getContactSettings, getSocialLinks } from '@/lib/data/contact';
import { getExperienceEntries } from '@/lib/data/experience';
import { getHeroData } from '@/lib/data/hero';
import { getProjects } from '@/lib/data/projects';
import { getSkillGroups } from '@/lib/data/skills';
import type { NavLink } from '@/types/portfolio';

export const revalidate = 300;

export default async function Home() {
  const [hero, profile, skillGroups, experience, projects, socialLinks, contactSettings] =
    await Promise.all([
      getHeroData(),
      getProfileData(),
      getSkillGroups(),
      getExperienceEntries(),
      getProjects(),
      getSocialLinks(),
      getContactSettings(),
    ]);

  const navLinks: NavLink[] = [];

  if (profile !== null) {
    navLinks.push({ label: 'About', anchor: 'about' });
  }

  if (skillGroups.length > 0) {
    navLinks.push({ label: 'Skills', anchor: 'skills' });
  }

  if (experience.length > 0) {
    navLinks.push({ label: 'Experience', anchor: 'experience' });
  }

  if (projects.length > 0) {
    navLinks.push({ label: 'Projects', anchor: 'projects' });
  }

  if (socialLinks.length > 0 || contactSettings?.formEnabled) {
    navLinks.push({ label: 'Contact', anchor: 'contact' });
  }

  return (
    <>
      <Header developerName={profile?.fullName ?? ''} navLinks={navLinks} />
      <main id="main-content" tabIndex={-1}>
        <HeroSection data={hero} />
        <AboutSection data={profile} />
        <SkillsSection groups={skillGroups} />
        <ExperienceSection entries={experience} />
        <ProjectsSection projects={projects} />
        <ContactSection links={socialLinks} contactSettings={contactSettings} />
      </main>
    </>
  );
}
