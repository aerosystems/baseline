// Демонстрація SQL-ін'єкції та захисту від неї.
// Потрібна бібліотека SQLite: у Visual Studio додайте sqlite3.c і sqlite3.h
// до проєкту (амальгама з sqlite.org) або підключіть пакет через NuGet.
#include <stdio.h>
#include <string.h>
#include "sqlite3.h"

// Створює навчальну базу в пам'яті з двома обліковими записами
sqlite3* setup_db() {
        sqlite3* db = nullptr;
        sqlite3_open(":memory:", &db);

        const char* schema =
                "CREATE TABLE users ("
                        "  id INTEGER PRIMARY KEY,"
                        "  login TEXT NOT NULL,"
                        "  password TEXT NOT NULL,"
                        "  role TEXT DEFAULT 'user');"
                        "INSERT INTO users (login, password, role) "
                        "VALUES ('admin', 'secret123', 'admin');"
                        "INSERT INTO users (login, password, role) "
                        "VALUES ('user1', 'pass1', 'user');";

        sqlite3_exec(db, schema, nullptr, nullptr, nullptr);
        return db;
}

// ВРАЗЛИВИЙ варіант: запит склеюється з рядків, дані користувача
// потрапляють у текст запиту й змінюють його структуру
bool vulnerable_login(sqlite3* db, const char *login, const char *password) {
        char query[2048];
        memset(query, 0, sizeof(query));

        sprintf(query,
                "SELECT login, role FROM users WHERE login='%s' AND password='%s'",
                login, password);

        printf("[ВРАЗЛИВИЙ] Запит: %s\n", query);

        sqlite3_stmt* stmt = nullptr;
        if (sqlite3_prepare_v2(db, query, -1, &stmt, nullptr) != SQLITE_OK) {
                printf("[ВРАЗЛИВИЙ] Помилка SQL: %s\n", sqlite3_errmsg(db));
                return false;
        }

        bool found = (sqlite3_step(stmt) == SQLITE_ROW);
        if (found) {
                printf("[ВРАЗЛИВИЙ] Вхід виконано як: %s (роль %s)\n",
                       sqlite3_column_text(stmt, 0),
                       sqlite3_column_text(stmt, 1));
        }
        sqlite3_finalize(stmt);
        return found;
}

// БЕЗПЕЧНИЙ варіант: структура запиту фіксована, дані передаються
// окремо через параметри й ніколи не тлумачаться як код SQL
bool safe_login(sqlite3* db, const char *login, const char *password) {
        const char *query = "SELECT login, role FROM users WHERE login=? AND password=?";

        printf("[БЕЗПЕЧНИЙ] Запит: %s\n", query);
        printf("[БЕЗПЕЧНИЙ] Параметри: ('%s', '%s')\n", login, password);

        sqlite3_stmt* stmt = nullptr;
        sqlite3_prepare_v2(db, query, -1, &stmt, nullptr);
        sqlite3_bind_text(stmt, 1, login, -1, SQLITE_TRANSIENT);
        sqlite3_bind_text(stmt, 2, password, -1, SQLITE_TRANSIENT);

        bool found = (sqlite3_step(stmt) == SQLITE_ROW);
        if (found) {
                printf("[БЕЗПЕЧНИЙ] Вхід виконано як: %s\n",
                       sqlite3_column_text(stmt, 0));
        }
        sqlite3_finalize(stmt);
        return found;
}

int main() {
    sqlite3* db = setup_db();

    printf("=== Коректний вхід ===\n");
    vulnerable_login(db, "admin", "secret123");

    // Введене значення закриває лапку й додає умову, істинну завжди
    const char *injection = "' OR '1'='1";

    printf("\n=== Атака SQL-ін'єкцією ===\n");
    bool bypassed = vulnerable_login(db, "admin", injection);
    printf("Результат: %s\n", (bypassed ? "ЗАХИСТ ОБІЙДЕНО" : "доступ відхилено"));

    printf("\n=== Та сама атака на параметризованому запиті ===\n");
    bool blocked = safe_login(db, "admin", injection);
    printf("Результат: %s\n", (blocked ? "ЗАХИСТ ОБІЙДЕНО" : "доступ відхилено"));

    sqlite3_close(db);
    return 0;
}
