package rest

import (
	"fmt"
	"log"
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/config"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/controller"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func CreateRouter(
	config *config.Config,
	authenticationService interfaces.AuthenticationService,
	attachmentService interfaces.AttachmentService,
	authorisationService interfaces.AuthorisationService,
	channelMessageService interfaces.ChannelMessageService,
	channelService interfaces.ChannelService,
	guildBanService interfaces.GuildBanService,
	guildCategoryService interfaces.GuildCategoryService,
	guildInviteService interfaces.GuildInviteService,
	guildMemberService interfaces.GuildMemberService,
	guildRoleService interfaces.GuildRoleService,
	guildService interfaces.GuildService,
	relationshipService interfaces.RelationshipService,
	sessionService interfaces.SessionService,
	userAccountService interfaces.UserAccountService,
	voiceStateService interfaces.VoiceStateService,
) *echo.Echo {
	e := echo.New()
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "remote_ip=${remote_ip}, method=${method}, uri=${uri}, status=${status}, latency=${latency_human}\n",
	}))

	e.Use(middleware.Gzip())
	e.Use(middleware.RequestID())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{fmt.Sprintf("https://%s", config.Host)},
		AllowHeaders:  []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "X-App-Token"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		ExposeHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "X-App-Token"},
	}))

	APIV1 := e.Group("/api/v1")
	controller.NewAuthController(config, APIV1, sessionService, authenticationService)
	controller.NewWebhooksController(config, APIV1, attachmentService)
	APIV1.Use(CreateAuthenticationMiddleware(config, sessionService))
	controller.NewAttachmentController(APIV1, attachmentService)
	controller.NewChannelController(APIV1, channelService)
	controller.NewChannelMessageController(APIV1, channelMessageService)
	controller.NewGuildBanController(APIV1, guildBanService)
	controller.NewGuildController(APIV1, guildService)
	controller.NewGuildInviteController(APIV1, guildInviteService)
	controller.NewGuildMemberController(APIV1, guildMemberService)
	controller.NewGuildRoleController(APIV1, guildRoleService)
	controller.NewRelationshipController(APIV1, relationshipService)
	controller.NewSessionController(APIV1, sessionService)
	controller.NewUserAccountController(APIV1, userAccountService)
	controller.NewGuildCategoriesController(APIV1, guildCategoryService)

	go func() {
		if err := e.Start(":4000"); err != nil && err != http.ErrServerClosed {
			log.Fatalf("shutting down server: %v", err)
		}
	}()

	return e
}
