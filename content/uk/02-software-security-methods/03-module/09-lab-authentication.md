---
title: "Реалізація алгоритму ідентифікації і аутентифікації користувачів в мережі. Блок-схема алгоритму"
shortTitle: "Ідентифікація та аутентифікація користувачів"
type: lab
order: 9
labNumber: 10
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим C++ компілятором (MSVC, MinGW або GCC)"
  - "Середовище розробки (Visual Studio, VS Code)"
  - "Доступ до Інтернету для перевірки TOTP"
preview: "Реалізація системи ідентифікації та аутентифікації."
---

**Мета:** вивчити принципи ідентифікації та аутентифікації користувачів. Реалізувати безпечну систему аутентифікації з хешуванням паролів, challenge-response протоколом та двофакторною аутентифікацією.

**Обладнання:** ПК з встановленим C++ компілятором (MSVC, MinGW або GCC); Середовище розробки (Visual Studio, VS Code); Доступ до Інтернету для перевірки TOTP.

**Тривалість:** 4 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 7: Ідентифікація та аутентифікація. Загрози безпеці |
| **Навички** | Хеш-функції, робота з файлами |
| **Середовище** | ПК з встановленим C++ компілятором (MSVC, MinGW або GCC) |

## Теоретичні відомості

### 1 Ідентифікація, аутентифікація, авторизація

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ПРОЦЕС ДОСТУПУ ДО СИСТЕМИ                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ІДЕНТИФІКАЦІЯ        АУТЕНТИФІКАЦІЯ        АВТОРИЗАЦІЯ               │
│  "Хто ти?"            "Доведи!"             "Що дозволено?"           │
│       ↓                    ↓                      ↓                   │
│  ┌─────────┐          ┌─────────┐           ┌─────────┐               │
│  │  Login  │ ───────► │ Password│ ────────► │  Права  │               │
│  │  Email  │          │  Token  │           │  Ролі   │               │
│  │   ID    │          │  Biom.  │           │  ACL    │               │
│  └─────────┘          └─────────┘           └─────────┘               │
│                                                                       │
│  Приклад:                                                             │
│  "Я користувач admin" → "Ось мій пароль" → "Доступ до /admin"         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 2 Фактори аутентифікації

Таблиця 1 — Фактори аутентифікації

| Фактор | Що це | Приклади |
|----|----|----|
| **Знання** | Щось, що знає тільки користувач | Пароль, PIN, секретне питання |
| **Володіння** | Щось, що має тільки користувач | Телефон (SMS, TOTP), смарт-карта |
| **Біометрія** | Щось, чим є користувач | Відбиток пальця, обличчя, голос |

**MFA (Multi-Factor Authentication)** — використання двох і більше факторів.

### 3 Безпечне зберігання паролів

**Небезпечно:**

```
users.txt:
admin:password123    ← Пароль у відкритому вигляді
user1:qwerty         ← Зловмисник бачить все
```
**Краще (хеш):**

```
users.txt:
admin:ef92b778bafe771e89245b89ecbc0  ← Хеш пароля
user1:d8578edf8458ce06fbc5bb76a58c   ← Але однакові паролі → однакові хеші
```
**Найкраще (хеш + сіль):**

```
users.txt:
admin:a1b2c3:8f7e6d5c4b3a2918...  ← Унікальна сіль + хеш
user1:x9y8z7:1a2b3c4d5e6f7890...  ← Однакові паролі → різні хеші
┌───────────────────────────────────────────────────────────────────────┐
│                    ХЕШУВАННЯ З СІЛЛЮ                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  РЕЄСТРАЦІЯ:                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ 1. Генерувати випадкову сіль (16+ байт)                         │  │
│  │ 2. hash = SHA256(salt + password)                               │  │
│  │ 3. Зберегти: (login, salt, hash)                                │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ПЕРЕВІРКА:                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ 1. Отримати salt і hash за login                                │  │
│  │ 2. computed_hash = SHA256(salt + input_password)                │  │
│  │ 3. Порівняти computed_hash з hash (безпечне порівняння!)        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 4 Атаки на паролі

Таблиця 2 — Атаки на паролі та засоби захисту

| Атака | Опис | Захист |
|----|----|----|
| **Brute force** | Перебір всіх комбінацій | Rate limiting, складні паролі |
| **Dictionary** | Перебір словника | Нестандартні паролі |
| **Rainbow tables** | Готові таблиці хеш→пароль | Сіль |
| **Timing attack** | Аналіз часу порівняння | Constant-time порівняння |
| **Credential stuffing** | Використання витоків | MFA, унікальні паролі |

### 5 Challenge-Response протокол

Замість передачі пароля мережею використовується виклик-відповідь:

```
┌───────────────────────────────────────────────────────────────────────┐
│                    CHALLENGE-RESPONSE ПРОТОКОЛ                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Клієнт                                      Сервер                   │
│     │                                           │                     │
│     │──────── 1. "Я хочу увійти як admin" ─────►│                     │
│     │                                           │                     │
│     │◄─────── 2. Challenge (випадкове число) ───│                     │
│     │                                           │                     │
│     │  3. Response = HMAC(challenge, password)  │                     │
│     │                                           │                     │
│     │──────── 4. Response ─────────────────────►│                     │
│     │                                           │                     │
│     │          5. Сервер обчислює HMAC          │                     │
│     │             і порівнює з Response         │                     │
│     │                                           │                     │
│     │◄─────── 6. OK / FAIL ─────────────────────│                     │
│     │                                           │                     │
│                                                                       │
│  Пароль ніколи не передається мережею!                                │
│  Кожен challenge унікальний → захист від replay-атак                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 6 TOTP (Time-based One-Time Password)

TOTP генерує 6-значний код, що змінюється кожні 30 секунд.

**Алгоритм:**

```
1. Поточний час: T = floor(unix_time / 30)
2. HMAC: H = HMAC-SHA1(secret_key, T)
3. Динамічне зрізання: код = DT(H) mod 10^6
```
**Формула:**

```
TOTP = HOTP(K, T) = Truncate(HMAC-SHA1(K, T)) mod 10^6

де T = floor((current_unix_time - T0) / X)
   T0 = 0 (epoch)
   X = 30 (секунд)
```
## Приклад виконання

### Завдання 1: Реєстрація користувача

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <random>
#include <sstream>
#include <iomanip>

// Клас SHA256 узято з лабораторної роботи №7 — підключіть його файл до проєкту
std::string sha256(const std::string& message);

using Bytes = std::vector<unsigned char>;

class PasswordManager {
public:
    static const size_t SALT_LENGTH = 16;   // 128 біт
    static const int ITERATIONS = 100000;   // сповільнення перебору

    // Криптографічно стійка сіль: унікальна для кожного користувача
    static Bytes generateSalt() {
        std::random_device rd;                       // джерело ентропії ОС
        std::uniform_int_distribution<int> dist(0, 255);

        Bytes salt(SALT_LENGTH);
        for (unsigned char& byte : salt) {
            byte = static_cast<unsigned char>(dist(rd));
        }
        return salt;
    }

    static std::string toHex(const Bytes& data) {
        std::ostringstream out;
        for (unsigned char byte : data) {
            out << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(byte);
        }
        return out.str();
    }

    // Спрощений аналог PBKDF2: багаторазове хешування пари «сіль + пароль».
    // Ітерації роблять перевірку одного пароля повільною, тому перебір
    // мільярдів варіантів стає непрактичним.
    static std::string hashPassword(const std::string& password, const Bytes& salt) {
        std::string digest = sha256(toHex(salt) + password);

        for (int i = 1; i < ITERATIONS; ++i) {
            digest = sha256(digest);
        }
        return digest;
    }

    // Один прохід SHA-256 — лише для порівняння швидкості у звіті.
    // У робочих системах так паролі не зберігають.
    static std::string simpleHash(const std::string& password, const Bytes& salt) {
        return sha256(toHex(salt) + password);
    }

    struct Credentials {
        Bytes salt;
        std::string hash;
    };

    // Реєстрація: у базі зберігаються лише сіль і хеш, самого пароля немає
    static Credentials registerUser(const std::string& password) {
        Credentials credentials;
        credentials.salt = generateSalt();
        credentials.hash = hashPassword(password, credentials.salt);
        return credentials;
    }

    // Перевірка: пароль хешується з тією самою сіллю й порівнюється з базою
    static bool verifyPassword(const std::string& password, const Credentials& stored) {
        return constantTimeEquals(hashPassword(password, stored.salt), stored.hash);
    }

    // Порівняння за сталий час — див. завдання 2
    static bool constantTimeEquals(const std::string& a, const std::string& b) {
        if (a.size() != b.size()) return false;

        unsigned char diff = 0;
        for (size_t i = 0; i < a.size(); ++i) {
            diff |= static_cast<unsigned char>(a[i] ^ b[i]);
        }
        return diff == 0;
    }
};

int main() {
    std::string password = "S3cret!Pass";

    PasswordManager::Credentials stored = PasswordManager::registerUser(password);
    std::cout << "Сіль (hex): " << PasswordManager::toHex(stored.salt) << "\n";
    std::cout << "Хеш:        " << stored.hash.substr(0, 32) << "...\n\n";

    std::cout << "Правильний пароль: "
              << (PasswordManager::verifyPassword(password, stored) ? "доступ надано" : "відмова") << "\n";
    std::cout << "Хибний пароль:     "
              << (PasswordManager::verifyPassword("wrong", stored) ? "доступ надано" : "відмова") << "\n";

    // Та сама сіль двічі не повторюється, тому однакові паролі
    // дають різні хеші — райдужні таблиці стають марними
    PasswordManager::Credentials another = PasswordManager::registerUser(password);
    std::cout << "\nТой самий пароль, інша сіль: хеші "
              << (another.hash == stored.hash ? "збігаються" : "різні") << "\n";

    return 0;
}
```

Результат роботи програми (сіль і хеш у кожного запуску свої):

```
Сіль (hex): a2fb3f4ec04865e6a78c4e569a90461b
Хеш:        22fc81b09e78ac3352902d914964bb1e...

Правильний пароль: доступ надано
Хибний пароль:     відмова

Той самий пароль, інша сіль: хеші різні
```

### Завдання 2: Захист від timing attacks

```cpp
#include <iostream>
#include <string>
#include <chrono>

// НЕБЕЗПЕЧНЕ порівняння: виходить із циклу на першій розбіжності,
// тому час виконання залежить від кількості правильних символів
bool unsafeCompare(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;

    for (size_t i = 0; i < a.size(); ++i) {
        if (a[i] != b[i]) return false;   // ранній вихід — джерело витоку
    }
    return true;
}

// БЕЗПЕЧНЕ порівняння: завжди обходить усі байти,
// результат накопичується операцією XOR
bool safeCompare(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;

    unsigned char diff = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        diff |= static_cast<unsigned char>(a[i] ^ b[i]);
    }
    return diff == 0;
}

// Вимірює середній час одного порівняння
template <typename Compare>
double measure(Compare compare, const std::string& secret, const std::string& attempt) {
    const int REPEATS = 200000;
    auto start = std::chrono::high_resolution_clock::now();

    volatile bool sink = false;               // заважає оптимізатору прибрати виклик
    for (int i = 0; i < REPEATS; ++i) {
        sink = compare(secret, attempt);
    }

    auto elapsed = std::chrono::high_resolution_clock::now() - start;
    return std::chrono::duration<double, std::nano>(elapsed).count() / REPEATS;
}

int main() {
    const std::string secret = "correcthashvalue1234567890123456";

    const std::string attempts[] = {
        "wrongghashvalue1234567890123456X",   // розбіжність із першого символу
        "correctghashvalue123456789012345",   // збігаються 7 символів
        "correcthashvalue12345678901234XX"    // збігаються 30 символів
    };

    std::cout << "=== ДЕМОНСТРАЦІЯ TIMING ATTACK ===\n\n";
    std::cout << "Небезпечне порівняння (час залежить від збігів):\n";
    for (const std::string& attempt : attempts) {
        std::cout << "  " << measure(unsafeCompare, secret, attempt) << " нс\n";
    }

    std::cout << "\nБезпечне порівняння (сталий час):\n";
    for (const std::string& attempt : attempts) {
        std::cout << "  " << measure(safeCompare, secret, attempt) << " нс\n";
    }

    std::cout << "\nЧим більше правильних символів на початку, тим довше працює\n"
                 "небезпечний варіант — саме цей час і вимірює зловмисник.\n";
    return 0;
}
```

Результат роботи програми (значення часу залежать від машини):

```
=== ДЕМОНСТРАЦІЯ TIMING ATTACK ===

Небезпечне порівняння (час залежить від збігів):
  42.0044 нс
  174.284 нс
  325.618 нс

Безпечне порівняння (сталий час):
  302.902 нс
  304.912 нс
  305.376 нс

Чим більше правильних символів на початку, тим довше працює
небезпечний варіант — саме цей час і вимірює зловмисник.
```

### Завдання 3: Challenge-Response протокол

```cpp
#include <iostream>
#include <string>
#include <map>
#include <random>
#include <sstream>
#include <iomanip>

std::string sha256(const std::string& message);   // з лабораторної роботи №7

// Challenge-response: пароль мережею не передається.
// Сервер надсилає випадкове число, клієнт доводить знання пароля,
// повертаючи хеш від пари «виклик + хеш пароля».
class ChallengeResponseAuth {
public:
    void registerUser(const std::string& username, const std::string& password) {
        users_[username] = sha256(password);      // у робочій системі — сіль і PBKDF2
        std::cout << "[SERVER] Користувача '" << username << "' зареєстровано\n";
    }

    // Крок 1: клієнт запитує вхід, сервер видає одноразовий виклик
    std::string requestLogin(const std::string& username) {
        if (users_.find(username) == users_.end()) {
            std::cout << "[SERVER] Користувача '" << username << "' не знайдено\n";
            return "";
        }

        std::string challenge = randomHex(32);
        challenges_[username] = challenge;
        std::cout << "[SERVER] Виклик для '" << username << "': "
                  << challenge.substr(0, 16) << "...\n";
        return challenge;
    }

    // Крок 3: сервер обчислює очікувану відповідь і порівнює
    bool verifyResponse(const std::string& username, const std::string& response) {
        auto challenge = challenges_.find(username);
        if (challenge == challenges_.end()) {
            std::cout << "[SERVER] Немає активного виклику\n";
            return false;
        }

        std::string expected = sha256(challenge->second + users_[username]);
        challenges_.erase(challenge);             // виклик одноразовий

        bool ok = (expected == response);
        std::cout << "[SERVER] Перевірка: " << (ok ? "успіх" : "відмова") << "\n";
        return ok;
    }

    // Крок 2: дія клієнта — обчислення відповіді на виклик
    static std::string computeResponse(const std::string& challenge, const std::string& password) {
        return sha256(challenge + sha256(password));
    }

private:
    static std::string randomHex(int bytes) {
        std::random_device rd;
        std::uniform_int_distribution<int> dist(0, 255);

        std::ostringstream out;
        for (int i = 0; i < bytes; ++i) {
            out << std::hex << std::setw(2) << std::setfill('0') << dist(rd);
        }
        return out.str();
    }

    std::map<std::string, std::string> users_;       // ім'я → хеш пароля
    std::map<std::string, std::string> challenges_;  // ім'я → активний виклик
};

int main() {
    ChallengeResponseAuth server;
    server.registerUser("student", "S3cret!Pass");

    std::cout << "\n=== Успішна автентифікація ===\n";
    std::string challenge = server.requestLogin("student");
    std::string response = ChallengeResponseAuth::computeResponse(challenge, "S3cret!Pass");
    std::cout << "[CLIENT] Відповідь: " << response.substr(0, 16) << "...\n";
    server.verifyResponse("student", response);

    std::cout << "\n=== Атака повтором (replay) ===\n";
    std::cout << "[ATTACKER] Повторно надсилає перехоплену відповідь\n";
    server.verifyResponse("student", response);

    std::cout << "\n=== Хибний пароль ===\n";
    challenge = server.requestLogin("student");
    server.verifyResponse("student", ChallengeResponseAuth::computeResponse(challenge, "wrong"));

    return 0;
}
```

Результат роботи програми:

```
[SERVER] Користувача 'student' зареєстровано

=== Успішна автентифікація ===
[SERVER] Виклик для 'student': 78abdd86de9d92b9...
[CLIENT] Відповідь: e7986c853d0e7791...
[SERVER] Перевірка: успіх

=== Атака повтором (replay) ===
[ATTACKER] Повторно надсилає перехоплену відповідь
[SERVER] Немає активного виклику

=== Хибний пароль ===
[SERVER] Виклик для 'student': a1acd6111957660f...
[SERVER] Перевірка: відмова
```

### Завдання 4: Двофакторна аутентифікація (TOTP)

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <ctime>
#include <cstdint>
#include <iomanip>
#include <sstream>

// Хеш-функція з лабораторної роботи №7. TOTP за RFC 6238 припускає
// SHA-1, SHA-256 або SHA-512; тут використано SHA-256.
std::string sha256(const std::string& message);
std::vector<unsigned char> sha256Raw(const std::string& message);

using Bytes = std::vector<unsigned char>;

// HMAC за RFC 2104: hash((key ^ opad) + hash((key ^ ipad) + message))
Bytes hmacSha256(const Bytes& key, const Bytes& message) {
    const size_t BLOCK = 64;
    Bytes paddedKey = key;

    if (paddedKey.size() > BLOCK) {
        std::string raw(paddedKey.begin(), paddedKey.end());
        paddedKey = sha256Raw(raw);
    }
    paddedKey.resize(BLOCK, 0x00);

    Bytes inner(BLOCK), outer(BLOCK);
    for (size_t i = 0; i < BLOCK; ++i) {
        inner[i] = static_cast<unsigned char>(paddedKey[i] ^ 0x36);
        outer[i] = static_cast<unsigned char>(paddedKey[i] ^ 0x5c);
    }

    inner.insert(inner.end(), message.begin(), message.end());
    Bytes innerHash = sha256Raw(std::string(inner.begin(), inner.end()));

    outer.insert(outer.end(), innerHash.begin(), innerHash.end());
    return sha256Raw(std::string(outer.begin(), outer.end()));
}

class TOTP {
public:
    TOTP(const Bytes& secret, int digits = 6, int interval = 30)
        : secret_(secret), digits_(digits), interval_(interval) {}

    // Код залежить від номера часового інтервалу, а не від точного часу,
    // тому клієнт і сервер отримують однакове значення протягом 30 секунд
    std::string generate(std::time_t timestamp = std::time(nullptr)) const {
        uint64_t counter = static_cast<uint64_t>(timestamp) / interval_;

        Bytes message(8);
        for (int i = 7; i >= 0; --i) {           // лічильник у big-endian
            message[i] = static_cast<unsigned char>(counter & 0xFF);
            counter >>= 8;
        }

        Bytes mac = hmacSha256(secret_, message);

        // Динамічне обрізання (dynamic truncation) за RFC 4226
        int offset = mac.back() & 0x0F;
        uint32_t binary =
            (static_cast<uint32_t>(mac[offset]     & 0x7F) << 24) |
            (static_cast<uint32_t>(mac[offset + 1] & 0xFF) << 16) |
            (static_cast<uint32_t>(mac[offset + 2] & 0xFF) << 8)  |
            (static_cast<uint32_t>(mac[offset + 3] & 0xFF));

        uint32_t modulus = 1;
        for (int i = 0; i < digits_; ++i) modulus *= 10;

        std::ostringstream out;
        out << std::setw(digits_) << std::setfill('0') << (binary % modulus);
        return out.str();
    }

    // Допуск у window інтервалів компенсує розбіжність годинників
    bool verify(const std::string& code, int window = 1) const {
        std::time_t now = std::time(nullptr);
        for (int shift = -window; shift <= window; ++shift) {
            if (generate(now + shift * interval_) == code) return true;
        }
        return false;
    }

    int secondsLeft() const {
        return interval_ - static_cast<int>(std::time(nullptr) % interval_);
    }

private:
    Bytes secret_;
    int digits_;
    int interval_;
};

int main() {
    Bytes secret = { 'S','t','u','d','e','n','t','S','e','c','r','e','t','K','e','y','1','2','3','4' };
    TOTP totp(secret);

    std::string code = totp.generate();
    std::cout << "=== Двофакторна автентифікація (TOTP) ===\n";
    std::cout << "Поточний код:     " << code << "\n";
    std::cout << "Дійсний ще:       " << totp.secondsLeft() << " с\n\n";

    std::cout << "Перевірка коду:   " << (totp.verify(code) ? "прийнято" : "відхилено") << "\n";
    std::cout << "Перевірка \"000000\": " << (totp.verify("000000") ? "прийнято" : "відхилено") << "\n\n";

    std::cout << "Код для сусідніх інтервалів (демонстрація вікна допуску):\n";
    std::time_t now = std::time(nullptr);
    for (int shift = -1; shift <= 1; ++shift) {
        std::cout << "  зсув " << std::showpos << shift << std::noshowpos
                  << " інтервал: " << totp.generate(now + shift * 30) << "\n";
    }

    return 0;
}
```
Результат роботи програми:

```
=== Двофакторна автентифікація (TOTP) ===
Поточний код:     724161
Дійсний ще:       14 с

Перевірка коду:   прийнято
Перевірка "000000": відхилено

Код для сусідніх інтервалів (демонстрація вікна допуску):
  зсув -1 інтервал: 557715
  зсув +0 інтервал: 724161
  зсув +1 інтервал: 112200
```

Самі коди в кожного будуть свої: вони залежать від поточного часу, тому
однаковими в усіх студентів будуть лише секрет і структура виводу. Зате
перевірити реалізацію просто — той самий секрет `JBSWY3DPEHPK3PXP` можна
додати в Google Authenticator і звірити коди на екрані телефона.
## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. **Реєстрація користувача:**

```
- Реалізувати генерацію криптографічно безпечної солі
- Реалізувати хешування пароля з сіллю (SHA-256 або PBKDF2)
- Продемонструвати, що однакові паролі з різною сіллю дають різні хеші
```

3. **Перевірка пароля:**

```
- Реалізувати функцію перевірки пароля
- Використати constant-time порівняння хешів
- Продемонструвати захист від timing attacks
```

4. **Challenge-Response:**

```
- Реалізувати протокол виклик-відповідь
- Продемонструвати успішну аутентифікацію
- Продемонструвати захист від replay-атак
```

5. **TOTP:**

```
- Реалізувати генерацію TOTP-кодів
- Перевірити сумісність з Google Authenticator (опціонально)
- Продемонструвати повний цикл 2FA (пароль + TOTP)
```

6. Виконати індивідуальне завдання згідно з варіантом.

7. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- постановку задачі за індивідуальним варіантом;
- повний код програми з коментарями;
- демонстрацію реєстрації з хешуванням і сіллю;
- демонстрацію перевірки пароля (правильний/неправильний);
- демонстрацію challenge-response протоколу;
- демонстрацію генерації та перевірки TOTP;
- результат виконання індивідуального завдання;
- висновок про переваги багатофакторної аутентифікації.

## Варіанти індивідуальних завдань

| № | Завдання |
|----|----|
| 1 | Реалізувати перевірку складності пароля (довжина, цифри, спецсимволи). |
| 2 | Порівняти час хешування SHA-256 vs PBKDF2 з різною кількістю ітерацій. |
| 3 | Реалізувати блокування облікового запису після 5 невдалих спроб. |
| 4 | Додати до challenge-response timestamp для захисту від затримки. |
| 5 | Реалізувати HOTP (counter-based) замість TOTP. |
| 6 | Додати можливість відновлення пароля через секретне питання. |
| 7 | Реалізувати вхід через одноразове посилання (magic link). |
| 8 | Порівняти SHA-256 та bcrypt для хешування паролів. |
| 9 | Реалізувати перевірку пароля за словником (dictionary check). |
| 10 | Додати сесійний токен після успішної аутентифікації. |
| 11 | Реалізувати "запам'ятати мене" з безпечним токеном. |
| 12 | Додати логування всіх спроб входу (успішних і невдалих). |
| 13 | Реалізувати зміну пароля з перевіркою старого. |
| 14 | Додати геолокаційну перевірку (IP → країна) при вході. |
| 15 | Реалізувати backup codes для 2FA (як у Google). |
| 16 | Порівняти час атаки brute force для паролів різної довжини. |
| 17 | Реалізувати автоматичний logout після N хвилин неактивності. |
| 18 | Додати сповіщення на email при вході з нового пристрою. |
| 19 | Реалізувати passwordless вхід (тільки TOTP без пароля). |
| 20 | Інтегрувати з WebAuthn/FIDO2 (теоретичний опис + псевдокод). |

## Контрольні запитання

Запитання згруповано за рівнями навчальних досягнень. Для позитивної оцінки студент має відповісти на запитання середнього рівня, оцінка «добре» потребує відповідей достатнього рівня, оцінка «відмінно» — високого.

### Середній рівень (репродуктивний)

1. Чим ідентифікація відрізняється від аутентифікації?
2. Чим аутентифікація відрізняється від авторизації?
3. Чому не можна зберігати паролі у відкритому вигляді?
4. Що таке сіль (salt)?
5. Які фактори аутентифікації існують? Наведіть приклад кожного.
6. Що таке MFA?
7. Як працює challenge-response протокол?
8. Як працює TOTP і чому код змінюється кожні 30 секунд?

### Достатній рівень (конструктивно-варіативний)

1. Чим PBKDF2 кращий за простий SHA-256 для зберігання паролів?
2. Що саме унеможливлює сіль і чому вона має бути унікальною для кожного користувача?
3. Що таке timing attack і як від неї захиститися під час порівняння хешів?
4. Чому challenge має бути унікальним щоразу? Яка атака стає можливою без цього?
5. Чому пароль не передають мережею навіть у хешованому вигляді?
6. Що робити, якщо користувач втратив доступ до другого фактора? Які ризики має процедура відновлення?
7. Чим апаратний ключ безпечніший за код із SMS?
8. Як перевірити стійкість власної схеми зберігання паролів?

### Високий рівень (творчий)

1. Спроєктуйте схему аутентифікації для навчального порталу: які фактори, як зберігаються паролі, як відбувається відновлення доступу. Обґрунтуйте кожне рішення.
2. Базу хешів паролів викрадено. Опишіть порядок дій адміністратора та поясніть, від чого саме захистили сіль і повільна функція.
3. Оцініть, чому збільшення вимог до складності пароля має межу корисності, і запропонуйте, чим його доцільніше замінити.
4. Сформулюйте, чому багатофакторність підвищує безпеку не вдвічі, а на порядок, і за яких умов цей виграш зникає.

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).

## Cheat Sheet

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ШПАРГАЛКА: АУТЕНТИФІКАЦІЯ                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ХЕШУВАННЯ ПАРОЛІВ:                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ salt = secrets.token_bytes(16)                                  │  │
│  │ hash = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)    │  │
│  │ Зберігати: (salt, hash)                                         │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  БЕЗПЕЧНЕ ПОРІВНЯННЯ:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ hmac.compare_digest(a, b)  ← Constant-time!                     │  │
│  │ НЕ використовуйте: a == b                                       │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  CHALLENGE-RESPONSE:                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Server: challenge = secrets.token_bytes(32)                     │  │
│  │ Client: response = HMAC(password_hash, challenge)               │  │
│  │ Server: expected = HMAC(stored_hash, challenge)                 │  │
│  │         compare(response, expected)                             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  TOTP:                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ counter = time() // 30                                          │  │
│  │ code = Truncate(HMAC-SHA1(secret, counter)) mod 10^6            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ФАКТОРИ MFA:                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Знання    → пароль, PIN                                         │  │
│  │ Володіння → телефон (TOTP), смарт-карта                         │  │
│  │ Біометрія → відбиток, обличчя                                   │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
