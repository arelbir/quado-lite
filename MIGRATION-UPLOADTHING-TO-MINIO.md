# 📦 UploadThing → MinIO Migration Guide

## ✅ Migration Completed

### **Changes Made:**

#### 1. **New Files Created:**
- `src/lib/storage/minio-client.ts` - MinIO S3 client configuration
- `src/lib/storage/upload-helpers.ts` - File upload/delete helpers
- `src/lib/storage/minio-actions.ts` - Server actions for file operations
- `src/app/api/upload/route.ts` - File upload endpoint
- `src/app/api/upload/delete/route.ts` - File delete endpoint
- `src/components/ui/custom/image-upload-minio.tsx` - MinIO upload component

#### 2. **Files Updated:**
- `src/app/(main)/settings/_components/user-card.tsx` - Uses MinIO instead of UploadThing
- `src/config/routes.ts` - Removed `/api/uploadthing` from public routes

#### 3. **Files Removed:**
- `src/app/api/uploadthing/route.ts` ❌
- `src/config/uploadthing.ts` ❌
- `src/lib/core/uploadthing.ts` ❌
- `src/lib/uploadthing-actions.ts` ❌
- `src/components/ui/custom/image-upload.tsx` → Renamed to `.backup`

---

## 🚀 Next Steps

### **1. Remove UploadThing Dependencies**
```bash
pnpm remove uploadthing @uploadthing/react
```

### **2. Install MinIO Dependencies**
```bash
pnpm add minio
pnpm add -D @types/minio
```

### **3. Install Required React Dependencies**
```bash
pnpm add react-dropzone
```

### **4. Update Environment Variables**
Ensure your `.env` has MinIO configuration:
```bash
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=quado-uploads
```

### **5. Start MinIO (Docker)**
```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=admin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  quay.io/minio/minio server /data --console-address ":9001"
```

Or use your existing `docker-compose.yml`:
```yaml
services:
  minio:
    image: quay.io/minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
```

### **6. Initialize MinIO Bucket**
The bucket will be created automatically on first upload, or you can create it manually via MinIO console at http://localhost:9001

### **7. Update Other Upload Components**
If you have other components using UploadThing, update them to use `ImageUploadMinio` instead:

```tsx
// Old
import { ImageUpload } from '@/components/ui/custom/image-upload';

// New
import { ImageUploadMinio } from '@/components/ui/custom/image-upload-minio';
```

---

## 🔍 Search for Remaining UploadThing Usage

Run this command to find any remaining UploadThing references:
```bash
# Windows PowerShell
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Select-String "uploadthing|UploadThing" -CaseSensitive

# Linux/Mac
grep -r "uploadthing\|UploadThing" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/
```

---

## 📝 API Changes

### **Upload File:**
**Before (UploadThing):**
```tsx
const { startUpload } = useUploadThing("imageUploader");
const result = await startUpload(files);
```

**After (MinIO):**
```tsx
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// { success: true, url: "http://...", key: "abc123.jpg" }
```

### **Delete File:**
**Before (UploadThing):**
```tsx
import { deleteUploadthingFiles } from '@/lib/uploadthing-actions';
await deleteUploadthingFiles(filename);
```

**After (MinIO):**
```tsx
import { deleteMinioFile } from '@/lib/storage/minio-actions';
await deleteMinioFile(key);
```

---

## ✅ Benefits

- ✅ **Self-hosted**: No external dependencies or API limits
- ✅ **S3 Compatible**: Works with any S3-compatible storage
- ✅ **Cost Effective**: No per-upload or storage fees
- ✅ **Docker-First**: Integrates with your existing Docker stack
- ✅ **Full Control**: Direct access to files and storage management
- ✅ **Production Ready**: MinIO is battle-tested and enterprise-grade

---

## 🐛 Troubleshooting

### MinIO Connection Error
- Ensure MinIO is running: `docker ps | grep minio`
- Check environment variables are set correctly
- Verify network connectivity to MinIO port (9000)

### Upload Fails
- Check file size limits (default 10MB)
- Verify file type is allowed
- Check MinIO bucket permissions

### Files Not Accessible
- Ensure bucket policy is set to public read
- Check `MINIO_PUBLIC_URL` environment variable
- Verify MinIO is accessible from your app

---

## 📚 Additional Resources

- [MinIO Documentation](https://min.io/docs/minio/linux/index.html)
- [MinIO JavaScript SDK](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
- [S3 API Compatibility](https://docs.min.io/docs/minio-server-configuration-guide.html)
