package mapper

import (
	"github.com/MikeT117/accord/backend/internal/interface/api/rest/dto/response"
)

func ToSignInResponse(accesstoken []byte, refreshtoken []byte) *response.SignInResponse {
	return &response.SignInResponse{
		Accesstoken:  string(accesstoken),
		Refreshtoken: string(refreshtoken),
	}
}
