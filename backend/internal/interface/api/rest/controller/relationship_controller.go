package controller

import (
	"net/http"

	"github.com/MikeT117/accord/backend/internal/application/interfaces"
	"github.com/MikeT117/accord/backend/internal/interface/api/authentication"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/request"
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"

	"github.com/labstack/echo/v4"
)

type RelationshipController struct {
	relationshipService interfaces.RelationshipService
}

func NewRelationshipController(
	baseGroup *echo.Group,
	relationshipService interfaces.RelationshipService,
) *RelationshipController {
	controller := &RelationshipController{
		relationshipService: relationshipService,
	}

	subGroup := baseGroup.Group("/relationships")
	subGroup.POST("", controller.createRelationship)
	subGroup.PATCH("/:v", controller.updateRelationship)
	subGroup.DELETE("/:relationshipID", controller.deleteRelationship)
	return controller
}

func (c *RelationshipController) createRelationship(ctx echo.Context) error {

	var payload request.CreateRelationshipRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToCreateRelationshipCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.relationshipService.Create(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *RelationshipController) updateRelationship(ctx echo.Context) error {
	var payload request.UpdateRelationshipRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToUpdateRelationshipCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.relationshipService.Update(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}

func (c *RelationshipController) deleteRelationship(ctx echo.Context) error {
	var payload request.DeleteRelationshipRequest
	if err := ctx.Bind(&payload); err != nil {
		return response.ErrorResponse(ctx, http.StatusBadRequest, nil)
	}

	requestorID, _ := authentication.GetRequestorDetails(ctx)
	cmd, err := payload.ToDeleteRelationshipCommand(requestorID)
	if err != nil {
		return handleError(ctx, err)
	}

	if err := c.relationshipService.Delete(ctx.Request().Context(), cmd); err != nil {
		return handleError(ctx, err)
	}

	return response.NoContentResponse(ctx)
}
