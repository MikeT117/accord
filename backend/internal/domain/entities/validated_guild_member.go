package entities

type ValidatedGuildMember struct {
	GuildMember
	isValid bool
}

func (ve *ValidatedGuildMember) IsValid() bool {
	return ve.isValid
}

func NewValidatedGuildMember(guildMember *GuildMember) (*ValidatedGuildMember, error) {
	if err := guildMember.validate(); err != nil {
		return nil, err
	}

	return &ValidatedGuildMember{
		GuildMember: *guildMember,
		isValid:     true,
	}, nil
}
