'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type CvAsset = {
  id: string;
  fileName: string;
  fileSize: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminCvPage() {
  const [cv, setCv] = useState<CvAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCv = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/cv');
      const data = await response.json();
      setCv(data.cv);
    } catch {
      toast.error('Failed to load CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCv();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/cv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Upload failed');
        return;
      }

      toast.success('CV uploaded successfully');
      setCv(data.cv);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete the current CV?')) return;

    setDeleting(true);
    try {
      const response = await fetch('/api/admin/cv', {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error('Failed to delete CV');
        return;
      }

      toast.success('CV deleted');
      setCv(null);
    } catch {
      toast.error('Failed to delete CV');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    window.open('/api/cv/download', '_blank');
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">CV Management</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-foreground">CV Management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload and manage your downloadable CV PDF.
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Current CV</CardTitle>
          <CardDescription>
            The PDF file available for public download on your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cv ? (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{cv.fileName}</span>
                    <Badge>Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(cv.fileSize)} • Uploaded{' '}
                    {new Date(cv.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleDownload} variant="outline">
                  Download
                </Button>
                <Button onClick={handleDelete} variant="destructive" disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">No CV uploaded.</p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {cv ? 'Replace CV' : 'Upload CV'} (PDF, max 10MB)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
