package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	OAuthNonceSecret string

	GithubKey         string
	GithubSecret      string
	GithubRedirectURL string

	GitlabKey         string
	GitlabSecret      string
	GitlabRedirectURL string

	JWTAccesstokenKey  []byte
	JWTRefreshtokenKey []byte

	JWTRegistrationTokenKey []byte

	CloudinaryURL    string
	CloudinaryResURL string
	CloudinarySecret string
	CloudinaryAPIKey string
	CloudinaryEnv    string

	DatabaseURL string

	HTTPPort      int
	WebsocketPort int
	WebRTCPort    int

	Host string

	NATSURL      string
	NATSUser     string
	NATSPassword string

	APIURL string
	RTCURL string
	WSURL  string
}

func MustLoadConfig() *Config {
	godotenv.Load(".env.local")

	config := &Config{
		OAuthNonceSecret: mustGetEnv("OAUTH_NONCE_SECRET", true),

		JWTAccesstokenKey:       []byte(mustGetEnv("JWT_ACCESSTOKEN_KEY", true)),
		JWTRefreshtokenKey:      []byte(mustGetEnv("JWT_REFRESHTOKEN_KEY", true)),
		JWTRegistrationTokenKey: []byte(mustGetEnv("JWT_REGISTRATIONTOKEN_KEY", true)),

		CloudinaryURL:    mustGetEnv("CLOUDINARY_URL", false),
		CloudinaryResURL: mustGetEnv("CLOUDINARY_RES_URL", false),
		CloudinarySecret: mustGetEnv("CLOUDINARY_SECRET", false),
		CloudinaryAPIKey: mustGetEnv("CLOUDINARY_API_KEY", false),
		CloudinaryEnv:    mustGetEnv("CLOUDINARY_ENVIRONMENT", false),

		DatabaseURL: mustGetEnv("DATABASE_URL", true),

		NATSURL:      mustGetEnv("NATS_URL", true),
		NATSUser:     mustGetEnv("NATS_USER", true),
		NATSPassword: mustGetEnv("NATS_PASSWORD", true),

		Host:   mustGetEnv("HOST", true),
		APIURL: mustGetEnv("API_URL", true),
		RTCURL: mustGetEnv("RTC_URL", true),
		WSURL:  mustGetEnv("WS_URL", true),
	}

	var err error

	config.HTTPPort, err = strconv.Atoi(mustGetEnv("HTTP_PORT", true))
	if err != nil {
		log.Fatalf("invalid http port environment variable: %d\n", config.HTTPPort)
	}

	config.WebsocketPort, err = strconv.Atoi(mustGetEnv("WEBSOCKET_PORT", true))
	if err != nil {
		log.Fatalf("invalid websocket port environment variable: %d\n", config.WebsocketPort)
	}

	config.WebRTCPort, err = strconv.Atoi(mustGetEnv("WEBRTC_WS_PORT", true))
	if err != nil {
		log.Fatalf("invalid web rtc websocket port environment variable: %d\n", config.WebRTCPort)
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
