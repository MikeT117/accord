package web_rtc_voice

import "sync"

type SafeRWMutex[T any] struct {
	Mutex sync.RWMutex
	Data  T
}
