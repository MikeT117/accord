package response

type SignInResponse struct {
	Accesstoken  string `json:"accesstoken"`
	Refreshtoken string `json:"refreshtoken"`
}
