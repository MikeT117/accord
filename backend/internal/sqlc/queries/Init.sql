-- name: GetWebsocketInitialisationPayload :one
WITH guilds_cte AS (
	SELECT
    g.*
	FROM
    guilds g
	INNER JOIN
    guild_members gm ON gm.guild_id = g.id
	WHERE
    gm.user_id = @user_id
),

icon_attachment_cte AS (
	SELECT
    ga.guild_id,
    ga.attachment_id
	FROM 
    guild_attachments ga
	INNER JOIN
    guilds_cte gcte ON gcte.id = ga.guild_id
	WHERE
    ga.usage_type = 0
	LIMIT 1
),

banner_attachment_cte AS (
	SELECT
    ga.guild_id,
    ga.attachment_id
	FROM
    guild_attachments ga
	INNER JOIN
    guilds_cte gcte ON gcte.id = ga.guild_id
	WHERE
    ga.usage_type = 1
	LIMIT 1
),

guilds_attachments_cte AS (
	SELECT
    gcte.*,
    iacte.attachment_id as icon,
    bacte.attachment_id as banner
	FROM
    guilds_cte gcte
	LEFT JOIN
    icon_attachment_cte iacte ON iacte.guild_id = gcte.id
	LEFT JOIN
    banner_attachment_cte bacte ON bacte.guild_id = gcte.id
),

user_cte AS (
	SELECT
    u.id,
    ua.attachment_id,
    u.display_name,
    u.public_flags,
    JSON_BUILD_OBJECT(
		'id', u.id,
		'avatar', ua.attachment_id,
		'displayName', u.display_name,
		'publicFlags', u.public_flags,
		'relationshipCount', u.relationship_count,
		'oauthAccountId', u.oauth_account_id,
		'updatedAt', u.updated_at
	)::JSON AS user
	FROM
    users u
	LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
	WHERE
    u.id = @user_id
),


guild_member_cte AS (
	SELECT
    gm.guild_id,
    JSON_BUILD_OBJECT(
		'nickname', gm.nickname,
		'joinedAt', gm.joined_at,
		'user', JSON_BUILD_OBJECT(
			'id', ucte.id,
			'avatar', ucte.attachment_id,
			'displayName', ucte.display_name,
			'publicFlags', ucte.public_flags
		),
		'roles', COALESCE(JSON_AGG(DISTINCT gru.role_id), '[]'::JSON)
	)::JSON AS member
	FROM 
    guild_members gm
	INNER JOIN
    user_cte ucte ON ucte.id = gm.user_id
	INNER JOIN
    guilds_cte gcte ON gcte.id = gm.guild_id
	LEFT JOIN
    guild_role_users gru ON gru.user_id = gm.user_id
	GROUP BY
    gm.guild_id,
    gm.user_id,
    ucte.id,
    ucte.attachment_id,
    ucte.display_name,
    ucte.public_flags
),

guild_roles_cte AS (
	SELECT
    gr.guild_id, 
    JSON_AGG(
		JSON_BUILD_OBJECT(
			'id', gr.id,
			'name', gr.name,
			'permissions', gr.permissions,
			'guildId', gr.guild_id,
			'creatorId', gr.creator_id,
			'updatedAt', gr.updated_at
		)
	) AS roles
	FROM
    guild_roles gr
	INNER JOIN
    guilds_cte gcte ON gcte.id = gr.guild_id
	GROUP BY
    gr.guild_id
),

channels_cte AS (
	SELECT
    c.*
	FROM
    channels c
	INNER JOIN
    guilds_cte gcte ON gcte.id = c.guild_id
),
	
	
channel_roles_cte AS (
	SELECT
    grc.channel_id,
    ARRAY_AGG(grc.role_id) as roles
	FROM
    guild_role_channels grc
	INNER JOIN
    channels_cte ccte ON ccte.id = grc.channel_id
	GROUP BY
    grc.channel_id
),

channels_roles_cte AS (
	SELECT
    c.guild_id,
    JSON_AGG(
		JSON_BUILD_OBJECT(
			'id', c.id,
			'name', c.name,
			'topic', c.topic,
			'channelType', c.channel_type,
			'parentId', c.parent_id,
			'creatorId', c.creator_id,
			'guildId', c.guild_id,
			'updatedAt', c.updated_at,
			'roles', crcte.roles
		)
	)::JSON as channels
	FROM
    channels_cte c
	INNER JOIN
    channel_roles_cte crcte ON crcte.channel_id = c.id 
	WHERE
    c.channel_type NOT IN (2, 3)
	GROUP BY
    c.guild_id
),

voice_channel_states_cte AS (
	SELECT
    vcs.user_id,
    vcs.self_mute,
    vcs.self_deaf,
    vcs.channel_id,
    vcs.guild_id
	FROM
    voice_channel_states vcs
	INNER JOIN
    channels_cte ccte ON ccte.id = vcs.channel_id 
	WHERE
    ccte.channel_type = 4
),

voice_channel_state_user_cte AS (
    SELECT
        u.id,
        JSON_BUILD_OBJECT(
            'id', u.id,
            'avatar', ua.attachment_id,
            'displayName',  (CASE
                                WHEN gm.nickname IS NOT NULL THEN gm.nickname
                                ELSE u.display_name
                            END)::text,
            'username', u.username,
            'publicFlags', u.public_flags
	    )::JSON AS user
    FROM
    guild_members gm
    INNER JOIN
    voice_channel_states_cte vcscte ON vcscte.user_id = gm.user_id
    INNER JOIN
    users u ON u.id = gm.user_id
    LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
),

voice_states_users_cte AS (
    SELECT
        COALESCE(JSON_AGG(
            JSON_BUILD_OBJECT(
            'selfMute', vcscte.self_mute,
            'selfDeaf', vcscte.self_deaf,
            'channelId', vcscte.channel_id,
            'guildId', vcscte.guild_id,
            'user', vcsucte.user
            )
        ),
	'[]'::JSON)::JSON AS "voiceChannelStates"
    FROM
    voice_channel_states_cte vcscte
    INNER JOIN 
    voice_channel_state_user_cte vcsucte ON vcsucte.id = vcscte.user_id
),

private_channels_cte AS (
	SELECT
    c.*
	FROM
    channels c
	INNER JOIN
    channel_users cu ON cu.channel_id = c.id
	WHERE
    cu.user_id = @user_id
),

private_channel_users_cte AS (
	SELECT
    cu.channel_id,
    JSON_AGG(
		JSON_BUILD_OBJECT(
			'id', u.id,
			'avatar', ua.attachment_id,
			'displayName', u.display_name,
			'publicFlags', u.public_flags
		)
	) AS users
	FROM
    users u
	LEFT JOIN
    user_attachments ua ON ua.user_id = u.id
	INNER JOIN
    channel_users cu ON cu.user_id = u.id
	INNER JOIN
    private_channels_cte pccte ON pccte.id = cu.channel_id
	GROUP BY
    cu.channel_id
),

private_channels_users_cte AS (
	SELECT
    COALESCE(JSON_AGG(
		JSON_BUILD_OBJECT(
		'id', pccte.id,
		'name', pccte.name,
		'topic', pccte.topic,
		'channelType', pccte.channel_type,
		'parentId', pccte.parent_id,
		'creatorId', pccte.creator_id,
		'guildId', pccte.guild_id,
		'updatedAt', pccte.updated_at,
		'users', COALESCE(pcucte.users, '[]'::JSON)
		)
	), '[]'::JSON)::JSON AS "privateChannels"
	FROM
    private_channels_cte pccte
	INNER JOIN
    private_channel_users_cte pcucte ON pcucte.channel_id = pccte.id
),

guilds_roles_members_channels_cte AS (
SELECT
COALESCE(JSON_AGG(
		JSON_BUILD_OBJECT(
		'id', g.id,
		'name', g.name,
		'description', g.description,
		'isDiscoverable', g.is_discoverable,
		'channelCount', g.channel_count,
		'memberCount', g.member_count,
		'creatorId', g.creator_id,
		'guildCategoryId', g.guild_category_id,
		'updatedAt', g.updated_at,
		'icon', g.icon,
		'banner', g.banner,
		'channels', COALESCE(ch.channels, '[]'::JSON),
		'roles', COALESCE(gr.roles, '[]'::JSON),
		'member', gm.member
		)
	), '[]'::JSON)::JSON AS guilds
FROM
guilds_attachments_cte g
INNER JOIN
guild_member_cte gm ON gm.guild_id = g.id
INNER JOIN
guild_roles_cte gr ON gr.guild_id = g.id
INNER JOIN
user_cte ucte ON ucte.id IS NOT NULL
LEFT JOIN
channels_roles_cte ch ON ch.guild_id = g.id
)

SELECT
ucte.user,
grmccte.guilds,
pcucte."privateChannels",
vsucte."voiceChannelStates"
FROM
user_cte ucte,
guilds_roles_members_channels_cte grmccte,
private_channels_users_cte pcucte,
voice_states_users_cte vsucte;