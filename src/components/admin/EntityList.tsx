'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type EntityItem = Record<string, unknown> & {
  id?: string;
  published?: boolean;
  isVisible?: boolean;
};

export function EntityList({
  items,
  columns,
  onEdit,
  onDelete,
  extraActions,
  entityPath,
  editBasePath,
  lifecycleActions,
  orderField,
  previewBasePath,
  showEdit = true,
}: {
  items: EntityItem[];
  columns: { key: string; label: string }[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  extraActions?: (item: EntityItem) => React.ReactNode;
  entityPath?: string;
  editBasePath?: string;
  lifecycleActions?: boolean;
  orderField?: boolean;
  previewBasePath?: string;
  showEdit?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [orderValues, setOrderValues] = useState<Record<string, number>>(
    Object.fromEntries(items.map((item) => [String(item.id ?? ''), Number(item.displayOrder ?? 0)]))
  );

  const pendingItem = useMemo(
    () => items.find((item) => item.id === pendingDeleteId),
    [items, pendingDeleteId]
  );

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {orderField ? <TableHead>Order</TableHead> : null}
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2 + (orderField ? 1 : 0)}
                  className="py-10 text-center text-muted-foreground"
                >
                  No records yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const itemId = String(item.id ?? '');

                return (
                  <TableRow key={itemId}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>{String(item[column.key] ?? '-')}</TableCell>
                    ))}
                    {orderField ? (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            className="w-20"
                            type="number"
                            min={0}
                            value={String(orderValues[itemId] ?? 0)}
                            onChange={(event) =>
                              setOrderValues((current) => ({
                                ...current,
                                [itemId]: Number(event.target.value),
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              if (!entityPath || !itemId) {
                                return;
                              }

                              const response = await fetch(`${entityPath}/${itemId}/order`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ displayOrder: orderValues[itemId] ?? 0 }),
                              });
                              const payload = (await response.json().catch(() => ({}))) as {
                                error?: string;
                              };

                              if (!response.ok) {
                                toast.error(payload.error ?? 'Unable to save order');
                                return;
                              }

                              toast.success('Order saved');
                              router.refresh();
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </TableCell>
                    ) : null}
                    <TableCell>
                      {'published' in item && typeof item.published === 'boolean' ? (
                        item.published ? (
                          item.isVisible === false ? (
                            <Badge variant="secondary">Hidden</Badge>
                          ) : (
                            <Badge>Published</Badge>
                          )
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {extraActions?.(item)}
                        {previewBasePath && itemId ? (
                          <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={`${previewBasePath}/${itemId}`} target="_blank" />}
                          >
                            Preview
                          </Button>
                        ) : null}
                        {lifecycleActions && entityPath && itemId ? (
                          <>
                            {!item.published ? (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const response = await fetch(`${entityPath}/${itemId}/publish`, {
                                    method: 'PATCH',
                                  });
                                  const payload = (await response.json().catch(() => ({}))) as {
                                    error?: string;
                                  };
                                  if (!response.ok) {
                                    toast.error(payload.error ?? 'Unable to publish');
                                    return;
                                  }
                                  toast.success('Published');
                                  router.refresh();
                                }}
                              >
                                Publish
                              </Button>
                            ) : null}
                            {item.published && item.isVisible !== false ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    await fetch(`${entityPath}/${itemId}/unpublish`, {
                                      method: 'PATCH',
                                    });
                                    router.refresh();
                                  }}
                                >
                                  Unpublish
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async () => {
                                    await fetch(`${entityPath}/${itemId}/hide`, {
                                      method: 'PATCH',
                                    });
                                    router.refresh();
                                  }}
                                >
                                  Hide
                                </Button>
                              </>
                            ) : null}
                            {item.published && item.isVisible === false ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  await fetch(`${entityPath}/${itemId}/show`, { method: 'PATCH' });
                                  router.refresh();
                                }}
                              >
                                Show
                              </Button>
                            ) : null}
                          </>
                        ) : null}
                        {showEdit && itemId ? (
                          onEdit ? (
                            <Button variant="outline" size="sm" onClick={() => onEdit(itemId)}>
                              Edit
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              render={<Link href={`${editBasePath ?? pathname}/${itemId}`} />}
                            >
                              Edit
                            </Button>
                          )
                        ) : null}
                        {onDelete && itemId ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPendingDeleteId(itemId)}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>
              This action permanently removes{' '}
              <strong>{String(pendingItem?.id ?? 'the selected record')}</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (pendingDeleteId) {
                  if (onDelete) {
                    onDelete(pendingDeleteId);
                  } else if (entityPath) {
                    const response = await fetch(`${entityPath}/${pendingDeleteId}`, {
                      method: 'DELETE',
                    });
                    const payload = (await response.json().catch(() => ({}))) as { error?: string };

                    if (!response.ok) {
                      toast.error(payload.error ?? 'Unable to delete');
                    } else {
                      toast.success('Deleted');
                      router.refresh();
                    }
                  }
                }
                setPendingDeleteId(null);
              }}
            >
              Confirm delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
