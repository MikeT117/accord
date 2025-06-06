package db

import (
	"context"

	"github.com/MikeT117/accord/backend/internal/domain/repositories"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DBTX interface {
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
}

type MasterRepository struct {
	DB                          *pgxpool.Pool
	AccountRepository           repositories.AccountRepository
	UserRepository              repositories.UserRepository
	AttachmentRepository        repositories.AttachmentRepository
	ChannelMessageRepository    repositories.ChannelMessageRepository
	ChannelUserRepository       repositories.ChannelUserRepository
	ChannelRepository           repositories.ChannelRepository
	GuildInviteRepository       repositories.GuildInviteRepository
	GuildMemberRepository       repositories.GuildMemberRepository
	GuildRepository             repositories.GuildRepository
	GuildRoleRepository         repositories.GuildRoleRepository
	GuildRoleUserRepository     repositories.GuildRoleUserRepository
	GuildRoleChannelRepository  repositories.GuildRoleChannelRepository
	RelationshipRepository      repositories.RelationshipRepository
	SessionRepository           repositories.SessionRepository
	VoiceChannelStateRepository repositories.VoiceStateRepository
}

func CreateMasterRepository(db *pgxpool.Pool) *MasterRepository {
	return &MasterRepository{
		DB:                          db,
		AccountRepository:           CreateAccountRepository(db),
		UserRepository:              CreateUserRepository(db),
		AttachmentRepository:        CreateAttachmentRepository(db),
		ChannelMessageRepository:    CreateChannelMessageRepository(db),
		ChannelRepository:           CreateChannelRepository(db),
		ChannelUserRepository:       CreateChannelUserRepository(db),
		GuildInviteRepository:       CreateGuildInviteRepository(db),
		GuildMemberRepository:       CreateGuildMemberRepository(db),
		GuildRepository:             CreateGuildRepository(db),
		GuildRoleRepository:         CreateGuildRoleRepository(db),
		GuildRoleUserRepository:     CreateGuildRoleUserRepository(db),
		GuildRoleChannelRepository:  CreateGuildRoleChannelRepository(db),
		RelationshipRepository:      CreateRelationshipRepository(db),
		SessionRepository:           CreateSessionRepository(db),
		VoiceChannelStateRepository: CreateVoiceStateRepository(db),
	}
}

func (m *MasterRepository) WithTx(tx pgx.Tx) *MasterRepository {
	return &MasterRepository{
		DB:                          m.DB,
		AccountRepository:           CreateAccountRepository(tx),
		AttachmentRepository:        CreateAttachmentRepository(tx),
		ChannelMessageRepository:    CreateChannelMessageRepository(tx),
		ChannelRepository:           CreateChannelRepository(tx),
		ChannelUserRepository:       CreateChannelUserRepository(tx),
		GuildInviteRepository:       CreateGuildInviteRepository(tx),
		GuildMemberRepository:       CreateGuildMemberRepository(tx),
		GuildRepository:             CreateGuildRepository(tx),
		GuildRoleRepository:         CreateGuildRoleRepository(tx),
		GuildRoleUserRepository:     CreateGuildRoleUserRepository(tx),
		GuildRoleChannelRepository:  CreateGuildRoleChannelRepository(tx),
		RelationshipRepository:      CreateRelationshipRepository(tx),
		SessionRepository:           CreateSessionRepository(tx),
		VoiceChannelStateRepository: CreateVoiceStateRepository(tx),
	}
}
