import type { SocialLinkData } from '@/types/portfolio';

interface ContactSectionProps {
  links: SocialLinkData[];
}

export default function ContactSection({ links }: ContactSectionProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h2 id="contact-heading" className="mb-4 text-3xl font-bold text-gray-900">
          Get In Touch
        </h2>
        <p className="mb-8 text-gray-600">
          Feel free to reach out through any of the following channels.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {links.map((link) => {
            const isMailto = link.url.startsWith('mailto:');
            return (
              <a
                aria-label={link.platform}
                className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                href={link.url}
                key={`${link.platform}-${link.displayOrder}`}
                rel={isMailto ? undefined : 'noopener noreferrer'}
                target={isMailto ? undefined : '_blank'}
              >
                {link.platform}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
