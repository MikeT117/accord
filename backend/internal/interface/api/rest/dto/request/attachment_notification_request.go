package request

import (
	"time"

	"github.com/google/uuid"
)

type CloudinaryNotification struct {
	AccessMode          string              `json:"access_mode"`
	APIKey              string              `json:"api_key"`
	AssetID             string              `json:"asset_id"`
	Bytes               int64               `json:"bytes"`
	CreatedAt           time.Time           `json:"created_at"`
	ETag                string              `json:"etag"`
	Folder              string              `json:"folder"` // Note: empty in your sample
	Format              string              `json:"format"`
	Height              int                 `json:"height"`
	NotificationContext NotificationContext `json:"notification_context"`
	NotificationType    string              `json:"notification_type"`
	OriginalFilename    string              `json:"original_filename"`
	Placeholder         bool                `json:"placeholder"`
	PublicID            uuid.UUID           `json:"public_id"`
	RequestID           string              `json:"request_id"`
	ResourceType        string              `json:"resource_type"`
	SecureURL           string              `json:"secure_url"`
	SignatureKey        string              `json:"signature_key"`
	Tags                []string            `json:"tags"`
	Timestamp           time.Time           `json:"timestamp"`
	Type                string              `json:"type"`
	URL                 string              `json:"url"`
	Version             float64             `json:"version"`
	VersionID           string              `json:"version_id"`
	Width               int                 `json:"width"`
}

type NotificationContext struct {
	TriggeredAt time.Time               `json:"triggered_at"`
	TriggeredBy NotificationTriggeredBy `json:"triggered_by"`
}

type NotificationTriggeredBy struct {
	ID     string `json:"id"`
	Source string `json:"source"`
}
