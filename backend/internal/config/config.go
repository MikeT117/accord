package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppMode  string
	Protocol string

	FrontendHost string
	Host         string

	OAuthNonceSecret string

	JWTAccesstokenKey       []byte
	JWTRefreshtokenKey      []byte
	JWTRegistrationTokenKey []byte

	GithubKey         string
	GithubSecret      string
	GithubRedirectURL string

	GitlabKey         string
	GitlabSecret      string
	GitlabRedirectURL string

	CloudinaryURL    string
	CloudinaryResURL string
	CloudinarySecret string
	CloudinaryAPIKey string
	CloudinaryEnv    string

	DatabaseURL string

	RestServerPort            int
	WebsocketServerPort       int
	WebRTCWebsocketServerPort int

	NATSURL      string
	NATSUser     string
	NATSPassword string
}

func MustLoadConfig() *Config {
	godotenv.Load(".env.local")

	config := &Config{
		AppMode:      mustGetEnv("APP_MODE", true),
		Protocol:     mustGetEnv("PROTOCOL", true),
		FrontendHost: mustGetEnv("FRONTEND_HOST", true),

		Host: mustGetEnv("HOST", true),

		OAuthNonceSecret: mustGetEnv("OAUTH_NONCE_SECRET", true),

		JWTAccesstokenKey:       []byte(mustGetEnv("JWT_ACCESSTOKEN_KEY", true)),
		JWTRefreshtokenKey:      []byte(mustGetEnv("JWT_REFRESHTOKEN_KEY", true)),
		JWTRegistrationTokenKey: []byte(mustGetEnv("JWT_REGISTRATIONTOKEN_KEY", true)),

		CloudinarySecret: mustGetEnv("CLOUDINARY_SECRET", false),
		CloudinaryAPIKey: mustGetEnv("CLOUDINARY_API_KEY", false),
		CloudinaryEnv:    mustGetEnv("CLOUDINARY_ENVIRONMENT", false),

		DatabaseURL: mustGetEnv("DATABASE_URL", true),

		NATSURL:      mustGetEnv("NATS_URL", true),
		NATSUser:     mustGetEnv("NATS_USER", true),
		NATSPassword: mustGetEnv("NATS_PASSWORD", true),
	}

	var err error

	if config.AppMode == "" || (config.AppMode != "PRODUCTION" && config.AppMode != "DEVELOPMENT") {
		log.Fatalf("invalid app mode, only production or development is allowed\n")
	}

	if config.Protocol != "http" && config.Protocol != "https" {
		log.Fatalf("invalid protocol, valid options are 'http' or 'https'\n")
	}

	config.RestServerPort, err = strconv.Atoi(mustGetEnv("REST_SERVER_PORT", true))
	if err != nil {
		log.Fatalf("invalid http port environment variable: %d\n", config.RestServerPort)
	}

	config.WebsocketServerPort, err = strconv.Atoi(mustGetEnv("WEBSOCKET_SERVER_PORT", true))
	if err != nil {
		log.Fatalf("invalid websocket port environment variable: %d\n", config.WebsocketServerPort)
	}

	config.WebRTCWebsocketServerPort, err = strconv.Atoi(mustGetEnv("WEBRTC_WEBSOCKET_SERVER_PORT", true))
	if err != nil {
		log.Fatalf("invalid web rtc websocket port environment variable: %d\n", config.WebRTCWebsocketServerPort)
	}

	config.GithubKey = mustGetEnv("GITHUB_KEY", false)
	if config.GithubKey != "" {
		config.GithubSecret = mustGetEnv("GITHUB_SECRET", true)
		config.GithubRedirectURL = mustGetEnv("GITHUB_REDIRECT_URL", true)
	}

	config.GitlabKey = mustGetEnv("GITLAB_KEY", false)
	if config.GitlabKey != "" {
		config.GitlabSecret = mustGetEnv("GITLAB_SECRET", true)
		config.GitlabRedirectURL = mustGetEnv("GITLAB_REDIRECT_URL", true)
	}

	if config.GithubKey == "" && config.GitlabKey == "" {
		log.Fatalf("no oauth config provided\n")
	}

	if config.AppMode == "PRODUCTION" {
		config.FrontendHost = fmt.Sprintf("https://%s", config.FrontendHost)
	} else {
		config.FrontendHost = fmt.Sprintf("http://%s", config.FrontendHost)
	}

	log.Printf("\n%s\n%s\n%s\n", config.NATSURL, config.NATSPassword, config.NATSUser)
	return config
}

func mustGetEnv(key string, required bool) string {
	val := os.Getenv(key)
	if val != "" {
		return val
	}

	if required {
		log.Fatalf("missing required environment variable : %s\n", key)
	}

	log.Printf("missing non-required environment variable (%s), this may reduce functionality.\n", key)

	return ""
}
