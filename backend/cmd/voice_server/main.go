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
	"github.com/MikeT117/accord/backend/internal/interface/api/web_rtc_voice"
	"github.com/gorilla/websocket"
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
	transactor, dbGetter := db.NewTransactorFromPool(pool)

	// Repositories
	attachmentRepository := db.CreateAttachmentRepository(dbGetter)
	channelRepository := db.CreateChannelRepository(dbGetter)
	guildMemberRepository := db.CreateGuildMemberRepository(dbGetter)
	guildRepository := db.CreateGuildRepository(dbGetter)
	guildRoleRepository := db.CreateGuildRoleRepository(dbGetter)
	sessionRepository := db.CreateSessionRepository(dbGetter)
	userRepository := db.CreateUserRepository(dbGetter)
	relationshipRepository := db.CreateRelationshipRepository(dbGetter)
	channelMessageRepository := db.CreateChannelMessageRepository(dbGetter)
	voiceStateRepository := db.CreateVoiceStateRepository(dbGetter)

	// Event Subscriber
	eventSubscriber := pubsub.MustCreateEventSubscriber(config)
	defer eventSubscriber.Shutdown()

	// Event Publisher
	eventPublisher := pubsub.MustCreateEventPublisher(ctx, config)
	defer eventPublisher.Close()

	// Event Service
	eventService := services.CreateEventService(eventPublisher, channelMessageRepository, channelRepository, userRepository, guildRepository, guildMemberRepository, attachmentRepository, guildRoleRepository, relationshipRepository, voiceStateRepository)

	// Services
	authorisationService := services.CreateAuthorisationService(guildRoleRepository, channelRepository, guildMemberRepository, relationshipRepository)
	channelService := services.CreateChannelService(transactor, authorisationService, eventService, channelRepository, guildRepository, guildRoleRepository, userRepository)
	websocketService := services.CreateWebsocketService(userRepository, sessionRepository, guildRepository, guildMemberRepository, guildRoleRepository, channelRepository, relationshipRepository, voiceStateRepository)
	guildRoleService := services.CreateGuildRoleService(transactor, authorisationService, eventService, guildRoleRepository, guildMemberRepository, channelRepository, userRepository)
	voiceStateService := services.CreateVoiceStateService(transactor, authorisationService, voiceStateRepository, userRepository, eventService)

	// Websocket Hub
	hub, err := web_rtc_voice.CreateHub(config, websocketService, authorisationService, guildRoleService, voiceStateService, channelService)
	if err != nil {
		log.Panicln(err)
	}

	// Websocket Handler
	server := &http.Server{Addr: fmt.Sprintf(":%d", config.WebRTCWebsocketPort)}
	http.HandleFunc("/rtc", func(w http.ResponseWriter, r *http.Request) {

		if !hub.AllowConnections() {
			log.Println("Not accepting new connections")
			return
		}

		upgrader := websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("UpgradeErr: ", err)
			return
		}

		client := web_rtc_voice.CreateClient(hub)
		client.CreateWebsocket(conn)
	})

	go func() {
		if err := server.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	<-ctx.Done()
	log.Println("Shutting down voice server")

	hub.Shutdown()

	if err := server.Shutdown(ctx); err != nil {
		log.Panicln(err)
	}

}
