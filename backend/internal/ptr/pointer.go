package pointer

import "github.com/google/uuid"

func Of[T any](v T) *T { return &v }

func UUIDPtrToStringPtr(v *uuid.UUID) *string {
	if v == nil || *v == uuid.Nil {
		return nil
	}
	return Of(v.String())
}

func UUIDToStringPtr(v uuid.UUID) *string {
	if v == uuid.Nil {
		return nil
	}
	return Of(v.String())
}
