package entities

type ValidatedSession struct {
	Session
	isValid bool
}

func (ve *ValidatedSession) IsValid() bool {
	return ve.isValid
}

func NewValidatedSession(session *Session) (*ValidatedSession, error) {
	if err := session.validate(); err != nil {
		return nil, err
	}

	return &ValidatedSession{
		Session: *session,
		isValid: true,
	}, nil
}
