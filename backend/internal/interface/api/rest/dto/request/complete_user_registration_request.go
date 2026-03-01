package request

import (
	"github.com/MikeT117/accord/backend/internal/application/command"
	"github.com/google/uuid"
)

type CompleteUserRegistrationRequest struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Token       string `json:"token"`
}

func (r *CompleteUserRegistrationRequest) ToCompleteUserRegistrationCommand(ID uuid.UUID) *command.CompleteUserRegistrationCommand {
	return &command.CompleteUserRegistrationCommand{
		ID:          ID,
		DisplayName: r.DisplayName,
		Username:    r.Username,
	}
}
