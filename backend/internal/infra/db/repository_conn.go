package db

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func CreatePool(ctx context.Context, databaseURL string) *pgxpool.Pool {

	config, err := pgxpool.ParseConfig(databaseURL)

	if err != nil {
		log.Fatalf("Unable to parse config: %v\n", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)

	if err != nil {
		log.Fatalf("Unable to create Pool: %v\n", err)
	}

	return pool
}
