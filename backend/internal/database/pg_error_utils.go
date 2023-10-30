package database

import (
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

func IsPGErrorConstraint(err error, constraint string) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.ConstraintName == constraint
	}
	return false
}

func IsPGErrNoRows(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}
