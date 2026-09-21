---
title: "Використання шифру Цезаря з ключовим словом, Афінної системи підстановки Цезаря при розв'язанні задачі захисту інформації. Програмна реалізація"
shortTitle: "Шифр Цезаря з ключовим словом. Афінний шифр"
type: lab
order: 5
labNumber: 2
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим C++ компілятором (MSVC, MinGW або GCC)"
  - "Середовище розробки (Visual Studio, VS Code)"
preview: "Реалізація афінної системи та шифру з ключовим словом."
---

**Мета:** вивчити принципи шифрування методом Цезаря з ключовим словом та афінної системи підстановки. Реалізувати алгоритми програмно.

**Обладнання:** ПК з встановленим C++ компілятором (MSVC, MinGW або GCC); Середовище розробки (Visual Studio, VS Code).

**Тривалість:** 2 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 3: Афінна система підстановок. Шифр Цезаря з ключовим словом |
| **Навички** | Модульна арифметика, обернений елемент за модулем |
| **Середовище** | ПК з встановленим C++ компілятором (MSVC, MinGW або GCC) |

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
│  gcd(a, 26) = 1 для: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25        │
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

### Крок 1. Шифр з ключовим словом

```cpp
#include <iostream>
#include <string>
#include <cctype>

const std::string ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Формує шифрувальний алфавіт: спершу літери ключа без повторів, далі решта
std::string createKeywordAlphabet(const std::string& keyword) {
    bool used[26] = { false };
    std::string cipherAlphabet;

    for (char c : keyword) {
        char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        if (up >= 'A' && up <= 'Z' && !used[up - 'A']) {
            used[up - 'A'] = true;
            cipherAlphabet += up;
        }
    }

    for (char c : ALPHABET) {
        if (!used[c - 'A']) {
            cipherAlphabet += c;
        }
    }

    return cipherAlphabet;
}

// Зашифрування: літера відкритого тексту замінюється літерою з тієї самої позиції
std::string keywordEncrypt(const std::string& text, const std::string& keyword) {
    std::string cipherAlphabet = createKeywordAlphabet(keyword);
    std::string result;

    for (char c : text) {
        char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        if (up >= 'A' && up <= 'Z') {
            result += cipherAlphabet[up - 'A'];
        } else {
            result += c;
        }
    }

    return result;
}

// Розшифрування: зворотний пошук позиції літери в шифрувальному алфавіті
std::string keywordDecrypt(const std::string& text, const std::string& keyword) {
    std::string cipherAlphabet = createKeywordAlphabet(keyword);
    std::string result;

    for (char c : text) {
        char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        size_t pos = cipherAlphabet.find(up);
        if (pos != std::string::npos) {
            result += ALPHABET[pos];
        } else {
            result += c;
        }
    }

    return result;
}

int main() {
    std::string keyword = "CIPHER";
    std::string plaintext = "HELLO WORLD";

    std::cout << "Ключове слово:    " << keyword << "\n";
    std::cout << "Алфавіт:          " << createKeywordAlphabet(keyword) << "\n";
    std::cout << "Відкритий текст:  " << plaintext << "\n";

    std::string ciphertext = keywordEncrypt(plaintext, keyword);
    std::cout << "Шифротекст:       " << ciphertext << "\n";
    std::cout << "Розшифровано:     " << keywordDecrypt(ciphertext, keyword) << "\n";

    return 0;
}
```

Результат роботи програми:

```
Ключове слово:    CIPHER
Алфавіт:          CIPHERABDFGJKLMNOQSTUVWXYZ
Відкритий текст:  HELLO WORLD
Шифротекст:       BEJJM WMQJH
Розшифровано:     HELLO WORLD
```

### Крок 2. Афінний шифр

```cpp
#include <iostream>
#include <string>
#include <stdexcept>
#include <cctype>

const int N = 26;  // потужність англійської абетки

// Найбільший спільний дільник, алгоритм Евкліда
int gcd(int a, int b) {
    while (b != 0) {
        int t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// Обернений елемент a^-1 mod n, розширений алгоритм Евкліда
int modInverse(int a, int n) {
    int oldR = a, r = n;
    int oldS = 1, s = 0;

    while (r != 0) {
        int q = oldR / r;
        int tmp = oldR - q * r;  oldR = r;  r = tmp;
        tmp = oldS - q * s;      oldS = s;  s = tmp;
    }

    if (oldR != 1) {
        throw std::runtime_error("Оберненого елемента не існує: gcd != 1");
    }

    return ((oldS % n) + n) % n;  // нормалізація до діапазону [0, n)
}

// Зашифрування: C = (a*P + b) mod N
std::string affineEncrypt(const std::string& text, int a, int b) {
    if (gcd(a, N) != 1) {
        throw std::runtime_error("Параметр a не взаємно простий з N");
    }

    std::string result;
    for (char c : text) {
        char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        if (up >= 'A' && up <= 'Z') {
            int p = up - 'A';
            result += static_cast<char>((a * p + b) % N + 'A');
        } else {
            result += c;
        }
    }
    return result;
}

// Розшифрування: P = a^-1 * (C - b) mod N
std::string affineDecrypt(const std::string& text, int a, int b) {
    int aInv = modInverse(a, N);

    std::string result;
    for (char c : text) {
        char up = static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        if (up >= 'A' && up <= 'Z') {
            int cipher = up - 'A';
            int p = (aInv * ((cipher - b) % N + N)) % N;
            result += static_cast<char>(p + 'A');
        } else {
            result += c;
        }
    }
    return result;
}

int main() {
    int a = 5, b = 8;
    std::string plaintext = "AFFINE CIPHER";

    std::cout << "Афінний шифр: a=" << a << ", b=" << b << "\n";
    std::cout << "Перевірка:    gcd(" << a << ", " << N << ") = "
              << gcd(a, N) << "\n";
    std::cout << "Обернений:    " << a << "^-1 mod " << N
              << " = " << modInverse(a, N) << "\n\n";

    std::cout << "Відкритий текст:  " << plaintext << "\n";

    std::string ciphertext = affineEncrypt(plaintext, a, b);
    std::cout << "Шифротекст:       " << ciphertext << "\n";
    std::cout << "Розшифровано:     " << affineDecrypt(ciphertext, a, b) << "\n";

    return 0;
}
```
Результат роботи програми:

```
Афінний шифр: a=5, b=8
Перевірка:    gcd(5, 26) = 1
Обернений:    5^-1 mod 26 = 21

Відкритий текст:  AFFINE CIPHER
Шифротекст:       IHHWVC SWFRCP
Розшифровано:     AFFINE CIPHER
```

Перші дві літери шифротексту варто перевірити вручну: A має номер 0, тож
5·0 + 8 = 8, а це I; F має номер 5, тож 5·5 + 8 = 33, а 33 mod 26 = 7, тобто H.
Дві однакові літери FF дають однакові IH — афінний шифр лишається шифром
простої заміни з усіма його слабкостями.
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

Запитання згруповано за рівнями навчальних досягнень. Для позитивної оцінки студент має відповісти на запитання середнього рівня, оцінка «добре» потребує відповідей достатнього рівня, оцінка «відмінно» — високого.

### Середній рівень (репродуктивний)

1. Як формується шифрувальний алфавіт з ключовим словом?
2. Запишіть формулу зашифрування афінного шифру.
3. Які вимоги висуваються до параметра a в афінному шифрі?
4. Що таке обернений елемент за модулем?
5. Що таке функція Ейлера φ(n)?
6. Скільки існує ключів для афінного шифру з алфавітом 26 літер?
7. Що відбувається з повторюваними літерами ключового слова?
8. Як перевірити правильність дешифрування отриманого тексту?

### Достатній рівень (конструктивно-варіативний)

1. Чому значення a = 2 не підходить для афінного шифру з алфавітом із 26 літер?
2. Як знайти обернений елемент за модулем розширеним алгоритмом Евкліда?
3. Чому кількість ключів афінного шифру дорівнює φ(n)·n, а не n²?
4. Чим шифр Цезаря є окремим випадком афінного шифру? Які значення параметрів йому відповідають?
5. Як зміниться ключовий простір, якщо перейти на українську абетку з 33 літер?
6. Запишіть формулу розшифрування афінного шифру й поясніть роль оберненого елемента.
7. Чому шифр з ключовим словом складніше зламати повним перебором, ніж шифр Цезаря?
8. Як частотний аналіз застосовують до афінного шифру?

### Високий рівень (творчий)

1. Поясніть, чому обидва розглянуті шифри лишаються моноалфавітними, і які наслідки це має для їхньої стійкості.
2. Запропонуйте спосіб автоматично визначити параметри a і b афінного шифру за шифротекстом достатньої довжини.
3. Оцініть, наскільки зросте стійкість, якщо застосувати афінний шифр двічі з різними ключами. Обґрунтуйте відповідь.
4. Сформулюйте вимоги до вибору ключового слова, за яких шифр з ключовим словом дає найбільший ефект.

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).
