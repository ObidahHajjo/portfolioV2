import { NextResponse } from 'next/server';

import { ok, withAdminAuth, zodValidate } from '@/lib/admin/api-helpers';
import { db } from '@/lib/db';
import { SectionVisibilitySchema } from '@/lib/admin/validation';

const VALID_SECTIONS = ['articles', 'open_source', 'talks'];

export async function GET(req: Request, { params }: { params: { section: string } }) {
  return withAdminAuth(async () => {
    if (!VALID_SECTIONS.includes(params.section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const visibility = await db.sectionVisibility.findUnique({
      where: { section: params.section },
    });

    if (!visibility) {
      return ok({ section: params.section, enabled: true });
    }

    return ok(visibility);
  })(req);
}

export async function PUT(req: Request, { params }: { params: { section: string } }) {
  return withAdminAuth(async (innerReq) => {
    if (!VALID_SECTIONS.includes(params.section)) {
      return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
    }

    const body = await innerReq.json();
    const validated = zodValidate(SectionVisibilitySchema, body);

    if (validated instanceof NextResponse) {
      return validated;
    }

    const visibility = await db.sectionVisibility.upsert({
      where: { section: params.section },
      update: { enabled: validated.data.enabled },
      create: { section: params.section, enabled: validated.data.enabled },
    });

    return ok(visibility);
  })(req);
}
