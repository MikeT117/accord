package rest_api

import (
	"strings"

	v "github.com/cohesivestack/valgo"
)

func (b *GuildCreateRequestBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Name, "Name").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.Bool(b.IsDiscoverable, "IsDiscoverable"))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *GuildUpdateRequestBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Name, "Name").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.String(b.Description, "Description").OfLengthBetween(0, 500)).
		Is(v.Bool(b.IsDiscoverable, "IsDiscoverable"))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *GuildRoleUpdateRequestBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Name, "Name").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.Int32(b.Permissions, "Permissions").Between(0, 2147483647))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *GuildMemberUpdateBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Nickname.String, "Nickname").Not().Blank().OfLengthBetween(2, 100))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *GuildChannelCreateBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Name, "Name").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.String(b.Topic, "Topic").OfLengthBetween(0, 512)).
		Is(v.Bool(b.IsPrivate, "IsPrivate")).
		Is(v.Int16(b.ChannelType, "ChannelType").InSlice([]int16{0, 1, 4}))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *BannedGuildMemberCreateBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Reason, "Reason").Not().Blank().OfLengthBetween(0, 512))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *ChannelUpdateBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Name, "Name").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.String(b.Topic.String, "Topic").OfLengthBetween(0, 512))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *AttachmentSignBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Filename, "Filename").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.Int64(b.Filesize, "Filesize").Not().Zero()).
		Is(v.Int64(b.Height, "Height").Not().Zero()).
		Is(v.Int64(b.Width, "Width").Not().Zero()).
		Is(v.String(b.ResourceType, "ResourceType").InSlice([]string{"image", "video", "link"}))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *ChannelMessageCreateBody) Validate() (bool, string) {
	if len(b.Attachments) == 0 {
		val := v.Is(v.String(b.Content, "Content").Not().Blank().OfLengthBetween(1, 2000))

		if !val.Valid() {
			messages := []string{}
			for _, v := range val.Errors() {
				messages = append(messages, v.Messages()...)
			}
			return false, strings.Join(messages, ", ")
		}
	}

	return true, ""
}

func (b *ChannelMessageUpdateBody) Validate() (bool, string) {
	val := v.Is(v.String(b.Content, "Content").Not().Blank().OfLengthBetween(1, 2000))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}
