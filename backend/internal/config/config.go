package config

import (
	"fmt"
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

	JWTIssuer          string
	JWTAccesstokenKey  []byte
	JWTRefreshtokenKey []byte

	CloudinaryURL    string
	CloudinaryResURL string
	CloudinarySecret string
	CloudinaryAPIKey string
	CloudinaryEnv    string

	DatabaseURL string

	HTTPPort            int
	WebsocketPort       int
	WebRTCWebsocketPort int

	Host string

	NATSURL      string
	NATSUser     string
	NATSPassword string

	APIURL string
	RTCURL string
	WSURL  string
}

func LoadConfig() *Config {
	godotenv.Load(".env.local")

	HTTPPort, err := strconv.Atoi(mustGetEnv("HTTP_PORT", true))
	if err != nil {
		log.Fatalf("invalid http port environment variable: %d\n", HTTPPort)
	}

	WebsocketPort, err := strconv.Atoi(mustGetEnv("WEBSOCKET_PORT", true))
	if err != nil {
		log.Fatalf("invalid websocket port environment variable: %d\n", WebsocketPort)
	}

	WebRTCPort, err := strconv.Atoi(mustGetEnv("WEBRTC_WS_PORT", true))
	if err != nil {
		log.Fatalf("invalid web rtc websocket port environment variable: %d\n", WebRTCPort)
	}

	return &Config{
		OAuthNonceSecret: mustGetEnv("OAUTH_NONCE_SECRET", true),

		GithubKey:         mustGetEnv("GITHUB_KEY", true),
		GithubSecret:      mustGetEnv("GITHUB_SECRET", true),
		GithubRedirectURL: mustGetEnv("GITHUB_REDIRECT_URL", true),

		JWTIssuer:          mustGetEnv("JWT_ISSUER", true),
		JWTAccesstokenKey:  []byte(mustGetEnv("JWT_ACCESSTOKEN_KEY", true)),
		JWTRefreshtokenKey: []byte(mustGetEnv("JWT_REFRESHTOKEN_KEY", true)),

		CloudinaryURL:    mustGetEnv("CLOUDINARY_URL", false),
		CloudinaryResURL: mustGetEnv("CLOUDINARY_RES_URL", false),
		CloudinarySecret: mustGetEnv("CLOUDINARY_SECRET", false),
		CloudinaryAPIKey: mustGetEnv("CLOUDINARY_API_KEY", false),
		CloudinaryEnv:    mustGetEnv("CLOUDINARY_ENVIRONMENT", false),

		DatabaseURL: mustGetEnv("DATABASE_URL", true),

		HTTPPort:            HTTPPort,
		WebsocketPort:       WebsocketPort,
		WebRTCWebsocketPort: WebRTCPort,

		Host: mustGetEnv("HOST", true),

		NATSURL:      mustGetEnv("NATS_URL", true),
		NATSUser:     mustGetEnv("NATS_USER", true),
		NATSPassword: mustGetEnv("NATS_PASSWORD", true),

		APIURL: mustGetEnv("API_URL", true),
		RTCURL: mustGetEnv("RTC_URL", true),
		WSURL:  mustGetEnv("WS_URL", true),
	}

}

func mustGetEnv(key string, required bool) string {
	val := os.Getenv(key)
	if val == "" {
		if required {
			panic(fmt.Sprintf("missing required environment variable : %s\n", key))
		}

		fmt.Printf("missing non-required environment variable (%s), this may reduce functionality.\n", key)
	}

	return val
}
