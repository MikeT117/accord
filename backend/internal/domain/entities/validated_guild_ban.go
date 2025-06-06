package entities

type ValidatedGuildBan struct {
	GuildBan
	isValid bool
}

func (ve *ValidatedGuildBan) IsValid() bool {
	return ve.isValid
}

func NewValidatedGuildBan(guildBan *GuildBan) (*ValidatedGuildBan, error) {
	if err := guildBan.validate(); err != nil {
		return nil, err
	}

	return &ValidatedGuildBan{
		GuildBan: *guildBan,
		isValid:  true,
	}, nil
}
