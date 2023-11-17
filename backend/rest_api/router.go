package rest_api

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/MikeT117/accord/backend/internal/constants"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func (a *api) CreateRouterAndMountRoutes() {
	e := echo.New()

	e.HTTPErrorHandler = func(err error, c echo.Context) {
		log.Printf("An error occurred: %v\n", err)

		unsuccessfulResponse, ok := err.(UnsuccessfulResponse)
		if !ok {
			unsuccessfulResponse = NewServerError(err, "")
		}

		c.JSON(unsuccessfulResponse.GetStatus(), unsuccessfulResponse)
	}

	echo.MethodNotAllowedHandler = func(c echo.Context) error {
		return c.JSON(http.StatusMethodNotAllowed, NewClientError(nil, http.StatusMethodNotAllowed, http.StatusText(http.StatusMethodNotAllowed)))
	}

	echo.NotFoundHandler = func(c echo.Context) error {
		return c.JSON(http.StatusNotFound, NewClientError(nil, http.StatusNotFound, http.StatusText(http.StatusNotFound)))
	}

	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "remote_ip=${remote_ip}, method=${method}, uri=${uri}, status=${status}, latency=${latency_human}\n",
	}))
	e.Use(middleware.RequestID())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:  []string{fmt.Sprintf("https://%s", os.Getenv("HOST"))},
		AllowHeaders:  []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "X-App-Token"},
		AllowMethods:  []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		ExposeHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "X-App-Token"},
	}))

	V1 := e.Group("/api/v1")

	// Authentication routes
	V1.GET("/auth/github", a.HandleGithubAuthRedirect)
	V1.GET("/auth/github/callback", a.HandleGithubAuthCallback)

	// Routes that require an authentciated request
	AUTHENTICATED := V1.Group("")
	AUTHENTICATED.Use(a.AuthenticationMiddleware)

	AUTHENTICATED.GET("/users/@me/sessions", a.HandleUserSessionReadMany)
	AUTHENTICATED.GET("/users/:user_id/profile", a.HandleUserProfileReadOne)

	AUTHENTICATED.GET("/users/@me/relationships", a.HandleUserRelationshipReadMany)
	AUTHENTICATED.POST("/users/@me/relationships", a.HandleUserRelationshipCreate)
	AUTHENTICATED.DELETE("/users/@me/relationships/:relationship_id", a.HandleUserRelationshipDelete)
	AUTHENTICATED.PATCH("/users/@me/relationships/:relationship_id/accept", a.HandleUserRelationshipUpdate)

	AUTHENTICATED.POST("/users/@me/channels", a.HandlePrivateChannelCreate)
	AUTHENTICATED.PATCH("/users/@me", a.HandleUserProfileUpdate)
	AUTHENTICATED.DELETE("/users/@me/sessions/:session_id", a.HandleUserSessionDelete)

	AUTHENTICATED.GET("/guilds/discoverable", a.HandleGuildReadMany)
	AUTHENTICATED.GET("/guilds/categories", a.HandleGuildCategoryReadMany)
	AUTHENTICATED.POST("/guilds", a.HandleGuildCreate)
	AUTHENTICATED.POST("/guilds/:guild_id/join", a.HandleGuildMemberCreate)
	AUTHENTICATED.DELETE("/@me/guilds/:guild_id", a.HandleGuildMemberLeave)

	AUTHENTICATED.GET("/invites/:invite_id", a.HandleGuildInviteReadOne)

	AUTHENTICATED.POST("/attachments/sign", a.HandleAttachmentSign)
	AUTHENTICATED.DELETE("/attachments/:attachment_id", a.HandleAttachmentDelete)

	CHANNEL_PERMISSION_CREATE_CHANNEL_MESSAGE := AUTHENTICATED.Group("")
	CHANNEL_PERMISSION_CREATE_CHANNEL_MESSAGE.Use(a.RequiredChannelPermission(constants.CREATE_CHANNEL_MESSAGE))
	CHANNEL_PERMISSION_CREATE_CHANNEL_MESSAGE.POST("/channels/:channel_id/messages", a.HandleChannelMessageCreate)
	CHANNEL_PERMISSION_CREATE_CHANNEL_MESSAGE.DELETE("/channels/:channel_id/:message_id", a.HandleOwnerChannelMessageDelete)
	CHANNEL_PERMISSION_CREATE_CHANNEL_MESSAGE.PATCH("/channels/:channel_id/messages/:message_id", a.HandleChannelMessageUpdate)

	CHANNEL_PERMISSION_VIEW_GUILD_CHANNEL := AUTHENTICATED.Group("")
	CHANNEL_PERMISSION_VIEW_GUILD_CHANNEL.Use(a.RequiredChannelPermission(constants.VIEW_GUILD_CHANNEL))
	CHANNEL_PERMISSION_VIEW_GUILD_CHANNEL.GET("/channels/:channel_id/messages", a.HandleChannelMessageReadMany)
	CHANNEL_PERMISSION_VIEW_GUILD_CHANNEL.GET("/channels/:channel_id/pins", a.HandleChannelPinsReadMany)

	CHANNEL_PERMISSION_MANAGE_GUILD_CHANNELS := AUTHENTICATED.Group("")
	CHANNEL_PERMISSION_MANAGE_GUILD_CHANNELS.Use(a.RequiredChannelPermission(constants.MANAGE_GUILD_CHANNELS))
	CHANNEL_PERMISSION_MANAGE_GUILD_CHANNELS.PATCH("/channels/:channel_id", a.HandleChannelUpdate)
	CHANNEL_PERMISSION_MANAGE_GUILD_CHANNELS.PATCH("/guilds/:guild_id/channels/:channel_id", a.HandleGuildChannelUpdate)
	CHANNEL_PERMISSION_MANAGE_GUILD_CHANNELS.DELETE("/guilds/:guild_id/channels/:channel_id", a.HandleGuildChannelDelete)

	CHANNEL_PERMISSION_MANAGE_CHANNEL_MESSAGES := AUTHENTICATED.Group("")
	CHANNEL_PERMISSION_MANAGE_CHANNEL_MESSAGES.Use(a.RequiredChannelPermission(constants.MANAGE_CHANNEL_MESSAGES))
	CHANNEL_PERMISSION_MANAGE_CHANNEL_MESSAGES.PUT("/channels/:channel_id/pins/:message_id", a.HandleChannelMessagePinCreate)
	CHANNEL_PERMISSION_MANAGE_CHANNEL_MESSAGES.DELETE("/channels/:channel_id/pins/:message_id", a.HandleChannelMessagePinDelete)
	CHANNEL_PERMISSION_MANAGE_CHANNEL_MESSAGES.DELETE("/guilds/:guild_id/channels/:channel_id/:message_id", a.HandleAdminChannelMessageDelete)

	GUILD_PERMISSION_MANAGE_GUILD_CHANNELS := AUTHENTICATED.Group("")
	GUILD_PERMISSION_MANAGE_GUILD_CHANNELS.Use(a.RequiredGuildPermission(constants.MANAGE_GUILD_CHANNELS))
	GUILD_PERMISSION_MANAGE_GUILD_CHANNELS.POST("/guilds/:guild_id/channels", a.HandleGuildChannelCreate)

	GUILD_PERMISSION_MANAGE_GUILD := AUTHENTICATED.Group("")
	GUILD_PERMISSION_MANAGE_GUILD.Use(a.RequiredGuildPermission(constants.MANAGE_GUILD))

	GUILD_PERMISSION_MANAGE_GUILD.GET("/guilds/:guild_id/roles/:role_id/members", a.HandleGuildRoleMemberReadMany)
	GUILD_PERMISSION_MANAGE_GUILD.POST("/guilds/:guild_id/roles/:role_id/members", a.HandleGuildRoleMemberCreate)
	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id/roles/:role_id/members/:user_id", a.HandleGuildRoleMemberDelete)

	GUILD_PERMISSION_MANAGE_GUILD.PUT("/guilds/:guild_id/roles/:role_id/channels/:channel_id", a.HandleGuildRoleChannelCreate)
	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id/roles/:role_id/channels/:channel_id", a.HandleGuildRoleChannelDelete)

	GUILD_PERMISSION_MANAGE_GUILD.GET("/guilds/:guild_id/invites", a.HandleGuildInviteReadMany)
	GUILD_PERMISSION_MANAGE_GUILD.POST("/guilds/:guild_id/invites", a.HandleGuildInviteCreate)
	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id/invites/:invite_id", a.HandleGuildInviteDelete)

	GUILD_PERMISSION_MANAGE_GUILD.PATCH("/guilds/:guild_id", a.HandleGuildUpdate)
	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id", a.HandleGuildDelete)

	GUILD_PERMISSION_MANAGE_GUILD.POST("/guilds/:guild_id/roles", a.HandleGuildRoleCreate)
	GUILD_PERMISSION_MANAGE_GUILD.PATCH("/guilds/:guild_id/roles/:role_id", a.HandleGuildRoleUpdate)
	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id/roles/:role_id", a.HandleGuildRoleDelete)

	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id/members/:user_id", a.HandleGuildMemberDelete)

	GUILD_PERMISSION_MANAGE_GUILD.GET("/guilds/:guild_id/bans", a.HandleGuildBansReadMany)
	GUILD_PERMISSION_MANAGE_GUILD.PUT("/guilds/:guild_id/bans/:user_id", a.HandleGuildBanCreate)
	GUILD_PERMISSION_MANAGE_GUILD.DELETE("/guilds/:guild_id/bans/:user_id", a.HandleGuildBanDelete)

	// Routes that require an authentciated request and have the VIEW_GUILD_MEMBERS permission
	GUILD_PERMISSION_VIEW_MEMBERS := AUTHENTICATED.Group("")
	GUILD_PERMISSION_VIEW_MEMBERS.Use(a.RequiredGuildPermission(constants.VIEW_GUILD_MEMBERS))
	GUILD_PERMISSION_VIEW_MEMBERS.GET("/guilds/:guild_id/members", a.HandleGuildMemberReadMany)

	if err := e.Start(fmt.Sprintf(":%s", os.Getenv("HTTP_PORT"))); err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
