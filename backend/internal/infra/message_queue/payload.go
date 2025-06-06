package message_queue

// Payloads for processing  by the provider and forwarded to subscribers(clients) based on the role, user and excluded IDs
type SubscriberPayload struct {
	Op              string
	Version         int
	RoleIDs         []string
	UserIDs         []string
	ExcludedUserIDs []string
	Data            interface{}
}

// Payloads for processing only by the provider, not a data payload for subscribers(clients)
type ProviderPayload struct {
	Op      string
	Version int
	UserIDs []string
	RoleIDs []string
}
