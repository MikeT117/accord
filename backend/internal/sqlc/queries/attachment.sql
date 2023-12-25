-- name: CreateAttachment :execrows
INSERT INTO
attachments
(id, resource_type, signature, attached_by_id, unix_timestamp, height, width, filesize)
VALUES
(@id, @resource_type, @signature, @attached_by_id, @unix_timestamp, @height, @width, @filesize);

-- name: LinkAttachmentToUser :execrows
WITH unlink_existing_cte AS (
  DELETE FROM
  user_attachments
  WHERE
  user_id = @user_id
)

INSERT INTO
user_attachments
(attachment_id, user_id)
VALUES
(@attachment_id, @user_id);

-- name: LinkAttachmentsToChannelMessage :execrows
INSERT INTO
channel_message_attachments (attachment_id, channel_message_id)
SELECT
id,
@message_id
FROM
attachments
WHERE
id = ANY(@attachment_ids::uuid[]);

-- name: LinkAttachmentToGuild :execrows
WITH unlink_existing_cte AS (
  DELETE FROM
  guild_attachments
  WHERE
  guild_id = @guild_id
  AND
  usage_type = @usage_type
)

INSERT INTO
guild_attachments
(attachment_id, guild_id, usage_type)
VALUES
(@attachment_id, @guild_id, @usage_type);

-- name: DeleteAttachment :execrows
DELETE
FROM
attachments
WHERE
id = @attachment_id
AND
attached_by_id = @user_id;

-- name: GetAttachmentByID :one
SELECT
*
FROM
attachments
WHERE
id = @attachment_id;

-- name: GetAttachmentCountByMessageID :one
SELECT
COUNT(attachment_id)
FROM
channel_message_attachments
WHERE
channel_message_id = @message_id;