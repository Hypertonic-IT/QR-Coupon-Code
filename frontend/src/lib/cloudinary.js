import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads to Cloudinary or returns the base64 string if not configured.
 * This ensures the app doesn't crash if credentials aren't provided.
 */
export const uploadToCloudinary = async (fileStr, folder) => {
  if (!process.env.CLOUDINARY_API_KEY) {
    console.warn("Cloudinary not configured. Using base64 fallback.");
    return fileStr;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: folder,
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return fileStr; // Fallback to base64
  }
};

export default cloudinary;
