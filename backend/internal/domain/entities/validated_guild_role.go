package entities

type ValidatedGuildRole struct {
	GuildRole
	isValid bool
}

func (ve *ValidatedGuildRole) IsValid() bool {
	return ve.isValid
}

func NewValidatedGuildRole(guildRole *GuildRole) (*ValidatedGuildRole, error) {
	if err := guildRole.validate(); err != nil {
		return nil, err
	}

	return &ValidatedGuildRole{
		GuildRole: *guildRole,
		isValid:   true,
	}, nil
}
