package response

type CompleteRegistrationResponse struct {
	Accesstoken  string `json:"accesstoken"`
	Refreshtoken string `json:"refreshtoken"`
}
