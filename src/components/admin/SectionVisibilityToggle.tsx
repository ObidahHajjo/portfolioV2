'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type SectionVisibilityToggleProps = {
  section: 'articles' | 'open_source' | 'talks';
  enabled: boolean;
};

export function SectionVisibilityToggle({
  section,
  enabled: initialEnabled,
}: SectionVisibilityToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <label className="flex items-center gap-3">
      <input
        type="checkbox"
        checked={enabled}
        disabled={isSaving}
        onChange={async (event) => {
          const nextEnabled = event.target.checked;

          setEnabled(nextEnabled);
          setIsSaving(true);

          try {
            const response = await fetch(`/api/admin/section-visibility/${section}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ enabled: nextEnabled }),
            });

            if (!response.ok) {
              setEnabled(!nextEnabled);
              toast.error('Failed to update visibility');
            }
          } catch {
            setEnabled(!nextEnabled);
            toast.error('Failed to update visibility');
          } finally {
            setIsSaving(false);
          }
        }}
        className="size-4 rounded border-gray-300"
      />
      <span className="text-sm">Show section on public portfolio</span>
    </label>
  );
}
