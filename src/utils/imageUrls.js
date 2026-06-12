import noImage from "../assets/no-image.jpeg";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return noImage;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  return `${import.meta.env.VITE_API_URL}/uploads/${imagePath}`;
};