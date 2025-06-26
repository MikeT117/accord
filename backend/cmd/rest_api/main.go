package main

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/application/services"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/infra/cloudinary"
	"github.com/MikeT117/accord/backend/internal/infra/db"
	"github.com/MikeT117/accord/backend/internal/infra/oauth"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest"
)

func main() {
	config := config.LoadConfig()
	ctx := context.Background()
	pool := db.CreatePool(ctx, config.DatabaseURL)

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

	// Services
	authorisationService := services.CreateAuthorisationService(guildRoleRepository, channelRepository, guildMemberRepository, relationshipRepository)
	authenticationService := services.CreateAuthenticationService(transactor, githubOAuth, userRepository, accountRepository)
	attachmentService := services.CreateAttachmentService(transactor, cloudinaryUpload, attachmentRepository)
	accountService := services.CreateUserAccountService(transactor, accountRepository, userRepository)
	channelMessageService := services.CreateChannelMessageService(transactor, authorisationService, channelMessageRepository, channelRepository, userRepository, guildMemberRepository, guildRoleRepository, attachmentRepository)
	channelService := services.CreateChannelService(transactor, authorisationService, channelRepository, guildRoleRepository, userRepository)
	guildBanService := services.CreateGuildBanService(transactor, authorisationService, guildMemberRepository, guildBanRepository)
	guildCategoryService := services.CreateGuildCategoryService(transactor, authorisationService, guildCategoryRepository)
	guildInviteService := services.CreateGuildInviteService(transactor, authorisationService, guildInviteRepository, guildRepository)
	guildMemberService := services.CreateGuildMemberService(transactor, authorisationService, userRepository, guildMemberRepository, guildRoleRepository, guildRepository, guildInviteRepository)
	guildService := services.CreateGuildService(transactor, authorisationService, guildRepository, guildMemberRepository, guildRoleRepository, channelRepository)
	guildRoleService := services.CreateGuildRoleService(transactor, authorisationService, guildRoleRepository, guildMemberRepository)
	relationshipService := services.CreateRelationshipService(transactor, authorisationService, relationshipRepository, userRepository)
	sessionService := services.CreateSessionService(transactor, sessionRepository, userRepository)
	voiceStateService := services.CreateVoiceStateService(transactor, authorisationService, voiceStateRepository, userRepository)

	// Rest API
	rest.CreateRouter(config, authenticationService, attachmentService, authorisationService, channelMessageService, channelService, guildBanService, guildCategoryService, guildInviteService, guildMemberService, guildRoleService, guildService, relationshipService, sessionService, accountService, voiceStateService)
}
