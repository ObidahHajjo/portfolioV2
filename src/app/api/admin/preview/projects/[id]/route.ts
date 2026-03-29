import { NextResponse } from 'next/server';

import { requireSession } from '@/lib/session';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireSession(req);

    if (session instanceof NextResponse) {
      return session;
    }

    const project = await db.project.findUnique({
      where: { id: params.id },
      include: {
        skills: { include: { skill: true } },
        caseStudy: true,
        mediaAsset: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(project, {
      headers: {
        'X-Robots-Tag': 'noindex',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
