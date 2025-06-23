package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type DBTX interface {
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
}

type pgxDB interface {
	DBTX
	Begin(ctx context.Context) (pgx.Tx, error)
}

var (
	_ DBTX  = &pgx.Conn{}
	_ DBTX  = pgx.Tx(nil)
	_ DBTX  = &pgxpool.Conn{}
	_ DBTX  = &pgxpool.Pool{}
	_ DBTX  = &pgxpool.Tx{}
	_ pgxDB = &pgx.Conn{}
	_ pgxDB = pgx.Tx(nil)
	_ pgxDB = &pgxpool.Conn{}
	_ pgxDB = &pgxpool.Pool{}
	_ pgxDB = &pgxpool.Tx{}
)

type (
	transactorKey struct{}
	// DBGetter is used to get the current DB handler from the context.
	// It returns the current transaction if there is one, otherwise it will return the original DB.
	DBGetter func(context.Context) DBTX
)

type TXKEY struct{}

func txToContext(ctx context.Context, tx pgx.Tx) context.Context {
	return context.WithValue(ctx, TXKEY{}, tx)
}

func txFromContext(ctx context.Context) pgx.Tx {
	if tx, ok := ctx.Value(TXKEY{}).(pgx.Tx); ok {
		return tx
	}

	return nil
}

func NewTransactor(db *pgx.Conn) (*Transactor, DBGetter) {
	pgxTxGetter := func(ctx context.Context) pgxDB {
		if tx := txFromContext(ctx); tx != nil {
			return tx
		}

		return db
	}

	dbGetter := func(ctx context.Context) DBTX {
		if tx := txFromContext(ctx); tx != nil {
			return tx
		}

		return db
	}

	return &Transactor{
		pgxTxGetter,
	}, dbGetter
}

func NewTransactorFromPool(pool *pgxpool.Pool) (*Transactor, DBGetter) {
	pgxTxGetter := func(ctx context.Context) pgxDB {
		if tx := txFromContext(ctx); tx != nil {
			return tx
		}

		return pool
	}

	dbGetter := func(ctx context.Context) DBTX {
		if tx := txFromContext(ctx); tx != nil {
			return tx
		}

		return pool
	}

	return &Transactor{
		pgxTxGetter,
	}, dbGetter
}

type (
	pgxTxGetter func(context.Context) pgxDB
)

type Transactor struct {
	pgxTxGetter
}

func (t *Transactor) WithinTransaction(ctx context.Context, txFunc func(context.Context) error) error {
	db := t.pgxTxGetter(ctx)

	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	txCtx := txToContext(ctx, tx)

	if err := txFunc(txCtx); err != nil {
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}

	return nil
}

func IsWithinTransaction(ctx context.Context) bool {
	return ctx.Value(transactorKey{}) != nil
}
