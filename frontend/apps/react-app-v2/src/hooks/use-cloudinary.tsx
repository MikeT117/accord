import { env } from "@/lib/constants";
import { useSignAttachmentMutation } from "@/lib/react-query/mutations/sign-attachment-mutation";
import { useUploadAttachmentMutation } from "@/lib/react-query/mutations/upload-attachment-mutation";
import { useState, useRef, type ChangeEvent, type ReactNode } from "react";

export type AttachmentPreview = {
    id: string;
    name: string;
    preview: string;
};

function createPreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (!file.type.includes("image/")) {
            resolve("");
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => resolve(image.src);
            image.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function useCloudinary() {
    const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
    const [error, setError] = useState(false);
    const ref = useRef<HTMLInputElement | null>(null);

    const { mutateAsync: signAttachment } = useSignAttachmentMutation();
    const { mutateAsync: uploadAttachment } = useUploadAttachmentMutation();

    function onFileUploadClick() {
        if (!env.CLOUDINARY_URL || !env.CLOUDINARY_API_KEY) {
            console.warn("Cloudinary URL/API-KEY not valid, attachment upload functionality disabled!");
            return;
        }

        if (typeof ref.current?.click !== "function") {
            return;
        }

        ref.current.click();
    }

    async function handleUploadInputChange({ target }: ChangeEvent<HTMLInputElement>) {
        if (!target.files) {
            return;
        }

        await Promise.allSettled(
            Array.from(target.files).map(async (file) => {
                try {
                    const preview = await createPreview(file);
                    const { id, signature, timestamp } = await signAttachment({
                        filename: file.name,
                        filesize: file.size,
                        resourceType: file.type,
                    });

                    await uploadAttachment({
                        id,
                        file,
                        signature,
                        timestamp,
                    });
                    setAttachments((s) => [...s, { id, preview, name: file.name }]);
                } catch (e) {
                    setError(true);
                    console.error("Attachment upload error: ", e);
                }
            })
        );
    }

    function UploadWrapper({
        id,
        children,
        disabled = false,
        multiple = true,
    }: {
        id: string;
        children?: ReactNode;
        disabled?: boolean;
        multiple?: boolean;
    }) {
        return (
            <label htmlFor={id} className="m-0 cursor-pointer p-0">
                {children}
                <input
                    id={id}
                    name={id}
                    ref={ref}
                    onChange={handleUploadInputChange}
                    type="file"
                    style={{ display: "none" }}
                    disabled={disabled}
                    multiple={multiple}
                />
            </label>
        );
    }

    return {
        ref,
        attachments,
        error,
        UploadWrapper,
        onFileUploadClick,
        deleteAttachment: (id: string) => setAttachments((s) => s.filter((a) => a.id !== id)),
        clearAttachments: () => setAttachments([]),
    };
}
