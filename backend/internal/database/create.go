package database

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Create(ctx context.Context) *pgxpool.Pool {

	config, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))

	if err != nil {
		log.Fatalf("Unable to parse config: %v\n", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)

	if err != nil {
		log.Fatalf("Unable to create Pool: %v\n", err)
	}

	return pool
}
