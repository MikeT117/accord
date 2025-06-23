package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/jackc/pgx/v5"
)

type SessionRepository struct {
	db DBGetter
}

func CreateSessionRepository(db DBGetter) repositories.SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) GetByID(ctx context.Context, ID string, userID string) (*entities.Session, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			user_id,
			token,
			expires_at,
			ip_address,
			user_agent,
			created_at,
			updated_at
		FROM
			session
		WHERE
			id = $1
		AND 
			user_id = $2;
	`, ID, userID)

	session := &entities.Session{}

	if err := row.Scan(
		&session.ID,
		&session.UserID,
		&session.Token,
		&session.ExpiresAt,
		&session.IPAddress,
		&session.UserAgent,
		&session.CreatedAt,
		&session.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, wrapUnknownErr("select session by id failed", err)
	}

	return session, nil
}

func (r *SessionRepository) GetByUserID(ctx context.Context, userID string) ([]*entities.Session, error) {
	rows, err := r.db(ctx).Query(ctx, `
		SELECT
			id,
			user_id,
			token,
			expires_at,
			ip_address,
			user_agent,
			created_at,
			updated_at
		FROM
			session
		WHERE
			user_id = $1;
	`, userID)

	if err != nil {
		return nil, wrapUnknownErr("select sessions by user id failed", err)
	}
	defer rows.Close()

	sessions := []*entities.Session{}

	for rows.Next() {
		session := &entities.Session{}

		if err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.Token,
			&session.ExpiresAt,
			&session.IPAddress,
			&session.UserAgent,
			&session.CreatedAt,
			&session.UpdatedAt,
		); err != nil {
			return nil, wrapUnknownErr("map over select sessions by user id failed", err)
		}

		sessions = append(sessions, session)
	}

	return sessions, nil
}

func (r *SessionRepository) GetByToken(ctx context.Context, token string) (*entities.Session, error) {
	row := r.db(ctx).QueryRow(ctx, `
		SELECT
			id,
			user_id,
			token,
			expires_at,
			ip_address,
			user_agent,
			created_at,
			updated_at
		FROM
			session
		WHERE
			token = $1;
	`, token)

	session := &entities.Session{}

	if err := row.Scan(
		&session.ID,
		&session.UserID,
		&session.Token,
		&session.ExpiresAt,
		&session.IPAddress,
		&session.UserAgent,
		&session.CreatedAt,
		&session.UpdatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, wrapUnknownErr("select session by token failed", err)
	}

	return session, nil
}

func (r *SessionRepository) Create(ctx context.Context, session *entities.Session) error {
	_, err := r.db(ctx).Exec(ctx, `
		INSERT INTO
			session (
				id,
				user_id,
				token,
				expires_at,
				ip_address,
				user_agent,
				created_at,
				updated_at
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
	`,
		session.ID,
		session.UserID,
		session.Token,
		session.ExpiresAt,
		session.IPAddress,
		session.UserAgent,
		session.CreatedAt,
		session.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("insert session failed", err)
	}

	return nil
}

func (r *SessionRepository) Update(ctx context.Context, session *entities.Session) error {
	result, err := r.db(ctx).Exec(ctx, `
		UPDATE
			session
		SET
			user_id = $2,
			token = $3,
			expires_at = $4,
			ip_address = $5,
			user_agent = $6,
			created_at = $7,
			updated_at = $8
		WHERE
			id = $1;
	`,
		session.ID,
		session.UserID,
		session.Token,
		session.ExpiresAt,
		session.IPAddress,
		session.UserAgent,
		session.CreatedAt,
		session.UpdatedAt,
	)

	if err != nil {
		return wrapUnknownErr("update session failed", err)
	}

	if result.RowsAffected() != 1 {
		return ErrNotFound
	}

	return nil
}

func (r *SessionRepository) DeleteByID(ctx context.Context, ID string, userID string) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			session
		WHERE
			id = $1
		AND
			user_id = $2;
	`, ID, userID)

	if err != nil {
		return wrapUnknownErr("delete session by id failed", err)
	}

	if result.RowsAffected() != 1 {
		return ErrNotFound
	}

	return nil
}

func (r *SessionRepository) DeleteByToken(ctx context.Context, token string, userID string) error {
	result, err := r.db(ctx).Exec(ctx, `
		DELETE FROM
			session
		WHERE
			token = $1
		AND
			user_id = $2;
	`, token, userID)

	if err != nil {
		return wrapUnknownErr("delete session by token failed", err)
	}

	if result.RowsAffected() != 1 {
		return ErrNotFound
	}

	return nil
}
