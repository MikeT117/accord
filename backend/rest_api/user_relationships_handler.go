package rest_api

import (
	"net/http"
	"slices"

	"github.com/MikeT117/accord/backend/internal/constants"
	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleUserRelationshipReadMany(c echo.Context) error {
	sqlUserRelationships, err := a.Queries.GetManyUserRelationshipsByUserID(c.Request().Context(), c.(*CustomCtx).UserID)

	if err != nil {
		return NewServerError(err, "GetUserRelationshipsByUserID")
	}

	return NewSuccessfulResponse(c, http.StatusOK, a.Mapper.ConvertSQLCGetManyUserRelationshipsByUserIDRowToUserRelationships(sqlUserRelationships))
}

func (a *api) HandleUserRelationshipCreate(c echo.Context) error {

	body := UserRelationshipCreateRequestBody{}

	if err := c.Bind(&body); err != nil {
		return NewClientError(err, http.StatusBadRequest, "unable to bind body")
	}

	if valid, reason := body.Validate(); !valid {
		return NewClientError(nil, http.StatusBadRequest, reason)
	}

	recipient, err := a.Queries.GetUserByUsername(c.Request().Context(), body.Username)

	if err != nil {
		return NewServerError(err, "GetUserProfileByUsername")
	}

	if recipient.PublicFlags&(1<<constants.ALLOW_FRIEND_REQUESTS) == 0 && body.Status != 2 {
		return NewClientError(nil, http.StatusBadRequest, "friend requests disabled")
	}

	isBlocked, err := a.Queries.HasBlockedRelationship(c.Request().Context(), sqlc.HasBlockedRelationshipParams{
		UserID:        recipient.ID,
		RequestUserID: c.(*CustomCtx).UserID,
	})

	if err != nil {
		return NewServerError(err, "IsUserBlocked")
	}

	if isBlocked {
		return NewClientError(nil, http.StatusBadRequest, "user is blocked")
	}

	dbTx, err := a.Pool.Begin(c.Request().Context())
	if err != nil {
		return NewServerError(err, "Begin")
	}

	defer dbTx.Rollback(c.Request().Context())

	tx := a.Queries.WithTx(dbTx)

	sqlRelationship, err := tx.CreateRelationship(c.Request().Context(), sqlc.CreateRelationshipParams{
		Status:    body.Status,
		CreatorID: c.(*CustomCtx).UserID,
	})

	if err != nil {
		return NewServerError(err, "CreateRelationship")
	}

	relationship := a.Mapper.ConvertSQLCRelationshipToRelationship(sqlRelationship)

	if sqlRelationship.Status == 2 {

		count, err := tx.LinkRelationshipUser(c.Request().Context(), sqlc.LinkRelationshipUserParams{
			RelationshipID: sqlRelationship.ID,
			UserID:         recipient.ID,
		})

		if err != nil {
			return NewServerError(err, "LinkRelationshipUsers")
		}

		if count != 1 {
			return NewServerError(nil, "linked user count does not equal 1")
		}

	} else {
		count, err := tx.LinkManyRelationshipUsers(c.Request().Context(), sqlc.LinkManyRelationshipUsersParams{
			RelationshipID: sqlRelationship.ID,
			UserIds:        []uuid.UUID{recipient.ID, c.(*CustomCtx).UserID},
		})

		if err != nil {
			return NewServerError(err, "LinkRelationshipUsers")
		}

		if count != 2 {
			return NewServerError(nil, "linked users count does not equal 2")
		}

		sender, err := tx.GetUserByID(c.Request().Context(), c.(*CustomCtx).UserID)

		if err != nil {
			return NewServerError(err, "unable to create relationship")
		}

		relationship.User = a.Mapper.ConvertGetUserByIDRowToUser(sender)
		a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
			Op:      "RELATIONSHIP_CREATE",
			Version: 0,
			UserIDs: []uuid.UUID{recipient.ID},
			Data:    &relationship,
		})
	}

	relationship.User = a.Mapper.ConvertGetUserByUsernameRowToUser(recipient)
	dbTx.Commit(c.Request().Context())
	return NewSuccessfulResponse(c, http.StatusOK, &relationship)
}

func (a *api) HandleUserRelationshipDelete(c echo.Context) error {
	relationshipID, err := uuid.Parse(c.Param("relationship_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid relationship ID")
	}

	userIDs, err := a.Queries.GetRelationshipUserIDsByRelationshipID(c.Request().Context(), relationshipID)

	if err != nil {
		return NewServerError(err, "GetRelationshipUserIDsByRelationshipID")
	}

	if !slices.Contains(userIDs, c.(*CustomCtx).UserID) {
		return NewClientError(nil, http.StatusNotFound, "relationship not found")
	}

	rowsAffected, err := a.Queries.DeleteRelationship(c.Request().Context(), sqlc.DeleteRelationshipParams{
		UserID:         c.(*CustomCtx).UserID,
		RelationshipID: relationshipID,
	})

	if err != nil {
		return NewServerError(err, "DeleteRelationship")
	}

	if rowsAffected != 1 {
		return NewClientError(nil, http.StatusNotFound, "relationship not found")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "RELATIONSHIP_DELETE",
		Version:         0,
		UserIDs:         userIDs,
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data: &models.DeletedUserRelationship{
			ID: relationshipID,
		},
	})

	return NewSuccessfulResponse(c, http.StatusOK, nil)
}

func (a *api) HandleUserRelationshipUpdate(c echo.Context) error {
	relationshipID, err := uuid.Parse(c.Param("relationship_id"))

	if err != nil {
		return NewClientError(err, http.StatusBadRequest, "invalid relationship ID")
	}

	userIDs, err := a.Queries.GetRelationshipUserIDsByRelationshipID(c.Request().Context(), relationshipID)

	if err != nil {
		return NewServerError(err, "GetRelationshipUserIDsByRelationshipID")
	}

	if !slices.Contains(userIDs, c.(*CustomCtx).UserID) {
		return NewClientError(nil, http.StatusNotFound, "relationship not found")
	}

	_, err = a.Queries.UpdateRelationship(c.Request().Context(), sqlc.UpdateRelationshipParams{
		UserID:         c.(*CustomCtx).UserID,
		RelationshipID: relationshipID,
		Status:         0,
	})

	if err != nil {
		return NewServerError(err, "DeleteRelationship")
	}

	a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
		Op:              "RELATIONSHIP_UPDATE",
		Version:         0,
		UserIDs:         userIDs,
		ExcludedUserIDs: []uuid.UUID{c.(*CustomCtx).UserID},
		Data: &models.UpdatedUserRelationship{
			ID:     relationshipID,
			Status: 0,
		},
	})

	return NewSuccessfulResponse(c, http.StatusOK, &models.UpdatedUserRelationship{
		ID:     relationshipID,
		Status: 0,
	})
}
