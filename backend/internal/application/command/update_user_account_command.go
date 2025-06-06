package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type UpdateUserCommand struct {
	ID          string
	DisplayName string
	PublicFlags int8
	Avatar      *string
	Banner      *string
}

type UpdateUserCommandResult struct {
	Result *common.UserResult
}
