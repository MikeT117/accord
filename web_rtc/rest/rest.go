package rest

import (
	"io"
	"net/http"
	"strconv"
	"time"

	signal "github.com/MikeT117/go_web_rtc/internal"
	"github.com/MikeT117/go_web_rtc/web_rtc/rtc"
	"github.com/labstack/echo/v4"
	"github.com/pion/webrtc/v4"
)

func CreateRESTService() {

	hub := rtc.CreateAPI()
	channel := hub.CreateChannel("channel1")

	e := echo.New()

	e.POST("/api", func(c echo.Context) error {

		body, err := io.ReadAll(c.Request().Body)
		if err != nil {
			return err
		}

		offer := webrtc.SessionDescription{}
		signal.Decode(string(body), &offer)

		rtc := channel.CreatePeer(strconv.FormatInt(time.Now().UnixNano(), 10), offer)
		return c.String(http.StatusOK, signal.Encode(rtc.LocalDescription()))

	})
	e.Logger.Fatal(e.Start(":8080"))
}
