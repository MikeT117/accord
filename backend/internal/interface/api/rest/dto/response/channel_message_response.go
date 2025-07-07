package response

type ChannelMessageResponse struct {
	ID          string                        `json:"id"`
	Content     string                        `json:"content"`
	Pinned      bool                          `json:"pinned"`
	Flag        int8                          `json:"flag"`
	ChannelID   string                        `json:"channelId"`
	CreatedAt   int64                         `json:"createdAt"`
	UpdatedAt   int64                         `json:"updatedAt"`
	Attachments []*AttachmentResponse         `json:"attachments"`
	Author      *ChannelMessageAuthorResponse `json:"author"`
}
