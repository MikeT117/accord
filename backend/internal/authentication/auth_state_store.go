package authentication

import (
	"time"
)

type Store struct {
	states          map[string]int64
	expiredInterval time.Duration
}

func (s *Store) Insert(key string) {
	s.states[key] = time.Now().Add(time.Second * 10).UnixNano()
}

func (s *Store) Get(key string) bool {
	return s.states[key] != 0 && s.states[key] > time.Now().UnixNano()
}

func (s *Store) deletedExpired() {
	now := time.Now().UnixNano()
	for k, v := range s.states {
		if now > v {
			delete(s.states, k)
		}
	}
}

func (s *Store) cleanup() {
	ticker := time.NewTicker(s.expiredInterval)
	for {
		<-ticker.C
		s.deletedExpired()
	}
}

func NewStateStore() *Store {
	store := &Store{
		states:          make(map[string]int64),
		expiredInterval: time.Second * 30,
	}

	go store.cleanup()
	return store
}

var StateStore *Store = NewStateStore()
