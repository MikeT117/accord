package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	migrations "github.com/MikeT117/accord/backend/db"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env.local")
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Println("DATABASE_URL not populated")

	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		cancel()
	}()

	pool := db.MustCreatePool(ctx, databaseURL)
	defer func() {
		log.Println("shutting down pgx pool")
		pool.Close()
	}()

	migrations.RunMigrations(stdlib.OpenDBFromPool(pool))
}
