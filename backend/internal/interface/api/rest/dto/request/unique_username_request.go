package request

type UniqueUsernameRequest struct {
	Username string `json:"username"`
	Token    string `json:"token"`
}
