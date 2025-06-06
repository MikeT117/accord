package entities

type ValidatedVoiceState struct {
	VoiceState
	isValid bool
}

func (ve *ValidatedVoiceState) IsValid() bool {
	return ve.isValid
}

func NewValidatedVoiceChannelStatus(voiceState *VoiceState) (*ValidatedVoiceState, error) {
	if err := voiceState.validate(); err != nil {
		return nil, err
	}

	return &ValidatedVoiceState{
		VoiceState: *voiceState,
		isValid:    true,
	}, nil
}
