import { ChangeEvent, ReactNode, useRef, useState } from 'react';
import { useSignAttachmentMutation } from '@/api/attachments/signAttachment';
import { env } from '../env';
import { useUploadAttachmentMutation } from '../api/attachments/uploadAttachment';
import { toastStore } from '../shared-components/Toast';
import { useI18nContext } from '../i18n/i18n-react';

type UploadedAttachment = {
    id: string;
    preview: string;
};

const readFile = (file: File): Promise<{ preview: string; height: number; width: number }> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                resolve({ preview: image.src, height: image.height, width: image.width });
            };
            image.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

export const useCloudinary = () => {
    const { LL } = useI18nContext();
    const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
    const ref = useRef<HTMLInputElement | null>(null);

    const { mutateAsync: signAttachment } = useSignAttachmentMutation();
    const { mutateAsync: uploadAttachment } = useUploadAttachmentMutation();

    const onFileUploadClick = () => {
        if (!env.cloudinaryUrl || !env.cloudinaryApiKey) {
            console.warn(
                'Cloudinary URL/API-KEY not valid, attachment upload functionality disabled!',
            );
            return;
        }

        if (typeof ref.current?.click === 'function') {
            ref.current.click();
        }
    };

    const uploadFile = async (file: File, height: number, width: number) => {
        const signedAttachment = await signAttachment({
            filename: file.name,
            filesize: file.size,
            height: height,
            width: width,
            resourceType: file.type,
        });

        await uploadAttachment({
            file,
            uploadURL: signedAttachment.uploadURL,
        });

        return { id: signedAttachment.id };
    };

    const handleUploadInputChange = async ({ target }: ChangeEvent<HTMLInputElement>) => {
        if (!target.files) {
            return;
        }

        await Promise.allSettled(
            Array.from(target.files).map(async (file) => {
                try {
                    const readAttachment = await readFile(file);
                    const uploadedAttachment = await uploadFile(
                        file,
                        readAttachment.height,
                        readAttachment.width,
                    );

                    setAttachments((s) => [
                        ...s,
                        { id: uploadedAttachment.id, preview: readAttachment.preview },
                    ]);
                } catch (e) {
                    toastStore.create({
                        title: LL.Toasts.Titles.UploadFailed(),
                        type: 'ERROR',
                        description: LL.Toasts.Descriptions.UploadFailed({ fileName: file.name }),
                    });

                    console.error('Attachment upload error: ', e);
                }
            }),
        );
    };

    const UploadWrapper = ({
        id,
        children,
        disabled = false,
        multiple = true,
    }: {
        id: string;
        children?: ReactNode;
        disabled?: boolean;
        multiple?: boolean;
    }) => (
        <label htmlFor={id} className='m-0 cursor-pointer p-0'>
            {children}
            <input
                id={id}
                name={id}
                ref={ref}
                onChange={handleUploadInputChange}
                type='file'
                style={{ display: 'none' }}
                disabled={disabled}
                multiple={multiple}
            />
        </label>
    );

    return {
        ref,
        attachments,
        UploadWrapper,
        onFileUploadClick,
        deleteAttachment: (id: string) => setAttachments((s) => s.filter((a) => a.id !== id)),
        clearAttachments: () => setAttachments([]),
    };
};
