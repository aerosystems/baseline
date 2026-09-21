---
title: "Використання шифру простої перестановки при розв'язанні задачі захисту інформації (прості шифруючі таблиці, шифруючі таблиці з ключовим словом). Програмна реалізація"
shortTitle: "Шифри перестановки"
type: lab
order: 8
labNumber: 3
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим C++ компілятором (MSVC, MinGW або GCC)"
  - "Середовище розробки (Visual Studio, VS Code)"
preview: "Реалізація шифрів перестановки з використанням таблиць."
---

**Мета:** вивчити принципи шифрування методом перестановки. Реалізувати прості та складні шифруючі таблиці.

**Обладнання:** ПК з встановленим C++ компілятором (MSVC, MinGW або GCC); Середовище розробки (Visual Studio, VS Code).

**Тривалість:** 2 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 7: Шифруючі таблиці. Магічні квадрати |
| **Навички** | Робота з двовимірними масивами |
| **Середовище** | ПК з встановленим C++ компілятором (MSVC, MinGW або GCC) |

## Теоретичні відомості

### 1 Принцип шифрів перестановки

На відміну від шифрів заміни, шифри перестановки не змінюють символи, а переставляють їх місцями за певним правилом.

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ПОРІВНЯННЯ ШИФРІВ                                  │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ШИФР ЗАМІНИ:                                                         │
│  Відкритий:  H E L L O                                                │
│  Шифрований: K H O O R    ← Кожна літера замінена на іншу             │
│                                                                       │
│  ШИФР ПЕРЕСТАНОВКИ:                                                   │
│  Відкритий:  H E L L O                                                │
│  Шифрований: L O E H L    ← Ті самі літери, але в іншому порядку      │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 2 Проста шифруюча таблиця

Текст записується в таблицю по рядках, читається по стовпцях:

```
Текст: "HELLO WORLD" → без пробілів HELLOWORLD (10 літер)
Ширина таблиці: 4 → потрібно 12 комірок, доповнюємо двома X

Запис по рядках:
┌───┬───┬───┬───┐
│ H │ E │ L │ L │
│ O │ W │ O │ R │
│ L │ D │ X │ X │
└───┴───┴───┴───┘

Читання по стовпцях:
Стовпець 1: H O L
Стовпець 2: E W D
Стовпець 3: L O X
Стовпець 4: L R X

Шифротекст: HOL EWD LOX LRX (без пробілів: HOLEWDLOXLRX)
```
### 3 Шифрування з ключовим словом

Стовпці переставляються згідно з алфавітним порядком літер ключа:

```
Ключ: CRYPTO
Нумерація за алфавітом: C=1, R=4, Y=6, P=3, T=5, O=2

Текст: "ATTACK AT DAWN"

       C  R  Y  P  T  O
       1  4  6  3  5  2
      ┌──┬──┬──┬──┬──┬──┐
      │A │T │T │A │C │K │
      │A │T │D │A │W │N │
      └──┴──┴──┴──┴──┴──┘

Читання в порядку 1,2,3,4,5,6:
Стовпець 1 (C): AA
Стовпець 2 (O): KN
Стовпець 3 (P): AA
Стовпець 4 (R): TT
Стовпець 5 (T): CW
Стовпець 6 (Y): TD

Шифротекст: AAKNAATTCWTD
```
### 4 Подвійна перестановка

Застосовується перестановка і рядків, і стовпців:

```
Ключ рядків: KEY (K=2, E=1, Y=3)
Ключ стовпців: CAT (A=1, C=2, T=3)

       C  A  T
      ┌──┬──┬──┐
  K 2 │H │E │L │
  E 1 │L │O │W │
  Y 3 │O │R │L │
      └──┴──┴──┘

1. Перестановка рядків (E,K,Y → 1,2,3):
      ┌──┬──┬──┐
    1 │L │O │W │
    2 │H │E │L │
    3 │O │R │L │
      └──┴──┴──┘

2. Перестановка стовпців (A,C,T → 1,2,3):
      ┌──┬──┬──┐
      │O │L │W │
      │E │H │L │
      │R │O │L │
      └──┴──┴──┘

Шифротекст (читання по рядках): OLWEHLROL
```
## Приклад виконання

### Крок 1. Проста перестановка

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <cctype>

// Прибирає пробіли та переводить у верхній регістр
std::string normalize(const std::string& text) {
    std::string result;
    for (char c : text) {
        if (!std::isspace(static_cast<unsigned char>(c))) {
            result += static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        }
    }
    return result;
}

// Зашифрування: запис по рядках, читання по стовпцях
std::string simpleEncrypt(const std::string& plaintext, int columns) {
    std::string text = normalize(plaintext);

    // Доповнюємо до довжини, кратної кількості стовпців
    while (text.size() % columns != 0) {
        text += 'X';
    }

    int rows = static_cast<int>(text.size()) / columns;
    std::string ciphertext;

    for (int col = 0; col < columns; ++col) {
        for (int row = 0; row < rows; ++row) {
            ciphertext += text[row * columns + col];
        }
    }

    return ciphertext;
}

// Розшифрування: запис по стовпцях, читання по рядках
std::string simpleDecrypt(const std::string& ciphertext, int columns) {
    int rows = static_cast<int>(ciphertext.size()) / columns;
    std::vector<std::string> table(rows, std::string(columns, ' '));

    size_t idx = 0;
    for (int col = 0; col < columns; ++col) {
        for (int row = 0; row < rows; ++row) {
            table[row][col] = ciphertext[idx++];
        }
    }

    std::string plaintext;
    for (const std::string& row : table) {
        plaintext += row;
    }

    return plaintext;
}

int main() {
    std::string plaintext = "HELLO WORLD";
    int columns = 4;

    std::cout << "=== Проста перестановка ===\n";
    std::cout << "Відкритий текст:    " << plaintext << "\n";
    std::cout << "Кількість стовпців: " << columns << "\n";

    std::string ciphertext = simpleEncrypt(plaintext, columns);
    std::cout << "Шифротекст:         " << ciphertext << "\n";
    std::cout << "Розшифровано:       " << simpleDecrypt(ciphertext, columns) << "\n";

    return 0;
}
```

Результат роботи програми:

```
=== Проста перестановка ===
Відкритий текст:    HELLO WORLD
Кількість стовпців: 4
Шифротекст:         HOLEWDLOXLRX
Розшифровано:       HELLOWORLDXX
```

### Крок 2. Перестановка з ключовим словом

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <algorithm>
#include <cctype>

// Порядок стовпців за алфавітним порядком літер ключа:
// order[i] — номер стовпця i у послідовності читання
std::vector<int> getKeyOrder(const std::string& keyword) {
    int n = static_cast<int>(keyword.size());
    std::vector<int> idx(n);
    std::iota(idx.begin(), idx.end(), 0);

    // Стабільне сортування: однакові літери зберігають порядок появи
    std::stable_sort(idx.begin(), idx.end(), [&keyword](int a, int b) {
        return std::toupper(static_cast<unsigned char>(keyword[a])) <
               std::toupper(static_cast<unsigned char>(keyword[b]));
    });

    std::vector<int> order(n);
    for (int pos = 0; pos < n; ++pos) {
        order[idx[pos]] = pos;
    }
    return order;
}

std::string normalize(const std::string& text) {
    std::string result;
    for (char c : text) {
        if (!std::isspace(static_cast<unsigned char>(c))) {
            result += static_cast<char>(std::toupper(static_cast<unsigned char>(c)));
        }
    }
    return result;
}

std::string keywordEncrypt(const std::string& plaintext, const std::string& keyword) {
    std::string text = normalize(plaintext);
    int keyLen = static_cast<int>(keyword.size());

    while (text.size() % keyLen != 0) {
        text += 'X';
    }

    int rows = static_cast<int>(text.size()) / keyLen;
    std::vector<int> order = getKeyOrder(keyword);
    std::string ciphertext;

    // Стовпці читаються в порядку, заданому ключем
    for (int target = 0; target < keyLen; ++target) {
        int col = static_cast<int>(
            std::find(order.begin(), order.end(), target) - order.begin());
        for (int row = 0; row < rows; ++row) {
            ciphertext += text[row * keyLen + col];
        }
    }

    return ciphertext;
}

std::string keywordDecrypt(const std::string& ciphertext,
                           const std::string& keyword) {
    int keyLen = static_cast<int>(keyword.size());
    int rows = static_cast<int>(ciphertext.size()) / keyLen;
    std::vector<int> order = getKeyOrder(keyword);
    std::vector<std::string> table(rows, std::string(keyLen, ' '));

    size_t idx = 0;
    for (int target = 0; target < keyLen; ++target) {
        int col = static_cast<int>(
            std::find(order.begin(), order.end(), target) - order.begin());
        for (int row = 0; row < rows; ++row) {
            table[row][col] = ciphertext[idx++];
        }
    }

    std::string plaintext;
    for (const std::string& row : table) {
        plaintext += row;
    }
    return plaintext;
}

int main() {
    std::string keyword = "CIPHER";
    std::string plaintext = "TRANSPOSITION CIPHER";

    std::vector<int> order = getKeyOrder(keyword);
    std::cout << "Ключове слово:   " << keyword << "\n";
    std::cout << "Порядок стовпців:";
    for (int value : order) {
        std::cout << " " << value;
    }
    std::cout << "\n";

    std::string ciphertext = keywordEncrypt(plaintext, keyword);
    std::cout << "Відкритий текст: " << plaintext << "\n";
    std::cout << "Шифротекст:      " << ciphertext << "\n";
    std::cout << "Розшифровано:    " << keywordDecrypt(ciphertext, keyword) << "\n";

    return 0;
}
```

Результат роботи програми:

```
Ключове слово:   CIPHER
Порядок стовпців: 0 3 4 2 1 5
Відкритий текст: TRANSPOSITION CIPHER
Шифротекст:      TONRSIHXNTPXRSCXAIIXPOEX
Розшифровано:    TRANSPOSITIONCIPHERXXXXX
```

### Крок 3. Подвійна перестановка

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <algorithm>
#include <cctype>

std::vector<int> getKeyOrder(const std::string& keyword);  // з кроку 2
std::string normalize(const std::string& text);            // з кроку 2

// Подвійна перестановка: спершу переставляються рядки, потім стовпці
std::string doubleEncrypt(const std::string& plaintext,
                          const std::string& rowKey,
                          const std::string& colKey) {
    int rows = static_cast<int>(rowKey.size());
    int cols = static_cast<int>(colKey.size());
    std::string text = normalize(plaintext);

    while (static_cast<int>(text.size()) < rows * cols) {
        text += 'X';
    }

    // Заповнюємо таблицю по рядках
    std::vector<std::string> table(rows, std::string(cols, ' '));
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            table[r][c] = text[r * cols + c];
        }
    }

    // Перестановка рядків за ключем rowKey
    std::vector<int> rowOrder = getKeyOrder(rowKey);
    std::vector<std::string> byRows(rows);
    for (int r = 0; r < rows; ++r) {
        byRows[rowOrder[r]] = table[r];
    }

    // Перестановка стовпців за ключем colKey
    std::vector<int> colOrder = getKeyOrder(colKey);
    std::vector<std::string> result(rows, std::string(cols, ' '));
    for (int r = 0; r < rows; ++r) {
        for (int c = 0; c < cols; ++c) {
            result[r][colOrder[c]] = byRows[r][c];
        }
    }

    std::string ciphertext;
    for (const std::string& row : result) {
        ciphertext += row;
    }
    return ciphertext;
}

int main() {
    std::string rowKey = "KEY";
    std::string colKey = "CAT";
    std::string plaintext = "HELLOWORL";

    std::cout << "=== Подвійна перестановка ===\n";
    std::cout << "Ключ рядків:     " << rowKey << "\n";
    std::cout << "Ключ стовпців:   " << colKey << "\n";
    std::cout << "Відкритий текст: " << plaintext << "\n";
    std::cout << "Шифротекст:      "
              << doubleEncrypt(plaintext, rowKey, colKey) << "\n";

    return 0;
}
```

Результат роботи програми:

```
=== Подвійна перестановка ===
Ключ рядків:     KEY
Ключ стовпців:   CAT
Відкритий текст: HELLOWORL
Шифротекст:      OLWEHLROL
```

## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. Реалізувати просту шифруючу таблицю (запис по рядках, читання по стовпцях).

3. Реалізувати функцію визначення порядку за ключовим словом.

4. Реалізувати шифрування та дешифрування з ключовим словом.

5. Реалізувати подвійну перестановку.

6. Виконати шифрування тексту з варіанта.

7. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- код програми з коментарями;
- візуалізацію таблиць шифрування;
- результати шифрування та дешифрування;
- висновок про стійкість шифрів перестановки.

## Варіанти індивідуальних завдань

| №   | Ключове слово | Текст для шифрування |
|-----|---------------|----------------------|
| 1   | CIPHER        | THE QUICK BROWN FOX  |
| 2   | SECURITY      | CRYPTOGRAPHY IS FUN  |
| 3   | ENCODE        | SEND REINFORCEMENTS  |
| 4   | DECODE        | ATTACK AT MIDNIGHT   |
| 5   | PROTECT       | THE SECRET MESSAGE   |
| 6   | DEFEND        | ENEMY APPROACHING    |
| 7   | SHIELD        | MISSION ACCOMPLISHED |
| 8   | GUARD         | RETREAT IMMEDIATELY  |
| 9   | SECURE        | HOLD YOUR POSITION   |
| 10  | PRIVATE       | ADVANCE TO THE NORTH |
| 11  | HIDDEN        | THE PASSWORD IS SAFE |
| 12  | COVERT        | OPERATION COMPLETE   |
| 13  | SECRET        | RENDEZVOUS AT NOON   |
| 14  | STEALTH       | AWAIT FURTHER ORDERS |
| 15  | MASKED        | THE COAST IS CLEAR   |
| 16  | CRYPTO        | EXECUTE PLAN ALPHA   |
| 17  | ENIGMA        | ALL SYSTEMS ARE GO   |
| 18  | MYSTERY       | COMMENCE OPERATION   |
| 19  | PUZZLE        | OBJECTIVE ACHIEVED   |
| 20  | CIPHER        | RETURN TO BASE NOW   |

## Контрольні запитання

Запитання згруповано за рівнями навчальних досягнень. Для позитивної оцінки студент має відповісти на запитання середнього рівня, оцінка «добре» потребує відповідей достатнього рівня, оцінка «відмінно» — високого.

### Середній рівень (репродуктивний)

1. Чим шифри перестановки відрізняються від шифрів заміни?
2. Як виконується шифрування простою шифруючою таблицею?
3. Як визначається порядок стовпців за ключовим словом?
4. Як доповнюється текст, якщо його довжина не кратна довжині ключа?
5. Що таке подвійна перестановка?
6. Скільки можливих перестановок існує для таблиці 5×5?
7. Чи змінює шифр перестановки склад літер тексту?
8. Які дані потрібні для розшифрування тексту, зашифрованого шифруючою таблицею?

### Достатній рівень (конструктивно-варіативний)

1. Чому шифри перестановки не піддаються класичному частотному аналізу окремих літер?
2. Що дає подвійна перестановка для стійкості порівняно з одинарною?
3. Як символи-заповнювачі можуть видати довжину ключа криптоаналітику?
4. Запишіть алгоритм розшифрування тексту, зашифрованого таблицею з ключовим словом.
5. Як однакові літери в ключовому слові впливають на порядок стовпців і як цю неоднозначність усувають?
6. Чому аналіз частот біграм ефективніший проти шифрів перестановки, ніж аналіз частот літер?
7. Як визначити ймовірну довжину ключа, маючи лише шифротекст?
8. Чим магічний квадрат як спосіб перестановки відрізняється від шифруючої таблиці з ключем?

### Високий рівень (творчий)

1. Запропонуйте алгоритм автоматичного зламу шифру простої перестановки за наявності достатнього обсягу шифротексту.
2. Поясніть, чому комбінація заміни й перестановки стійкіша за кожен із цих методів окремо, і наведіть приклад такої комбінації в сучасних шифрах.
3. Оцініть реальну стійкість подвійної перестановки з ключами довжиною 8 і 10 символів: скільки варіантів має перебрати криптоаналітик?
4. Сформулюйте, які властивості тексту зберігає шифр перестановки, і поясніть, як саме ці властивості використовує криптоаналітик.

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).
