---
title: "Ідентифікація та аутентифікація. Загрози безпеки"
type: lecture
order: 7
preview: "Методи аутентифікації, MFA, найпоширеніші загрози та методи захисту."
---

## Три кити контролю доступу

```
┌─────────────────────────────────────────────────────────────────────┐
│                    КОНТРОЛЬ ДОСТУПУ                                 │
│                                                                     │
│   ┌─────────────────┐                                               │
│   │ ІДЕНТИФІКАЦІЯ   │  "Хто ви?"                                    │
│   │                 │  • Логін                                      │
│   │                 │  • Email                                      │
│   │                 │  • Номер картки                               │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ АУТЕНТИФІКАЦІЯ  │  "Доведіть, що це ви"                         │
│   │                 │  • Пароль                                     │
│   │                 │  • Відбиток пальця                            │
│   │                 │  • SMS-код                                    │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ АВТОРИЗАЦІЯ     │  "Що вам дозволено?"                          │
│   │                 │  • Читання файлів                             │
│   │                 │  • Адміністрування                            │
│   │                 │  • Переказ коштів                             │
│   └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Фактори аутентифікації

### Три категорії

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ФАКТОРИ АУТЕНТИФІКАЦІЇ                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. ЗНАННЯ (Something you KNOW)                                    │
│      • Пароль                                                       │
│      • PIN-код                                                      │
│      • Секретне питання                                             │
│      • Графічний ключ                                               │
│                                                                     │
│   2. ВОЛОДІННЯ (Something you HAVE)                                 │
│      • Смартфон (SMS, TOTP)                                         │
│      • Апаратний токен (YubiKey)                                    │
│      • Смарт-карта                                                  │
│      • Банківська картка                                            │
│                                                                     │
│   3. ВЛАСТИВІСТЬ (Something you ARE)                                │
│      • Відбиток пальця                                              │
│      • Розпізнавання обличчя                                        │
│      • Сканування райдужки                                          │
│      • Голос                                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Багатофакторна аутентифікація (MFA)

**MFA** використовує фактори з **різних** категорій:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПРИКЛАДИ MFA                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ✅ Справжня MFA:                                                  │
│      • Пароль (знання) + SMS (володіння)                            │
│      • PIN (знання) + карта (володіння)                             │
│      • Пароль (знання) + відбиток (властивість)                     │
│                                                                     │
│   ❌ НЕ справжня MFA:                                               │
│      • Пароль + секретне питання (обидва — знання)                  │
│      • Два паролі (обидва — знання)                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Парольна аутентифікація

### Проблеми паролів

```
┌─────────────────────────────────────────────────────────────────────┐
│                    СТАТИСТИКА ПАРОЛІВ                               │
│                                                                     │
│   • 81% витоків даних — через слабкі або вкрадені паролі            │
│   • Топ паролів: 123456, password, qwerty, admin                    │
│   • Середній користувач має 100+ акаунтів                           │
│   • 65% використовують один пароль скрізь                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Безпечне зберігання паролів

**НІКОЛИ** не зберігайте паролі у відкритому вигляді!

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ЕВОЛЮЦІЯ ЗБЕРІГАННЯ ПАРОЛІВ                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ❌ Відкритий текст:                                               │
│      password: "qwerty123"                                          │
│      → Витік БД = всі паролі скомпрометовані                        │
│                                                                     │
│   ❌ Простий хеш:                                                   │
│      hash: SHA256("qwerty123")                                      │
│      → Rainbow tables: попередньо обчислені хеші                    │
│                                                                     │
│   ⚠️ Хеш + сіль:                                                    │
│      salt: "a1b2c3d4"                                               │
│      hash: SHA256(salt + "qwerty123")                               │
│      → Швидкі хеші = brute force можливий                           │
│                                                                     │
│   ✅ Повільні хеш-функції:                                          │
│      bcrypt(password, cost=12)                                      │
│      Argon2id(password, memory=64MB, iterations=3)                  │
│      → Спеціально повільні, стійкі до GPU                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Реалізація безпечного зберігання

```cpp
// Для паролів застосовують повільні функції з керованою складністю.
// У C++ це libsodium (Argon2id) або OpenSSL (PBKDF2, scrypt).
#include <sodium.h>
#include <openssl/evp.h>
#include <string>
#include <vector>

// ===== Argon2id, рекомендований варіант =====
// Функція сама генерує сіль і зберігає параметри всередині рядка хешу
std::string hashPasswordArgon2(const std::string& password) {
    char hashed[crypto_pwhash_STRBYTES];

    if (crypto_pwhash_str(hashed,
                          password.c_str(), password.size(),
                          crypto_pwhash_OPSLIMIT_INTERACTIVE,   // ітерації
                          crypto_pwhash_MEMLIMIT_INTERACTIVE)   // пам'ять, ~64 МБ
        != 0) {
        return "";   // бракує пам'яті
    }
    return std::string(hashed);
}

bool verifyArgon2(const std::string& password, const std::string& stored) {
    return crypto_pwhash_str_verify(stored.c_str(), password.c_str(), password.size()) == 0;
}

// ===== PBKDF2 засобами OpenSSL, якщо libsodium недоступна =====
std::vector<unsigned char> hashPasswordPbkdf2(const std::string& password,
                                              const std::vector<unsigned char>& salt,
                                              int iterations = 600000) {
    std::vector<unsigned char> key(32);

    PKCS5_PBKDF2_HMAC(password.c_str(), static_cast<int>(password.size()),
                      salt.data(), static_cast<int>(salt.size()),
                      iterations, EVP_sha256(),
                      static_cast<int>(key.size()), key.data());
    return key;
}

// Кількість ітерацій підбирають так, щоб перевірка одного пароля
// тривала близько 100 мс — непомітно для користувача
// й украй дорого для перебору мільярдів варіантів
```

## TOTP (Time-based One-Time Password)

### Принцип роботи

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOTP (RFC 6238)                                  │
│                                                                     │
│   Секретний ключ K (спільний для сервера і клієнта)                 │
│                                                                     │
│   Поточний час T = floor(Unix_time / 30)  (30-секундні інтервали)   │
│                                                                     │
│   TOTP = HMAC-SHA1(K, T) → 6 цифр                                   │
│                                                                     │
│   ┌────────────────────────────────────────────┐                    │
│   │                                            │                    │
│   │   Сервер            Клієнт (Google Auth)   │                    │
│   │     │                     │                │                    │
│   │     │  Реєстрація         │                │                    │
│   │     │  ─────────────────► │ K (QR-код)     │                    │
│   │     │                     │                │                    │
│   │     │  Аутентифікація     │                │                    │
│   │     │ ◄───────────────────│ TOTP(K, T)     │                    │
│   │     │                     │                │                    │
│   │   TOTP(K, T) ==?          │                │                    │
│   │                           │                │                    │
│   └────────────────────────────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Реалізація TOTP

```cpp
#include <ctime>
#include <cstdint>
#include <string>
#include <vector>
#include <iomanip>
#include <sstream>

std::vector<unsigned char> hmacSha256(const std::vector<unsigned char>& key,
                                      const std::vector<unsigned char>& message);

// TOTP за RFC 6238: код залежить від номера 30-секундного інтервалу
std::string generateTotp(const std::vector<unsigned char>& secret, int interval = 30) {
    uint64_t counter = static_cast<uint64_t>(std::time(nullptr)) / interval;

    std::vector<unsigned char> message(8);
    for (int i = 7; i >= 0; --i) {                 // лічильник у big-endian
        message[i] = static_cast<unsigned char>(counter & 0xFF);
        counter >>= 8;
    }

    std::vector<unsigned char> mac = hmacSha256(secret, message);

    // Динамічне обрізання: зсув визначається останнім байтом MAC
    int offset = mac.back() & 0x0F;
    uint32_t code =
        (static_cast<uint32_t>(mac[offset]     & 0x7F) << 24) |
        (static_cast<uint32_t>(mac[offset + 1] & 0xFF) << 16) |
        (static_cast<uint32_t>(mac[offset + 2] & 0xFF) << 8)  |
        (static_cast<uint32_t>(mac[offset + 3] & 0xFF));

    std::ostringstream out;
    out << std::setw(6) << std::setfill('0') << (code % 1000000);
    return out.str();
}
```

## Протоколи аутентифікації

### Challenge-Response

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHALLENGE-RESPONSE                               │
│                                                                     │
│   Клієнт                                    Сервер                  │
│     │                                         │                     │
│     │  "Хочу увійти як Alice"                │                      │
│     │ ────────────────────────────────────────►                     │
│     │                                         │                     │
│     │  Challenge: R (випадкове число)         │                     │
│     │ ◄────────────────────────────────────────                     │
│     │                                         │                     │
│     │  Response: H(password || R)             │                     │
│     │ ────────────────────────────────────────►                     │
│     │                                         │                     │
│     │              Сервер перевіряє:          │                     │
│     │              H(stored_password || R)    │                     │
│     │              == отриманий Response?     │                     │
│     │                                         │                     │
│     │  OK / Помилка                           │                     │
│     │ ◄────────────────────────────────────────                     │
│                                                                     │
│   Переваги:                                                         │
│   • Пароль ніколи не передається                                    │
│   • Replay attack неможлива (R унікальне)                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### OAuth 2.0 та OpenID Connect

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OAUTH 2.0 / OIDC                                 │
│                                                                     │
│   Користувач   Застосунок    Провайдер (Google, GitHub...)          │
│       │            │              │                                 │
│       │  "Увійти"  │              │                                 │
│       │───────────►│              │                                 │
│       │            │              │                                 │
│       │  Редірект на провайдера   │                                 │
│       │◄───────────│              │                                 │
│       │                           │                                 │
│       │  Логін у провайдера       │                                 │
│       │──────────────────────────►│                                 │
│       │                           │                                 │
│       │  "Дозволити доступ?"      │                                 │
│       │◄──────────────────────────│                                 │
│       │                           │                                 │
│       │  Так!                     │                                 │
│       │──────────────────────────►│                                 │
│       │                           │                                 │
│       │  Редірект з кодом         │                                 │
│       │◄──────────────────────────│                                 │
│       │            │              │                                 │
│       │  Код       │              │                                 │
│       │───────────►│              │                                 │
│       │            │  Обмін коду  │                                 │
│       │            │  на токен    │                                 │
│       │            │─────────────►│                                 │
│       │            │              │                                 │
│       │            │  Access Token│                                 │
│       │            │◄─────────────│                                 │
│       │            │              │                                 │
│       │  Успішний  │              │                                 │
│       │  вхід!     │              │                                 │
│       │◄───────────│              │                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Найпоширеніші загрози безпеки

### OWASP Top 10 (2021)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OWASP TOP 10                                     │
├──────┬──────────────────────────────────────────────────────────────┤
│  1   │ Broken Access Control (порушення контролю доступу)           │
├──────┼──────────────────────────────────────────────────────────────┤
│  2   │ Cryptographic Failures (криптографічні помилки)              │
├──────┼──────────────────────────────────────────────────────────────┤
│  3   │ Injection (ін'єкції: SQL, XSS, Command)                      │
├──────┼──────────────────────────────────────────────────────────────┤
│  4   │ Insecure Design (небезпечний дизайн)                         │
├──────┼──────────────────────────────────────────────────────────────┤
│  5   │ Security Misconfiguration (неправильна конфігурація)         │
├──────┼──────────────────────────────────────────────────────────────┤
│  6   │ Vulnerable Components (вразливі компоненти)                  │
├──────┼──────────────────────────────────────────────────────────────┤
│  7   │ Identification and Authentication Failures                   │
├──────┼──────────────────────────────────────────────────────────────┤
│  8   │ Software and Data Integrity Failures                         │
├──────┼──────────────────────────────────────────────────────────────┤
│  9   │ Security Logging and Monitoring Failures                     │
├──────┼──────────────────────────────────────────────────────────────┤
│ 10   │ Server-Side Request Forgery (SSRF)                           │
└──────┴──────────────────────────────────────────────────────────────┘
```

### SQL-ін'єкція

```cpp
// ВРАЗЛИВИЙ КОД: дані користувача стають частиною тексту запиту
bool loginVulnerable(const std::string& username, const std::string& password) {
    std::string query = "SELECT * FROM users WHERE username='" + username +
                        "' AND password='" + password + "'";
    // Якщо username = "admin' --", запит перетворюється на
    // SELECT * FROM users WHERE username='admin' --' AND password='...'
    // Решта рядка стає коментарем, і пароль узагалі не перевіряється
    return execute(query);
}

// БЕЗПЕЧНИЙ КОД: структура запиту стала, дані передаються параметрами
bool loginSafe(sqlite3* db, const std::string& username, const std::string& password) {
    const char* query = "SELECT * FROM users WHERE username=? AND password_hash=?";

    sqlite3_stmt* stmt = nullptr;
    sqlite3_prepare_v2(db, query, -1, &stmt, nullptr);
    sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_TRANSIENT);
    sqlite3_bind_text(stmt, 2, password.c_str(), -1, SQLITE_TRANSIENT);

    bool found = (sqlite3_step(stmt) == SQLITE_ROW);
    sqlite3_finalize(stmt);
    return found;
}
```

### XSS (Cross-Site Scripting)

```html
<!-- ❌ ВРАЗЛИВИЙ КОД -->
<div>Привіт, <?php echo $_GET['name']; ?></div>
<!-- Якщо name = <script>alert('XSS')</script> — скрипт виконається! -->

<!-- ✅ БЕЗПЕЧНИЙ КОД -->
<div>Привіт, <?php echo htmlspecialchars($_GET['name'], ENT_QUOTES); ?></div>
```

### Man-in-the-Middle (MitM)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MAN-IN-THE-MIDDLE                                │
│                                                                     │
│   Аліса          Зловмисник (Мелорі)           Боб                  │
│     │                   │                       │                   │
│     │  "Привіт, Бобе"   │                       │                   │
│     │──────────────────►│                       │                   │
│     │                   │  "Привіт, Бобе"       │                   │
│     │                   │──────────────────────►│                   │
│     │                   │                       │                   │
│     │                   │  "Привіт, Алісо"      │                   │
│     │                   │◄──────────────────────│                   │
│     │  "Привіт, Алісо"  │                       │                   │
│     │◄──────────────────│                       │                   │
│     │                   │                       │                   │
│   Аліса та Боб не знають, що Мелорі читає всі повідомлення!         │
│                                                                     │
│   Захист: TLS/HTTPS, перевірка сертифікатів                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Фішинг

```
┌────────────────────────────────────────────────────────────────────┐
│                    ФІШИНГ                                          │
│                                                                    │
│   Від: security@paypa1.com  (l замість l? Це 1!)                   │
│   Тема: Ваш акаунт заблоковано!                                    │
│                                                                    │
│   Шановний клієнте,                                                │
│                                                                    │
│   Ми виявили підозрілу активність. Негайно підтвердіть             │
│   свої дані за посиланням:                                         │
│                                                                    │
│   [Підтвердити] ← насправді веде на paypa1-security.com            │
│                                                                    │
│   Ознаки фішингу:                                                  │
│   • Терміновість ("негайно", "заблоковано")                        │
│   • Помилки в домені                                               │
│   • Загальне звернення ("шановний клієнте")                        │
│   • Посилання не на офіційний сайт                                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Методи захисту

### Defense in Depth (глибинний захист)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ШАРИ ЗАХИСТУ                                     │
│                                                                     │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                    ПОЛІТИКИ                               │     │
│   │   ┌───────────────────────────────────────────────────┐   │     │
│   │   │              ПЕРИМЕТР (Firewall)                  │   │     │
│   │   │   ┌───────────────────────────────────────────┐   │   │     │
│   │   │   │           МЕРЕЖА (IDS/IPS)                │   │   │     │
│   │   │   │   ┌───────────────────────────────────┐   │   │   │     │
│   │   │   │   │        ХОСТ (антивірус)           │   │   │   │     │
│   │   │   │   │   ┌───────────────────────────┐   │   │   │   │     │
│   │   │   │   │   │    ЗАСТОСУНОК (WAF)       │   │   │   │   │     │
│   │   │   │   │   │   ┌───────────────────┐   │   │   │   │   │     │
│   │   │   │   │   │   │      ДАНІ         │   │   │   │   │   │     │
│   │   │   │   │   │   │   (шифрування)    │   │   │   │   │   │     │
│   │   │   │   │   │   └───────────────────┘   │   │   │   │   │     │
│   │   │   │   │   └───────────────────────────┘   │   │   │   │     │
│   │   │   │   └───────────────────────────────────┘   │   │   │     │
│   │   │   └───────────────────────────────────────────┘   │   │     │
│   │   └───────────────────────────────────────────────────┘   │     │
│   └───────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Принцип найменших привілеїв

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LEAST PRIVILEGE                                  │
│                                                                     │
│   ❌ Поганий підхід:                                                │
│      • Всі розробники мають root/admin доступ                       │
│      • Застосунок працює від root                                   │
│      • База даних з правами SELECT/INSERT/UPDATE/DELETE/DROP        │
│                                                                     │
│   ✅ Правильний підхід:                                             │
│      • Кожен має мінімум необхідних прав                            │
│      • Застосунок працює від обмеженого користувача                 │
│      • Окремі облікові записи для читання/запису                    │
│      • Тимчасові підвищені права (sudo, just-in-time)               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Практичні завдання

### Завдання 1

Поясніть різницю між ідентифікацією, аутентифікацією та авторизацією на прикладі входу в банківський застосунок.

### Завдання 2

Чому bcrypt/Argon2 кращі за SHA-256 для хешування паролів?

### Завдання 3

Як захиститися від SQL-ін'єкції? Наведіть приклад вразливого та безпечного коду.

## 💼 Real World: Authentication у компаніях

```
┌────────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION В ENTERPRISE                    │
│                                                                │
│   🔐 GOOGLE / MICROSOFT / META                                 │
│   • Passkeys (FIDO2/WebAuthn) — passwordless                   │
│   • Hardware security keys для співробітників                  │
│   • Risk-based authentication                                  │
│   • Zero Trust Architecture                                    │
│                                                                │
│   🏦 БАНКИ (ПриватБанк, Monobank)                              │
│   • MFA: пароль + SMS/Push                                     │
│   • Біометрія в мобільних застосунках                          │
│   • 3D Secure для онлайн-платежів                              │
│   • HSM для зберігання ключів                                  │
│                                                                │
│   ☁️ AWS / AZURE / GCP                                         │
│   • IAM (Identity and Access Management)                       │
│   • MFA для консолі та CLI                                     │
│   • Service accounts з обмеженими правами                      │
│   • SSO (Single Sign-On) через SAML/OIDC                       │
│                                                                │
│   🛡️ OWASP TOP 10 2021                                         │
│   • #7: Identification and Authentication Failures             │
│   • 81% breaches через слабкі/вкрадені credentials             │
│   • Credential stuffing атаки                                  │
└────────────────────────────────────────────────────────────────┘
```

### Реальні інциденти

| Рік | Компанія | Проблема | Наслідки |
|-----|----------|----------|----------|
| 2024 | **23andMe** | Credential stuffing | 6.9M користувачів |
| 2023 | **LastPass** | Weak master passwords | Витік vault |
| 2022 | **Uber** | MFA fatigue attack | Повний доступ |
| 2021 | **Colonial Pipeline** | Одна скомпрометована VPN | $4.4M ransom |

## 🎯 Career Spotlight

```
┌───────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                           │
│                                                               │
│   Identity & Access Management (IAM) Engineer                 │
│   ├── Зарплата: $100,000 - $160,000/рік                       │
│   ├── Навички: OAuth/OIDC, SAML, LDAP, Azure AD               │
│   └── Компанії: Okta, Auth0, Ping Identity, enterprise        │
│                                                               │
│   Application Security Engineer                               │
│   ├── Зарплата: $120,000 - $180,000/рік                       │
│   ├── Навички: OWASP, secure coding, threat modeling          │
│   └── Компанії: Google, Meta, Netflix, Coinbase               │
│                                                               │
│   Penetration Tester                                          │
│   ├── Зарплата: $100,000 - $170,000/рік                       │
│   ├── Навички: Web app testing, credential attacks            │
│   └── Компанії: NCC Group, Bishop Fox, Synack                 │
│                                                               │
│   Security Operations (SOC) Analyst                           │
│   ├── Зарплата: $70,000 - $120,000/рік                        │
│   ├── Навички: SIEM, threat detection, incident response      │
│   └── Компанії: CrowdStrike, Splunk, enterprise               │
│                                                               │
│   DevSecOps Engineer                                          │
│   ├── Зарплата: $130,000 - $190,000/рік                       │
│   ├── Навички: CI/CD security, secrets management             │
│   └── Компанії: HashiCorp, GitLab, major tech                 │
└───────────────────────────────────────────────────────────────┘
```

## 📚 Resources

### Онлайн практика
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/) — вразливий застосунок для навчання
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — безкоштовний курс
- [HackTheBox](https://hackthebox.com/) — практичні labs
- [TryHackMe](https://tryhackme.com/) — guided learning paths

### Tools
- **Burp Suite** — веб-тестування
- **Hydra** — password cracking (етичне тестування)
- **hashcat** — GPU-based password recovery
- **Have I Been Pwned** — перевірка витоків

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                 AUTH & SECURITY QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Фактори аутентифікації:                                       │
│   • Знання (Something you KNOW): пароль, PIN                    │
│   • Володіння (Something you HAVE): телефон, токен              │
│   • Властивість (Something you ARE): біометрія                  │
│                                                                 │
│   Хешування паролів (C++, libsodium):                           │
│   crypto_pwhash_str(hash, pass, len, OPSLIMIT, MEMLIMIT)        │
│   crypto_pwhash_str_verify(hash, pass, len)                     │
│   Алгоритм Argon2id — стандарт де-факто                         │
│                                                                 │
│   from argon2 import PasswordHasher                             │
│   ph = PasswordHasher()                                         │
│   hash = ph.hash(password)                                      │
│   ph.verify(hash, password)                                     │
│                                                                 │
│   TOTP (RFC 6238):                                              │
│   counter = floor(unix_time / 30)                               │
│   TOTP = HMAC-SHA1(secret, counter) → truncate → 6 digits       │
│                                                                 │
│   SQL Injection Prevention:                                     │
│   ❌ f"SELECT * FROM users WHERE id={user_input}"               │
│   ✅ cursor.execute("SELECT * FROM users WHERE id=?", (id,))    │
│                                                                 │
│   XSS Prevention:                                               │
│   ❌ <div>{user_input}</div>                                    │
│   ✅ <div>{escape(user_input)}</div>                            │
│   ✅ Content-Security-Policy header                             │
│                                                                 │
│   OWASP Top 10 (2021):                                          │
│   1. Broken Access Control                                      │
│   2. Cryptographic Failures                                     │
│   3. Injection                                                  │
│   7. Identification and Authentication Failures                 │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка різниця між ідентифікацією, аутентифікацією та авторизацією?**
   - Ідентифікація: "Я — Іван" (заява)
   - Аутентифікація: "Ось мій пароль" (доказ)
   - Авторизація: "Іван має доступ до /admin" (права)

2. **Чому bcrypt/Argon2 кращі за SHA-256 для паролів?**
   - Навмисно повільні (регульований cost factor)
   - Вбудована сіль
   - Стійкі до GPU/ASIC атак
   - SHA-256 надто швидкий → легкий brute force

3. **Що таке MFA fatigue attack?**
   - Атакуючий спамить push-нотифікаціями
   - Жертва випадково підтверджує, щоб зупинити спам
   - Захист: number matching, rate limiting

4. **Як захиститися від SQL injection?**
   - Параметризовані запити (prepared statements)
   - ORM з автоматичним escaping
   - Input validation (whitelist)
   - Principle of least privilege для DB user

5. **Що таке credential stuffing?**
   - Використання витоклих паролів з інших сайтів
   - Працює через повторне використання паролів
   - Захист: MFA, breach detection, rate limiting

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть власний TOTP автентифікатор

Реалізуйте той самий алгоритм, що використовує Google Authenticator — це реально просто!

**Кроки:**

1. Створіть TOTP генератор:
```bash
mkdir -p ~/totp-project && cd ~/totp-project
nano my_totp.py
```

```cpp
// Власний застосунок-автентифікатор, аналог Google Authenticator
#include <iostream>
#include <string>
#include <vector>
#include <thread>
#include <chrono>
#include <ctime>
#include <cctype>

std::string generateTotp(const std::vector<unsigned char>& secret, int interval = 30);

// Секрет сервіси показують у Base32 (RFC 4648): 32 символи алфавіту замість
// довільних байтів, щоб його можна було продиктувати або набрати вручну.
// Вісім символів кодують п'ять байтів, тому біти накопичуємо в буфері.
std::vector<unsigned char> base32Decode(const std::string& encoded) {
    const std::string ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    std::vector<unsigned char> result;
    unsigned int buffer = 0;
    int bits = 0;

    for (char c : encoded) {
        size_t value = ALPHABET.find(std::toupper(static_cast<unsigned char>(c)));
        if (value == std::string::npos) continue;   // '=' і пробіли пропускаємо

        buffer = (buffer << 5) | static_cast<unsigned int>(value);
        bits += 5;

        if (bits >= 8) {
            bits -= 8;
            result.push_back(static_cast<unsigned char>((buffer >> bits) & 0xFF));
        }
    }

    return result;
}

int main() {
    // Секрет у Base32 — саме його показує сервіс у вигляді QR-коду
    const std::string TEST_SECRET = "JBSWY3DPEHPK3PXP";
    const int INTERVALS = 3;              // скільки разів показати зміну коду
    std::vector<unsigned char> secret = base32Decode(TEST_SECRET);

    std::cout << "TOTP-автентифікатор\n";
    std::cout << "========================================\n";
    std::cout << "Секрет: " << TEST_SECRET << "\n\n";

    std::string previous;
    int shown = 0;                        // скільки різних кодів уже показано

    // Демонстрація охоплює три інтервали: цього досить, щоб двічі побачити
    // зміну коду. Справжній автентифікатор працює, доки його не закрили, —
    // для цього досить прибрати умову shown < INTERVALS
    while (shown < INTERVALS) {
        std::string code = generateTotp(secret);
        int remaining = 30 - static_cast<int>(std::time(nullptr) % 30);

        if (code != previous) {
            if (!previous.empty()) {
                std::cout << "\n";        // код змінився — залишаємо попередній у журналі
            }
            previous = code;
            ++shown;
        }

        std::cout << "\rКод: " << code << "  (дійсний ще " << remaining
                  << " с)   " << std::flush;
        std::this_thread::sleep_for(std::chrono::seconds(1));
    }

    std::cout << "\n\nКод змінився " << (INTERVALS - 1) << " рази — саме так "
                 "автентифікатор і працює.\n";
    return 0;
}
```

2. Зберіть і запустіть:
```bash
g++ -std=c++17 my_totp.cpp sha256.cpp -o my_totp
./my_totp
```

Програма працює близько хвилини й завершується сама. Рядок із кодом
оновлюється на місці, тому на екрані видно три рядки — по одному на кожен
інтервал (значення коду залежать від часу запуску, у вас будуть свої):

```
TOTP-автентифікатор
========================================
Секрет: JBSWY3DPEHPK3PXP

Код: 116079  (дійсний ще 1 с)
Код: 503497  (дійсний ще 1 с)
Код: 189678  (дійсний ще 30 с)

Код змінився 2 рази — саме так автентифікатор і працює.
```

3. Перевірте з реальним автентифікатором:
- Відкрийте Google Authenticator або Authy
- Додайте акаунт вручну з секретом `JBSWY3DPEHPK3PXP`
- Коди мають збігатися!

**Очікуваний результат:**
- Працюючий генератор TOTP мовою C++
- Розуміння алгоритму TOTP (HMAC + time + truncation)
- Коди збігаються з Google Authenticator

**Бонус (для допитливих):**
- Сформуйте рядок `otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP` і згенеруйте з нього QR-код будь-яким онлайн-сервісом
- Реалізуйте перевірку з допуском ±30 секунд
- Додайте аргументи командного рядка: `./my_totp --secret YOURSECRET`

---

## 🔧 Розширене практичне завдання (для лабораторної)

```cpp
// Практичне завдання: безпечна автентифікація
#include <iostream>
#include <string>
#include <vector>
#include <ctime>
#include <stdexcept>

std::string hashPasswordArgon2(const std::string& password);
bool verifyArgon2(const std::string& password, const std::string& stored);
std::string generateTotp(const std::vector<unsigned char>& secret, int interval = 30);
std::vector<unsigned char> randomBytes(size_t count);

struct User {
    std::string username;
    std::string passwordHash;              // у базі зберігається лише хеш
    std::vector<unsigned char> mfaSecret;  // секрет для другого фактора
    std::time_t createdAt = 0;
};

// Реєстрація: перевірка складності пароля та хешування Argon2id
User registerUser(const std::string& username, const std::string& password) {
    if (password.size() < 8) {
        throw std::runtime_error("Пароль має містити щонайменше 8 символів");
    }

    User user;
    user.username = username;
    user.passwordHash = hashPasswordArgon2(password);
    user.mfaSecret = randomBytes(20);
    user.createdAt = std::time(nullptr);
    return user;
}

// Перевірка пароля: порівняння виконується всередині verifyArgon2
// за сталий час, тому час відповіді не видає кількості збігів
bool checkPassword(const User& user, const std::string& password) {
    return verifyArgon2(password, user.passwordHash);
}

// Перевірка коду другого фактора з допуском на розбіжність годинників
bool checkTotp(const User& user, const std::string& code, int window = 1) {
    for (int shift = -window; shift <= window; ++shift) {
        if (generateTotp(user.mfaSecret) == code) return true;
    }
    return false;
}

int main() {
    std::cout << "=== Реєстрація користувача ===\n";
    User user = registerUser("john_doe", "SecureP@ss123!");
    std::cout << "Користувач: " << user.username << "\n";
    std::cout << "Хеш:        " << user.passwordHash.substr(0, 40) << "...\n\n";

    std::cout << "=== Перевірка пароля ===\n";
    std::cout << "Правильний: " << (checkPassword(user, "SecureP@ss123!") ? "доступ" : "відмова") << "\n";
    std::cout << "Хибний:     " << (checkPassword(user, "wrong") ? "доступ" : "відмова") << "\n\n";

    std::cout << "=== Другий фактор ===\n";
    std::string code = generateTotp(user.mfaSecret);
    std::cout << "Поточний код: " << code << "\n";
    std::cout << "Перевірка:    " << (checkTotp(user, code) ? "прийнято" : "відхилено") << "\n";

    return 0;
}
```

**Завдання:**
1. Запустіть код та проаналізуйте вивід
2. Спробуйте зламати вразливий login через SQL injection
3. Реалізуйте rate limiting для захисту від brute force
4. Додайте перевірку складності пароля (великі/малі літери, цифри, спецсимволи)

## Підсумок

| Термін | Визначення |
|--------|------------|
| **Ідентифікація** | Заява про особу (хто ви) |
| **Аутентифікація** | Доведення особи |
| **Авторизація** | Перевірка прав доступу |
| **MFA** | Багатофакторна аутентифікація |
| **TOTP** | Одноразовий пароль на основі часу |
| **bcrypt/Argon2** | Повільні хеш-функції для паролів |

**Безпека — це процес, а не продукт. Використовуйте MFA, оновлюйте ПЗ, не довіряйте вхідним даним.**

Це завершує курс "Програмні методи захисту інформації". Успіхів на заліку!
