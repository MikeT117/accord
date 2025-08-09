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

type VoiceStateRepository struct {
	db DBGetter
}

func CreateVoiceStateRepository(db DBGetter) repositories.VoiceStateRepository {
	return &VoiceStateRepository{db: db}
}

func (r *VoiceStateRepository) GetByID(ctx context.Context, ID uuid.UUID) (*entities.VoiceState, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			self_mute,
			self_deaf,
			channel_id,
			user_id,
			guild_id,
		FROM
			voice_state
		WHERE
			id = $1;
	`, ID)

	voiceState := &entities.VoiceState{}
	if err := row.Scan(
		&voiceState.SelfMute,
		&voiceState.SelfDeaf,
		&voiceState.ChannelID,
		&voiceState.UserID,
		&voiceState.GuildID,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select voice state by id failed", err)
	}

	return voiceState, nil
}

func (r *VoiceStateRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*entities.VoiceState, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			self_mute,
			self_deaf,
			channel_id,
			user_id,
			guild_id,
		FROM
			voice_state
		WHERE
			user_id = $1;
	`, userID)

	voiceState := &entities.VoiceState{}
	if err := row.Scan(
		&voiceState.SelfMute,
		&voiceState.SelfDeaf,
		&voiceState.ChannelID,
		&voiceState.UserID,
		&voiceState.GuildID,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, domain.ErrEntityNotFound
		}
		return nil, wrapUnknownErr("select voice state by user id failed", err)
	}

	return voiceState, nil
}

func (r *VoiceStateRepository) GetByChannelID(ctx context.Context, channelID uuid.UUID) ([]*entities.VoiceState, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			self_mute,
			self_deaf,
			channel_id,
			user_id,
			guild_id,
		FROM
			voice_state
		WHERE
			channel_id = $1;
	`, channelID)

	if err != nil {
		return nil, wrapUnknownErr("select voice state by channel id failed", err)
	}

	defer rows.Close()

	voiceStates := []*entities.VoiceState{}

	for rows.Next() {
		voiceState := &entities.VoiceState{}
		if err := rows.Scan(
			&voiceState.SelfMute,
			&voiceState.SelfDeaf,
			&voiceState.ChannelID,
			&voiceState.UserID,
			&voiceState.GuildID,
		); err != nil {
			return nil, wrapUnknownErr("map over select voice state by channel id failed", err)
		}

		voiceStates = append(voiceStates, voiceState)
	}

	return voiceStates, nil
}

func (r *VoiceStateRepository) GetByGuildID(ctx context.Context, guildID uuid.UUID) ([]*entities.VoiceState, []uuid.UUID, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			self_mute,
			self_deaf,
			channel_id,
			user_id,
			guild_id,
		FROM
			voice_state
		WHERE
			guild_id = $1;
	`, guildID)

	if err != nil {
		return nil, nil, wrapUnknownErr("select voice state by guild id failed", err)
	}

	defer rows.Close()

	voiceStates := []*entities.VoiceState{}
	userIDs := []uuid.UUID{}
	for rows.Next() {
		voiceState := &entities.VoiceState{}
		if err := rows.Scan(
			&voiceState.SelfMute,
			&voiceState.SelfDeaf,
			&voiceState.ChannelID,
			&voiceState.UserID,
			&voiceState.GuildID,
		); err != nil {
			return nil, nil, wrapUnknownErr("map over select voice state by guild id failed", err)
		}

		voiceStates = append(voiceStates, voiceState)
		userIDs = append(userIDs, voiceState.UserID)
	}

	return voiceStates, userIDs, nil
}
func (r *VoiceStateRepository) Create(ctx context.Context, voiceState *entities.VoiceState) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			voice_state (
				self_mute,
				self_deaf,
				channel_id,
				user_id,
				guild_id,
			)
		VALUES ($1, $2, $3, $4, $5);
	`,
		&voiceState.SelfMute,
		&voiceState.SelfDeaf,
		&voiceState.ChannelID,
		&voiceState.UserID,
		voiceState.GuildID,
	)

	if err != nil {
		return wrapUnknownErr("insert voice state failed", err)
	}

	return nil

}
func (r *VoiceStateRepository) Update(ctx context.Context, voiceState *entities.VoiceState) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			guild_member
		SET
			self_mute = $1,
			self_deaf = $2,
			channel_id = $3,
			user_id = $4,
			guild_id = $5,
		WHERE
			user_id = $4
		AND
			channel_id = $3;
	`,
		&voiceState.SelfMute,
		&voiceState.SelfDeaf,
		&voiceState.ChannelID,
		&voiceState.UserID,
		voiceState.GuildID,
	)

	if err != nil {
		return wrapUnknownErr("update voice state failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
func (r *VoiceStateRepository) Delete(ctx context.Context, ID uuid.UUID) error {
	result, err := r.db(ctx).Exec(ctx, `
			DELETE FROM
				voice_state
			WHERE
				id = $1;
		`, ID)

	if err != nil {
		return wrapUnknownErr("delete account failed", err)
	}

	if result.RowsAffected() != 1 {
		return domain.ErrEntityNotFound
	}

	return nil
}
