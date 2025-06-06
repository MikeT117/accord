package entities

type ValidatedAccount struct {
	Account
	isValid bool
}

func (ve *ValidatedAccount) IsValid() bool {
	return ve.isValid
}

func NewValidatedAccount(account *Account) (*ValidatedAccount, error) {
	if err := account.validate(); err != nil {
		return nil, err
	}

	return &ValidatedAccount{
		Account: *account,
		isValid: true,
	}, nil
}
