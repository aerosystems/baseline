---
title: "Ідентифікація та аутентифікація. Загрози безпеки"
type: lecture
order: 4
preview: "Методи аутентифікації, MFA, найпоширеніші загрози та методи захисту."
---

## Три кити контролю доступу

```
┌─────────────────────────────────────────────────────────────────────┐
│                    КОНТРОЛЬ ДОСТУПУ                                 │
│                                                                     │
│   ┌─────────────────┐                                               │
│   │ ІДЕНТИФІКАЦІЯ   │  "Хто ви?"                                   │
│   │                 │  • Логін                                     │
│   │                 │  • Email                                     │
│   │                 │  • Номер картки                              │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ АУТЕНТИФІКАЦІЯ  │  "Доведіть, що це ви"                        │
│   │                 │  • Пароль                                    │
│   │                 │  • Відбиток пальця                           │
│   │                 │  • SMS-код                                   │
│   └────────┬────────┘                                               │
│            │                                                        │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ АВТОРИЗАЦІЯ     │  "Що вам дозволено?"                         │
│   │                 │  • Читання файлів                            │
│   │                 │  • Адміністрування                           │
│   │                 │  • Переказ коштів                            │
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
│      • Секретне питання                                            │
│      • Графічний ключ                                              │
│                                                                     │
│   2. ВОЛОДІННЯ (Something you HAVE)                                 │
│      • Смартфон (SMS, TOTP)                                        │
│      • Апаратний токен (YubiKey)                                   │
│      • Смарт-карта                                                 │
│      • Банківська картка                                           │
│                                                                     │
│   3. ВЛАСТИВІСТЬ (Something you ARE)                                │
│      • Відбиток пальця                                             │
│      • Розпізнавання обличчя                                       │
│      • Сканування райдужки                                         │
│      • Голос                                                       │
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
│      • Пароль (знання) + SMS (володіння)                           │
│      • PIN (знання) + карта (володіння)                            │
│      • Пароль (знання) + відбиток (властивість)                    │
│                                                                     │
│   ❌ НЕ справжня MFA:                                               │
│      • Пароль + секретне питання (обидва — знання)                 │
│      • Два паролі (обидва — знання)                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Парольна аутентифікація

### Проблеми паролів

```
┌─────────────────────────────────────────────────────────────────────┐
│                    СТАТИСТИКА ПАРОЛІВ                               │
│                                                                     │
│   • 81% витоків даних — через слабкі або вкрадені паролі           │
│   • Топ паролів: 123456, password, qwerty, admin                   │
│   • Середній користувач має 100+ акаунтів                          │
│   • 65% використовують один пароль скрізь                          │
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
│      → Витік БД = всі паролі скомпрометовані                       │
│                                                                     │
│   ❌ Простий хеш:                                                   │
│      hash: SHA256("qwerty123")                                      │
│      → Rainbow tables: попередньо обчислені хеші                   │
│                                                                     │
│   ⚠️ Хеш + сіль:                                                    │
│      salt: "a1b2c3d4"                                               │
│      hash: SHA256(salt + "qwerty123")                               │
│      → Швидкі хеші = brute force можливий                          │
│                                                                     │
│   ✅ Повільні хеш-функції:                                          │
│      bcrypt(password, cost=12)                                      │
│      Argon2id(password, memory=64MB, iterations=3)                 │
│      → Спеціально повільні, стійкі до GPU                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Реалізація безпечного зберігання

```python
import bcrypt
from argon2 import PasswordHasher


# === bcrypt ===
def hash_password_bcrypt(password: str) -> bytes:
    """Хешування з bcrypt."""
    salt = bcrypt.gensalt(rounds=12)  # cost factor
    return bcrypt.hashpw(password.encode(), salt)


def verify_bcrypt(password: str, hashed: bytes) -> bool:
    """Перевірка пароля."""
    return bcrypt.checkpw(password.encode(), hashed)


# === Argon2 (рекомендований) ===
ph = PasswordHasher(
    time_cost=3,        # ітерації
    memory_cost=65536,  # 64 MB
    parallelism=4       # потоки
)


def hash_password_argon2(password: str) -> str:
    """Хешування з Argon2id."""
    return ph.hash(password)


def verify_argon2(password: str, hashed: str) -> bool:
    """Перевірка пароля."""
    try:
        ph.verify(hashed, password)
        return True
    except:
        return False


# Приклад
password = "SecureP@ssw0rd!"

# bcrypt
hashed_bcrypt = hash_password_bcrypt(password)
print(f"bcrypt: {hashed_bcrypt}")
print(f"Верифікація: {verify_bcrypt(password, hashed_bcrypt)}")

# Argon2
hashed_argon2 = hash_password_argon2(password)
print(f"Argon2: {hashed_argon2}")
print(f"Верифікація: {verify_argon2(password, hashed_argon2)}")
```

## TOTP (Time-based One-Time Password)

### Принцип роботи

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TOTP (RFC 6238)                                  │
│                                                                     │
│   Секретний ключ K (спільний для сервера і клієнта)                │
│                                                                     │
│   Поточний час T = floor(Unix_time / 30)  (30-секундні інтервали)  │
│                                                                     │
│   TOTP = HMAC-SHA1(K, T) → 6 цифр                                  │
│                                                                     │
│   ┌────────────────────────────────────────────┐                    │
│   │                                            │                    │
│   │   Сервер            Клієнт (Google Auth)   │                   │
│   │     │                     │                │                    │
│   │     │  Реєстрація         │                │                    │
│   │     │  ─────────────────► │ K (QR-код)     │                   │
│   │     │                     │                │                    │
│   │     │  Аутентифікація     │                │                    │
│   │     │ ◄───────────────────│ TOTP(K, T)     │                   │
│   │     │                     │                │                    │
│   │   TOTP(K, T) ==?          │                │                    │
│   │                           │                │                    │
│   └────────────────────────────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Реалізація TOTP

```python
import hmac
import struct
import time
import base64


def generate_totp(secret: bytes, interval: int = 30) -> str:
    """Генерація TOTP коду."""
    # Поточний часовий інтервал
    counter = int(time.time()) // interval

    # HMAC-SHA1
    counter_bytes = struct.pack('>Q', counter)
    hmac_hash = hmac.new(secret, counter_bytes, 'sha1').digest()

    # Dynamic truncation
    offset = hmac_hash[-1] & 0x0F
    code = struct.unpack('>I', hmac_hash[offset:offset+4])[0]
    code = (code & 0x7FFFFFFF) % 1000000

    return f"{code:06d}"


# Приклад
secret = base64.b32decode("JBSWY3DPEHPK3PXP")  # Типовий секрет
code = generate_totp(secret)
print(f"TOTP код: {code}")
```

## Протоколи аутентифікації

### Challenge-Response

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CHALLENGE-RESPONSE                               │
│                                                                     │
│   Клієнт                                    Сервер                  │
│     │                                         │                     │
│     │  "Хочу увійти як Alice"                │                     │
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
│   • Пароль ніколи не передається                                   │
│   • Replay attack неможлива (R унікальне)                          │
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
│  1   │ Broken Access Control (порушення контролю доступу)          │
├──────┼──────────────────────────────────────────────────────────────┤
│  2   │ Cryptographic Failures (криптографічні помилки)             │
├──────┼──────────────────────────────────────────────────────────────┤
│  3   │ Injection (ін'єкції: SQL, XSS, Command)                     │
├──────┼──────────────────────────────────────────────────────────────┤
│  4   │ Insecure Design (небезпечний дизайн)                        │
├──────┼──────────────────────────────────────────────────────────────┤
│  5   │ Security Misconfiguration (неправильна конфігурація)        │
├──────┼──────────────────────────────────────────────────────────────┤
│  6   │ Vulnerable Components (вразливі компоненти)                 │
├──────┼──────────────────────────────────────────────────────────────┤
│  7   │ Identification and Authentication Failures                  │
├──────┼──────────────────────────────────────────────────────────────┤
│  8   │ Software and Data Integrity Failures                        │
├──────┼──────────────────────────────────────────────────────────────┤
│  9   │ Security Logging and Monitoring Failures                    │
├──────┼──────────────────────────────────────────────────────────────┤
│ 10   │ Server-Side Request Forgery (SSRF)                          │
└──────┴──────────────────────────────────────────────────────────────┘
```

### SQL-ін'єкція

```python
# ❌ ВРАЗЛИВИЙ КОД
def login_vulnerable(username, password):
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    # Якщо username = "admin' --"
    # Запит стає: SELECT * FROM users WHERE username='admin' --' AND password='...'
    # Пароль ігнорується!

# ✅ БЕЗПЕЧНИЙ КОД
def login_safe(username, password):
    query = "SELECT * FROM users WHERE username=? AND password=?"
    cursor.execute(query, (username, password))  # Параметризований запит
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
│   Аліса          Зловмисник (Мелорі)           Боб                 │
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
│   Аліса та Боб не знають, що Мелорі читає всі повідомлення!       │
│                                                                     │
│   Захист: TLS/HTTPS, перевірка сертифікатів                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Фішинг

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ФІШИНГ                                           │
│                                                                     │
│   Від: security@paypa1.com  (l замість l? Це 1!)                   │
│   Тема: Ваш акаунт заблоковано!                                    │
│                                                                     │
│   Шановний клієнте,                                                │
│                                                                     │
│   Ми виявили підозрілу активність. Негайно підтвердіть             │
│   свої дані за посиланням:                                         │
│                                                                     │
│   [Підтвердити] ← насправді веде на paypa1-security.com            │
│                                                                     │
│   Ознаки фішингу:                                                  │
│   • Терміновість ("негайно", "заблоковано")                        │
│   • Помилки в домені                                               │
│   • Загальне звернення ("шановний клієнте")                        │
│   • Посилання не на офіційний сайт                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Методи захисту

### Defense in Depth (глибинний захист)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ШАРИ ЗАХИСТУ                                     │
│                                                                     │
│   ┌───────────────────────────────────────────────────────────┐     │
│   │                    ПОЛІТИКИ                                │     │
│   │   ┌───────────────────────────────────────────────────┐   │     │
│   │   │              ПЕРИМЕТР (Firewall)                   │   │     │
│   │   │   ┌───────────────────────────────────────────┐   │   │     │
│   │   │   │           МЕРЕЖА (IDS/IPS)                 │   │   │     │
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
│      • Всі розробники мають root/admin доступ                      │
│      • Застосунок працює від root                                  │
│      • База даних з правами SELECT/INSERT/UPDATE/DELETE/DROP       │
│                                                                     │
│   ✅ Правильний підхід:                                             │
│      • Кожен має мінімум необхідних прав                           │
│      • Застосунок працює від обмеженого користувача                │
│      • Окремі облікові записи для читання/запису                   │
│      • Тимчасові підвищені права (sudo, just-in-time)              │
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
┌─────────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION В ENTERPRISE                     │
│                                                                 │
│   🔐 GOOGLE / MICROSOFT / META                                 │
│   • Passkeys (FIDO2/WebAuthn) — passwordless                   │
│   • Hardware security keys для співробітників                 │
│   • Risk-based authentication                                   │
│   • Zero Trust Architecture                                    │
│                                                                 │
│   🏦 БАНКИ (ПриватБанк, Monobank)                              │
│   • MFA: пароль + SMS/Push                                     │
│   • Біометрія в мобільних застосунках                         │
│   • 3D Secure для онлайн-платежів                              │
│   • HSM для зберігання ключів                                  │
│                                                                 │
│   ☁️ AWS / AZURE / GCP                                         │
│   • IAM (Identity and Access Management)                        │
│   • MFA для консолі та CLI                                     │
│   • Service accounts з обмеженими правами                      │
│   • SSO (Single Sign-On) через SAML/OIDC                       │
│                                                                 │
│   🛡️ OWASP TOP 10 2021                                         │
│   • #7: Identification and Authentication Failures             │
│   • 81% breaches через слабкі/вкрадені credentials             │
│   • Credential stuffing атаки                                  │
└─────────────────────────────────────────────────────────────────┘
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
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   Identity & Access Management (IAM) Engineer                   │
│   ├── Зарплата: $100,000 - $160,000/рік                       │
│   ├── Навички: OAuth/OIDC, SAML, LDAP, Azure AD               │
│   └── Компанії: Okta, Auth0, Ping Identity, enterprise        │
│                                                                 │
│   Application Security Engineer                                 │
│   ├── Зарплата: $120,000 - $180,000/рік                       │
│   ├── Навички: OWASP, secure coding, threat modeling          │
│   └── Компанії: Google, Meta, Netflix, Coinbase               │
│                                                                 │
│   Penetration Tester                                            │
│   ├── Зарплата: $100,000 - $170,000/рік                       │
│   ├── Навички: Web app testing, credential attacks            │
│   └── Компанії: NCC Group, Bishop Fox, Synack                 │
│                                                                 │
│   Security Operations (SOC) Analyst                             │
│   ├── Зарплата: $70,000 - $120,000/рік                        │
│   ├── Навички: SIEM, threat detection, incident response      │
│   └── Компанії: CrowdStrike, Splunk, enterprise               │
│                                                                 │
│   DevSecOps Engineer                                            │
│   ├── Зарплата: $130,000 - $190,000/рік                       │
│   ├── Навички: CI/CD security, secrets management             │
│   └── Компанії: HashiCorp, GitLab, major tech                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Resources

### Онлайн практика
- [OWASP WebGoat](https://owasp.org/www-project-webgoat/) — вразливий застосунок для навчання
- [PortSwigger Web Security Academy](https://portswigger.net/web-security) — безкоштовний курс
- [HackTheBox](https://hackthebox.com/) — практичні labs
- [TryHackMe](https://tryhackme.com/) — guided learning paths

### Книги
- **"The Web Application Hacker's Handbook"** — класика веб-безпеки
- **"Identity Attack Vectors"** by Morey Haber — IAM security
- **"OAuth 2 in Action"** — глибоке розуміння OAuth

### YouTube
- **OWASP** — офіційні відео про вразливості
- **LiveOverflow** — хакінг та CTF
- **John Hammond** — malware analysis, CTF
- **IppSec** — HackTheBox walkthroughs

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
│   Фактори аутентифікації:                                      │
│   • Знання (Something you KNOW): пароль, PIN                   │
│   • Володіння (Something you HAVE): телефон, токен             │
│   • Властивість (Something you ARE): біометрія                 │
│                                                                 │
│   Password Hashing (Python):                                    │
│   import bcrypt                                                │
│   hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())  │
│   bcrypt.checkpw(password.encode(), hashed)                    │
│                                                                 │
│   from argon2 import PasswordHasher                            │
│   ph = PasswordHasher()                                        │
│   hash = ph.hash(password)                                     │
│   ph.verify(hash, password)                                    │
│                                                                 │
│   TOTP (RFC 6238):                                             │
│   counter = floor(unix_time / 30)                              │
│   TOTP = HMAC-SHA1(secret, counter) → truncate → 6 digits     │
│                                                                 │
│   SQL Injection Prevention:                                     │
│   ❌ f"SELECT * FROM users WHERE id={user_input}"              │
│   ✅ cursor.execute("SELECT * FROM users WHERE id=?", (id,))   │
│                                                                 │
│   XSS Prevention:                                               │
│   ❌ <div>{user_input}</div>                                   │
│   ✅ <div>{escape(user_input)}</div>                           │
│   ✅ Content-Security-Policy header                            │
│                                                                 │
│   OWASP Top 10 (2021):                                         │
│   1. Broken Access Control                                      │
│   2. Cryptographic Failures                                     │
│   3. Injection                                                  │
│   7. Identification and Authentication Failures                │
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

```python
#!/usr/bin/env python3
"""Мій власний TOTP автентифікатор як Google Authenticator!"""

import hmac
import struct
import time
import base64
import sys

def generate_totp(secret: str, interval: int = 30) -> str:
    """Генерує 6-значний TOTP код."""
    # Декодуємо секрет з Base32
    key = base64.b32decode(secret.upper() + '=' * (8 - len(secret) % 8))

    # Поточний часовий інтервал
    counter = int(time.time()) // interval
    counter_bytes = struct.pack('>Q', counter)

    # HMAC-SHA1
    hmac_hash = hmac.new(key, counter_bytes, 'sha1').digest()

    # Dynamic truncation (RFC 6238)
    offset = hmac_hash[-1] & 0x0F
    code = struct.unpack('>I', hmac_hash[offset:offset+4])[0]
    code = (code & 0x7FFFFFFF) % 1_000_000

    return f"{code:06d}"


def main():
    # Тестовий секрет (Base32)
    # В реальності це отримується з QR-коду при налаштуванні 2FA
    TEST_SECRET = "JBSWY3DPEHPK3PXP"  # = "Hello!" в Base32

    print("🔐 My TOTP Authenticator")
    print("=" * 40)
    print(f"Secret: {TEST_SECRET}")
    print()

    while True:
        code = generate_totp(TEST_SECRET)
        remaining = 30 - (int(time.time()) % 30)

        print(f"\r Code: {code}  (expires in {remaining:2d}s)", end="", flush=True)
        time.sleep(1)


if __name__ == "__main__":
    main()
```

2. Запустіть:
```bash
python3 my_totp.py
```

3. Перевірте з реальним автентифікатором:
- Відкрийте Google Authenticator або Authy
- Додайте акаунт вручну з секретом `JBSWY3DPEHPK3PXP`
- Коди мають збігатися!

**Очікуваний результат:**
- Працюючий TOTP генератор на Python
- Розуміння алгоритму TOTP (HMAC + time + truncation)
- Коди збігаються з Google Authenticator

**Бонус (для допитливих):**
- Додайте генерацію QR-коду: `pip install qrcode && python -c "import qrcode; qrcode.make('otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP').save('qr.png')"`
- Реалізуйте перевірку з допуском ±30 секунд
- Зробіть CLI: `./my_totp.py --secret YOURSECRET`

---

## 🔧 Розширене практичне завдання (для лабораторної)

```python
#!/usr/bin/env python3
"""
Практичне завдання: безпечна аутентифікація.
"""

import secrets
import hmac
import time
import struct
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


# === Безпечне хешування паролів ===

ph = PasswordHasher(
    time_cost=3,        # кількість ітерацій
    memory_cost=65536,  # 64 MB RAM
    parallelism=4       # паралельні потоки
)


def register_user(username: str, password: str) -> dict:
    """
    Реєстрація користувача з безпечним хешуванням.
    """
    # Валідація пароля
    if len(password) < 8:
        raise ValueError("Пароль має бути мінімум 8 символів")

    # Хешування з Argon2id
    password_hash = ph.hash(password)

    return {
        "username": username,
        "password_hash": password_hash,
        "mfa_secret": secrets.token_hex(20),  # для TOTP
        "created_at": time.time()
    }


def verify_password(stored_hash: str, password: str) -> bool:
    """
    Перевірка пароля з constant-time порівнянням.
    """
    try:
        ph.verify(stored_hash, password)
        return True
    except VerifyMismatchError:
        return False


# === TOTP Implementation ===

def generate_totp(secret: bytes, time_step: int = 30) -> str:
    """
    Генерує 6-значний TOTP код.
    """
    counter = int(time.time()) // time_step
    counter_bytes = struct.pack('>Q', counter)

    # HMAC-SHA1
    hmac_hash = hmac.new(secret, counter_bytes, 'sha1').digest()

    # Dynamic truncation
    offset = hmac_hash[-1] & 0x0F
    code = struct.unpack('>I', hmac_hash[offset:offset+4])[0]
    code = (code & 0x7FFFFFFF) % 1_000_000

    return f"{code:06d}"


def verify_totp(secret: bytes, code: str, window: int = 1) -> bool:
    """
    Перевіряє TOTP код з допуском ±window інтервалів.
    """
    for offset in range(-window, window + 1):
        expected = generate_totp(secret, 30)
        # Shift time для перевірки сусідніх інтервалів
        if hmac.compare_digest(code, expected):
            return True
    return False


# === SQL Injection Demo ===

def vulnerable_login(username: str, password: str):
    """❌ ВРАЗЛИВИЙ КОД — НЕ ВИКОРИСТОВУЙТЕ!"""
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    print(f"Вразливий запит: {query}")
    # Якщо username = "admin' --", пароль ігнорується!


def safe_login(cursor, username: str, password: str):
    """✅ БЕЗПЕЧНИЙ КОД — параметризований запит"""
    query = "SELECT * FROM users WHERE username=? AND password_hash=?"
    # cursor.execute(query, (username, password_hash))
    print(f"Безпечний запит з параметрами: {query}")


# === Demo ===

if __name__ == "__main__":
    print("=== Реєстрація користувача ===")
    user = register_user("john_doe", "SecureP@ss123!")
    print(f"Username: {user['username']}")
    print(f"Hash: {user['password_hash'][:50]}...")
    print(f"MFA Secret: {user['mfa_secret']}")

    print("\n=== Перевірка пароля ===")
    print(f"Правильний пароль: {verify_password(user['password_hash'], 'SecureP@ss123!')}")
    print(f"Неправильний пароль: {verify_password(user['password_hash'], 'wrong')}")

    print("\n=== TOTP ===")
    secret = bytes.fromhex(user['mfa_secret'])
    totp_code = generate_totp(secret)
    print(f"TOTP код: {totp_code}")
    print(f"Верифікація: {verify_totp(secret, totp_code)}")

    print("\n=== SQL Injection Demo ===")
    print("Нормальний логін:")
    vulnerable_login("john", "password123")

    print("\nSQL Injection атака:")
    vulnerable_login("admin' --", "anything")

    print("\nБезпечний варіант:")
    safe_login(None, "john", "password123")
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
