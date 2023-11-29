package rest_api

import (
	"regexp"
	"strings"

	v "github.com/cohesivestack/valgo"
	"github.com/jackc/pgx/v5/pgtype"
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

func (b *ChannelUpdateRequestBody) Validate(private bool) (bool, string) {

	val := v.
		Is(v.Any(b.Name).Passing(func(val any) bool {
			if val.(pgtype.Text).Valid {
				return private && len(val.(pgtype.Text).String) >= 0 && len(val.(pgtype.Text).String) <= 100 || !private && len(val.(pgtype.Text).String) > 2 && len(val.(pgtype.Text).String) <= 100
			}

			return true
		})).
		Is(v.Any(b.Topic).Passing(func(val any) bool {
			return (val.(pgtype.Text).Valid && len(val.(pgtype.Text).String) >= 0 && len(val.(pgtype.Text).String) <= 100) || !val.(pgtype.Text).Valid
		}))

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
	regex, _ := regexp.Compile("image/.+")
	val := v.
		Is(v.String(b.Filename, "Filename").Not().Blank().OfLengthBetween(2, 100)).
		Is(v.Int64(b.Filesize, "Filesize").Not().Zero()).
		Is(v.Int64(b.Height, "Height").Not().Zero()).
		Is(v.Int64(b.Width, "Width").Not().Zero()).
		Is(v.String(b.ResourceType, "ResourceType").MatchingTo(regex))

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

func (b *UserProfileUpdateRequestBody) Validate() (bool, string) {
	val := v.
		Is(v.String(b.DisplayName, "DisplayName").Not().Blank().OfLengthBetween(6, 32)).
		Is(v.Int32(b.PublicFlags).Between(0, 16))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *UserRelationshipCreateRequestBody) Validate() (bool, string) {
	val := v.
		Is(v.String(b.Username, "Username").Not().Blank().OfLengthBetween(6, 32)).
		Is(v.Int32(b.Status).Between(1, 2))

	if !val.Valid() {
		messages := []string{}
		for _, v := range val.Errors() {
			messages = append(messages, v.Messages()...)
		}
		return false, strings.Join(messages, ", ")
	}

	return true, ""
}

func (b *GuildChannelUpdateRequestBody) Validate() (bool, string) {
	val0 := v.
		Is(v.Bool(b.LockPermissions, "LockPermissions")).
		Is(v.Bool(b.ParentID.Valid, "ParentID").True())

	val1 := v.
		Is(v.Bool(b.LockPermissions, "LockPermissions").False()).
		Is(v.Bool(b.ParentID.Valid, "ParentID").False())

	if !val0.Valid() {
		messages := []string{}

		for _, v := range val0.Errors() {
			messages = append(messages, v.Messages()...)
		}

		if !val1.Valid() {
			for _, v := range val1.Errors() {
				messages = append(messages, v.Messages()...)
			}
			return false, strings.Join(messages, ", ")
		}
	}

	return true, ""
}
