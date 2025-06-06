package db

import (
	"context"
	"errors"

	"github.com/MikeT117/accord/backend/internal/domain/entities"
	"github.com/MikeT117/accord/backend/internal/domain/repositories"
)

type SessionRepository struct {
	db DBTX
}

func CreateSessionRepository(db DBTX) repositories.SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) GetByID(context context.Context, ID string, userID string) (*entities.Session, error) {
	row := r.db.QueryRow(context, `
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
		return nil, err
	}

	return session, nil
}

func (r *SessionRepository) GetByUserID(context context.Context, userID string) ([]*entities.Session, error) {
	rows, err := r.db.Query(context, `
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
		return nil, err
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
			return nil, err
		}

		sessions = append(sessions, session)
	}

	return sessions, nil
}

func (r *SessionRepository) GetByToken(context context.Context, token string, userID string) (*entities.Session, error) {
	row := r.db.QueryRow(context, `
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
			token = $1
		AND
			user_id = $2;
	`, token, userID)

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
		return nil, err
	}

	return session, nil
}

func (r *SessionRepository) Create(context context.Context, validatedSession *entities.ValidatedSession) (*entities.Session, error) {
	row := r.db.QueryRow(context, `
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
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING
			id,
			user_id,
			token,
			expires_at,
			ip_address,
			user_agent,
			created_at,
			updated_at;
	`,
		validatedSession.ID,
		validatedSession.UserID,
		validatedSession.Token,
		validatedSession.ExpiresAt,
		validatedSession.IPAddress,
		validatedSession.UserAgent,
		validatedSession.CreatedAt,
		validatedSession.UpdatedAt,
	)

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
		return nil, err
	}

	return session, nil
}

func (r *SessionRepository) Update(context context.Context, validatedSession *entities.ValidatedSession) (*entities.Session, error) {
	row := r.db.QueryRow(context, `
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
			id = $1
		RETURNING
			id,
			user_id,
			token,
			expires_at,
			ip_address,
			user_agent,
			created_at,
			updated_at;
	`,
		validatedSession.ID,
		validatedSession.UserID,
		validatedSession.Token,
		validatedSession.ExpiresAt,
		validatedSession.IPAddress,
		validatedSession.UserAgent,
		validatedSession.CreatedAt,
		validatedSession.UpdatedAt,
	)

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
		return nil, err
	}

	return session, nil
}

func (r *SessionRepository) DeleteByID(context context.Context, ID string, userID string) error {
	result, err := r.db.Exec(context, `
		DELETE FROM
			session
		WHERE
			id = $1
		AND
			user_id = $2;
	`, ID, userID)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("session not found")
	}

	return nil
}

func (r *SessionRepository) DeleteByToken(context context.Context, token string, userID string) error {
	result, err := r.db.Exec(context, `
		DELETE FROM
			session
		WHERE
			token = $1
		AND
			user_id = $2;
	`, token, userID)

	if err != nil {
		return err
	}

	if result.RowsAffected() != 1 {
		return errors.New("session not found")
	}

	return nil
}
