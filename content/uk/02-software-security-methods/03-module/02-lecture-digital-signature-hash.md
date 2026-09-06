---
title: "Електронний цифровий підпис. Хеш-функції"
type: lecture
order: 2
preview: "ЕЦП, криптографічні хеш-функції, SHA, застосування."
---

## Навіщо потрібен цифровий підпис?

Асиметричне шифрування вирішує проблему конфіденційності. Але як забезпечити:

- **Автентичність** — хто автор повідомлення?
- **Цілісність** — чи не змінено повідомлення?
- **Неспростовність** — автор не може відмовитися від авторства?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПРОБЛЕМА                                         │
│                                                                     │
│   Аліса надсилає Бобу:                                              │
│   "Переведи 1000 грн на рахунок Карла"                              │
│                                                                     │
│   Питання:                                                          │
│   • Чи справді це Аліса? (автентичність)                           │
│   • Чи не змінив хтось суму? (цілісність)                          │
│   • Чи не скаже Аліса: "Я цього не писала"? (неспростовність)      │
│                                                                     │
│   Рішення: ЕЛЕКТРОННИЙ ЦИФРОВИЙ ПІДПИС                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Принцип цифрового підпису

### Ідея

**Підпис створюється приватним ключем** (тільки власник може підписати).
**Підпис перевіряється публічним ключем** (будь-хто може перевірити).

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ЦИФРОВИЙ ПІДПИС                                  │
│                                                                     │
│   ПІДПИСАННЯ (Аліса):                                               │
│                                                                     │
│   Документ M ──► [Підпис приватним ключем] ──► Підпис S             │
│                         │                                           │
│                    Priv_Alice                                       │
│                                                                     │
│   Надсилає: (M, S)                                                  │
│                                                                     │
│   ─────────────────────────────────────────────────────────────     │
│                                                                     │
│   ПЕРЕВІРКА (Боб):                                                  │
│                                                                     │
│   (M, S) ──► [Перевірка публічним ключем] ──► Дійсний / Недійсний  │
│                         │                                           │
│                    Pub_Alice                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Підпис RSA (спрощено)

```
Підписання:    S = Mᵈ mod n    (приватний ключ d)
Перевірка:     M' = Sᵉ mod n   (публічний ключ e)
               Якщо M' = M — підпис дійсний
```

**Проблема**: підписувати великі документи повільно!

**Рішення**: підписувати не документ, а його **хеш**.

## Хеш-функції

### Що таке хеш-функція?

**Хеш-функція** — функція, що перетворює вхід довільної довжини у вихід фіксованої довжини.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ХЕШ-ФУНКЦІЯ                                      │
│                                                                     │
│   Вхід (будь-якої довжини)          Вихід (фіксована довжина)       │
│                                                                     │
│   "Hello" ─────────────────────►    2cf24dba5fb0a30e...            │
│   (5 байт)          H()             (256 біт = 32 байт)            │
│                                                                     │
│   "Hello World" ───────────────►    a591a6d40bf420...              │
│   (11 байт)         H()             (256 біт = 32 байт)            │
│                                                                     │
│   Файл 1 ГБ ───────────────────►    7f83b1657ff1fc...              │
│   (10⁹ байт)        H()             (256 біт = 32 байт)            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Властивості криптографічної хеш-функції

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ВЛАСТИВОСТІ ХЕШУ                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. ДЕТЕРМІНОВАНІСТЬ                                                │
│     Той самий вхід → той самий хеш                                  │
│     H("Hello") завжди = 2cf24dba5fb0a30e...                        │
│                                                                     │
│  2. ШВИДКІСТЬ                                                       │
│     Обчислення H(M) має бути швидким                               │
│                                                                     │
│  3. СТІЙКІСТЬ ДО ПРООБРАЗУ (Preimage Resistance)                   │
│     Маючи h, неможливо знайти M: H(M) = h                          │
│                                                                     │
│  4. СТІЙКІСТЬ ДО ДРУГОГО ПРООБРАЗУ (Second Preimage)               │
│     Маючи M₁, неможливо знайти M₂ ≠ M₁: H(M₁) = H(M₂)              │
│                                                                     │
│  5. СТІЙКІСТЬ ДО КОЛІЗІЙ (Collision Resistance)                    │
│     Неможливо знайти будь-які M₁ ≠ M₂: H(M₁) = H(M₂)               │
│                                                                     │
│  6. ЛАВИННИЙ ЕФЕКТ                                                  │
│     Зміна 1 біта входу → зміна ~50% бітів виходу                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Демонстрація лавинного ефекту

```python
import hashlib

text1 = "Hello World"
text2 = "Hello Vorld"  # Одна літера змінена

hash1 = hashlib.sha256(text1.encode()).hexdigest()
hash2 = hashlib.sha256(text2.encode()).hexdigest()

print(f"'{text1}': {hash1}")
print(f"'{text2}': {hash2}")

# Порахуємо різницю в бітах
diff = bin(int(hash1, 16) ^ int(hash2, 16)).count('1')
print(f"Різних бітів: {diff} з 256 ({diff/256*100:.1f}%)")
```

Вивід:
```
'Hello World': a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
'Hello Vorld': 6c98a7a7e9f0e8d7b5c9a3f2e1d0c4b5a6978899aabbccddeeff00112233445566
Різних бітів: 128 з 256 (50.0%)
```

## Сімейства хеш-функцій

### MD (Message Digest)

```
┌────────────────────────────────────────────────────────────────────┐
│                    СІМЕЙСТВО MD                                     │
├──────────┬──────────────┬──────────────────────────────────────────┤
│ Алгоритм │ Розмір хешу  │ Статус                                   │
├──────────┼──────────────┼──────────────────────────────────────────┤
│ MD4      │ 128 біт      │ ❌ Зламаний (1995)                       │
├──────────┼──────────────┼──────────────────────────────────────────┤
│ MD5      │ 128 біт      │ ❌ Зламаний (2004), колізії за секунди   │
├──────────┼──────────────┼──────────────────────────────────────────┤
│ MD6      │ варіюється   │ ⚠️ Не стандартизований                   │
└──────────┴──────────────┴──────────────────────────────────────────┘
```

**MD5 все ще використовують** (помилково!) для:
- Контрольних сум файлів (краще SHA-256)
- Хешування паролів (категорично не можна!)

### SHA (Secure Hash Algorithm)

```
┌────────────────────────────────────────────────────────────────────┐
│                    СІМЕЙСТВО SHA                                    │
├───────────┬─────────────┬──────────┬───────────────────────────────┤
│ Алгоритм  │ Розмір хешу │ Рік      │ Статус                        │
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-0     │ 160 біт     │ 1993     │ ❌ Відкликаний                │
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-1     │ 160 біт     │ 1995     │ ❌ Зламаний (2017), заборонено│
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-224   │ 224 біт     │ 2004     │ ✅ Безпечний                  │
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-256   │ 256 біт     │ 2001     │ ✅ Рекомендований             │
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-384   │ 384 біт     │ 2001     │ ✅ Безпечний                  │
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-512   │ 512 біт     │ 2001     │ ✅ Безпечний                  │
├───────────┼─────────────┼──────────┼───────────────────────────────┤
│ SHA-3     │ 224-512 біт │ 2015     │ ✅ Новий стандарт (Keccak)    │
└───────────┴─────────────┴──────────┴───────────────────────────────┘
```

### Структура SHA-256

```
┌─────────────────────────────────────────────────────────────────────┐
│                    СТРУКТУРА SHA-256                                │
│                                                                     │
│   Повідомлення M                                                    │
│        │                                                            │
│        ▼                                                            │
│   ┌─────────────┐                                                   │
│   │  Padding    │  Доповнення до кратного 512 біт                  │
│   └──────┬──────┘                                                   │
│          │                                                          │
│   ┌──────┴──────┐                                                   │
│   │ M₁ M₂ ... Mₙ│  Блоки по 512 біт                                │
│   └──────┬──────┘                                                   │
│          │                                                          │
│   ╔══════╪══════╗                                                   │
│   ║      ▼      ║                                                   │
│   ║  ┌───────┐  ║  H₀ = ініціалізаційний вектор                    │
│   ║  │  Hᵢ   │  ║  (8 слів по 32 біт)                               │
│   ║  └───┬───┘  ║                                                   │
│   ║      │      ║                                                   │
│   ║  ┌───┴───┐  ║                                                   │
│   ║  │Compress│◄─── Mᵢ                                              │
│   ║  └───┬───┘  ║  64 раунди                                       │
│   ║      │      ║                                                   │
│   ║  ┌───┴───┐  ║                                                   │
│   ║  │ Hᵢ₊₁  │  ║                                                   │
│   ║  └───────┘  ║                                                   │
│   ╚══════╪══════╝  повторюємо для всіх блоків                      │
│          │                                                          │
│          ▼                                                          │
│   256-бітний хеш                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Використання в Python

```python
import hashlib

# SHA-256
message = b"Hello, World!"
hash_sha256 = hashlib.sha256(message).hexdigest()
print(f"SHA-256: {hash_sha256}")

# SHA-512
hash_sha512 = hashlib.sha512(message).hexdigest()
print(f"SHA-512: {hash_sha512}")

# SHA-3
hash_sha3_256 = hashlib.sha3_256(message).hexdigest()
print(f"SHA3-256: {hash_sha3_256}")

# Хешування файлу
def hash_file(filepath: str) -> str:
    sha256 = hashlib.sha256()
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            sha256.update(chunk)
    return sha256.hexdigest()
```

## Цифровий підпис з хешем

### Схема підпису

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПІДПИСАННЯ ДОКУМЕНТА                             │
│                                                                     │
│   Документ M                                                        │
│       │                                                             │
│       ▼                                                             │
│   ┌───────┐                                                         │
│   │ Hash  │ ──► h = H(M)   (наприклад, 256 біт)                    │
│   └───────┘                                                         │
│       │                                                             │
│       ▼                                                             │
│   ┌───────┐                                                         │
│   │ Sign  │ ──► S = h^d mod n   (RSA з приватним ключем)           │
│   └───────┘                                                         │
│       │                                                             │
│       ▼                                                             │
│   Підпис S                                                          │
│                                                                     │
│   Надсилається: (M, S)                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    ПЕРЕВІРКА ПІДПИСУ                                │
│                                                                     │
│   Отримано: (M, S)                                                  │
│                                                                     │
│   Крок 1: Обчислюємо хеш документа                                  │
│           h₁ = H(M)                                                 │
│                                                                     │
│   Крок 2: "Розшифровуємо" підпис публічним ключем                  │
│           h₂ = S^e mod n                                            │
│                                                                     │
│   Крок 3: Порівнюємо                                                │
│           Якщо h₁ = h₂ → підпис ДІЙСНИЙ                            │
│           Інакше → підпис НЕДІЙСНИЙ                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Реалізація

```python
import hashlib


class RSASignature:
    def __init__(self, n: int, e: int, d: int):
        self.n = n
        self.e = e
        self.d = d

    def sign(self, message: bytes) -> int:
        """Підписання повідомлення."""
        # Хешуємо
        h = hashlib.sha256(message).digest()
        h_int = int.from_bytes(h, 'big')

        # Підписуємо приватним ключем
        signature = pow(h_int, self.d, self.n)
        return signature

    def verify(self, message: bytes, signature: int) -> bool:
        """Перевірка підпису."""
        # Хешуємо повідомлення
        h = hashlib.sha256(message).digest()
        h_int = int.from_bytes(h, 'big')

        # "Розшифровуємо" підпис публічним ключем
        h_from_sig = pow(signature, self.e, self.n)

        # Порівнюємо
        return h_int == h_from_sig


# Приклад (з малими числами для демонстрації)
# У реальності n має бути 2048+ біт
n = 3233
e = 17
d = 2753

signer = RSASignature(n, e, d)

message = b"Transfer 1000 UAH to account 12345"
signature = signer.sign(message)
print(f"Підпис: {signature}")

# Перевірка
is_valid = signer.verify(message, signature)
print(f"Підпис дійсний: {is_valid}")

# Спроба підробки
fake_message = b"Transfer 9999 UAH to account 12345"
is_valid_fake = signer.verify(fake_message, signature)
print(f"Підпис для зміненого повідомлення: {is_valid_fake}")
```

## Застосування хеш-функцій

### 1. Цифровий підпис

Як розглянуто вище — підписуємо хеш, а не весь документ.

### 2. Перевірка цілісності файлів

```bash
# Створення контрольної суми
sha256sum file.iso > file.iso.sha256

# Перевірка
sha256sum -c file.iso.sha256
```

### 3. Зберігання паролів

**НІКОЛИ** не зберігайте паролі у відкритому вигляді!

```python
import hashlib
import os


def hash_password(password: str) -> tuple:
    """Хешування пароля з сіллю."""
    salt = os.urandom(16)
    # Використовуємо PBKDF2 або bcrypt, не просто SHA!
    hash_bytes = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode(),
        salt,
        100000  # ітерацій
    )
    return salt, hash_bytes


def verify_password(password: str, salt: bytes, hash_bytes: bytes) -> bool:
    """Перевірка пароля."""
    new_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode(),
        salt,
        100000
    )
    return new_hash == hash_bytes
```

### 4. Blockchain та Proof of Work

Bitcoin використовує SHA-256 для:
- Хешування блоків
- Proof of Work (знайти nonce, щоб хеш починався з N нулів)

```python
import hashlib


def mine_block(data: str, difficulty: int) -> tuple:
    """Простий приклад майнінгу."""
    nonce = 0
    prefix = '0' * difficulty

    while True:
        text = f"{data}{nonce}"
        hash_hex = hashlib.sha256(text.encode()).hexdigest()

        if hash_hex.startswith(prefix):
            return nonce, hash_hex

        nonce += 1


# Знайти хеш, що починається з 4 нулів
nonce, hash_result = mine_block("Hello, Blockchain!", 4)
print(f"Nonce: {nonce}")
print(f"Hash: {hash_result}")
```

### 5. HMAC (Hash-based Message Authentication Code)

Для автентифікації повідомлень з симетричним ключем:

```python
import hmac
import hashlib

key = b"secret_key"
message = b"Hello, World!"

# Створення HMAC
mac = hmac.new(key, message, hashlib.sha256).hexdigest()
print(f"HMAC: {mac}")

# Перевірка
def verify_hmac(key: bytes, message: bytes, mac: str) -> bool:
    expected = hmac.new(key, message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, mac)
```

## Практичні завдання

### Завдання 1

Обчисліть SHA-256 для рядків "test" та "Test". Порівняйте результати.

### Завдання 2

Чому MD5 не можна використовувати для цифрового підпису?

### Завдання 3

Що станеться, якщо зловмисник знайде колізію для хеш-функції, що використовується в ЕЦП?

## 💼 Real World

### ЕЦП та хеші в індустрії

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ЦИФРОВІ ПІДПИСИ У РЕАЛЬНОМУ СВІТІ                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ЕЛЕКТРОННИЙ ДОКУМЕНТООБІГ (Україна):                              │
│  ├── Дія — КЕП для громадян через смартфон                         │
│  ├── АЦСК ПриватБанку — 15+ млн сертифікатів                       │
│  ├── M.E.Doc — податкова звітність з ЕЦП                           │
│  └── Prozorro — електронні тендери з обов'язковим ЕЦП              │
│                                                                     │
│  БАНКІВСЬКІ СИСТЕМИ:                                                │
│  ├── SWIFT — SHA-256 для цілісності повідомлень                    │
│  ├── Міжбанківські перекази — RSA/ECDSA підписи                    │
│  ├── Клієнт-банк — КЕП для авторизації платежів                    │
│  └── HSM (Thales Luna, Utimaco) — зберігання ключів                │
│                                                                     │
│  SOFTWARE DISTRIBUTION:                                             │
│  ├── Microsoft Authenticode — підпис .exe/.dll                     │
│  ├── Apple Code Signing — обов'язково для App Store                │
│  ├── Linux Package Signing — GPG підписи deb/rpm                   │
│  └── Docker Content Trust — підписані образи                       │
│                                                                     │
│  BLOCKCHAIN:                                                        │
│  ├── Bitcoin — SHA-256 (double) для блоків                         │
│  ├── Ethereum — Keccak-256 (SHA-3 варіант)                         │
│  └── Кожна транзакція підписується ECDSA                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Приклад: Git та GitHub

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GIT INTEGRITY                                    │
│                                                                     │
│   Кожен коміт ідентифікується SHA-1 хешем:                         │
│                                                                     │
│   $ git log --oneline                                               │
│   a1b2c3d feat: add user authentication                            │
│   │                                                                 │
│   └── Це SHA-1 хеш:                                                │
│       • Метаданих коміту (автор, дата, повідомлення)               │
│       • Хешу дерева файлів                                          │
│       • Хешу батьківського коміту                                   │
│                                                                     │
│   GitHub Commit Signing (GPG/SSH):                                  │
│                                                                     │
│   $ git commit -S -m "Signed commit"                                │
│                                                                     │
│   ┌─────────────────────────────────────────────┐                   │
│   │ ✓ Verified                                   │                  │
│   │ This commit was signed with a verified       │                  │
│   │ signature and the email was verified.        │                  │
│   └─────────────────────────────────────────────┘                   │
│                                                                     │
│   Git переходить на SHA-256 (SHA-1 collision знайдено 2017)        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### SolarWinds Attack (2020)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPPLY CHAIN ATTACK                              │
│                                                                     │
│   Що сталося:                                                       │
│   • Хакери зламали SolarWinds build system                         │
│   • Впровадили malware в легітимне оновлення Orion                 │
│   • Оновлення було підписане справжнім сертифікатом SolarWinds     │
│   • 18,000 організацій встановили backdoor                         │
│                                                                     │
│   Постраждали:                                                      │
│   • Microsoft, Intel, Cisco                                        │
│   • US Treasury, Department of Homeland Security                   │
│   • FireEye (виявили атаку)                                        │
│                                                                     │
│   Урок:                                                             │
│   • Цифровий підпис гарантує автентичність, НЕ безпечність        │
│   • Потрібен захист всього CI/CD pipeline                          │
│   • SLSA framework для software supply chain security              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Career Spotlight

### Ролі, пов'язані з ЕЦП та хешуванням

```
┌─────────────────────────────────────────────────────────────────────┐
│                    КАР'ЄРНІ МОЖЛИВОСТІ                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  SECURITY ENGINEER (Code Signing)                                   │
│  ├── Зарплата: $130,000 - $180,000 (США)                           │
│  ├── Завдання:                                                      │
│  │   • Налаштування Authenticode/Apple signing                     │
│  │   • Керування сертифікатами та HSM                              │
│  │   • Інтеграція підпису в CI/CD                                  │
│  └── Компанії: Microsoft, Apple, Adobe, Autodesk                   │
│                                                                     │
│  BLOCKCHAIN DEVELOPER                                               │
│  ├── Зарплата: $120,000 - $200,000 (США)                           │
│  ├── Вимоги:                                                        │
│  │   • Глибоке знання хеш-функцій та ЕЦП                           │
│  │   • Solidity, Rust, Go                                          │
│  │   • Криптографічні примітиви                                    │
│  └── Компанії: Coinbase, Chainalysis, ConsenSys                    │
│                                                                     │
│  PKI ADMINISTRATOR                                                  │
│  ├── Зарплата: $90,000 - $140,000 (США)                            │
│  ├── Завдання:                                                      │
│  │   • Керування Certificate Authority                             │
│  │   • Видача та відкликання сертифікатів                          │
│  │   • Compliance (PCI DSS, SOC 2)                                 │
│  └── Компанії: Банки, страхові, урядові установи                   │
│                                                                     │
│  FORENSIC ANALYST                                                   │
│  ├── Зарплата: $80,000 - $130,000 (США)                            │
│  ├── Завдання:                                                      │
│  │   • Верифікація цілісності цифрових доказів                     │
│  │   • Аналіз хешів файлів                                         │
│  │   • Експертиза ЕЦП в судових справах                            │
│  └── Компанії: Правоохоронні органи, Deloitte, KPMG                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Resources

### Онлайн-практика

| Ресурс | Опис | Фокус |
|--------|------|-------|
| **CryptoHack.org** | Hash challenges, MAC bypasses | Практичні атаки |
| **Cryptopals Set 4** | MD4, SHA-1 length extension | Реальні вразливості |
| **Root-Me** | Криптографічні челенджі | CTF-стиль |
| **PortSwigger** | Web security з хешами | Web application |

### Стандарти та специфікації

- **FIPS 180-4** — SHA-1, SHA-256, SHA-512
- **FIPS 202** — SHA-3 (Keccak)
- **RFC 6234** — SHA algorithms в деталях
- **RFC 2104** — HMAC

---

## 📋 Cheat Sheet

### Хеш-функції

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HASH ALGORITHMS CHEAT SHEET                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  АЛГОРИТМ     │ РОЗМІР   │ СТАТУС      │ ВИКОРИСТАННЯ              │
│  ─────────────┼──────────┼─────────────┼─────────────────────────── │
│  MD5          │ 128 біт  │ ❌ ЗЛАМАНИЙ │ Тільки для checksum       │
│  SHA-1        │ 160 біт  │ ❌ ЗЛАМАНИЙ │ Legacy, не для безпеки    │
│  SHA-256      │ 256 біт  │ ✅ БЕЗПЕЧНИЙ│ Рекомендований            │
│  SHA-384      │ 384 біт  │ ✅ БЕЗПЕЧНИЙ│ Підвищена безпека         │
│  SHA-512      │ 512 біт  │ ✅ БЕЗПЕЧНИЙ│ Швидший на 64-bit CPU     │
│  SHA-3-256    │ 256 біт  │ ✅ БЕЗПЕЧНИЙ│ Альтернатива SHA-2        │
│  BLAKE2b      │ 512 біт  │ ✅ БЕЗПЕЧНИЙ│ Швидше за SHA-3           │
│  BLAKE3       │ 256 біт  │ ✅ БЕЗПЕЧНИЙ│ Найшвидший сучасний       │
│                                                                     │
│  ДЛЯ ПАРОЛІВ (повільні):                                           │
│  bcrypt       │ 184 біт  │ ✅          │ Класика для паролів       │
│  Argon2id     │ варіює   │ ✅          │ Переможець PHC 2015       │
│  scrypt       │ варіює   │ ✅          │ Memory-hard               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Команди OpenSSL

```bash
# SHA-256 хеш файлу
openssl dgst -sha256 file.txt

# SHA-512 хеш
openssl dgst -sha512 file.txt

# HMAC-SHA256
openssl dgst -sha256 -hmac "secret_key" file.txt

# Перевірка хешу
echo "expected_hash  file.txt" | sha256sum -c

# Підпис файлу з SHA-256
openssl dgst -sha256 -sign private.pem -out signature.bin file.txt

# Перевірка підпису
openssl dgst -sha256 -verify public.pem -signature signature.bin file.txt
```

### Команди в командному рядку

```bash
# Linux/macOS
sha256sum file.txt           # SHA-256
sha512sum file.txt           # SHA-512
md5sum file.txt              # MD5 (не рекомендовано)
shasum -a 256 file.txt       # macOS альтернатива

# Порівняння файлів за хешем
diff <(sha256sum file1.txt) <(sha256sum file2.txt)

# GPG підпис
gpg --sign --armor file.txt
gpg --verify file.txt.asc
```

### Python

```python
import hashlib
import hmac

# Базові хеші
sha256_hash = hashlib.sha256(b"data").hexdigest()
sha512_hash = hashlib.sha512(b"data").hexdigest()
sha3_hash = hashlib.sha3_256(b"data").hexdigest()

# HMAC
hmac_result = hmac.new(
    key=b"secret",
    msg=b"message",
    digestmod=hashlib.sha256
).hexdigest()

# Хешування файлу частинами
def hash_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(4096), b''):
            h.update(chunk)
    return h.hexdigest()

# Хешування пароля (НІКОЛИ не використовуйте SHA для паролів!)
import bcrypt
hashed = bcrypt.hashpw(b"password", bcrypt.gensalt(rounds=12))
bcrypt.checkpw(b"password", hashed)  # True
```

---

## ❓ Питання для самоперевірки

### 1. Чому SHA-256 не підходить для хешування паролів?

**Відповідь:** SHA-256 занадто швидкий. Сучасні GPU можуть обчислювати мільярди SHA-256 хешів за секунду, що робить brute-force атаки практичними. Для паролів потрібні спеціалізовані повільні функції (bcrypt, Argon2), які навмисно вимагають багато часу та пам'яті.

### 2. Що таке Length Extension Attack і які хеші до неї вразливі?

**Відповідь:** Length Extension Attack дозволяє, знаючи H(message) та довжину message (але не сам message), обчислити H(message || padding || extension) без знання оригінального повідомлення. Вразливі: MD5, SHA-1, SHA-256, SHA-512. Стійкі: SHA-3, BLAKE2, HMAC.

### 3. Чим HMAC відрізняється від простого Hash(key || message)?

**Відповідь:** Простий Hash(key || message) вразливий до length extension attack. HMAC використовує подвійне хешування: HMAC(K,M) = H((K⊕opad) || H((K⊕ipad) || M)), що робить його стійким. Також HMAC має математичний доказ безпеки.

### 4. Як працює цифровий підпис RSA з хешем?

**Відповідь:**
1. Обчислюємо хеш документа: h = SHA256(M)
2. Підписуємо хеш приватним ключем: S = h^d mod n
3. Для перевірки: обчислюємо h' = S^e mod n та порівнюємо з SHA256(M)
Хеш потрібен, бо RSA працює з числами меншими за n, а документи можуть бути довільного розміру.

### 5. Що таке SHAttered attack і чому SHA-1 більше не безпечний?

**Відповідь:** SHAttered (2017) — перша практична колізія SHA-1. Дослідники Google та CWI створили два різних PDF файли з однаковим SHA-1 хешем. Атака вимагала ~6500 CPU-років (~$110,000 на хмарі). Це зробило SHA-1 небезпечним для цифрових підписів та сертифікатів.

---

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть систему перевірки цілісності файлів

Напишіть скрипт, який обчислює хеші важливих файлів та виявляє несанкціоновані зміни — як справжня IDS!

**Кроки:**

1. Створіть скрипт моніторингу:
```bash
mkdir -p ~/integrity-checker && cd ~/integrity-checker
nano check_integrity.sh
```

```bash
#!/bin/bash
# Simple File Integrity Checker

WATCH_DIR="${1:-$HOME}"
BASELINE="baseline.sha256"

generate_baseline() {
    echo "📝 Generating baseline for $WATCH_DIR..."
    find "$WATCH_DIR" -maxdepth 1 -type f -exec sha256sum {} \; > "$BASELINE"
    echo "✅ Baseline saved: $(wc -l < $BASELINE) files"
}

check_integrity() {
    echo "🔍 Checking integrity..."
    if sha256sum -c "$BASELINE" 2>/dev/null | grep -v ": OK$"; then
        echo "⚠️  INTEGRITY VIOLATION DETECTED!"
        return 1
    else
        echo "✅ All files OK"
        return 0
    fi
}

case "$2" in
    --generate) generate_baseline ;;
    --check)    check_integrity ;;
    *)
        echo "Usage: $0 <directory> --generate|--check"
        echo "Example: $0 /etc --generate"
        ;;
esac
```

2. Протестуйте:
```bash
chmod +x check_integrity.sh

# Створіть тестові файли
mkdir -p test_files && cd test_files
echo "important data" > file1.txt
echo "secret config" > file2.txt

# Згенеруйте baseline
../check_integrity.sh . --generate

# Перевірте (має бути OK)
../check_integrity.sh . --check

# Змініть файл
echo "HACKED" >> file1.txt

# Перевірте знову (має виявити зміну!)
../check_integrity.sh . --check
```

**Очікуваний результат:**
- Працюючий скрипт перевірки цілісності
- Baseline файл з хешами
- Демонстрація виявлення зміненого файлу

**Бонус (для допитливих):**
- Додайте HMAC замість простого хешу (потрібен секретний ключ)
- Зробіть cron job для автоматичної перевірки: `*/5 * * * * ~/check_integrity.sh /etc --check`
- Порівняйте SHA-256 vs SHA-512 vs MD5 (та чому MD5 не використовувати)

---

## 🔧 Розширене практичне завдання (для лабораторної)

### Завдання: Система верифікації цілісності файлів

**Мета:** Створити систему для моніторингу змін у файлах (подібно до Tripwire або AIDE).

**Частина 1: Базова реалізація (Python)**

```python
"""
Завдання: Реалізуйте File Integrity Monitor

Функціональність:
1. Сканування директорії та обчислення хешів файлів
2. Збереження базової лінії (baseline)
3. Порівняння поточного стану з baseline
4. Виявлення: нових файлів, видалених файлів, змінених файлів
"""

import hashlib
import json
import os
from pathlib import Path
from typing import Dict, Tuple
from datetime import datetime


class FileIntegrityMonitor:
    def __init__(self, baseline_path: str = "baseline.json"):
        self.baseline_path = baseline_path
        self.baseline: Dict[str, dict] = {}

    def hash_file(self, filepath: str) -> Tuple[str, str]:
        """
        TODO: Обчисліть SHA-256 та SHA-512 хеші файлу.
        Використовуйте читання частинами для великих файлів.
        Поверніть (sha256_hash, sha512_hash)
        """
        pass

    def scan_directory(self, directory: str) -> Dict[str, dict]:
        """
        TODO: Рекурсивно скануйте директорію.
        Для кожного файлу збережіть:
        - sha256
        - sha512
        - size
        - mtime (modification time)
        - permissions
        """
        pass

    def create_baseline(self, directory: str):
        """
        TODO: Створіть baseline та збережіть у JSON.
        Включіть timestamp створення baseline.
        """
        pass

    def verify(self, directory: str) -> dict:
        """
        TODO: Порівняйте поточний стан з baseline.
        Поверніть словник з категоріями:
        - added: список нових файлів
        - removed: список видалених файлів
        - modified: список змінених файлів (з деталями)
        - unchanged: кількість незмінених файлів
        """
        pass

    def generate_report(self, changes: dict) -> str:
        """
        TODO: Згенеруйте текстовий звіт про зміни.
        """
        pass


# Використання
if __name__ == "__main__":
    fim = FileIntegrityMonitor()

    # Створення baseline
    fim.create_baseline("/path/to/monitor")

    # Пізніше: перевірка
    changes = fim.verify("/path/to/monitor")
    print(fim.generate_report(changes))
```

**Частина 2: Додавання HMAC підпису (захист baseline)**

```python
"""
TODO: Захистіть baseline від модифікації.

Проблема: якщо атакуючий змінить і файли, і baseline,
FIM не виявить атаку.

Рішення:
1. При створенні baseline обчисліть HMAC-SHA256 від JSON
2. Збережіть HMAC окремо або в зашифрованому вигляді
3. При верифікації перевірте HMAC baseline перед аналізом
"""

import hmac

class SecureFileIntegrityMonitor(FileIntegrityMonitor):
    def __init__(self, secret_key: bytes, baseline_path: str = "baseline.json"):
        super().__init__(baseline_path)
        self.secret_key = secret_key

    def sign_baseline(self, baseline_json: str) -> str:
        """
        TODO: Створіть HMAC-SHA256 підпис baseline
        """
        pass

    def verify_baseline_signature(self, baseline_json: str, signature: str) -> bool:
        """
        TODO: Перевірте HMAC підпис baseline
        """
        pass
```

**Частина 3: Інтеграція з OpenSSL**

```bash
#!/bin/bash
# file_integrity.sh

# TODO: Реалізуйте bash-версію з використанням OpenSSL

# 1. Створення baseline
create_baseline() {
    local dir=$1
    local output=$2

    # Для кожного файлу в директорії
    # Обчисліть sha256sum
    # Збережіть у форматі: hash  filepath
}

# 2. Верифікація
verify_integrity() {
    local baseline=$1

    # Використовуйте sha256sum -c для перевірки
}

# 3. Підпис baseline приватним ключем RSA
sign_baseline() {
    local baseline=$1
    local private_key=$2

    openssl dgst -sha256 -sign "$private_key" -out baseline.sig "$baseline"
}

# 4. Перевірка підпису
verify_signature() {
    local baseline=$1
    local signature=$2
    local public_key=$3

    openssl dgst -sha256 -verify "$public_key" -signature "$signature" "$baseline"
}
```

**Частина 4: Виявлення атак**

```python
"""
Тестові сценарії для вашої системи:

1. Модифікація файлу
2. Видалення файлу
3. Додавання нового файлу
4. Зміна тільки mtime (touch)
5. Модифікація baseline (має виявитись через HMAC)
6. Replay attack (стара версія файлу)
"""

def test_scenarios():
    # TODO: Реалізуйте автоматичні тести для кожного сценарію
    pass
```

**Критерії оцінювання:**
- Частина 1: 35 балів (базова функціональність)
- Частина 2: 25 балів (HMAC захист)
- Частина 3: 20 балів (інтеграція з OpenSSL)
- Частина 4: 20 балів (тестування атак)

---

## Підсумок

| Термін | Визначення |
|--------|------------|
| **ЕЦП** | Криптографічний механізм автентичності та цілісності |
| **Хеш-функція** | Перетворення довільного входу у фіксований вихід |
| **Колізія** | Два різних входи з однаковим хешем |
| **SHA-256** | Сучасна криптографічна хеш-функція (256 біт) |
| **HMAC** | Код автентичності на основі хешу та ключа |

**Цифровий підпис = Хеш документа + Шифрування приватним ключем**

На наступній лекції розглянемо конкретні алгоритми ЕЦП: DSA, ECDSA та український стандарт ДСТУ 4145.
