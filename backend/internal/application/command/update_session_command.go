package command

import "github.com/MikeT117/accord/backend/internal/application/common"

type UpdateSessionCommand struct {
	ID     string
	UserID string
	Token  string
}

type UpdateSessionCommandResult struct {
	Result *common.SessionResult
}
