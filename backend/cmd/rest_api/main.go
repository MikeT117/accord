package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/MikeT117/accord/backend/internal/application/services"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/infra/cloudinary"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/MikeT117/accord/backend/internal/infra/oauth"
	"github.com/MikeT117/accord/backend/internal/infra/pubsub"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest"
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
	defer func() {
		log.Println("shutting down pgx pool")
		pool.Close()
	}()

	// Event Broadcaster
	eventPublisher := pubsub.MustCreateEventPublisher(ctx, config)
	defer func() {
		log.Println("shutting down eventPublisher")
		eventPublisher.Close()
	}()

	// Transaction Handler
	transactor, dbGetter := db.NewTransactorFromPool(pool)

	// Repositories
	attachmentRepository := db.CreateAttachmentRepository(dbGetter)
	accountRepository := db.CreateAccountRepository(dbGetter)
	channelMessageRepository := db.CreateChannelMessageRepository(dbGetter)
	channelRepository := db.CreateChannelRepository(dbGetter)
	guildBanRepository := db.CreateGuildBanRepository(dbGetter)
	guildCategoryRepository := db.CreateGuildCategoryRepository(dbGetter)
	guildInviteRepository := db.CreateGuildInviteRepository(dbGetter)
	guildMemberRepository := db.CreateGuildMemberRepository(dbGetter)
	guildRepository := db.CreateGuildRepository(dbGetter)
	guildRoleRepository := db.CreateGuildRoleRepository(dbGetter)
	relationshipRepository := db.CreateRelationshipRepository(dbGetter)
	sessionRepository := db.CreateSessionRepository(dbGetter)
	userRepository := db.CreateUserRepository(dbGetter)
	voiceStateRepository := db.CreateVoiceStateRepository(dbGetter)

	// OAuth
	githubOAuth := oauth.NewGithubOAuthConfig(config.GithubKey, config.GithubSecret, config.GithubRedirectURL, config.OAuthNonceSecret)

	// Cloudinary
	cloudinaryUpload := cloudinary.NewCloudinaryUpload(config.CloudinaryEnv, config.CloudinaryAPIKey, config.CloudinarySecret)

	// Auth Services
	authorisationService := services.CreateAuthorisationService(guildRoleRepository, channelRepository, guildMemberRepository, relationshipRepository)
	authenticationService := services.CreateAuthenticationService(transactor, githubOAuth, userRepository, accountRepository)

	// Event Service
	eventService := services.CreateEventService(eventPublisher, channelMessageRepository, channelRepository, userRepository, guildRepository, guildMemberRepository, attachmentRepository, guildRoleRepository, relationshipRepository)

	// Services
	attachmentService := services.CreateAttachmentService(transactor, cloudinaryUpload, attachmentRepository)
	userAccountService := services.CreateUserAccountService(transactor, eventService, accountRepository, userRepository)
	channelService := services.CreateChannelService(transactor, authorisationService, eventService, channelRepository, guildRepository, guildRoleRepository, userRepository)
	guildBanService := services.CreateGuildBanService(transactor, authorisationService, guildMemberRepository, guildBanRepository)
	guildCategoryService := services.CreateGuildCategoryService(transactor, authorisationService, guildCategoryRepository)
	guildInviteService := services.CreateGuildInviteService(transactor, authorisationService, guildInviteRepository, guildRepository)
	guildMemberService := services.CreateGuildMemberService(transactor, authorisationService, userRepository, guildMemberRepository, guildRoleRepository, guildRepository, guildInviteRepository)
	guildService := services.CreateGuildService(transactor, authorisationService, eventService, guildRepository, guildMemberRepository, guildRoleRepository, channelRepository)
	guildRoleService := services.CreateGuildRoleService(transactor, authorisationService, eventService, guildRoleRepository, guildMemberRepository, channelRepository)
	relationshipService := services.CreateRelationshipService(transactor, authorisationService, eventService, relationshipRepository, userRepository)
	sessionService := services.CreateSessionService(transactor, eventService, sessionRepository, userRepository)
	voiceStateService := services.CreateVoiceStateService(transactor, authorisationService, voiceStateRepository, userRepository)
	channelMessageService := services.CreateChannelMessageService(transactor, authorisationService, eventService, channelMessageRepository, channelRepository, userRepository, guildMemberRepository, guildRoleRepository, attachmentRepository)

	// Rest API
	server := rest.CreateRouter(config, authenticationService, attachmentService, authorisationService, channelMessageService, channelService, guildBanService, guildCategoryService, guildInviteService, guildMemberService, guildRoleService, guildService, relationshipService, sessionService, userAccountService, voiceStateService)
	defer func() {
		log.Println("shutting down echo router")
		if err := server.Shutdown(ctx); err != nil {
			server.Logger.Fatal(err)
		}
	}()

	<-ctx.Done()
	log.Println("shutting down rest api")
}
