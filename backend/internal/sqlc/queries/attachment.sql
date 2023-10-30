-- name: CreateAttachment :execrows
INSERT INTO attachments (id, resource_type, signature, attached_by_id, unix_timestamp, height, width, filesize)
VALUES (@id, @resource_type, @signature, @attached_by_id, @unix_timestamp, @height, @width, @filesize);

-- name: LinkAttachmentToUser :execrows
WITH updated_attachment_cte AS (
  UPDATE attachments
  SET linked = true
  WHERE id = @attachment_id
  RETURNING id
)
INSERT INTO user_attachments (attachment_id, user_id)
SELECT id, @user_id
FROM updated_attachment_cte;

-- name: LinkAttachmentToChannelMessage :execrows
WITH updated_attachment_cte AS (
  UPDATE attachments
  SET linked = true
  WHERE id = @attachment_id
  RETURNING *
)
INSERT INTO channel_message_attachments (attachment_id, channel_message_id)
SELECT id, @message_id
FROM updated_attachment_cte;

-- name: LinkAttachmentsToChannelMessage :execrows
WITH updated_attachment_cte AS (
  UPDATE attachments
  SET linked = true
  WHERE id = ANY(@attachment_ids::uuid[])
  RETURNING *
)
INSERT INTO channel_message_attachments (attachment_id, channel_message_id)
SELECT id, @message_id
FROM updated_attachment_cte;

-- name: LinkAttachmentToGuild :execrows
WITH updated_attachment_cte AS (
  UPDATE attachments
  SET linked = true
  WHERE id = @attachment_id
  RETURNING id
)
INSERT INTO guild_attachments (attachment_id, guild_id, usage_type)
SELECT id, @guild_id, @usage_type
FROM updated_attachment_cte;

-- name: DeleteAttachment :execrows
DELETE
FROM attachments
WHERE id = @attachment_id AND attached_by_id = @user_id;

-- name: GetAttachmentByID :one
SELECT *
FROM attachments
WHERE id = @attachment_id;