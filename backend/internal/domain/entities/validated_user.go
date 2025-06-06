package entities

type ValidatedUser struct {
	User
	isValid bool
}

func (ve *ValidatedUser) IsValid() bool {
	return ve.isValid
}

func NewValidatedUser(user *User) (*ValidatedUser, error) {
	if err := user.validate(); err != nil {
		return nil, err
	}

	return &ValidatedUser{
		User:    *user,
		isValid: true,
	}, nil
}
