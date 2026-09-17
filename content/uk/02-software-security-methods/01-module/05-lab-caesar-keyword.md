---
title: "Шифр Цезаря з ключовим словом. Афінний шифр"
type: lab
order: 5
labNumber: 2
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим C++ компілятором або Python 3"
  - "Середовище розробки (Visual Studio, VS Code)"
preview: "Реалізація афінної системи та шифру з ключовим словом."
---

**Мета:** вивчити принципи шифрування методом Цезаря з ключовим словом та афінної системи підстановки. Реалізувати алгоритми програмно.

**Обладнання:** ПК з встановленим C++ компілятором або Python 3; Середовище розробки (Visual Studio, VS Code).

**Тривалість:** 2 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 3: Афінна система підстановок. Шифр Цезаря з ключовим словом |
| **Навички** | Модульна арифметика, обернений елемент за модулем |
| **Середовище** | ПК з встановленим C++ компілятором або Python 3 |

## Теоретичні відомості

### 1 Шифр Цезаря з ключовим словом

Замість фіксованого зсуву, створюється новий алфавіт на основі ключового слова.

**Алгоритм формування алфавіту:**

1. Видалити повторювані літери з ключа
2. Записати ключ на початку
3. Дописати решту літер алфавіту

```
Ключове слово: CIPHER
Алфавіт:       CIPHERABDFGJKLMNOQSTUVWXYZ

Відкритий:   A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
Шифрований:  C I P H E R A B D F G J K L M N O Q S T U V W X Y Z
```
### 2 Афінний шифр

**Формула шифрування:**

```
C = (a·P + b) mod n
```
де:

- P — числовий код відкритої літери (A=0, B=1, ...)
- C — числовий код шифрованої літери
- a, b — ключі шифру
- n — розмір алфавіту (26 для англійського)

**Формула дешифрування:**

```
P = a⁻¹·(C - b) mod n
```
де a⁻¹ — мультиплікативний обернений елемент a за модулем n.

**Вимога**: gcd(a, n) = 1 (a і n взаємно прості).

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ДОПУСТИМІ ЗНАЧЕННЯ a (mod 26)                      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  gcd(a, 26) = 1 для: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25       │
│                                                                       │
│  Всього: 12 допустимих значень (φ(26) = 12)                           │
│  Загальна кількість ключів: 12 × 26 = 312                             │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 3 Обернений елемент за модулем

Для знаходження a⁻¹ використовується розширений алгоритм Евкліда:

```
a⁻¹ mod n — це таке x, що a·x ≡ 1 (mod n)

Приклад: a=5, n=26
5·x ≡ 1 (mod 26)
5·21 = 105 = 4·26 + 1 = 1 (mod 26)
Отже, 5⁻¹ mod 26 = 21
```
## Приклад виконання

### Крок 1. Шифр з ключовим словом (Python)

```python
def create_keyword_alphabet(keyword: str) -> str:
    """Створює алфавіт з ключовим словом."""
    # Видаляємо повтори з ключа
    seen = set()
    key_chars = []
    for c in keyword.upper():
        if c.isalpha() and c not in seen:
            seen.add(c)
            key_chars.append(c)

    # Додаємо решту літер
    for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
        if c not in seen:
            key_chars.append(c)

    return ''.join(key_chars)

def keyword_cipher_encrypt(plaintext: str, keyword: str) -> str:
    """Шифрування шифром з ключовим словом."""
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    cipher_alphabet = create_keyword_alphabet(keyword)

    result = []
    for c in plaintext.upper():
        if c.isalpha():
            idx = alphabet.index(c)
            result.append(cipher_alphabet[idx])
        else:
            result.append(c)

    return ''.join(result)

def keyword_cipher_decrypt(ciphertext: str, keyword: str) -> str:
    """Дешифрування шифром з ключовим словом."""
    alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    cipher_alphabet = create_keyword_alphabet(keyword)

    result = []
    for c in ciphertext.upper():
        if c.isalpha():
            idx = cipher_alphabet.index(c)
            result.append(alphabet[idx])
        else:
            result.append(c)

    return ''.join(result)

# Демонстрація
keyword = "CIPHER"
plaintext = "HELLO WORLD"

print(f"Ключове слово: {keyword}")
print(f"Алфавіт: {create_keyword_alphabet(keyword)}")
print(f"Відкритий текст: {plaintext}")

ciphertext = keyword_cipher_encrypt(plaintext, keyword)
print(f"Шифротекст: {ciphertext}")

decrypted = keyword_cipher_decrypt(ciphertext, keyword)
print(f"Розшифровано: {decrypted}")
```
### Крок 2. Афінний шифр

```python
def gcd(a: int, b: int) -> int:
    """НСД (алгоритм Евкліда)."""
    while b:
        a, b = b, a % b
    return a

def mod_inverse(a: int, n: int) -> int:
    """Обернений елемент a⁻¹ mod n."""
    # Розширений алгоритм Евкліда
    old_r, r = a, n
    old_s, s = 1, 0

    while r != 0:
        q = old_r // r
        old_r, r = r, old_r - q * r
        old_s, s = s, old_s - q * s

    if old_r != 1:
        raise ValueError(f"Обернений не існує: gcd({a}, {n}) = {old_r}")

    return old_s % n

def affine_encrypt(plaintext: str, a: int, b: int) -> str:
    """Шифрування афінним шифром: C = (a·P + b) mod 26."""
    n = 26
    if gcd(a, n) != 1:
        raise ValueError(f"a={a} не взаємно просте з {n}")

    result = []
    for c in plaintext.upper():
        if c.isalpha():
            p = ord(c) - ord('A')
            cipher = (a * p + b) % n
            result.append(chr(cipher + ord('A')))
        else:
            result.append(c)

    return ''.join(result)

def affine_decrypt(ciphertext: str, a: int, b: int) -> str:
    """Дешифрування: P = a⁻¹·(C - b) mod 26."""
    n = 26
    a_inv = mod_inverse(a, n)

    result = []
    for c in ciphertext.upper():
        if c.isalpha():
            cipher = ord(c) - ord('A')
            p = (a_inv * (cipher - b)) % n
            result.append(chr(p + ord('A')))
        else:
            result.append(c)

    return ''.join(result)

# Демонстрація
a, b = 5, 8
plaintext = "AFFINE CIPHER"

print(f"\nАфінний шифр: a={a}, b={b}")
print(f"Перевірка: gcd({a}, 26) = {gcd(a, 26)}")
print(f"Обернений: {a}⁻¹ mod 26 = {mod_inverse(a, 26)}")

print(f"\nВідкритий текст: {plaintext}")

ciphertext = affine_encrypt(plaintext, a, b)
print(f"Шифротекст: {ciphertext}")

decrypted = affine_decrypt(ciphertext, a, b)
print(f"Розшифровано: {decrypted}")
```
**Очікуваний результат:**

```
Ключове слово: CIPHER
Алфавіт: CIPHERABDFGJKLMNOQSTUVWXYZ
Відкритий текст: HELLO WORLD
Шифротекст: BEJJM WMQJH
Розшифровано: HELLO WORLD

Афінний шифр: a=5, b=8
Перевірка: gcd(5, 26) = 1
Обернений: 5⁻¹ mod 26 = 21

Відкритий текст: AFFINE CIPHER
Шифротекст: IRRWVC SWFRCP
Розшифровано: AFFINE CIPHER
```
## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. Реалізувати функцію створення алфавіту з ключовим словом.

3. Реалізувати шифрування та дешифрування з ключовим словом.

4. Реалізувати функцію НСД та перевірку допустимості параметра a.

5. Реалізувати пошук оберненого елемента за модулем.

6. Реалізувати афінний шифр (шифрування та дешифрування).

7. Перевірити роботу на прикладах з варіанта.

8. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- код програми з коментарями;
- результати шифрування та дешифрування з ключовим словом;
- результати афінного шифру з різними параметрами;
- таблицю допустимих значень a;
- висновок.

## Варіанти індивідуальних завдань

| №   | Ключове слово | a   | b   | Текст для шифрування |
|-----|---------------|-----|-----|----------------------|
| 1   | SECURITY      | 5   | 8   | CRYPTOGRAPHY         |
| 2   | CIPHER        | 7   | 3   | INFORMATION          |
| 3   | CRYPTO        | 9   | 5   | SECURITY             |
| 4   | SECRET        | 11  | 7   | ALGORITHM            |
| 5   | KEYWORD       | 15  | 12  | ENCRYPTION           |
| 6   | ENCODE        | 17  | 4   | DECRYPTION           |
| 7   | DECODE        | 19  | 9   | MATHEMATICS          |
| 8   | PROTECT       | 21  | 6   | SUBSTITUTION         |
| 9   | DEFEND        | 23  | 11  | PERMUTATION          |
| 10  | SHIELD        | 25  | 2   | FREQUENCY            |
| 11  | GUARD         | 3   | 14  | ANALYSIS             |
| 12  | SECURE        | 5   | 17  | CLASSICAL            |
| 13  | PRIVATE       | 7   | 21  | MODERN               |
| 14  | PUBLIC        | 9   | 1   | SYMMETRIC            |
| 15  | HIDDEN        | 11  | 19  | ASYMMETRIC           |
| 16  | COVERT        | 15  | 8   | CIPHERTEXT           |
| 17  | STEALTH       | 17  | 13  | PLAINTEXT            |
| 18  | MASKED        | 19  | 22  | ALPHABET             |
| 19  | CONCEALED     | 21  | 10  | MODULAR              |
| 20  | OBSCURED      | 23  | 15  | ARITHMETIC           |

## Контрольні запитання

1. Як формується алфавіт з ключовим словом?
2. Які вимоги до параметра a в афінному шифрі?
3. Як знайти обернений елемент за модулем?
4. Скільки існує ключів для афінного шифру з алфавітом 26 літер?
5. Чому a=2 не підходить для афінного шифру?
6. Що таке функція Ейлера φ(n)?
7. Як перевірити правильність дешифрування?

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).
