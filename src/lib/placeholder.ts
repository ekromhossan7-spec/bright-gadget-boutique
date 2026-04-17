import noImage from "@/assets/no-image.png";

export const NO_IMAGE = noImage;

export const imgOr = (src?: string | null) => src && src.trim() ? src : NO_IMAGE;
