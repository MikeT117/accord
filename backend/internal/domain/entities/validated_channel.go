package entities

type ValidatedChannel struct {
	Channel
	isValid bool
}

func (ve *ValidatedChannel) IsValid() bool {
	return ve.isValid
}

func NewValidatedChannel(channel *Channel) (*ValidatedChannel, error) {
	if err := channel.validate(); err != nil {
		return nil, err
	}

	return &ValidatedChannel{
		Channel: *channel,
		isValid: true,
	}, nil
}
