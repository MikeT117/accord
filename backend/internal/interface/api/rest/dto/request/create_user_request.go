package request

type CreateUserRequest struct {
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Token       string `json:"token"`
}
