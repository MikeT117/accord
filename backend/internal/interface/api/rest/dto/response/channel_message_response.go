package response

import "time"

type ChannelMessageResponse struct {
	ID          string                        `json:"id"`
	Content     string                        `json:"content"`
	Pinned      bool                          `json:"pinned"`
	Flag        int8                          `json:"flag"`
	ChannelID   string                        `json:"channelId"`
	CreatedAt   time.Time                     `json:"createdAt"`
	UpdatedAt   time.Time                     `json:"updatedAt"`
	Attachments []*AttachmentResponse         `json:"attachments"`
	Author      *ChannelMessageAuthorResponse `json:"author"`
}
