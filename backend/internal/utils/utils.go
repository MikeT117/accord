package utils

import (
	"sync"
)

type SafeRWMutexMap[T any] struct {
	Mutex sync.RWMutex
	Data  T
}
