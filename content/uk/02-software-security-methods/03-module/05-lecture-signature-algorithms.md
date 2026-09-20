---
title: "Алгоритми електронного цифрового підпису"
type: lecture
order: 5
preview: "DSA, ECDSA, RSA-підпис, український стандарт ДСТУ 4145."
---

## Огляд алгоритмів ЕЦП

```
┌─────────────────────────────────────────────────────────────────────┐
│                    АЛГОРИТМИ ЦИФРОВОГО ПІДПИСУ                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   На основі факторизації:                                           │
│   • RSA (PKCS#1)                                                    │
│                                                                     │
│   На основі дискретного логарифму:                                  │
│   • DSA (Digital Signature Algorithm)                               │
│   • Схема Шнорра                                                    │
│   • Ель-Гамаля                                                      │
│                                                                     │
│   На основі еліптичних кривих:                                      │
│   • ECDSA (Elliptic Curve DSA)                                      │
│   • EdDSA (Edwards-curve DSA)                                       │
│   • ДСТУ 4145 (Україна)                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## RSA-підпис (PKCS#1)

### Базова схема

Ми вже розглядали RSA-підпис на минулій лекції:

```
Підписання:   S = H(M)^d mod n
Перевірка:    H(M) =? S^e mod n
```

### Стандарт PKCS#1 v1.5

Простий підпис вразливий до атак. PKCS#1 додає **padding**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PKCS#1 v1.5 PADDING                              │
│                                                                     │
│   ┌────┬────┬────────────────┬────┬──────────────────────────────┐  │
│   │0x00│0x01│ 0xFF...0xFF    │0x00│    DigestInfo (ASN.1)        │  │
│   │    │    │ (padding)      │    │    + H(M)                    │  │
│   └────┴────┴────────────────┴────┴──────────────────────────────┘  │
│                                                                     │
│   DigestInfo = OID алгоритму хешування + хеш                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### RSA-PSS (Probabilistic Signature Scheme)

Сучасна рекомендована схема з випадковістю:

```cpp
// RSA-PSS засобами OpenSSL: детермінований підпис PKCS#1 v1.5
// поступається ймовірнісній схемі PSS, тому для нових систем беруть PSS.
#include <openssl/evp.h>
#include <openssl/rsa.h>
#include <vector>
#include <string>

std::vector<unsigned char> signPss(EVP_PKEY* privateKey, const std::string& message) {
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_PKEY_CTX* pkeyCtx = nullptr;

    EVP_DigestSignInit(ctx, &pkeyCtx, EVP_sha256(), nullptr, privateKey);
    EVP_PKEY_CTX_set_rsa_padding(pkeyCtx, RSA_PKCS1_PSS_PADDING);
    EVP_PKEY_CTX_set_rsa_pss_saltlen(pkeyCtx, RSA_PSS_SALTLEN_DIGEST);

    size_t length = 0;
    EVP_DigestSign(ctx, nullptr, &length,
                   reinterpret_cast<const unsigned char*>(message.data()), message.size());

    std::vector<unsigned char> signature(length);
    EVP_DigestSign(ctx, signature.data(), &length,
                   reinterpret_cast<const unsigned char*>(message.data()), message.size());
    signature.resize(length);

    EVP_MD_CTX_free(ctx);
    return signature;
}

bool verifyPss(EVP_PKEY* publicKey, const std::string& message,
               const std::vector<unsigned char>& signature) {
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_PKEY_CTX* pkeyCtx = nullptr;

    EVP_DigestVerifyInit(ctx, &pkeyCtx, EVP_sha256(), nullptr, publicKey);
    EVP_PKEY_CTX_set_rsa_padding(pkeyCtx, RSA_PKCS1_PSS_PADDING);
    EVP_PKEY_CTX_set_rsa_pss_saltlen(pkeyCtx, RSA_PSS_SALTLEN_DIGEST);

    bool ok = EVP_DigestVerify(ctx, signature.data(), signature.size(),
                               reinterpret_cast<const unsigned char*>(message.data()),
                               message.size()) == 1;
    EVP_MD_CTX_free(ctx);
    return ok;
}

// Ключ: EVP_PKEY* key = EVP_RSA_gen(2048);
```

## DSA (Digital Signature Algorithm)

### Історія

DSA розроблений NIST у 1991 році як частина стандарту **DSS** (Digital Signature Standard, FIPS 186). Базується на дискретному логарифмі.

### Параметри DSA

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПАРАМЕТРИ DSA                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   p — велике просте число (1024-3072 біт)                           │
│   q — просте число, дільник (p-1) (160-256 біт)                     │
│   g — генератор підгрупи порядку q                                  │
│                                                                     │
│   g = h^((p-1)/q) mod p, де h — будь-яке 1 < h < p-1                │
│                                                                     │
│   Приватний ключ: x (випадкове, 0 < x < q)                          │
│   Публічний ключ: y = g^x mod p                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Підписання DSA

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПІДПИСАННЯ DSA                                   │
│                                                                     │
│   Вхід: повідомлення M, приватний ключ x                            │
│                                                                     │
│   1. Обчислити хеш: h = H(M)                                        │
│                                                                     │
│   2. Обрати випадкове k: 0 < k < q                                  │
│      (КРИТИЧНО: k має бути унікальним для кожного підпису!)         │
│                                                                     │
│   3. Обчислити r:                                                   │
│      r = (g^k mod p) mod q                                          │
│      Якщо r = 0, повернутися до кроку 2                             │
│                                                                     │
│   4. Обчислити s:                                                   │
│      s = k^(-1) × (h + x×r) mod q                                   │
│      Якщо s = 0, повернутися до кроку 2                             │
│                                                                     │
│   Підпис: (r, s)                                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Перевірка DSA

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ПЕРЕВІРКА DSA                                    │
│                                                                     │
│   Вхід: повідомлення M, підпис (r, s), публічний ключ y             │
│                                                                     │
│   1. Перевірити: 0 < r < q та 0 < s < q                             │
│                                                                     │
│   2. Обчислити хеш: h = H(M)                                        │
│                                                                     │
│   3. Обчислити w = s^(-1) mod q                                     │
│                                                                     │
│   4. Обчислити:                                                     │
│      u₁ = h × w mod q                                               │
│      u₂ = r × w mod q                                               │
│                                                                     │
│   5. Обчислити v:                                                   │
│      v = (g^u₁ × y^u₂ mod p) mod q                                  │
│                                                                     │
│   6. Підпис дійсний, якщо v = r                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Критичність k

**УВАГА**: Повторне використання k повністю компрометує приватний ключ!

```
Якщо k однакове для двох підписів (r₁,s₁) та (r₂,s₂):

r₁ = r₂ = r

s₁ = k⁻¹(h₁ + xr) mod q
s₂ = k⁻¹(h₂ + xr) mod q

s₁ - s₂ = k⁻¹(h₁ - h₂) mod q

k = (h₁ - h₂)/(s₁ - s₂) mod q

x = (s₁k - h₁)/r mod q

→ Приватний ключ x розкрито!
```

**Реальний приклад**: у 2010 році Sony використовувала фіксоване k для підпису PS3 firmware → приватний ключ викрадено.

## ECDSA (Elliptic Curve DSA)

### Еліптичні криві

**Еліптична крива** — множина точок (x, y), що задовольняють рівняння:

```
y² = x³ + ax + b  (mod p)
```

```
                y
                │     ╭──────╮
                │    ╱        ╲
                │   │          │
                │   │    P     │
                ├───┼────●─────┼───── x
                │   │          │
                │    ╲        ╱
                │     ╰──────╯
                │
```

### Операції на еліптичних кривих

**Додавання точок**: P + Q = R

```
     y│
      │         R'
      │         ●
      │        ╱
      │    P  ╱
      │    ●─╱───●Q
      ├─────╱────────── x
      │    ╱
      │   ●R
      │
```

Пряма через P та Q перетинає криву в R', відображення якої відносно осі x дає R.

**Множення на скаляр**: k × P = P + P + ... + P (k разів)

### Переваги ECC

```
┌────────────────────────────────────────────────────────────────────┐
│                    ЕКВІВАЛЕНТНА БЕЗПЕКА                            │
├────────────────────────┬───────────────────┬───────────────────────┤
│ Рівень безпеки (біт)   │ RSA/DSA (біт)     │ ECC (біт)             │
├────────────────────────┼───────────────────┼───────────────────────┤
│ 80                     │ 1024              │ 160                   │
├────────────────────────┼───────────────────┼───────────────────────┤
│ 112                    │ 2048              │ 224                   │
├────────────────────────┼───────────────────┼───────────────────────┤
│ 128                    │ 3072              │ 256                   │
├────────────────────────┼───────────────────┼───────────────────────┤
│ 192                    │ 7680              │ 384                   │
├────────────────────────┼───────────────────┼───────────────────────┤
│ 256                    │ 15360             │ 521                   │
└────────────────────────┴───────────────────┴───────────────────────┘
```

**ECC у 10-15 разів коротші ключі** при тій самій безпеці!

### Стандартні криві

- **NIST P-256** (secp256r1) — найпоширеніша
- **secp256k1** — Bitcoin
- **Curve25519** — сучасна, швидка (X25519 для ECDH, Ed25519 для підпису)

### ECDSA підписання

```cpp
// ECDSA на кривій P-256: той самий рівень стійкості, що й RSA-3072,
// але ключ у 12 разів коротший
#include <openssl/evp.h>
#include <openssl/ec.h>
#include <vector>
#include <string>

EVP_PKEY* generateEcKey() {
    return EVP_EC_gen("P-256");        // крива SECP256R1
}

std::vector<unsigned char> signEcdsa(EVP_PKEY* privateKey, const std::string& message) {
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_DigestSignInit(ctx, nullptr, EVP_sha256(), nullptr, privateKey);

    size_t length = 0;
    EVP_DigestSign(ctx, nullptr, &length,
                   reinterpret_cast<const unsigned char*>(message.data()), message.size());

    std::vector<unsigned char> signature(length);
    EVP_DigestSign(ctx, signature.data(), &length,
                   reinterpret_cast<const unsigned char*>(message.data()), message.size());
    signature.resize(length);

    EVP_MD_CTX_free(ctx);
    return signature;
}

bool verifyEcdsa(EVP_PKEY* publicKey, const std::string& message,
                 const std::vector<unsigned char>& signature) {
    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_DigestVerifyInit(ctx, nullptr, EVP_sha256(), nullptr, publicKey);

    bool ok = EVP_DigestVerify(ctx, signature.data(), signature.size(),
                               reinterpret_cast<const unsigned char*>(message.data()),
                               message.size()) == 1;
    EVP_MD_CTX_free(ctx);
    return ok;
}
```

### Застосування ECDSA

- **Bitcoin/Ethereum** — всі транзакції підписуються ECDSA (secp256k1)
- **TLS/HTTPS** — сертифікати веб-сайтів
- **SSH** — автентифікація
- **Смарт-карти** — завдяки коротким ключам

## Український стандарт ДСТУ 4145

### Особливості

ДСТУ 4145-2002 "Інформаційні технології. Криптографічний захист інформації. Цифровий підпис, що ґрунтується на еліптичних кривих" — український національний стандарт.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ДСТУ 4145                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Еліптичні криві над полем GF(2^m)                                 │
│   (бінарні поля, на відміну від простих у NIST)                     │
│                                                                     │
│   Рівняння кривої: y² + xy = x³ + ax² + b                           │
│                                                                     │
│   Підтримувані розміри: 163, 167, 173, 179, 191, 233, 257,          │
│                         307, 367, 431 біт                           │
│                                                                     │
│   Хеш-функція: ГОСТ 34.311-95 (подібна до SHA-1)                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Кваліфікований електронний підпис (КЕП)

В Україні КЕП має юридичну силу власноручного підпису:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ІНФРАСТРУКТУРА КЕП В УКРАЇНІ                     │
│                                                                     │
│   Користувач                                                        │
│       │                                                             │
│       │ Отримує сертифікат                                          │
│       ▼                                                             │
│   ┌─────────────────┐                                               │
│   │ АЦСК            │ Акредитований центр сертифікації ключів       │
│   │ (ПриватБанк,    │ • Ідентифікує особу                           │
│   │  Дія, ІІТ...)   │ • Видає сертифікат                            │
│   └────────┬────────┘                                               │
│            │                                                        │
│            │ Реєстрація                                             │
│            ▼                                                        │
│   ┌─────────────────┐                                               │
│   │ ЦЗО             │ Центральний засвідчувальний орган             │
│   │ (Мін'юст)       │ • Акредитує АЦСК                              │
│   │                 │ • Веде реєстр сертифікатів                    │
│   └─────────────────┘                                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Формат сертифіката X.509

```
┌─────────────────────────────────────────────────────────────────────┐
│                    СЕРТИФІКАТ X.509                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Версія: 3                                                         │
│   Серійний номер: 12345678                                          │
│   Алгоритм підпису: ДСТУ 4145 / SHA-256                             │
│                                                                     │
│   Видавець (Issuer):                                                │
│     CN = АЦСК ПриватБанку                                           │
│     O = ПриватБанк                                                  │
│     C = UA                                                          │
│                                                                     │
│   Термін дії:                                                       │
│     Від: 2024-01-01                                                 │
│     До: 2026-01-01                                                  │
│                                                                     │
│   Суб'єкт (Subject):                                                │
│     CN = Іваненко Іван Іванович                                     │
│     Serial = 1234567890 (РНОКПП)                                    │
│                                                                     │
│   Публічний ключ: (координати точки на кривій)                      │
│                                                                     │
│   Підпис видавця: (ДСТУ 4145)                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Порівняння алгоритмів

```
┌────────────────────────────────────────────────────────────────────┐
│                    ПОРІВНЯННЯ АЛГОРИТМІВ ЕЦП                       │
├──────────┬──────────┬────────────┬─────────────┬───────────────────┤
│ Алгоритм │ Основа   │ Ключ (біт) │ Підпис(біт) │ Швидкість         │
├──────────┼──────────┼────────────┼─────────────┼───────────────────┤
│ RSA-2048 │ Фактор.  │ 2048       │ 2048        │ Перевірка швидша  │
├──────────┼──────────┼────────────┼─────────────┼───────────────────┤
│ DSA      │ Дискр.лог│ 2048/256   │ 512         │ Середня           │
├──────────┼──────────┼────────────┼─────────────┼───────────────────┤
│ ECDSA    │ Еліпт.кр.│ 256        │ 512         │ Швидка            │
│ P-256    │          │            │             │                   │
├──────────┼──────────┼────────────┼─────────────┼───────────────────┤
│ Ed25519  │ Еліпт.кр.│ 256        │ 512         │ Дуже швидка       │
├──────────┼──────────┼────────────┼─────────────┼───────────────────┤
│ ДСТУ4145 │ Еліпт.кр.│ 256-431    │ 512-862     │ Середня           │
│          │ GF(2^m)  │            │             │                   │
└──────────┴──────────┴────────────┴─────────────┴───────────────────┘
```

## Практичні завдання

### Завдання 1

Поясніть, чому повторне використання k у DSA/ECDSA призводить до компрометації ключа.

### Завдання 2

Порівняйте розміри ключів RSA-3072 та ECDSA P-256 для однакового рівня безпеки.

### Завдання 3

Чим відрізняється ДСТУ 4145 від ECDSA на кривих NIST?

## 💼 Real World

### Алгоритми ЕЦП в індустрії

```
┌────────────────────────────────────────────────────────────────────┐
│                    ЕЦП У РЕАЛЬНИХ СИСТЕМАХ                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  TLS/HTTPS СЕРТИФІКАТИ:                                            │
│  ├── RSA-2048/3072 — досі 70%+ сертифікатів                        │
│  ├── ECDSA P-256 — зростає популярність (Google, Cloudflare)       │
│  ├── Ed25519 — ще не підтримується браузерами для TLS              │
│  └── Let's Encrypt: 300M+ сертифікатів (RSA за замовчуванням)      │
│                                                                    │
│  КРИПТОВАЛЮТИ:                                                     │
│  ├── Bitcoin — ECDSA secp256k1 для всіх транзакцій                 │
│  ├── Ethereum — ECDSA secp256k1 + планує BLS signatures            │
│  ├── Solana — Ed25519 (швидкість критична)                         │
│  └── Cardano — Ed25519                                             │
│                                                                    │
│  SSH АВТЕНТИФІКАЦІЯ:                                               │
│  ├── Ed25519 — рекомендований (ssh-keygen -t ed25519)              │
│  ├── ECDSA — підтримується, але менш бажаний                       │
│  ├── RSA-4096 — legacy, все ще широко використовується             │
│  └── DSA — deprecated, вимкнений за замовчуванням                  │
│                                                                    │
│  УКРАЇНСЬКА PKI:                                                   │
│  ├── ДСТУ 4145 — обов'язковий для КЕП                              │
│  ├── АЦСК ПриватБанку — 15+ млн КЕП                                │
│  ├── Дія.Підпис — КЕП через смартфон                               │
│  └── Prozorro — електронні тендери з ДСТУ 4145                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### Приклад: Sony PlayStation 3 Hack (2010)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ECDSA IMPLEMENTATION FAILURE                     │
│                                                                     │
│   Помилка Sony:                                                     │
│   • Використовували ECDSA для підпису firmware                      │
│   • Замість випадкового k використали ФІКСОВАНЕ значення            │
│   • k має бути унікальним для КОЖНОГО підпису!                      │
│                                                                     │
│   Математика атаки:                                                 │
│                                                                     │
│   Підпис 1: (r₁, s₁) де s₁ = k⁻¹(H(m₁) + xr₁)                       │
│   Підпис 2: (r₂, s₂) де s₂ = k⁻¹(H(m₂) + xr₂)                       │
│                                                                     │
│   Якщо k₁ = k₂ = k:                                                 │
│   r₁ = r₂ (бо r = (k×G).x mod n)                                    │
│                                                                     │
│   s₁ - s₂ = k⁻¹(H(m₁) - H(m₂))                                      │
│   k = (H(m₁) - H(m₂)) / (s₁ - s₂)                                   │
│                                                                     │
│   x = (s₁×k - H(m₁)) / r₁                                           │
│                                                                     │
│   → Приватний ключ Sony розкрито!                                   │
│   → Homebrew software на PS3                                        │
│   → $170M втрат для Sony                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Let's Encrypt та ACME

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LET'S ENCRYPT WORKFLOW                           │
│                                                                     │
│   1. Клієнт (certbot) генерує CSR з публічним ключем                │
│                                                                     │
│   2. ACME Challenge (доведення володіння доменом):                  │
│      ├── HTTP-01: файл на /.well-known/acme-challenge/              │
│      ├── DNS-01: TXT запис в DNS                                    │
│      └── TLS-ALPN-01: спеціальний TLS сертифікат                    │
│                                                                     │
│   3. Let's Encrypt підписує сертифікат:                             │
│      ├── RSA-2048 або ECDSA P-256 (вибір клієнта)                   │
│      └── Сертифікат підписаний ланцюжком до ISRG Root X1            │
│                                                                     │
│   4. Автоматичне поновлення кожні 60-90 днів                        │
│                                                                     │
│   Статистика (2024):                                                │
│   • 300+ мільйонів активних сертифікатів                            │
│   • 250+ мільйонів доменів                                          │
│   • Безкоштовно та автоматизовано                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Career Spotlight

### Спеціалізації з цифрового підпису

```
┌────────────────────────────────────────────────────────────────────┐
│                    КАР'ЄРНІ МОЖЛИВОСТІ                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SECURITY ARCHITECT (PKI/Digital Identity)                         │
│  ├── Зарплата: $150,000 - $220,000 (США)                           │
│  ├── Зарплата: €90,000 - €140,000 (Європа)                         │
│  ├── Завдання:                                                     │
│  │   • Проектування PKI архітектури                                │
│  │   • Вибір алгоритмів (RSA vs ECDSA vs Ed25519)                  │
│  │   • Compliance (eIDAS, ДСТУ, PCI DSS)                           │
│  └── Компанії: DigiCert, Entrust, Thales, банки                    │
│                                                                    │
│  CRYPTOGRAPHY ENGINEER                                             │
│  ├── Зарплата: $140,000 - $200,000 (США)                           │
│  ├── Вимоги:                                                       │
│  │   • PhD або MS в криптографії/математиці                        │
│  │   • Публікації на CRYPTO, EUROCRYPT, IACR                       │
│  │   • Досвід з post-quantum algorithms                            │
│  └── Компанії: Google, Apple, Microsoft, AWS                       │
│                                                                    │
│  BLOCKCHAIN SECURITY SPECIALIST                                    │
│  ├── Зарплата: $130,000 - $250,000 (США)                           │
│  ├── Завдання:                                                     │
│  │   • Аудит смарт-контрактів                                      │
│  │   • Аналіз ECDSA реалізацій                                     │
│  │   • Дослідження Schnorr/BLS signatures                          │
│  └── Компанії: Chainalysis, Trail of Bits, OpenZeppelin            │
│                                                                    │
│  КЕП/ЕЦП СПЕЦІАЛІСТ (Україна)                                      │
│  ├── Зарплата: $30,000 - $60,000 (Україна)                         │
│  ├── Завдання:                                                     │
│  │   • Впровадження КЕП в організаціях                             │
│  │   • Інтеграція з Дія.Підпис                                     │
│  │   • Робота з ДСТУ 4145                                          │
│  └── Компанії: ІІТ, державні установи, банки                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📚 Resources

### Онлайн-практика

| Ресурс | Опис | Рівень |
|--------|------|--------|
| **CryptoHack.org** | ECDSA challenges, curve attacks | Середній-Експерт |
| **Cryptopals Set 6** | DSA parameter attacks | Експерт |
| **HackTheBox** | Криптографічні машини | Середній |
| **RootMe** | Challenges з ЕЦП | Початковий-Середній |

### Специфікації

- **FIPS 186-5** — Digital Signature Standard (DSS)
- **RFC 6979** — Deterministic ECDSA (захист від Sony-подібних атак)
- **RFC 8032** — Ed25519 та Ed448
- **ДСТУ 4145-2002** — Український стандарт ЕЦП

---

## 📋 Cheat Sheet

### Алгоритми підпису

```
┌────────────────────────────────────────────────────────────────────┐
│                    SIGNATURE ALGORITHMS CHEAT SHEET                │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  АЛГОРИТМ  │ КЛЮЧ      │ ПІДПИС    │ БЕЗПЕКА  │ ШВИДКІСТЬ          │
│  ──────────┼───────────┼───────────┼──────────┼─────────────────── │
│  RSA-2048  │ 2048 біт  │ 2048 біт  │ 112 біт  │ Повільний          │
│  RSA-3072  │ 3072 біт  │ 3072 біт  │ 128 біт  │ Повільний          │
│  DSA       │ 2048/256  │ 512 біт   │ 112 біт  │ Середній           │
│  ECDSA-256 │ 256 біт   │ 512 біт   │ 128 біт  │ Швидкий            │
│  ECDSA-384 │ 384 біт   │ 768 біт   │ 192 біт  │ Швидкий            │
│  Ed25519   │ 256 біт   │ 512 біт   │ 128 біт  │ Дуже швидкий       │
│  Ed448     │ 448 біт   │ 896 біт   │ 224 біт  │ Швидкий            │
│                                                                    │
│  РЕКОМЕНДАЦІЇ:                                                     │
│  • Нові системи: Ed25519 або ECDSA P-256                           │
│  • Legacy/сумісність: RSA-3072+                                    │
│  • Україна (КЕП): ДСТУ 4145                                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### OpenSSL команди

```bash
# ===== ECDSA =====
# Генерація ключа P-256
openssl ecparam -genkey -name prime256v1 -out ec_private.pem

# Перегляд ключа
openssl ec -in ec_private.pem -text -noout

# Витяг публічного ключа
openssl ec -in ec_private.pem -pubout -out ec_public.pem

# Підпис файлу
openssl dgst -sha256 -sign ec_private.pem -out signature.bin document.txt

# Перевірка підпису
openssl dgst -sha256 -verify ec_public.pem -signature signature.bin document.txt

# ===== Ed25519 =====
# Генерація ключа
openssl genpkey -algorithm Ed25519 -out ed25519_private.pem

# Витяг публічного
openssl pkey -in ed25519_private.pem -pubout -out ed25519_public.pem

# Підпис (Ed25519 не вимагає окремого хешу)
openssl pkeyutl -sign -inkey ed25519_private.pem -in document.txt -out sig.bin

# Перевірка
openssl pkeyutl -verify -pubin -inkey ed25519_public.pem -in document.txt -sigfile sig.bin

# ===== DSA =====
# Генерація параметрів та ключа
openssl dsaparam -genkey 2048 -out dsa_private.pem

# ===== X.509 Сертифікат з ECDSA =====
openssl req -new -x509 -key ec_private.pem -sha256 -days 365 \
    -subj "/CN=example.com" -out certificate.pem
```

### Стисла довідка: OpenSSL

```cpp
// Стисла довідка: підписи в OpenSSL
#include <openssl/evp.h>
#include <openssl/pem.h>

// ===== Генерація ключів =====
EVP_PKEY* rsaKey = EVP_RSA_gen(2048);       // RSA-2048
EVP_PKEY* ecKey  = EVP_EC_gen("P-256");     // ECDSA P-256
EVP_PKEY* edKey  = EVP_PKEY_Q_keygen(nullptr, nullptr, "ED25519");  // Ed25519

// ===== Підпис і перевірка =====
// EVP_DigestSignInit / EVP_DigestSign — формування підпису
// EVP_DigestVerifyInit / EVP_DigestVerify — перевірка
// Для Ed25519 хеш-функцію не вказують: вона вбудована в схему

// ===== Збереження ключів у форматі PEM =====
BIO* out = BIO_new_file("private.pem", "w");
PEM_write_bio_PrivateKey(out, rsaKey, nullptr, nullptr, 0, nullptr, nullptr);
BIO_free(out);

BIO* pub = BIO_new_file("public.pem", "w");
PEM_write_bio_PUBKEY(pub, rsaKey, nullptr);
BIO_free(pub);
```

### SSH ключі

```bash
# Ed25519 (рекомендовано)
ssh-keygen -t ed25519 -C "user@example.com"

# ECDSA
ssh-keygen -t ecdsa -b 256 -C "user@example.com"

# RSA (legacy)
ssh-keygen -t rsa -b 4096 -C "user@example.com"

# Перетворення OpenSSH -> PEM
ssh-keygen -p -m PEM -f ~/.ssh/id_ed25519
```

---

## 🎯 Міні-проект (30 хв)

### Завдання: Порівняйте алгоритми підпису — RSA vs ECDSA vs Ed25519

Виміряйте продуктивність різних алгоритмів та зрозумійте, чому Ed25519 став таким популярним!

**Кроки:**

1. Створіть бенчмарк-скрипт:
```bash
mkdir -p ~/sig-benchmark && cd ~/sig-benchmark
nano benchmark.sh
```

```bash
#!/bin/bash
# Digital Signature Algorithm Benchmark

echo "🔑 Generating keys..."
echo ""

echo "RSA-2048:"
time openssl genrsa -out rsa.pem 2048 2>/dev/null
echo ""

echo "ECDSA P-256:"
time openssl ecparam -genkey -name prime256v1 -out ecdsa.pem 2>/dev/null
echo ""

echo "Ed25519:"
time openssl genpkey -algorithm Ed25519 -out ed25519.pem 2>/dev/null
echo ""

# Створити тестовий файл
dd if=/dev/urandom of=testfile.bin bs=1K count=10 2>/dev/null

echo "✍️  Signing benchmark (100 iterations)..."
echo ""

echo "RSA-2048 signing:"
time for i in $(seq 1 100); do
    openssl dgst -sha256 -sign rsa.pem testfile.bin > /dev/null
done
echo ""

echo "ECDSA P-256 signing:"
time for i in $(seq 1 100); do
    openssl dgst -sha256 -sign ecdsa.pem testfile.bin > /dev/null
done
echo ""

echo "Ed25519 signing:"
time for i in $(seq 1 100); do
    openssl pkeyutl -sign -inkey ed25519.pem -rawin -in testfile.bin > /dev/null 2>&1
done
echo ""

echo "📊 Summary:"
echo "- RSA-2048: найповільніший, але найсумісніший"
echo "- ECDSA: швидший, менші ключі (32 байти vs 256)"
echo "- Ed25519: найшвидший, найбезпечніший дизайн"
```

2. Запустіть та проаналізуйте:
```bash
chmod +x benchmark.sh
./benchmark.sh
```

3. Перевірте розміри ключів:
```bash
echo "Key sizes:"
wc -c *.pem
openssl rsa -in rsa.pem -pubout 2>/dev/null | wc -c
openssl ec -in ecdsa.pem -pubout 2>/dev/null | wc -c
openssl pkey -in ed25519.pem -pubout 2>/dev/null | wc -c
```

**Очікуваний результат:**
- Порівняння часу генерації ключів
- Порівняння часу підписання
- Розуміння trade-offs між алгоритмами

**Бонус (для допитливих):**
- Запустіть `openssl speed rsa2048 ecdsap256 ed25519` для офіційного бенчмарку
- Дослідіть чому GitHub, Signal використовують Ed25519
- Перегляньте сертифікат реального сайту: `openssl s_client -connect github.com:443 < /dev/null 2>/dev/null | openssl x509 -text | grep "Signature Algorithm"`

---

## 🔧 Розширене практичне завдання (для лабораторної)

### Завдання: Порівняльний аналіз алгоритмів ЕЦП

**Мета:** Практично дослідити різні алгоритми підпису, їх швидкість та особливості.

**Частина 1: Бенчмарк алгоритмів (C++)**

```cpp
// Завдання: порівняйте швидкодію RSA, ECDSA та Ed25519.
//
// Виміряйте час:
//   1. Генерації ключової пари
//   2. Формування підпису
//   3. Перевірки підпису
// Для повідомлень різного розміру: 32 Б, 1 КБ, 1 МБ, 100 МБ.

#include <chrono>
#include <string>

// TODO: виміряти RSA-2048 і RSA-4096 (доповнення PSS)
void benchmarkRsa(const std::string& message, int iterations = 100);

// TODO: виміряти ECDSA на кривих P-256 і P-384
void benchmarkEcdsa(const std::string& message, int iterations = 100);

// TODO: виміряти Ed25519
void benchmarkEd25519(const std::string& message, int iterations = 100);

// TODO: звести результати в таблицю та пояснити,
// чому перевірка RSA швидша за підпис, а в ECDSA — навпаки
void printComparisonTable();
```

**Частина 2: Демонстрація атаки на DSA/ECDSA**

```cpp
// Завдання: продемонструйте атаку на повторне використання k у ECDSA.
//
//   1. Реалізуйте спрощений варіант ECDSA
//   2. Підпишіть два різні повідомлення з тим самим k
//   3. Відновіть закритий ключ із двох підписів

#include <string>
#include <utility>

using u64 = unsigned long long;

// TODO: спрощений підпис ECDSA
//   r = (k * G).x mod n
//   s = k^-1 * (hash(m) + r * privateKey) mod n
std::pair<u64, u64> simpleEcdsaSign(const std::string& message, u64 privateKey, u64 k);

// TODO: відновлення закритого ключа за двома підписами з однаковим k.
// Якщо r1 == r2, то k однаковий, і тоді:
//   k = (hash(m1) - hash(m2)) * (s1 - s2)^-1 mod n
//   privateKey = (s1 * k - hash(m1)) * r^-1 mod n
u64 recoverPrivateKey(const std::string& m1, std::pair<u64, u64> sig1,
                      const std::string& m2, std::pair<u64, u64> sig2);

// Саме через цю вразливість було зламано підписи PlayStation 3:
// Sony використовувала однакове k для всіх підписів
```

**Частина 3: Робота з X.509 сертифікатами**

```cpp
// Завдання: створіть і проаналізуйте сертифікати з різними алгоритмами

#include <openssl/x509.h>
#include <openssl/evp.h>
#include <string>

// TODO: створіть самопідписаний сертифікат із ключем:
//   - RSA-2048
//   - ECDSA P-256
//   - Ed25519
// Виведіть відомості про сертифікат: суб'єкт, видавця, алгоритм, термін дії
X509* createSelfSignedCert(const std::string& algorithm);

// TODO: завантажте сертифікат реального сайту (openssl s_client -connect)
// і проаналізуйте:
//   - алгоритм підпису
//   - довжину ключа
//   - термін дії
//   - ланцюжок сертифікації
void analyzeRealCert(const std::string& domain);
```

**Частина 4: OpenSSL скрипт**

```bash
#!/bin/bash
# compare_algorithms.sh

# TODO: Створіть bash-скрипт для порівняння алгоритмів через OpenSSL

# 1. Генерація ключів різних типів
generate_keys() {
    echo "Generating RSA-2048..."
    time openssl genrsa -out rsa2048.pem 2048

    echo "Generating RSA-4096..."
    time openssl genrsa -out rsa4096.pem 4096

    echo "Generating ECDSA P-256..."
    time openssl ecparam -genkey -name prime256v1 -out ecdsa256.pem

    echo "Generating Ed25519..."
    time openssl genpkey -algorithm Ed25519 -out ed25519.pem
}

# 2. Бенчмарк підписання
benchmark_signing() {
    local file=$1
    local iterations=$2

    echo "=== Benchmarking signing of $file ==="

    echo "RSA-2048:"
    time for i in $(seq 1 $iterations); do
        openssl dgst -sha256 -sign rsa2048.pem $file > /dev/null
    done

    echo "ECDSA P-256:"
    time for i in $(seq 1 $iterations); do
        openssl dgst -sha256 -sign ecdsa256.pem $file > /dev/null
    done

    echo "Ed25519:"
    time for i in $(seq 1 $iterations); do
        openssl pkeyutl -sign -inkey ed25519.pem -in $file > /dev/null 2>&1
    done
}

# 3. Вбудований бенчмарк OpenSSL
openssl_speed_test() {
    openssl speed rsa2048 rsa4096 ecdsap256 ed25519
}

# Запуск
generate_keys
dd if=/dev/urandom of=testfile.bin bs=1K count=1
benchmark_signing testfile.bin 100
openssl_speed_test
```

**Критерії оцінювання:**
- Частина 1: 30 балів (бенчмарки)
- Частина 2: 25 балів (демонстрація атаки)
- Частина 3: 25 балів (сертифікати)
- Частина 4: 20 балів (OpenSSL скрипт)

---

## Тест для самоперевірки

Десять запитань, у кожному одна правильна відповідь. Якщо тема винесена вашій групі на самостійне опрацювання, цей самий тест публікується в Google Classroom — 10 балів, по одному за кожне запитання.

**1.** На складності якої задачі ґрунтується DSA?

- дискретного логарифма
- факторизації великих чисел
- пошуку колізій хеш-функції
- дискретного логарифма на еліптичній кривій

**2.** Що додає до RSA-підпису стандарт PKCS#1 v1.5?

- доповнення з DigestInfo: ідентифікатор хеш-алгоритму разом із хешем
- другий приватний ключ для подвійного підпису
- стиснення документа перед підписанням
- мітку часу від центру сертифікації

**3.** Що є підписом у DSA?

- пара чисел (r, s)
- одне число S = H(M)ᵈ mod n
- точка на еліптичній кривій
- хеш документа, зашифрований відкритим ключем

**4.** Яку вимогу висувають до випадкового k під час підписання DSA?

- воно має бути унікальним для кожного підпису
- воно має бути однаковим для всіх підписів одного ключа
- воно має дорівнювати хешу повідомлення
- воно має бути більшим за модуль p

**5.** Які довжини ключів дають рівень безпеки 128 біт?

- RSA 3072 біт і ECC 256 біт
- RSA 2048 біт і ECC 224 біт
- RSA 1024 біт і ECC 160 біт
- RSA 7680 біт і ECC 384 біт

**6.** Над яким полем будується український стандарт ДСТУ 4145?

- над бінарним полем GF(2^m)
- над простим полем GF(p), як у NIST
- над кільцем лишків Z_n
- над полем дійсних чисел

**7.** Яку хеш-функцію передбачає ДСТУ 4145?

- ГОСТ 34.311-95
- SHA-256
- SHA-3
- MD5

**8.** Хто акредитує АЦСК в інфраструктурі КЕП України?

- центральний засвідчувальний орган при Мін'юсті
- Національний банк України
- кожен АЦСК акредитує себе сам
- застосунок «Дія»

**9.** Яку проблему розв'язує RFC 6979?

- генерує k детерміновано з приватного ключа й хешу повідомлення
- задає новий формат сертифіката замість X.509
- стискає підпис удвічі
- прискорює перевірку підпису на слабких пристроях

**10.** Чим BLS-підписи корисні для Ethereum 2.0?

- кілька підписів агрегуються в один фіксованого розміру
- вони вдвічі коротші за ECDSA
- вони не потребують приватного ключа
- вони стійкі до квантового комп'ютера

## Підсумок

| Термін | Визначення |
|--------|------------|
| **DSA** | Digital Signature Algorithm, стандарт FIPS 186 |
| **ECDSA** | DSA на еліптичних кривих |
| **Ed25519** | Сучасний швидкий алгоритм на кривій Curve25519 |
| **ДСТУ 4145** | Український стандарт ЕЦП на бінарних кривих |
| **X.509** | Стандарт формату сертифікатів |
| **КЕП** | Кваліфікований електронний підпис |

**Для нових систем рекомендуються Ed25519 або ECDSA P-256.**

На наступній лекції розглянемо ідентифікацію, аутентифікацію та найпоширеніші загрози інформаційній безпеці.
