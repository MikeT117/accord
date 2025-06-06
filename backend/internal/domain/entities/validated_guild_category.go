package entities

type ValidatedGuildCategory struct {
	GuildCategory
	isValid bool
}

func (ve *ValidatedGuildCategory) IsValid() bool {
	return ve.isValid
}

func NewValidatedGuildCategory(guildCategory *GuildCategory) (*ValidatedGuildCategory, error) {
	if err := guildCategory.validate(); err != nil {
		return nil, err
	}

	return &ValidatedGuildCategory{
		GuildCategory: *guildCategory,
		isValid:       true,
	}, nil
}
