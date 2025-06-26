package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/mapper"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type GuildMemberController struct {
	guildMemberService interfaces.GuildMemberService
}

func NewGuildMemberController(
	baseGroup *echo.Group,
	guildMemberService interfaces.GuildMemberService,
) *GuildMemberController {
	controller := &GuildMemberController{
		guildMemberService: guildMemberService,
	}

	subGroup := baseGroup.Group("/guilds/:guildID/members")
	subGroup.GET("", controller.getMembers)
	subGroup.PATCH("/:userID", controller.updateMember)
	subGroup.DELETE("/:userID", controller.deleteMember)
	return controller
}

func (c *GuildMemberController) getMembers(ctx echo.Context) error {
	var payload request.QueryGuildMembersRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToGuildMembersQuery(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	guildMembers, err := c.guildMemberService.GetByGuildID(ctx.Request().Context(), cmd)
	if err != nil {
		return handleError(ctx, err)
	}

	return response.JSONResponse(ctx, http.StatusOK, mapper.ToGuildMemberUsersResponse(guildMembers.Result))
}

func (c *GuildMemberController) updateMember(ctx echo.Context) error {
	var payload request.UpdateGuildMemberRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateGuildMemberCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildMemberService.Update(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *GuildMemberController) deleteMember(ctx echo.Context) error {
	var payload request.DeleteGuildMemberRequest
	if err := ctx.Bind(&payload); err != nil {
		return handleError(ctx, err)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteGuildMemberCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.guildMemberService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
