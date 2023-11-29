package rest_api

import (
	"net/http"
	"slices"

	message_queue "github.com/MikeT117/accord/backend/internal/message_queue"
	"github.com/MikeT117/accord/backend/internal/sqlc"
	"github.com/MikeT117/accord/backend/models"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func (a *api) HandleUserRelationshipReadMany(c echo.Context) error {
	sqlUserRelationships, err := a.Queries.GetManyUserRelationshipsByUserID(c.Request().Context(), c.(*APIContext).UserID)

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

	userID, err := a.Queries.GetUserIDByUsername(c.Request().Context(), body.Username)

	if err != nil {
		return NewServerError(err, "GetUserProfileByUsername")
	}

	count, err := a.Queries.HasBlockedRelationship(c.Request().Context(), sqlc.HasBlockedRelationshipParams{
		UserID:        userID,
		RequestUserID: c.(*APIContext).UserID,
	})

	if err != nil {
		return NewServerError(err, "IsUserBlocked")
	}

	if count != 0 {
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
		CreatorID: c.(*APIContext).UserID,
	})

	if err != nil {
		return NewServerError(err, "CreateRelationship")
	}

	relationship := a.Mapper.ConvertSQLCRelationshipToRelationship(sqlRelationship)

	if sqlRelationship.Status == 2 {

		sqlRelationshipUser, err := tx.LinkRelationshipUser(c.Request().Context(), sqlc.LinkRelationshipUserParams{
			RelationshipID: sqlRelationship.ID,
			UserID:         userID,
		})

		if err != nil {
			return NewServerError(err, "LinkRelationshipUsers")
		}

		relationship.User = a.Mapper.ConvertSQLCLinkRelationshipUserRowToUserLimited(sqlRelationshipUser)

	} else {
		sqlRelationshipUsers, err := tx.LinkManyRelationshipUsers(c.Request().Context(), sqlc.LinkManyRelationshipUsersParams{
			RelationshipID: sqlRelationship.ID,
			UserIds:        []uuid.UUID{userID, c.(*APIContext).UserID},
		})

		if err != nil {
			return NewServerError(err, "LinkRelationshipUsers")
		}

		users := a.Mapper.ConvertSQLCLinkRelationshipUsersRowToUsersLimited(sqlRelationshipUsers)

		var recipient models.UserLimited
		var sender models.UserLimited

		for idx := range users {
			if users[idx].ID != c.(*APIContext).UserID {
				recipient = users[idx]
			} else {
				sender = users[idx]
			}
		}

		relationship.User = sender
		a.MessageQueue.PublishForwardPayload(&message_queue.ForwardedPayload{
			Op:      "RELATIONSHIP_CREATE",
			Version: 0,
			UserIDs: []uuid.UUID{sender.ID},
			Data:    &relationship,
		})

		relationship.User = recipient

	}

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

	if !slices.Contains(userIDs, c.(*APIContext).UserID) {
		return NewClientError(nil, http.StatusNotFound, "relationship not found")
	}

	rowsAffected, err := a.Queries.DeleteRelationship(c.Request().Context(), sqlc.DeleteRelationshipParams{
		UserID:         c.(*APIContext).UserID,
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
		ExcludedUserIDs: []uuid.UUID{c.(*APIContext).UserID},
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

	if !slices.Contains(userIDs, c.(*APIContext).UserID) {
		return NewClientError(nil, http.StatusNotFound, "relationship not found")
	}

	_, err = a.Queries.UpdateRelationship(c.Request().Context(), sqlc.UpdateRelationshipParams{
		UserID:         c.(*APIContext).UserID,
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
		ExcludedUserIDs: []uuid.UUID{c.(*APIContext).UserID},
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
