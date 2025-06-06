package entities

type ValidatedGuild struct {
	Guild
	isValid bool
}

func (ve *ValidatedGuild) IsValid() bool {
	return ve.isValid
}

func NewValidatedGuild(guild *Guild) (*ValidatedGuild, error) {
	if err := guild.validate(); err != nil {
		return nil, err
	}

	return &ValidatedGuild{
		Guild:   *guild,
		isValid: true,
	}, nil
}
