'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function MediaUploadField({
  ownerType,
  ownerId,
  currentUrl,
  onUploaded,
}: {
  ownerType: string;
  ownerId: string;
  currentUrl?: string;
  onUploaded: (asset: { id: string; storageUrl: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="space-y-3 rounded-xl border border-dashed p-4">
      <div>
        <h3 className="text-sm font-medium text-foreground">Media Asset</h3>
        <p className="text-sm text-muted-foreground">
          Upload an image or PDF and link it to this record.
        </p>
      </div>

      {currentUrl ? (
        <a
          className="text-sm text-primary underline-offset-4 hover:underline"
          href={currentUrl}
          target="_blank"
        >
          Current media
        </a>
      ) : null}

      <Input
        type="file"
        accept="image/*,application/pdf"
        disabled={uploading}
        onChange={async (event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          const formData = new FormData();
          formData.append('file', file);
          formData.append('ownerType', ownerType);
          formData.append('ownerId', ownerId);

          setUploading(true);
          const response = await fetch('/api/admin/media-assets/upload', {
            method: 'POST',
            body: formData,
          });
          setUploading(false);

          const payload = (await response.json().catch(() => ({}))) as {
            id?: string;
            storageUrl?: string;
            error?: string;
          };

          if (!response.ok || !payload.id || !payload.storageUrl) {
            toast.error(payload.error ?? 'Upload failed');
            return;
          }

          toast.success('Upload complete');
          onUploaded({ id: payload.id, storageUrl: payload.storageUrl });
          event.target.value = '';
        }}
      />

      {uploading ? <Button disabled>Uploading...</Button> : null}
    </div>
  );
}
