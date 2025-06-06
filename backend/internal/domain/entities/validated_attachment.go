package entities

type ValidatedAttachment struct {
	Attachment
	isValid bool
}

func (ve *ValidatedAttachment) IsValid() bool {
	return ve.isValid
}

func NewValidatedAttachment(attachment *Attachment) (*ValidatedAttachment, error) {
	if err := attachment.validate(); err != nil {
		return nil, err
	}

	return &ValidatedAttachment{
		Attachment: *attachment,
		isValid:    true,
	}, nil
}
