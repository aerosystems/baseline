package minidb

// Small abstraction layer over underlying db
// with only used functions

import (
        "errors"
)

type MiniDB interface {
        Deinit()
        FindTo(out any, collName string, filter any) error
        AreAny(collName string, filter any) bool
        Create(collName string, new any) error
        Replace(collName string, filter any, new any) error
        Update(collName string, filter any, changes any) error
        Delete(collName string, filter any) (int64, error)
}

var ErrAlreadyExists error = errors.New("such entry already exists")
var ErrNotExists error = errors.New("such entry does not exist")
