'use client';

import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  deleteGalleryImage,
  GALLERY_CATEGORIES,
  type GalleryImage,
  getGalleryImageUrl,
  getGalleryImages,
  uploadGalleryImage,
} from '@/services/gallery';

function getCategoryLabel(value: string): string {
  return GALLERY_CATEGORIES.find(c => c.value === value)?.label ?? value;
}

export function GalleryManagementScreen() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [uploadCategory, setUploadCategory] = useState<string>(
    GALLERY_CATEGORIES[0].value
  );
  const [uploadAlt, setUploadAlt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const category = filterCategory === 'all' ? undefined : filterCategory;
      const res = await getGalleryImages(category);
      setImages(res.data);
    } catch {
      toast.error('Failed to load gallery images');
    } finally {
      setIsLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await uploadGalleryImage(
        selectedFile,
        uploadCategory,
        uploadAlt || undefined
      );
      toast.success('Image uploaded successfully');
      setSelectedFile(null);
      setUploadAlt('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      void fetchImages();
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteGalleryImage(deleteTarget.id);
      toast.success('Image deleted successfully');
      setDeleteTarget(null);
      void fetchImages();
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredImages =
    filterCategory === 'all'
      ? images
      : images.filter(img => img.category === filterCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Gallery Management
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload and manage images displayed on the landing page.
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="size-5" />
            Upload New Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="gallery-file">Image File</Label>
              <Input
                ref={fileInputRef}
                id="gallery-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-muted-foreground text-xs">
                JPEG, PNG, or WebP. Max 5 MB.
              </p>
            </div>

            <div className="w-full space-y-2 sm:w-48">
              <Label>Category</Label>
              <Select value={uploadCategory} onValueChange={setUploadCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2 sm:w-56">
              <Label htmlFor="gallery-alt">Alt Text (optional)</Label>
              <Input
                id="gallery-alt"
                placeholder="Describe the image..."
                value={uploadAlt}
                onChange={e => setUploadAlt(e.target.value)}
              />
            </div>

            <Button
              onClick={() => void handleUpload()}
              disabled={!selectedFile || isUploading}
              className="shrink-0"
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter + Image Grid */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">
              Gallery Images ({filteredImages.length})
            </CardTitle>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {GALLERY_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-16 text-center">
              <ImagePlus className="mb-3 size-10 opacity-40" />
              <p className="font-medium">No images found</p>
              <p className="mt-1 text-sm">
                Upload your first image using the form above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredImages.map(img => (
                <div
                  key={img.id}
                  className="border-border group relative overflow-hidden rounded-lg border"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={getGalleryImageUrl(img.filename)}
                      alt={img.alt ?? img.originalFilename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40" />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => setDeleteTarget(img)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <p className="text-foreground truncate text-sm font-medium">
                      {img.originalFilename}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(img.category)}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {(img.sizeBytes / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;
              {deleteTarget?.originalFilename}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
