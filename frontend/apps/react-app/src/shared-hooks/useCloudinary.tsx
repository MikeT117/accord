import type { Attachment } from '@accord/common';
import { ChangeEvent, memo, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { useDeleteAttachmentMutation } from '@/api/attachment/deleteAttachment';
import { useSignAttachmentMutation } from '@/api/attachment/signAttachment';
import { env } from '../env';

export type CloudinaryResp = {
  access_mode: string;
  api_key: string;
  asset_id: string;
  bytes: number;
  created_at: string;
  etag: string;
  folder: string;
  format: string;
  height: number;
  placeholder: boolean;
  public_id: string;
  resource_type: string;
  secure_url: string;
  signature: string;
  tags: string[];
  type: string;
  url: string;
  version: number;
  version_id: string;
  width: number;
};

const uploadFile = async ({
  file,
  publicId,
  signature,
  timestamp,
}: {
  file: File;
  publicId: string;
  timestamp: number;
  signature: string;
}): Promise<CloudinaryResp | null> => {
  if (!timestamp || !signature) {
    throw new Error('timestamp and/or signature empty');
  }
  if (!publicId) {
    throw new Error('File has no public ID');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', env.cloudinaryApiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  try {
    const resp = await fetch(env.cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });

    if (!resp.ok) {
      return null;
    }

    return resp.json();
  } catch {
    return null;
  }
};

export const useCloudinary = () => {
  const [attachments, setAttachments] = useState<Omit<Attachment, 'id'>[]>([]);
  const ref = useRef<HTMLInputElement | null>(null);

  const { mutateAsync: signAttachment } = useSignAttachmentMutation();
  const { mutateAsync: delAttachment } = useDeleteAttachmentMutation();

  const onFileUploadClick = useCallback(() => {
    if (!env.cloudinaryUrl && !env.cloudinaryApiKey) {
      alert('Cloudinary URL/API-KEY not valid, attachment upload disabled!');
      return;
    }
    if (ref.current) {
      ref.current.click();
    }
  }, []);

  const deleteAttachment = useCallback(
    async ({
      publicId,
      resourceType,
      timestamp,
      signature,
    }: Pick<Attachment, 'publicId' | 'resourceType' | 'timestamp' | 'signature'>) => {
      await delAttachment({ publicId, resourceType, timestamp, signature });
      setAttachments((s) => s.filter((a) => a.signature !== signature));
    },
    [delAttachment],
  );

  const deleteAttachments = useCallback(
    async (includeCloud = false) => {
      if (attachments.length === 0) {
        return;
      }
      if (includeCloud) {
        await Promise.all(attachments.map(async (a) => deleteAttachment({ ...a })));
      }
      setAttachments([]);
    },
    [attachments, deleteAttachment],
  );

  const UploadWrapper = memo(
    ({
      id,
      children,
      disabled = false,
      multiple = true,
    }: {
      id: string;
      children?: ReactNode;
      disabled?: boolean;
      multiple?: boolean;
    }) => {
      const handleChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
        if (!target.files || target.files.length === 0) {
          return;
        }

        Array.from(target.files).map(async (file) => {
          const cloudinaryPayload = await signAttachment({
            fileName: file.name,
          });
          const cloudinaryResponse = await uploadFile({
            file,
            ...cloudinaryPayload,
          });

          if (
            !cloudinaryResponse?.height ||
            !cloudinaryResponse?.width ||
            !cloudinaryResponse?.secure_url ||
            !cloudinaryResponse?.bytes ||
            !cloudinaryResponse?.resource_type ||
            !cloudinaryResponse?.public_id ||
            !cloudinaryResponse?.signature ||
            !cloudinaryPayload.timestamp
          ) {
            return;
          }
          setAttachments((s) => [
            ...s,
            {
              name: file.name,
              height: cloudinaryResponse.height,
              width: cloudinaryResponse.width,
              src: cloudinaryResponse.secure_url,
              size: cloudinaryResponse.bytes,
              resourceType: cloudinaryResponse.resource_type,
              publicId: cloudinaryResponse.public_id,
              signature: cloudinaryResponse.signature,
              timestamp: cloudinaryPayload.timestamp,
            },
          ]);
        });
      }, []);
      return (
        <label htmlFor={id} className='m-0 cursor-pointer p-0'>
          {children}
          <input
            id={id}
            name={id}
            ref={ref}
            onChange={handleChange}
            type='file'
            style={{ display: 'none' }}
            disabled={disabled}
            multiple={multiple}
          />
        </label>
      );
    },
  );

  UploadWrapper.displayName = 'UploadWrapper';

  return {
    ref,
    attachments,
    onFileUploadClick,
    UploadWrapper,
    deleteAttachment,
    deleteAttachments,
  };
};
