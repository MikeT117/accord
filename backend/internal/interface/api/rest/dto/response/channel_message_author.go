package response

import "github.com/google/uuid"

type ChannelMessageAuthorResponse struct {
	ID          uuid.UUID  `json:"id"`
	Username    string     `json:"username"`
	DisplayName string     `json:"displayName"`
	PublicFlags int8       `json:"publicFlags"`
	Avatar      *uuid.UUID `json:"avatar"`
	Banner      *uuid.UUID `json:"banner"`
}
