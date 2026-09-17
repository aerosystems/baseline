---
title: "Ідентифікація та аутентифікація користувачів"
type: lab
order: 9
labNumber: 10
subject: pmzi
duration: "4 академічні години"
equipment:
  - "ПК з встановленим Python 3.8+ або C++ компілятором"
  - "Середовище розробки (VS Code, PyCharm, Visual Studio)"
  - "Доступ до Інтернету для перевірки TOTP"
preview: "Реалізація системи ідентифікації та аутентифікації."
---

**Мета:** вивчити принципи ідентифікації та аутентифікації користувачів. Реалізувати безпечну систему аутентифікації з хешуванням паролів, challenge-response протоколом та двофакторною аутентифікацією.

**Обладнання:** ПК з встановленим Python 3.8+ або C++ компілятором; Середовище розробки (VS Code, PyCharm, Visual Studio); Доступ до Інтернету для перевірки TOTP.

**Тривалість:** 4 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 7: Ідентифікація та аутентифікація. Загрози безпеці |
| **Навички** | Хеш-функції, робота з файлами |
| **Середовище** | ПК з встановленим Python 3.8+ або C++ компілятором |

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

### Завдання 1: Реєстрація користувача (Python)

```python
import hashlib
import secrets
import hmac
from typing import Tuple, Optional

class PasswordManager:
    """Безпечне управління паролями з хешуванням і сіллю."""

    SALT_LENGTH = 16  # 128 біт
    ITERATIONS = 100000  # Для PBKDF2

    @staticmethod
    def generate_salt() -> bytes:
        """Генерує криптографічно безпечну сіль."""
        return secrets.token_bytes(PasswordManager.SALT_LENGTH)

    @staticmethod
    def hash_password(password: str, salt: bytes) -> bytes:
        """
        Хешує пароль з сіллю використовуючи PBKDF2.
        PBKDF2 краще за простий SHA256 через ітерації.
        """
        return hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            PasswordManager.ITERATIONS
        )

    @staticmethod
    def simple_hash(password: str, salt: bytes) -> bytes:
        """
        Простий хеш для демонстрації (salt + password).
        У продакшені використовуйте PBKDF2, bcrypt або Argon2.
        """
        return hashlib.sha256(salt + password.encode('utf-8')).digest()

    def register_user(self, password: str) -> Tuple[bytes, bytes]:
        """
        Реєструє користувача: генерує сіль і хеш.

        Returns:
            (salt, hash) для збереження в БД
        """
        salt = self.generate_salt()
        password_hash = self.hash_password(password, salt)
        return (salt, password_hash)

    def verify_password(self, password: str, salt: bytes, stored_hash: bytes) -> bool:
        """
        Перевіряє пароль.
        Використовує constant-time порівняння для захисту від timing attacks.
        """
        computed_hash = self.hash_password(password, salt)
        # hmac.compare_digest — безпечне порівняння (constant time)
        return hmac.compare_digest(computed_hash, stored_hash)

def demo_registration():
    print("=" * 60)
    print("ДЕМОНСТРАЦІЯ РЕЄСТРАЦІЇ ТА ПЕРЕВІРКИ ПАРОЛЯ")
    print("=" * 60)

    pm = PasswordManager()

    # Реєстрація користувача
    password = "MySecurePassword123!"
    salt, password_hash = pm.register_user(password)

    print(f"\nПароль: {password}")
    print(f"Сіль (hex): {salt.hex()}")
    print(f"Хеш (hex): {password_hash.hex()}")

    # Перевірка правильного пароля
    print(f"\n--- Перевірка правильного пароля ---")
    is_valid = pm.verify_password(password, salt, password_hash)
    print(f"Результат: {'✓ Пароль правильний' if is_valid else '✗ Пароль неправильний'}")

    # Перевірка неправильного пароля
    print(f"\n--- Перевірка неправильного пароля ---")
    wrong_password = "WrongPassword"
    is_valid = pm.verify_password(wrong_password, salt, password_hash)
    print(f"Результат: {'✓ Пароль правильний' if is_valid else '✗ Пароль неправильний'}")

    # Демонстрація унікальності хешів (різна сіль)
    print(f"\n--- Демонстрація солі ---")
    salt1, hash1 = pm.register_user("password")
    salt2, hash2 = pm.register_user("password")
    print(f"Пароль 'password' з сіллю 1: {hash1.hex()[:32]}...")
    print(f"Пароль 'password' з сіллю 2: {hash2.hex()[:32]}...")
    print(f"Хеші {'однакові' if hash1 == hash2 else 'різні'} (завдяки різній солі)")

if __name__ == "__main__":
    demo_registration()
```
### Завдання 2: Захист від timing attacks

```python
import time

def unsafe_compare(a: bytes, b: bytes) -> bool:
    """
    НЕБЕЗПЕЧНЕ порівняння — вразливе до timing attacks.
    Час виконання залежить від кількості однакових байт на початку.
    """
    if len(a) != len(b):
        return False
    for x, y in zip(a, b):
        if x != y:
            return False  # Вихід при першій різниці
    return True

def safe_compare(a: bytes, b: bytes) -> bool:
    """
    БЕЗПЕЧНЕ порівняння — constant time.
    Завжди перевіряє всі байти.
    """
    return hmac.compare_digest(a, b)

def demo_timing_attack():
    print("\n" + "=" * 60)
    print("ДЕМОНСТРАЦІЯ TIMING ATTACK")
    print("=" * 60)

    correct_hash = b"correcthashvalue1234567890123456"

    # Тестові значення з різною кількістю правильних байт
    test_values = [
        b"wrongggghashvalue1234567890123456",  # 0 правильних
        b"correctghashvalue1234567890123456",  # 7 правильних
        b"correcthashvalue12345678901234XX",   # 30 правильних
    ]

    print("\nНебезпечне порівняння (час залежить від співпадінь):")
    for test in test_values:
        start = time.perf_counter_ns()
        for _ in range(10000):
            unsafe_compare(correct_hash, test)
        elapsed = time.perf_counter_ns() - start
        matching = sum(a == b for a, b in zip(correct_hash, test))
        print(f"  {matching} співпадінь → {elapsed / 1000:.2f} µs")

    print("\nБезпечне порівняння (constant time):")
    for test in test_values:
        start = time.perf_counter_ns()
        for _ in range(10000):
            safe_compare(correct_hash, test)
        elapsed = time.perf_counter_ns() - start
        matching = sum(a == b for a, b in zip(correct_hash, test))
        print(f"  {matching} співпадінь → {elapsed / 1000:.2f} µs")

    print("\n→ Безпечне порівняння має приблизно однаковий час")
```
### Завдання 3: Challenge-Response протокол

```python
import secrets
import hmac
import hashlib
from typing import Dict, Optional

class ChallengeResponseAuth:
    """Реалізація challenge-response аутентифікації."""

    def __init__(self):
        # Імітація бази даних користувачів
        self.users: Dict[str, bytes] = {}
        # Активні виклики (challenge)
        self.challenges: Dict[str, bytes] = {}

    def register(self, username: str, password: str):
        """Реєстрація користувача (зберігаємо хеш пароля)."""
        # У реальній системі — сіль + PBKDF2
        password_hash = hashlib.sha256(password.encode()).digest()
        self.users[username] = password_hash
        print(f"[SERVER] Користувач '{username}' зареєстрований")

    def request_login(self, username: str) -> Optional[bytes]:
        """
        Крок 1: Клієнт запитує вхід.
        Сервер повертає challenge (випадкове число).
        """
        if username not in self.users:
            print(f"[SERVER] Користувач '{username}' не знайдений")
            return None

        # Генеруємо випадковий challenge (nonce)
        challenge = secrets.token_bytes(32)
        self.challenges[username] = challenge

        print(f"[SERVER] Challenge для '{username}': {challenge.hex()[:16]}...")
        return challenge

    def verify_response(self, username: str, response: bytes) -> bool:
        """
        Крок 2: Сервер перевіряє response від клієнта.
        """
        if username not in self.challenges:
            print(f"[SERVER] Немає активного challenge для '{username}'")
            return False

        challenge = self.challenges.pop(username)  # Одноразовий challenge
        password_hash = self.users[username]

        # Обчислюємо очікувану відповідь
        expected_response = hmac.new(
            password_hash,
            challenge,
            hashlib.sha256
        ).digest()

        # Безпечне порівняння
        is_valid = hmac.compare_digest(response, expected_response)

        if is_valid:
            print(f"[SERVER] Аутентифікація '{username}' успішна")
        else:
            print(f"[SERVER] Аутентифікація '{username}' невдала")

        return is_valid

    @staticmethod
    def compute_response(password: str, challenge: bytes) -> bytes:
        """
        Клієнтська сторона: обчислення response.
        """
        password_hash = hashlib.sha256(password.encode()).digest()
        response = hmac.new(
            password_hash,
            challenge,
            hashlib.sha256
        ).digest()
        return response

def demo_challenge_response():
    print("\n" + "=" * 60)
    print("ДЕМОНСТРАЦІЯ CHALLENGE-RESPONSE")
    print("=" * 60)

    auth = ChallengeResponseAuth()

    # Реєстрація
    auth.register("alice", "secret123")

    # Успішна аутентифікація
    print("\n--- Успішна аутентифікація ---")
    print("[CLIENT] Запит на вхід як 'alice'")
    challenge = auth.request_login("alice")

    if challenge:
        print(f"[CLIENT] Отримано challenge, обчислюю response...")
        response = ChallengeResponseAuth.compute_response("secret123", challenge)
        print(f"[CLIENT] Response: {response.hex()[:16]}...")

        auth.verify_response("alice", response)

    # Невдала аутентифікація (неправильний пароль)
    print("\n--- Невдала аутентифікація (неправильний пароль) ---")
    print("[CLIENT] Запит на вхід як 'alice'")
    challenge = auth.request_login("alice")

    if challenge:
        print(f"[CLIENT] Обчислюю response з НЕПРАВИЛЬНИМ паролем...")
        response = ChallengeResponseAuth.compute_response("wrongpassword", challenge)
        auth.verify_response("alice", response)

    # Replay attack (використання старого response)
    print("\n--- Спроба replay attack ---")
    challenge1 = auth.request_login("alice")
    response1 = ChallengeResponseAuth.compute_response("secret123", challenge1)

    # Імітація перехоплення і повторного використання
    print("[ATTACKER] Перехопив response, спробую ще раз...")
    challenge2 = auth.request_login("alice")  # Новий challenge

    # Старий response не підійде до нового challenge
    auth.verify_response("alice", response1)
    print("→ Replay attack заблокована: кожен challenge унікальний")
```
### Завдання 4: Двофакторна аутентифікація (TOTP)

```python
import hmac
import hashlib
import struct
import time
import base64

class TOTP:
    """Реалізація Time-based One-Time Password (RFC 6238)."""

    def __init__(self, secret: bytes, digits: int = 6, interval: int = 30):
        """
        Args:
            secret: Секретний ключ (мінімум 128 біт)
            digits: Кількість цифр у коді (6 або 8)
            interval: Інтервал зміни коду в секундах
        """
        self.secret = secret
        self.digits = digits
        self.interval = interval

    @classmethod
    def generate_secret(cls, length: int = 20) -> bytes:
        """Генерує випадковий секретний ключ."""
        return secrets.token_bytes(length)

    @staticmethod
    def get_secret_base32(secret: bytes) -> str:
        """Конвертує секрет у Base32 для QR-коду."""
        return base64.b32encode(secret).decode('utf-8')

    def _get_counter(self, timestamp: Optional[float] = None) -> int:
        """Обчислює лічильник для поточного часу."""
        if timestamp is None:
            timestamp = time.time()
        return int(timestamp) // self.interval

    def generate(self, timestamp: Optional[float] = None) -> str:
        """
        Генерує TOTP-код для вказаного часу.
        """
        counter = self._get_counter(timestamp)

        # Конвертуємо лічильник у 8 байт (big-endian)
        counter_bytes = struct.pack('>Q', counter)

        # HMAC-SHA1
        hmac_hash = hmac.new(self.secret, counter_bytes, hashlib.sha1).digest()

        # Dynamic truncation
        offset = hmac_hash[-1] & 0x0F
        binary = struct.unpack('>I', hmac_hash[offset:offset+4])[0]
        binary &= 0x7FFFFFFF  # Забираємо знаковий біт

        # Модуль для отримання потрібної кількості цифр
        otp = binary % (10 ** self.digits)

        return str(otp).zfill(self.digits)

    def verify(self, code: str, window: int = 1) -> bool:
        """
        Перевіряє TOTP-код з вікном допуску.

        Args:
            code: Код від користувача
            window: Кількість інтервалів до/після (для синхронізації часу)
        """
        current_counter = self._get_counter()

        for offset in range(-window, window + 1):
            test_time = (current_counter + offset) * self.interval
            if self.generate(test_time) == code:
                return True

        return False

def demo_totp():
    print("\n" + "=" * 60)
    print("ДЕМОНСТРАЦІЯ TOTP (TIME-BASED ONE-TIME PASSWORD)")
    print("=" * 60)

    # Генеруємо секрет
    secret = TOTP.generate_secret()
    totp = TOTP(secret)

    print(f"\nСекретний ключ (Base32): {TOTP.get_secret_base32(secret)}")
    print(f"(Цей ключ вводиться в Google Authenticator)")

    # Генеруємо код
    current_code = totp.generate()
    print(f"\nПоточний TOTP-код: {current_code}")
    print(f"Поточний час: {time.strftime('%H:%M:%S')}")

    # Перевіряємо код
    print("\n--- Перевірка коду ---")
    is_valid = totp.verify(current_code)
    print(f"Код {current_code}: {'✓ Дійсний' if is_valid else '✗ Недійсний'}")

    # Неправильний код
    wrong_code = "000000"
    is_valid = totp.verify(wrong_code)
    print(f"Код {wrong_code}: {'✓ Дійсний' if is_valid else '✗ Недійсний'}")

    # Показуємо зміну коду з часом
    print("\n--- Зміна коду з часом ---")
    for i in range(3):
        code = totp.generate()
        remaining = totp.interval - (int(time.time()) % totp.interval)
        print(f"Код: {code} (діє ще {remaining} сек)")
        time.sleep(2)

    # Повна демонстрація 2FA
    print("\n--- Повна демонстрація 2FA ---")
    pm = PasswordManager()

    # "Реєстрація" з 2FA
    password = "MyPassword123"
    salt, password_hash = pm.register_user(password)
    user_totp_secret = TOTP.generate_secret()
    user_totp = TOTP(user_totp_secret)

    print(f"Користувач зареєстрований з 2FA")
    print(f"TOTP-секрет (для Authenticator): {TOTP.get_secret_base32(user_totp_secret)}")

    # "Вхід" з 2FA
    print("\n--- Вхід з 2FA ---")
    input_password = "MyPassword123"
    input_totp = user_totp.generate()

    # Крок 1: перевірка пароля
    password_ok = pm.verify_password(input_password, salt, password_hash)
    print(f"Крок 1 - Пароль: {'✓' if password_ok else '✗'}")

    # Крок 2: перевірка TOTP
    totp_ok = user_totp.verify(input_totp)
    print(f"Крок 2 - TOTP ({input_totp}): {'✓' if totp_ok else '✗'}")

    if password_ok and totp_ok:
        print("\n✓ ВХІД УСПІШНИЙ (обидва фактори пройдено)")
    else:
        print("\n✗ ВХІД НЕВДАЛИЙ")

if __name__ == "__main__":
    demo_registration()
    demo_timing_attack()
    demo_challenge_response()
    demo_totp()
```
**Очікуваний результат:**

```
============================================================
ДЕМОНСТРАЦІЯ РЕЄСТРАЦІЇ ТА ПЕРЕВІРКИ ПАРОЛЯ
============================================================

Пароль: MySecurePassword123!
Сіль (hex): a1b2c3d4e5f6...
Хеш (hex): 9f8e7d6c5b4a...

--- Перевірка правильного пароля ---
Результат: ✓ Пароль правильний

--- Перевірка неправильного пароля ---
Результат: ✗ Пароль неправильний

--- Демонстрація солі ---
Пароль 'password' з сіллю 1: 8f7e6d5c...
Пароль 'password' з сіллю 2: 1a2b3c4d...
Хеші різні (завдяки різній солі)

============================================================
ДЕМОНСТРАЦІЯ TOTP (TIME-BASED ONE-TIME PASSWORD)
============================================================

Секретний ключ (Base32): JBSWY3DPEHPK3PXP
(Цей ключ вводиться в Google Authenticator)

Поточний TOTP-код: 284756
Поточний час: 14:32:15

--- Перевірка коду ---
Код 284756: ✓ Дійсний
Код 000000: ✗ Недійсний
```
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

1. Чому не можна зберігати паролі у відкритому вигляді?
2. Що таке сіль (salt) і навіщо вона потрібна?
3. Чим PBKDF2 кращий за простий SHA-256 для паролів?
4. Що таке timing attack і як від неї захиститися?
5. Як працює challenge-response протокол?
6. Чому challenge повинен бути унікальним кожного разу?
7. Що таке MFA і які фактори аутентифікації існують?
8. Як працює TOTP? Чому код змінюється кожні 30 секунд?
9. Що робити, якщо користувач втратив доступ до 2FA?
10. Чим аутентифікація відрізняється від авторизації?

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
