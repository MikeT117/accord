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

	v1 := e.Group("/api/v1")

	// Authentication routes
	v1.GET("/auth/github", a.HandleGithubAuthRedirect)
	v1.GET("/auth/github/callback", a.HandleGithubAuthCallback)

	// Routes that require an authentciated request
	authenticatedRoutes := v1.Group("")
	authenticatedRoutes.Use(a.AuthenticationMiddleware)

	authenticatedRoutes.POST("/@me/channels", a.HandlePrivateChannelCreate)
	authenticatedRoutes.POST("/guilds", a.HandleGuildCreate)
	authenticatedRoutes.GET("/guilds/discoverable", a.HandleGuildRead)
	authenticatedRoutes.GET("/guilds/categories", a.HandleGuildCategoryRead)

	authenticatedRoutes.POST("/attachments/sign", a.HandleAttachmentSign)
	authenticatedRoutes.DELETE("/attachments/:attachment_id", a.HandleAttachmentDelete)

	authenticatedRoutes.GET("/users/:user_id/profile", a.HandleUserProfileRead)

	managerGuildChannelRoutes := authenticatedRoutes.Group("")
	managerGuildChannelRoutes.Use(a.RequiredChannelPermission(constants.MANAGE_GUILD_CHANNELS))
	managerGuildChannelRoutes.GET("/channels/:channel_id/messages", a.HandleChannelMessageRead)
	managerGuildChannelRoutes.POST("/channels/:channel_id/messages", a.HandleChannelMessageCreate)

	// Routes that require an authenticated request and have the MANAGE_GUILD permission
	manageGuildRoutes := authenticatedRoutes.Group("")
	manageGuildRoutes.Use(a.RequiredGuildPermission(constants.MANAGE_GUILD))

	manageGuildRoutes.PATCH("/guilds/:guild_id", a.HandleGuildUpdate)
	manageGuildRoutes.DELETE("/guilds/:guild_id", a.HandleGuildDelete)

	manageGuildRoutes.GET("/guilds/:guild_id/roles", a.HandleGuildRoleRead)
	manageGuildRoutes.POST("/guilds/:guild_id/roles", a.HandleGuildRoleCreate)
	manageGuildRoutes.DELETE("/guilds/:guild_id/roles/:role_id", a.HandleGuildRoleDelete)
	manageGuildRoutes.PATCH("/guilds/:guild_id/roles/:role_id", a.HandleGuildRoleUpdate)

	manageGuildRoutes.DELETE("/guilds/:guild_id/members/:user_id", a.HandleGuildMemberDelete)

	manageGuildRoutes.GET("/guilds/:guild_id/bans", a.HandleGuildBansRead)
	manageGuildRoutes.PUT("/guilds/:guild_id/bans/:user_id", a.HandleGuildBanCreate)
	manageGuildRoutes.DELETE("/guilds/:guild_id/bans/:user_id", a.HandleGuildBanDelete)

	manageGuildChannelRoutes := authenticatedRoutes.Group("")
	manageGuildChannelRoutes.Use(a.RequiredGuildPermission(constants.MANAGE_GUILD_CHANNELS))

	manageGuildChannelRoutes.POST("guilds/:guild_id/channels/:channel_id/permissions/sync", a.HandleGuildChannelPermissionsSync)
	manageGuildChannelRoutes.POST("/guilds/:guild_id/channels", a.HandleGuildChannelCreate)

	// Routes that require an authentciated request and have the VIEW_GUILD_MEMBERS permission
	viewGuildMembersRoutes := authenticatedRoutes.Group("")
	viewGuildMembersRoutes.Use(a.RequiredGuildPermission(constants.VIEW_GUILD_MEMBERS))

	viewGuildMembersRoutes.GET("/guilds/:guild_id/members", a.HandleGuildMemberRead)

	if err := e.Start(fmt.Sprintf(":%s", os.Getenv("HTTP_PORT"))); err != http.ErrServerClosed {
		log.Fatal(err)
	}
}
