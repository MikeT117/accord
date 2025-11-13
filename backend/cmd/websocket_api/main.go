package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/MikeT117/accord/backend/internal/application/services"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/MikeT117/accord/backend/internal/infra/pubsub"
	websocket_api "github.com/MikeT117/accord/backend/internal/interface/api/websocket"
)

func main() {
	config := config.MustLoadConfig()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		cancel()
	}()

	// PGX Pool
	pool := db.MustCreatePool(ctx, config.DatabaseURL)
	defer pool.Close()

	// Transaction Handler
	_, dbGetter := db.NewTransactorFromPool(pool)

	// Repositories
	channelRepository := db.CreateChannelRepository(dbGetter)
	guildMemberRepository := db.CreateGuildMemberRepository(dbGetter)
	guildRepository := db.CreateGuildRepository(dbGetter)
	guildRoleRepository := db.CreateGuildRoleRepository(dbGetter)
	sessionRepository := db.CreateSessionRepository(dbGetter)
	userRepository := db.CreateUserRepository(dbGetter)
	relationshipRepository := db.CreateRelationshipRepository(dbGetter)

	// Services
	websocketService := services.CreateWebsocketService(userRepository, sessionRepository, guildRepository, guildMemberRepository, guildRoleRepository, channelRepository, relationshipRepository)

	// Event Subscriber
	eventSubscriber := pubsub.MustCreateEventSubscriber(config)
	defer eventSubscriber.Shutdown()

	// Websocket Hub
	hub := websocket_api.NewHub(ctx, config, eventSubscriber, websocketService)
	go hub.Run()

	// Websocket Handler
	server := &http.Server{Addr: fmt.Sprintf(":%d", config.WebsocketPort)}
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket_api.HandleNewWS(hub, w, r)
	})
	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	log.Println("Shutting down websocket server")
	if err := server.Shutdown(ctx); err != nil {
		panic(err)
	}
}
