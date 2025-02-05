import { useRef, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

function ImageUploadButton({
  onImagesUploaded,
}: {
  onImagesUploaded: (images: Image[]) => void;
}) {
  // deno-lint-ignore no-explicit-any
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [imageFiles, _setImageFiles] = useState([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // deno-lint-ignore no-explicit-any
  const handleImageUpload = (event: any) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file as Blob),
    }));
    const previousImages = previewImages;
    setPreviewImages([...previousImages, ...newImages]);

    // deno-lint-ignore no-explicit-any
    const newPreviewImages: any[] = [];
    const promises = files.map((file) => {
      return new Promise<void>((resolve) => {
        const fileReader = new FileReader();

        fileReader.addEventListener("load", (e) => {
          const data_url = e.target!.result;
          // const type = data_url.split(";")[0].split(":")[1];
          const imageObject = {
            type: "image_url",
            image_url: {
              url: data_url,
              detail: "high",
            },
          };

          newPreviewImages.push(imageObject);
          resolve();
        });

        fileReader.readAsDataURL(file as Blob);
      });
    });

    Promise.all(promises).then(() => {
      // All files have been processed and newImages is ready for postprocessing
      console.log("All files processed", newPreviewImages);
      const finalImages = [...imageFiles, ...newPreviewImages];
      onImagesUploaded(finalImages);
    });
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        multiple
        class="hidden"
      />
      <button
        onClick={onButtonClick}
        disabled={!IS_BROWSER}
        class="disabled:opacity-50 disabled:cursor-not-allowed rounded-md p-2 bg-gray-100 text-blue-600/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon icon-tabler icons-tabler-outline icon-tabler-photo-up"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M15 8h.01" />
          <path d="M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5" />
          <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l3.5 3.5" />
          <path d="M14 14l1 -1c.679 -.653 1.473 -.829 2.214 -.526" />
          <path d="M19 22v-6" />
          <path d="M22 19l-3 -3l-3 3" />
        </svg>
      </button>
    </>
  );
}

export default ImageUploadButton;
