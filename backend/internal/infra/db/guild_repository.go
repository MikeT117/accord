package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain"
	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type GuildRepository struct {
	db DBGetter
}

func CreateGuildRepository(db DBGetter) repositories.GuildRepository {
	return &GuildRepository{db: db}
}

func (r *GuildRepository) GetDiscoverable(ctx context.Context) ([]*entities.Guild, error) {
	rows, err := r.db(ctx).Query(ctx, `
        SELECT
                id,
                creator_id,
                guild_category_id,
                name,
                description,
                discoverable,
                channel_count,
                member_count,
                icon_id,
                banner_id,
                created_at,
                updated_at
        FROM
                guild
        WHERE
                discoverable;
       `)

	if err != nil {
		return nil, wrapUnknownErr("select discoverable  by guild idsfailed", err)
	}
	defer rows.Close()

	guilds := []*entities.Guild{}
	for rows.Next() {
		guild := &entities.Guild{}
		if err := rows.Scan(
			&guild.ID,
			&guild.CreatorID,
			&guild.GuildCategoryID,
			&guild.Name,
			&guild.Description,
			&guild.Discoverable,
			&guild.ChannelCount,
			&guild.MemberCount,
			&guild.IconID,
			&guild.BannerID,
			&guild.CreatedAt,
			&guild.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select discoverable guilds by guild idsfailed", err)
		}
		guilds = append(guilds, guild)
	}

	return guilds, nil
}

func (r *GuildRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.Guild, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			creator_id,
			guild_category_id,
			name,
			description,
			discoverable,
			channel_count,
			member_count,
			icon_id,
			banner_id,
			created_at,
			updated_at
		FROM
			guild
		WHERE
			id = $1;
	`, ID)

	guild := &entities.Guild{}
	if err := row.Scan(
		&guild.ID,
		&guild.CreatorID,
		&guild.GuildCategoryID,
		&guild.Name,
		&guild.Description,
		&guild.Discoverable,
		&guild.ChannelCount,
		&guild.MemberCount,
		&guild.IconID,
		&guild.BannerID,
		&guild.CreatedAt,
		&guild.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select guild by id failed", err)
	}

	return guild, nil
}
func (r *GuildRepository) GetByGuildIDs(ctx context.Context, guildIDs []uuid.UUID) ([]*entities.Guild, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			creator_id,
			guild_category_id,
			name,
			description,
			discoverable,
			channel_count,
			member_count,
			icon_id,
			banner_id,
			created_at,
			updated_at
		FROM
			guild
		WHERE
			id = ANY($1);
	`, guildIDs)

	if err != nil {
		return nil, wrapUnknownErr("select guilds by guild idsfailed", err)
	}
	defer rows.Close()

	guilds := []*entities.Guild{}
	for rows.Next() {
		guild := &entities.Guild{}
		if err := rows.Scan(
			&guild.ID,
			&guild.CreatorID,
			&guild.GuildCategoryID,
			&guild.Name,
			&guild.Description,
			&guild.Discoverable,
			&guild.ChannelCount,
			&guild.MemberCount,
			&guild.IconID,
			&guild.BannerID,
			&guild.CreatedAt,
			&guild.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select guilds by guild idsfailed", err)
		}
		guilds = append(guilds, guild)
	}

	return guilds, nil
}

func (r *GuildRepository) Create(ctx context.Context, guild *entities.Guild) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			guild (
				id,
				creator_id,
				guild_category_id,
				name,
				description,
				discoverable,
				channel_count,
				member_count,
				icon_id,
				banner_id,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
	`,
		&guild.ID,
		&guild.CreatorID,
		guild.GuildCategoryID,
		&guild.Name,
		&guild.Description,
		&guild.Discoverable,
		&guild.ChannelCount,
		&guild.MemberCount,
		guild.IconID,
		guild.BannerID,
		&guild.CreatedAt,
		&guild.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert guild failed", err)
	}

	return nil

}
func (r *GuildRepository) Update(ctx context.Context, guild *entities.Guild) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			guild
		SET
			creator_id = $2,
			guild_category_id = $3,
			name = $4,
			description = $5,
			discoverable = $6,
			channel_count = $7,
			member_count = $8,
			icon_id = $9,
			banner_id = $10,
			created_at = $11,
			updated_at = $12
		WHERE
			id =  $1;
	`,
		&guild.ID,
		&guild.CreatorID,
		guild.GuildCategoryID,
		&guild.Name,
		&guild.Description,
		&guild.Discoverable,
		&guild.ChannelCount,
		&guild.MemberCount,
		guild.IconID,
		guild.BannerID,
		&guild.CreatedAt,
		&guild.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update guild failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}

func (r *GuildRepository) Delete(ctx context.Context, ID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				guild
			WHERE
				id = $1
		`, ID)

	if err != nil {
		return wrapUnknownErr("delete guild failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
