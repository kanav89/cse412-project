import logging
import os

import psycopg2


logger = logging.getLogger(__name__)


class DatabaseConnectionError(RuntimeError):
    """Raised when Postgres cannot be reached with the current settings."""


def get_db_connection():
    """Return a psycopg2 connection using env vars with sensible defaults."""

    database_url = os.getenv("DATABASE_URL")
    conn_args = {
        "host": os.getenv("DB_HOST", "localhost"),
        "dbname": os.getenv("DB_NAME", "project"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", ""),
        "port": os.getenv("DB_PORT", "5432"),
    }

    try:
        if database_url:
            return psycopg2.connect(database_url)

        return psycopg2.connect(**conn_args)
    except psycopg2.OperationalError as exc:
        target = (
            database_url
            or f"{conn_args['dbname']} (host={conn_args['host']} port={conn_args['port']})"
        )
        logger.error(
            "Postgres connection failed while targeting %s. "
            "Set DATABASE_URL or DB_NAME/DB_USER/DB_PASSWORD/DB_HOST/DB_PORT env vars "
            "or create the database if it does not exist.\n%s",
            target,
            exc,
        )
        if database_url:
            message = (
                "Unable to connect using DATABASE_URL. Verify the connection string or "
                "update it to point at an existing database."
            )
        else:
            message = (
                "Unable to connect to Postgres database "
                f"'{conn_args['dbname']}' on {conn_args['host']}:{conn_args['port']}. "
                "Update DB_* env vars or create the database using the provided SQL."
            )
        raise DatabaseConnectionError(message) from exc
