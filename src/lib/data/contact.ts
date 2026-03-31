import { db } from '@/lib/db';
import type { ContactSettingsData, SocialLinkData } from '@/types/portfolio';

export async function getSocialLinks(): Promise<SocialLinkData[]> {
  try {
    const links = await db.socialLink.findMany({
      where: {
        published: true,
        isVisible: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return links.map((link) => ({
      platform: link.platform,
      url: link.url,
      displayOrder: link.displayOrder,
    }));
  } catch (error) {
    console.error('Failed to fetch social links:', error);
    return [];
  }
}

export async function getContactSettings(): Promise<ContactSettingsData | null> {
  try {
    const settings = await db.contactSettings.findFirst();

    if (!settings) {
      return null;
    }

    return {
      contactEmail: settings.contactEmail,
      formEnabled: settings.formEnabled,
      ctaMessage: settings.ctaMessage,
    };
  } catch (error) {
    console.error('Failed to fetch contact settings:', error);
    return null;
  }
}
