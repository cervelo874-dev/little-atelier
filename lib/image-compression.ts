import imageCompression from 'browser-image-compression';

export async function compressImage(file: File) {
    const options = {
        maxSizeMB: 0.3, // Target ~300KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/jpeg',
    }

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Compression failed:", error);
        throw error;
    }
}
