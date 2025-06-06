package entities

type ValidatedGuildInvite struct {
	GuildInvite
	isValid bool
}

func (ve *ValidatedGuildInvite) IsValid() bool {
	return ve.isValid
}

func NewValidatedGuildInvite(guildInvite *GuildInvite) (*ValidatedGuildInvite, error) {
	if err := guildInvite.validate(); err != nil {
		return nil, err
	}

	return &ValidatedGuildInvite{
		GuildInvite: *guildInvite,
		isValid:     true,
	}, nil
}
