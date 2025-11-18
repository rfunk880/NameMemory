<?php
/**
 * Image Optimization Utility
 * Resizes, compresses, and converts images to WebP
 */
class ImageOptimizer {

    /**
     * Process uploaded image: resize, compress, convert to WebP
     * @return array ['photo_url' => string, 'thumbnail_url' => string] or false on error
     */
    public static function processUpload($file, $uploadDir = null) {
        if (!$uploadDir) {
            $uploadDir = UPLOAD_DIR;
        }

        // Validate file
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return false;
        }

        // Check file size
        if ($file['size'] > UPLOAD_MAX_SIZE) {
            return false;
        }

        // Check file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            return false;
        }

        // Generate unique filename
        $uniqueId = uniqid() . '_' . time();
        $photoFilename = $uniqueId . '.webp';
        $thumbnailFilename = $uniqueId . '_thumb.webp';

        $photoPath = $uploadDir . 'photos/' . $photoFilename;
        $thumbnailPath = $uploadDir . 'thumbnails/' . $thumbnailFilename;

        // Load image based on type
        $image = null;
        switch ($mimeType) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($file['tmp_name']);
                break;
            case 'image/png':
                $image = imagecreatefrompng($file['tmp_name']);
                break;
            case 'image/webp':
                $image = imagecreatefromwebp($file['tmp_name']);
                break;
        }

        if (!$image) {
            return false;
        }

        // Get original dimensions
        $originalWidth = imagesx($image);
        $originalHeight = imagesy($image);

        // Create and save full-size image (max 800px width)
        $photoImage = self::resizeImage($image, $originalWidth, $originalHeight, PHOTO_MAX_WIDTH);
        if (!imagewebp($photoImage, $photoPath, PHOTO_QUALITY)) {
            imagedestroy($image);
            imagedestroy($photoImage);
            return false;
        }
        imagedestroy($photoImage);

        // Create and save thumbnail (150px)
        $thumbnailImage = self::resizeImage($image, $originalWidth, $originalHeight, THUMBNAIL_SIZE);
        if (!imagewebp($thumbnailImage, $thumbnailPath, PHOTO_QUALITY)) {
            imagedestroy($image);
            imagedestroy($thumbnailImage);
            unlink($photoPath); // Clean up photo if thumbnail fails
            return false;
        }
        imagedestroy($thumbnailImage);
        imagedestroy($image);

        // Return relative URLs
        return [
            'photo_url' => 'uploads/photos/' . $photoFilename,
            'thumbnail_url' => 'uploads/thumbnails/' . $thumbnailFilename
        ];
    }

    /**
     * Resize image maintaining aspect ratio
     */
    private static function resizeImage($image, $originalWidth, $originalHeight, $maxWidth) {
        // Calculate new dimensions
        if ($originalWidth <= $maxWidth) {
            $newWidth = $originalWidth;
            $newHeight = $originalHeight;
        } else {
            $ratio = $maxWidth / $originalWidth;
            $newWidth = $maxWidth;
            $newHeight = (int)($originalHeight * $ratio);
        }

        // Create new image
        $newImage = imagecreatetruecolor($newWidth, $newHeight);

        // Preserve transparency
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);

        // Resize
        imagecopyresampled(
            $newImage, $image,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $originalWidth, $originalHeight
        );

        return $newImage;
    }

    /**
     * Delete image files
     */
    public static function deleteImages($photoUrl, $thumbnailUrl, $uploadDir = null) {
        if (!$uploadDir) {
            $uploadDir = UPLOAD_DIR;
        }

        $photoPath = $uploadDir . '../' . $photoUrl;
        $thumbnailPath = $uploadDir . '../' . $thumbnailUrl;

        if (file_exists($photoPath)) {
            unlink($photoPath);
        }
        if (file_exists($thumbnailPath)) {
            unlink($thumbnailPath);
        }
    }
}
