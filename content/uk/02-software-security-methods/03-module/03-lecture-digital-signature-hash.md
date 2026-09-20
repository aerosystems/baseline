---
title: "Електронний цифровий підпис. Хеш-функції"
type: lecture
order: 3
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
│   • Чи справді це Аліса? (автентичність)                            │
│   • Чи не змінив хтось суму? (цілісність)                           │
│   • Чи не скаже Аліса: "Я цього не писала"? (неспростовність)       │
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
│   (M, S) ──► [Перевірка публічним ключем] ──► Дійсний / Недійсний   │
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
│   "Hello" ─────────────────────►    2cf24dba5fb0a30e...             │
│   (5 байт)          H()             (256 біт = 32 байт)             │
│                                                                     │
│   "Hello World" ───────────────►    a591a6d40bf420...               │
│   (11 байт)         H()             (256 біт = 32 байт)             │
│                                                                     │
│   Файл 1 ГБ ───────────────────►    7f83b1657ff1fc...               │
│   (10⁹ байт)        H()             (256 біт = 32 байт)             │
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
│     H("Hello") завжди = 2cf24dba5fb0a30e...                         │
│                                                                     │
│  2. ШВИДКІСТЬ                                                       │
│     Обчислення H(M) має бути швидким                                │
│                                                                     │
│  3. СТІЙКІСТЬ ДО ПРООБРАЗУ (Preimage Resistance)                    │
│     Маючи h, неможливо знайти M: H(M) = h                           │
│                                                                     │
│  4. СТІЙКІСТЬ ДО ДРУГОГО ПРООБРАЗУ (Second Preimage)                │
│     Маючи M₁, неможливо знайти M₂ ≠ M₁: H(M₁) = H(M₂)               │
│                                                                     │
│  5. СТІЙКІСТЬ ДО КОЛІЗІЙ (Collision Resistance)                     │
│     Неможливо знайти будь-які M₁ ≠ M₂: H(M₁) = H(M₂)                │
│                                                                     │
│  6. ЛАВИННИЙ ЕФЕКТ                                                  │
│     Зміна 1 біта входу → зміна ~50% бітів виходу                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Демонстрація лавинного ефекту

```cpp
#include <iostream>
#include <string>
#include <bitset>

std::string sha256(const std::string& message);   // реалізація з лабораторної роботи №7

// Кількість різних бітів двох шістнадцяткових хешів
int countDifferentBits(const std::string& hex1, const std::string& hex2) {
    auto value = [](char c) {
        return (c >= '0' && c <= '9') ? c - '0'
             : (c >= 'a' && c <= 'f') ? c - 'a' + 10
                                      : c - 'A' + 10;
    };

    int diff = 0;
    for (size_t i = 0; i < hex1.size(); ++i) {
        diff += static_cast<int>(std::bitset<4>(value(hex1[i]) ^ value(hex2[i])).count());
    }
    return diff;
}

int main() {
    std::string text1 = "Hello World";
    std::string text2 = "Hello Vorld";     // змінено одну літеру

    std::string hash1 = sha256(text1);
    std::string hash2 = sha256(text2);

    std::cout << "'" << text1 << "': " << hash1 << "\n";
    std::cout << "'" << text2 << "': " << hash2 << "\n";

    int diff = countDifferentBits(hash1, hash2);
    std::cout << "Різних бітів: " << diff << " з 256 ("
              << (diff * 100.0 / 256) << "%)\n";
    return 0;
}
```

Вивід:
```
'Hello World': a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e
'Hello Vorld': 1e0b908ac32a5e8abd5e1753c4750cd52391ed213602155f2c984dd4c2ec5782
Різних бітів: 142 з 256 (55.4688%)
```

Зміна однієї літери дала 142 різних біти. Очікуване значення — 128 (половина
від 256); конкретний результат коливається навколо нього, бо кожен біт виходу
змінюється незалежно з імовірністю 1/2. Відхилення в 14 бітів для 256 незалежних
випробувань — звичайне, у межах двох стандартних відхилень (σ = 8).

## Сімейства хеш-функцій

### MD (Message Digest)

```
┌────────────────────────────────────────────────────────────────────┐
│                    СІМЕЙСТВО MD                                    │
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
│                    СІМЕЙСТВО SHA                                   │
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
│   │  Padding    │  Доповнення до кратного 512 біт                   │
│   └──────┬──────┘                                                   │
│          │                                                          │
│   ┌──────┴──────┐                                                   │
│   │ M₁ M₂ ... Mₙ│  Блоки по 512 біт                                 │
│   └──────┬──────┘                                                   │
│          │                                                          │
│   ╔══════╪══════╗                                                   │
│   ║      ▼      ║                                                   │
│   ║  ┌───────┐  ║  H₀ = ініціалізаційний вектор                     │
│   ║  │  Hᵢ   │  ║  (8 слів по 32 біт)                               │
│   ║  └───┬───┘  ║                                                   │
│   ║      │      ║                                                   │
│   ║  ┌───┴───┐  ║                                                   │
│   ║  │Compress│◄─── Mᵢ                                              │
│   ║  └───┬───┘  ║  64 раунди                                        │
│   ║      │      ║                                                   │
│   ║  ┌───┴───┐  ║                                                   │
│   ║  │ Hᵢ₊₁  │  ║                                                   │
│   ║  └───────┘  ║                                                   │
│   ╚══════╪══════╝  повторюємо для всіх блоків                       │
│          │                                                          │
│          ▼                                                          │
│   256-бітний хеш                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Використання в C++

```cpp
// Стандартної хеш-функції в C++ немає: беруть або власну реалізацію
// (лабораторна робота №7), або бібліотеку OpenSSL.
#include <openssl/evp.h>
#include <fstream>
#include <iomanip>
#include <sstream>
#include <vector>
#include <string>

// Хешування рядка вказаним алгоритмом: "SHA256", "SHA512", "SHA3-256"
std::string hashString(const std::string& data, const char* algorithm) {
    const EVP_MD* md = EVP_get_digestbyname(algorithm);
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();

    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int length = 0;

    EVP_DigestInit_ex(ctx, md, nullptr);
    EVP_DigestUpdate(ctx, data.data(), data.size());
    EVP_DigestFinal_ex(ctx, digest, &length);
    EVP_MD_CTX_free(ctx);

    std::ostringstream out;
    for (unsigned int i = 0; i < length; ++i) {
        out << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(digest[i]);
    }
    return out.str();
}

// Хешування файлу частинами: великий файл не завантажують у пам'ять цілком
std::string hashFile(const std::string& path) {
    std::ifstream file(path, std::ios::binary);
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_DigestInit_ex(ctx, EVP_sha256(), nullptr);

    std::vector<char> buffer(4096);
    while (file.read(buffer.data(), buffer.size()) || file.gcount() > 0) {
        EVP_DigestUpdate(ctx, buffer.data(), static_cast<size_t>(file.gcount()));
    }

    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int length = 0;
    EVP_DigestFinal_ex(ctx, digest, &length);
    EVP_MD_CTX_free(ctx);

    std::ostringstream out;
    for (unsigned int i = 0; i < length; ++i) {
        out << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(digest[i]);
    }
    return out.str();
}
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
│   │ Hash  │ ──► h = H(M)   (наприклад, 256 біт)                     │
│   └───────┘                                                         │
│       │                                                             │
│       ▼                                                             │
│   ┌───────┐                                                         │
│   │ Sign  │ ──► S = h^d mod n   (RSA з приватним ключем)            │
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
│   Крок 2: "Розшифровуємо" підпис публічним ключем                   │
│           h₂ = S^e mod n                                            │
│                                                                     │
│   Крок 3: Порівнюємо                                                │
│           Якщо h₁ = h₂ → підпис ДІЙСНИЙ                             │
│           Інакше → підпис НЕДІЙСНИЙ                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Реалізація

```cpp
#include <string>

using u64 = unsigned long long;

std::string sha256(const std::string& message);          // лабораторна робота №7
u64 hashToNumber(const std::string& message);            // перші 8 байтів хешу
u64 fastPower(u64 base, u64 exp, u64 modulus);

// Підпис RSA: хеш повідомлення підноситься до степеня d (закритий ключ)
class RSASignature {
public:
    RSASignature(u64 n, u64 e, u64 d) : n_(n), e_(e), d_(d) {}

    u64 sign(const std::string& message) const {
        u64 h = hashToNumber(message) % n_;
        return fastPower(h, d_, n_);
    }

    // Перевірка: підпис підноситься до степеня e (відкритий ключ)
    // і порівнюється з хешем повідомлення
    bool verify(const std::string& message, u64 signature) const {
        u64 expected = hashToNumber(message) % n_;
        return fastPower(signature, e_, n_) == expected;
    }

private:
    u64 n_, e_, d_;
};
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

```cpp
#include <string>
#include <vector>
#include <random>

std::string sha256(const std::string& message);

// Пароль ніколи не зберігають у відкритому вигляді.
// Сіль унікальна для кожного користувача, ітерації сповільнюють перебір.
struct StoredPassword {
    std::string salt;
    std::string hash;
};

std::string randomSalt(int bytes = 16) {
    std::random_device rd;
    std::uniform_int_distribution<int> dist(0, 15);

    std::string salt;
    for (int i = 0; i < bytes * 2; ++i) {
        salt += "0123456789abcdef"[dist(rd)];
    }
    return salt;
}

// Спрощений аналог PBKDF2: багаторазове хешування
std::string derive(const std::string& password, const std::string& salt, int iterations = 100000) {
    std::string digest = sha256(salt + password);
    for (int i = 1; i < iterations; ++i) {
        digest = sha256(digest);
    }
    return digest;
}

StoredPassword hashPassword(const std::string& password) {
    StoredPassword stored;
    stored.salt = randomSalt();
    stored.hash = derive(password, stored.salt);
    return stored;
}

bool verifyPassword(const std::string& password, const StoredPassword& stored) {
    return derive(password, stored.salt) == stored.hash;
}
```

### 4. Blockchain та Proof of Work

Bitcoin використовує SHA-256 для:
- Хешування блоків
- Proof of Work (знайти nonce, щоб хеш починався з N нулів)

```cpp
#include <iostream>
#include <string>
#include <utility>

std::string sha256(const std::string& message);

// Proof of Work: шукаємо таке значення nonce, щоб хеш починався
// із заданої кількості нулів. Складність зростає експоненційно.
std::pair<unsigned long long, std::string> mineBlock(const std::string& data, int difficulty) {
    std::string prefix(difficulty, '0');

    for (unsigned long long nonce = 0; ; ++nonce) {
        std::string hash = sha256(data + std::to_string(nonce));
        if (hash.compare(0, prefix.size(), prefix) == 0) {
            return { nonce, hash };
        }
    }
}

int main() {
    auto result = mineBlock("Hello, Blockchain!", 4);   // хеш із чотирма нулями

    std::cout << "Nonce: " << result.first << "\n";
    std::cout << "Hash:  " << result.second << "\n";
    return 0;
}
```

### 5. HMAC (Hash-based Message Authentication Code)

Для автентифікації повідомлень з симетричним ключем:

```cpp
#include <string>
#include <vector>

std::vector<unsigned char> sha256Raw(const std::string& message);

using Bytes = std::vector<unsigned char>;

// HMAC за RFC 2104: hash((K ^ opad) || hash((K ^ ipad) || M))
// Просте склеювання ключа з повідомленням вразливе до атаки продовження довжини
Bytes hmacSha256(const Bytes& key, const std::string& message);

// Порівняння за сталий час: час виконання не залежить від того,
// на якому саме байті знайдено розбіжність
bool constantTimeEquals(const Bytes& a, const Bytes& b) {
    if (a.size() != b.size()) return false;

    unsigned char diff = 0;
    for (size_t i = 0; i < a.size(); ++i) {
        diff |= static_cast<unsigned char>(a[i] ^ b[i]);
    }
    return diff == 0;
}

bool verifyHmac(const Bytes& key, const std::string& message, const Bytes& mac) {
    return constantTimeEquals(hmacSha256(key, message), mac);
}
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
┌────────────────────────────────────────────────────────────────────┐
│                    ЦИФРОВІ ПІДПИСИ У РЕАЛЬНОМУ СВІТІ               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ЕЛЕКТРОННИЙ ДОКУМЕНТООБІГ (Україна):                              │
│  ├── Дія — КЕП для громадян через смартфон                         │
│  ├── АЦСК ПриватБанку — 15+ млн сертифікатів                       │
│  ├── M.E.Doc — податкова звітність з ЕЦП                           │
│  └── Prozorro — електронні тендери з обов'язковим ЕЦП              │
│                                                                    │
│  БАНКІВСЬКІ СИСТЕМИ:                                               │
│  ├── SWIFT — SHA-256 для цілісності повідомлень                    │
│  ├── Міжбанківські перекази — RSA/ECDSA підписи                    │
│  ├── Клієнт-банк — КЕП для авторизації платежів                    │
│  └── HSM (Thales Luna, Utimaco) — зберігання ключів                │
│                                                                    │
│  SOFTWARE DISTRIBUTION:                                            │
│  ├── Microsoft Authenticode — підпис .exe/.dll                     │
│  ├── Apple Code Signing — обов'язково для App Store                │
│  ├── Linux Package Signing — GPG підписи deb/rpm                   │
│  └── Docker Content Trust — підписані образи                       │
│                                                                    │
│  BLOCKCHAIN:                                                       │
│  ├── Bitcoin — SHA-256 (double) для блоків                         │
│  ├── Ethereum — Keccak-256 (SHA-3 варіант)                         │
│  └── Кожна транзакція підписується ECDSA                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Приклад: Git та GitHub

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GIT INTEGRITY                                    │
│                                                                     │
│   Кожен коміт ідентифікується SHA-1 хешем:                          │
│                                                                     │
│   $ git log --oneline                                               │
│   a1b2c3d feat: add user authentication                             │
│   │                                                                 │
│   └── Це SHA-1 хеш:                                                 │
│       • Метаданих коміту (автор, дата, повідомлення)                │
│       • Хешу дерева файлів                                          │
│       • Хешу батьківського коміту                                   │
│                                                                     │
│   GitHub Commit Signing (GPG/SSH):                                  │
│                                                                     │
│   $ git commit -S -m "Signed commit"                                │
│                                                                     │
│   ┌──────────────────────────────────────────────┐                  │
│   │ ✓ Verified                                   │                  │
│   │ This commit was signed with a verified       │                  │
│   │ signature and the email was verified.        │                  │
│   └──────────────────────────────────────────────┘                  │
│                                                                     │
│   Git переходить на SHA-256 (SHA-1 collision знайдено 2017)         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### SolarWinds Attack (2020)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPPLY CHAIN ATTACK                              │
│                                                                     │
│   Що сталося:                                                       │
│   • Хакери зламали SolarWinds build system                          │
│   • Впровадили malware в легітимне оновлення Orion                  │
│   • Оновлення було підписане справжнім сертифікатом SolarWinds      │
│   • 18,000 організацій встановили backdoor                          │
│                                                                     │
│   Постраждали:                                                      │
│   • Microsoft, Intel, Cisco                                         │
│   • US Treasury, Department of Homeland Security                    │
│   • FireEye (виявили атаку)                                         │
│                                                                     │
│   Урок:                                                             │
│   • Цифровий підпис гарантує автентичність, НЕ безпечність          │
│   • Потрібен захист всього CI/CD pipeline                           │
│   • SLSA framework для software supply chain security               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Career Spotlight

### Ролі, пов'язані з ЕЦП та хешуванням

```
┌────────────────────────────────────────────────────────────────────┐
│                    КАР'ЄРНІ МОЖЛИВОСТІ                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SECURITY ENGINEER (Code Signing)                                  │
│  ├── Зарплата: $130,000 - $180,000 (США)                           │
│  ├── Завдання:                                                     │
│  │   • Налаштування Authenticode/Apple signing                     │
│  │   • Керування сертифікатами та HSM                              │
│  │   • Інтеграція підпису в CI/CD                                  │
│  └── Компанії: Microsoft, Apple, Adobe, Autodesk                   │
│                                                                    │
│  BLOCKCHAIN DEVELOPER                                              │
│  ├── Зарплата: $120,000 - $200,000 (США)                           │
│  ├── Вимоги:                                                       │
│  │   • Глибоке знання хеш-функцій та ЕЦП                           │
│  │   • Solidity, Rust, Go                                          │
│  │   • Криптографічні примітиви                                    │
│  └── Компанії: Coinbase, Chainalysis, ConsenSys                    │
│                                                                    │
│  PKI ADMINISTRATOR                                                 │
│  ├── Зарплата: $90,000 - $140,000 (США)                            │
│  ├── Завдання:                                                     │
│  │   • Керування Certificate Authority                             │
│  │   • Видача та відкликання сертифікатів                          │
│  │   • Compliance (PCI DSS, SOC 2)                                 │
│  └── Компанії: Банки, страхові, урядові установи                   │
│                                                                    │
│  FORENSIC ANALYST                                                  │
│  ├── Зарплата: $80,000 - $130,000 (США)                            │
│  ├── Завдання:                                                     │
│  │   • Верифікація цілісності цифрових доказів                     │
│  │   • Аналіз хешів файлів                                         │
│  │   • Експертиза ЕЦП в судових справах                            │
│  └── Компанії: Правоохоронні органи, Deloitte, KPMG                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
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
│  АЛГОРИТМ     │ РОЗМІР   │ СТАТУС      │ ВИКОРИСТАННЯ               │
│  ─────────────┼──────────┼─────────────┼─────────────────────────── │
│  MD5          │ 128 біт  │ ❌ ЗЛАМАНИЙ │ Тільки для checksum        │
│  SHA-1        │ 160 біт  │ ❌ ЗЛАМАНИЙ │ Legacy, не для безпеки     │
│  SHA-256      │ 256 біт  │ ✅ БЕЗПЕЧНИЙ│ Рекомендований             │
│  SHA-384      │ 384 біт  │ ✅ БЕЗПЕЧНИЙ│ Підвищена безпека          │
│  SHA-512      │ 512 біт  │ ✅ БЕЗПЕЧНИЙ│ Швидший на 64-bit CPU      │
│  SHA-3-256    │ 256 біт  │ ✅ БЕЗПЕЧНИЙ│ Альтернатива SHA-2         │
│  BLAKE2b      │ 512 біт  │ ✅ БЕЗПЕЧНИЙ│ Швидше за SHA-3            │
│  BLAKE3       │ 256 біт  │ ✅ БЕЗПЕЧНИЙ│ Найшвидший сучасний        │
│                                                                     │
│  ДЛЯ ПАРОЛІВ (повільні):                                            │
│  bcrypt       │ 184 біт  │ ✅          │ Класика для паролів        │
│  Argon2id     │ варіює   │ ✅          │ Переможець PHC 2015        │
│  scrypt       │ варіює   │ ✅          │ Memory-hard                │
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

### Стисла довідка C++

```cpp
// Стисла довідка: що чим рахувати в C++
#include <string>
#include <vector>

// Власна реалізація SHA-256 — лабораторна робота №7
std::string sha256(const std::string& data);

// Бібліотека OpenSSL: SHA-256, SHA-512, SHA3-256
std::string hashString(const std::string& data, const char* algorithm);
// hashString(data, "SHA256"); hashString(data, "SHA512"); hashString(data, "SHA3-256");

// HMAC
std::vector<unsigned char> hmacSha256(const std::vector<unsigned char>& key,
                                      const std::string& message);

// Хешування файлу частинами по 4 КБ
std::string hashFile(const std::string& path);

// Для паролів звичайний SHA не застосовують: потрібні сіль
// і повільна функція (PBKDF2, bcrypt, Argon2) — див. розділ про зберігання паролів
```

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

**Частина 1: Базова реалізація (C++)**

```cpp
// Завдання: реалізуйте монітор цілісності файлів (File Integrity Monitor)
//
// Функціональність:
//   1. Сканування каталогу й обчислення хешів усіх файлів
//   2. Збереження базового стану (baseline) у файл
//   3. Порівняння поточного стану з базовим
//   4. Виявлення нових, видалених і змінених файлів

#include <string>
#include <map>
#include <vector>

struct FileRecord {
    std::string hash;        // SHA-256 вмісту
    unsigned long long size; // розмір у байтах
    std::string modified;    // час останньої зміни
};

class FileIntegrityMonitor {
public:
    explicit FileIntegrityMonitor(const std::string& baselinePath = "baseline.txt");

    // TODO: обчислити SHA-256 файлу, читаючи його частинами
    std::string hashFile(const std::string& path) const;

    // TODO: обійти каталог рекурсивно (std::filesystem::recursive_directory_iterator)
    // і скласти таблицю «шлях → запис»
    std::map<std::string, FileRecord> scanDirectory(const std::string& path) const;

    // TODO: зберегти й завантажити базовий стан
    void saveBaseline(const std::map<std::string, FileRecord>& state);
    void loadBaseline();

    // TODO: порівняти поточний стан із базовим і повернути три переліки:
    // нові файли, видалені файли, змінені файли
    struct Report {
        std::vector<std::string> added;
        std::vector<std::string> removed;
        std::vector<std::string> modified;
    };
    Report verify(const std::string& path) const;

private:
    std::string baselinePath_;
    std::map<std::string, FileRecord> baseline_;
};
```

**Частина 2: Додавання HMAC підпису (захист baseline)**

```cpp
// TODO: захистіть базовий стан від підміни.
//
// Проблема: якщо зловмисник змінить і файли, і baseline,
// монітор нічого не виявить.
//
// Розв'язання:
//   1. Під час створення baseline обчислити HMAC-SHA256 від його вмісту
//   2. Зберегти HMAC окремо від самого baseline
//   3. Перед перевіркою звірити HMAC і лише тоді аналізувати дані

#include <string>
#include <vector>

class SecureFileIntegrityMonitor : public FileIntegrityMonitor {
public:
    SecureFileIntegrityMonitor(const std::vector<unsigned char>& secretKey,
                               const std::string& baselinePath = "baseline.txt");

    // TODO: підписати вміст baseline
    std::string signBaseline(const std::string& content) const;

    // TODO: перевірити підпис baseline перед аналізом
    bool checkBaselineSignature() const;

private:
    std::vector<unsigned char> secretKey_;
};
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

```cpp
// Тестові сценарії для вашої системи:
//   1. Зміна вмісту файлу
//   2. Видалення файлу
//   3. Додавання нового файлу
//   4. Зміна лише часу модифікації (touch)
//   5. Підміна самого baseline — має виявлятися через HMAC
//   6. Повернення старої версії файлу (replay attack)

void testScenarios() {
    // TODO: реалізуйте автоматичну перевірку кожного сценарію
}
```

**Критерії оцінювання:**
- Частина 1: 35 балів (базова функціональність)
- Частина 2: 25 балів (HMAC захист)
- Частина 3: 20 балів (інтеграція з OpenSSL)
- Частина 4: 20 балів (тестування атак)

---

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** Яким ключем створюється цифровий підпис?

- приватним ключем підписувача
- публічним ключем підписувача
- публічним ключем отримувача
- спільним симетричним ключем

**2.** Чому підписують не сам документ, а його хеш?

- RSA працює з числами, меншими за n, а документ може бути будь-якого розміру
- хеш неможливо підробити, а документ можна
- так підпис стає довшим і надійнішим
- інакше отримувач не зможе прочитати документ

**3.** Що таке стійкість до прообразу?

- маючи хеш h, неможливо знайти повідомлення M, для якого H(M) = h
- маючи M₁, неможливо знайти M₂ з тим самим хешем
- неможливо знайти жодної пари повідомлень з однаковим хешем
- зміна одного біта входу змінює половину бітів виходу

**4.** У чому полягає лавинний ефект?

- зміна одного біта входу змінює приблизно половину бітів хешу
- довжина хешу зростає разом із довжиною входу
- однакові входи завжди дають однаковий хеш
- обчислення хешу пришвидшується на довгих даних

**5.** Який розмір хешу дає SHA-256 і якими блоками вона обробляє дані?

- хеш 256 біт, блоки по 512 біт
- хеш 256 біт, блоки по 256 біт
- хеш 512 біт, блоки по 256 біт
- хеш 128 біт, блоки по 512 біт

**6.** Який статус має SHA-1 сьогодні?

- зламаний: 2017 року знайдено практичну колізію
- рекомендований для цифрових підписів
- безпечний, але повільний
- використовується лише для паролів

**7.** Як перевіряється підпис RSA?

- обчислюють h₁ = H(M) і h₂ = Sᵉ mod n та порівнюють їх
- обчислюють h₁ = H(M) і h₂ = Sᵈ mod n та порівнюють їх
- розшифровують документ приватним ключем автора
- порівнюють довжину підпису з довжиною хешу

**8.** Чому SHA-256 не підходить для зберігання паролів?

- вона надто швидка, і перебір на GPU стає практичним
- вона не має лавинного ефекту
- її хеш надто короткий для пароля
- вона вразлива до колізій

**9.** Що дозволяє атака Length Extension?

- обчислити H(повідомлення ‖ доповнення ‖ додаток), не знаючи самого повідомлення
- відновити повідомлення з його хешу
- знайти два різні повідомлення з однаковим хешем
- пришвидшити перебір паролів удвічі

**10.** Чим HMAC кращий за просте H(ключ ‖ повідомлення)?

- подвійне хешування робить його стійким до Length Extension
- він коротший і швидший
- він не потребує ключа взагалі
- він шифрує повідомлення, а не лише автентифікує

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
