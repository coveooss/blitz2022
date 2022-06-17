const useImageVine = import.meta.env?.VITE_USE_IMAGE_VINE as string;
export const USE_IMAGE_VINE = useImageVine == '1' || useImageVine == 'true' || false;
