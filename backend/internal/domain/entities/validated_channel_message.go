package entities

type ValidatedChannelMessage struct {
	ChannelMessage
	isValid bool
}

func (ve *ValidatedChannelMessage) IsValid() bool {
	return ve.isValid
}

func NewValidatedChannelMessage(channelMessage *ChannelMessage) (*ValidatedChannelMessage, error) {
	if err := channelMessage.validate(); err != nil {
		return nil, err
	}

	return &ValidatedChannelMessage{
		ChannelMessage: *channelMessage,
		isValid:        true,
	}, nil
}
