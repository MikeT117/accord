package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type VoiceStateRepository struct {
	db DBTX
}

func CreateVoiceStateRepository(db DBTX) repositories.VoiceStateRepository {
	return &VoiceStateRepository{db: db}
}

func (r *VoiceStateRepository) GetByUserID(context context.Context, userID string) (*entities.VoiceState, error) {
	row := r.db.QueryRow(context, `
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
		return nil, err
	}

	return voiceState, nil
}

func (r *VoiceStateRepository) GetByChannelID(context context.Context, channelID string) ([]*entities.VoiceState, error) {
	rows, err := r.db.Query(context, `
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
		return nil, err
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
			return nil, err
		}

		voiceStates = append(voiceStates, voiceState)
	}

	return voiceStates, nil
}

func (r *VoiceStateRepository) GetByGuildID(context context.Context, guildID string) ([]*entities.VoiceState, error) {
	rows, err := r.db.Query(context, `
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
		return nil, err
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
			return nil, err
		}

		voiceStates = append(voiceStates, voiceState)
	}

	return voiceStates, nil
}
func (r *VoiceStateRepository) Create(context context.Context, validatedVoiceState *entities.ValidatedVoiceState) (*entities.VoiceState, error) {
	row := r.db.QueryRow(context, `
		INSERT INTO
			voice_state (
				self_mute,
				self_deaf,
				channel_id,
				user_id,
				guild_id,
			)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING
			self_mute,
			self_deaf,
			channel_id,
			user_id,
			guild_id;
	`,
		validatedVoiceState.SelfMute,
		validatedVoiceState.SelfDeaf,
		validatedVoiceState.ChannelID,
		validatedVoiceState.UserID,
		validatedVoiceState.GuildID,
	)

	voiceState := &entities.VoiceState{}
	if err := row.Scan(
		&voiceState.SelfMute,
		&voiceState.SelfDeaf,
		&voiceState.ChannelID,
		&voiceState.UserID,
		&voiceState.GuildID,
	); err != nil {
		return nil, err
	}

	return voiceState, nil
}
func (r *VoiceStateRepository) Update(context context.Context, validatedVoiceState *entities.ValidatedVoiceState) (*entities.VoiceState, error) {
	row := r.db.QueryRow(context, `
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
			channel_id = $3
		RETURNING
			self_mute,
			self_deaf,
			channel_id,
			user_id,
			guild_id;
	`,
		validatedVoiceState.SelfMute,
		validatedVoiceState.SelfDeaf,
		validatedVoiceState.ChannelID,
		validatedVoiceState.UserID,
		validatedVoiceState.GuildID,
	)

	voiceState := &entities.VoiceState{}
	if err := row.Scan(
		&voiceState.SelfMute,
		&voiceState.SelfDeaf,
		&voiceState.ChannelID,
		&voiceState.UserID,
		&voiceState.GuildID,
	); err != nil {
		return nil, err
	}

	return voiceState, nil
}
func (r *VoiceStateRepository) Delete(context context.Context, userID string, channelID string) error {
	result, err := r.db.Exec(context, `
			DELETE FROM
				voice_state
			WHERE
				user_id = $1
			AND
				channel_id = $2;
		`, userID, channelID)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("zero rows affected")
	}

	return nil
}
