---
title: "Шифри перестановки"
type: lab
order: 8
labNumber: 3
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим C++ компілятором або Python 3"
  - "Середовище розробки (Visual Studio, VS Code)"
preview: "Реалізація шифрів перестановки з використанням таблиць."
---

**Мета:** вивчити принципи шифрування методом перестановки. Реалізувати прості та складні шифруючі таблиці.

**Обладнання:** ПК з встановленим C++ компілятором або Python 3; Середовище розробки (Visual Studio, VS Code).

**Тривалість:** 2 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 7: Шифруючі таблиці. Магічні квадрати |
| **Навички** | Робота з двовимірними масивами |
| **Середовище** | ПК з встановленим C++ компілятором або Python 3 |

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
Текст: "HELLO WORLD"
Ширина таблиці: 4

Запис по рядках:        Читання по стовпцях:
┌───┬───┬───┬───┐
│ H │ E │ L │ L │       H O R   →  HOREL WLD LO
│ O │ W │ O │ R │       E W L
│ L │ D │ · │ · │       L O ·
└───┴───┴───┴───┘       L R ·

Шифротекст: HOWL EWOD LLR (без пробілів: HOWLEWODLLR)
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

Шифротекст: AAKNАATTCWTD
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

Шифротекст: OLWEHLLROLL
```
## Приклад виконання

### Крок 1. Проста перестановка (Python)

```python
import math

def simple_transposition_encrypt(plaintext: str, columns: int) -> str:
    """Проста шифруюча таблиця (запис по рядках, читання по стовпцях)."""
    # Видаляємо пробіли
    text = plaintext.replace(' ', '').upper()

    # Доповнюємо до кратної довжини
    padding = (columns - len(text) % columns) % columns
    text += 'X' * padding

    # Кількість рядків
    rows = len(text) // columns

    # Створюємо таблицю
    table = []
    for i in range(rows):
        table.append(list(text[i * columns:(i + 1) * columns]))

    # Читаємо по стовпцях
    ciphertext = ''
    for col in range(columns):
        for row in range(rows):
            ciphertext += table[row][col]

    return ciphertext

def simple_transposition_decrypt(ciphertext: str, columns: int) -> str:
    """Дешифрування простої перестановки."""
    rows = len(ciphertext) // columns

    # Записуємо по стовпцях
    table = [['' for _ in range(columns)] for _ in range(rows)]
    idx = 0
    for col in range(columns):
        for row in range(rows):
            table[row][col] = ciphertext[idx]
            idx += 1

    # Читаємо по рядках
    plaintext = ''
    for row in table:
        plaintext += ''.join(row)

    return plaintext

# Демонстрація
plaintext = "HELLO WORLD"
columns = 4

print("=== Проста перестановка ===")
print(f"Відкритий текст: {plaintext}")
print(f"Кількість стовпців: {columns}")

ciphertext = simple_transposition_encrypt(plaintext, columns)
print(f"Шифротекст: {ciphertext}")

decrypted = simple_transposition_decrypt(ciphertext, columns)
print(f"Розшифровано: {decrypted}")
```
### Крок 2. Перестановка з ключовим словом

```python
def get_key_order(keyword: str) -> list:
    """Визначає порядок стовпців за алфавітним порядком літер ключа."""
    # Створюємо пари (літера, індекс)
    pairs = [(c, i) for i, c in enumerate(keyword.upper())]
    # Сортуємо за алфавітом
    sorted_pairs = sorted(pairs, key=lambda x: x[0])
    # Повертаємо порядок
    order = [0] * len(keyword)
    for new_pos, (_, old_pos) in enumerate(sorted_pairs):
        order[old_pos] = new_pos
    return order

def keyword_transposition_encrypt(plaintext: str, keyword: str) -> str:
    """Шифрування з ключовим словом."""
    text = plaintext.replace(' ', '').upper()
    key_len = len(keyword)

    # Доповнення
    padding = (key_len - len(text) % key_len) % key_len
    text += 'X' * padding

    rows = len(text) // key_len
    order = get_key_order(keyword)

    # Створюємо таблицю
    table = []
    for i in range(rows):
        table.append(list(text[i * key_len:(i + 1) * key_len]))

    # Читаємо в порядку ключа
    ciphertext = ''
    for target_col in range(key_len):
        # Знаходимо стовпець з порядковим номером target_col
        actual_col = order.index(target_col)
        for row in range(rows):
            ciphertext += table[row][actual_col]

    return ciphertext

def keyword_transposition_decrypt(ciphertext: str, keyword: str) -> str:
    """Дешифрування з ключовим словом."""
    key_len = len(keyword)
    rows = len(ciphertext) // key_len
    order = get_key_order(keyword)

    # Записуємо в порядку ключа
    table = [['' for _ in range(key_len)] for _ in range(rows)]
    idx = 0

    for target_col in range(key_len):
        actual_col = order.index(target_col)
        for row in range(rows):
            table[row][actual_col] = ciphertext[idx]
            idx += 1

    # Читаємо по рядках
    plaintext = ''
    for row in table:
        plaintext += ''.join(row)

    return plaintext

# Демонстрація
keyword = "CRYPTO"
plaintext = "ATTACK AT DAWN"

print("\n=== Перестановка з ключовим словом ===")
print(f"Ключ: {keyword}")
print(f"Порядок: {get_key_order(keyword)}")
print(f"Відкритий текст: {plaintext}")

ciphertext = keyword_transposition_encrypt(plaintext, keyword)
print(f"Шифротекст: {ciphertext}")

decrypted = keyword_transposition_decrypt(ciphertext, keyword)
print(f"Розшифровано: {decrypted}")
```
### Крок 3. Подвійна перестановка

```python
def double_transposition_encrypt(plaintext: str, row_key: str, col_key: str) -> str:
    """Подвійна перестановка (рядки і стовпці)."""
    text = plaintext.replace(' ', '').upper()
    rows = len(row_key)
    cols = len(col_key)

    # Доповнення
    padding = (rows * cols - len(text) % (rows * cols)) % (rows * cols)
    text += 'X' * padding

    row_order = get_key_order(row_key)
    col_order = get_key_order(col_key)

    # Створюємо таблицю
    table = []
    idx = 0
    for _ in range(rows):
        row = []
        for _ in range(cols):
            if idx < len(text):
                row.append(text[idx])
                idx += 1
            else:
                row.append('X')
        table.append(row)

    # Перестановка рядків
    new_table = [None] * rows
    for i, order in enumerate(row_order):
        new_table[order] = table[i]

    # Перестановка стовпців
    final_table = []
    for row in new_table:
        new_row = [None] * cols
        for j, order in enumerate(col_order):
            new_row[order] = row[j]
        final_table.append(new_row)

    # Читаємо по рядках
    ciphertext = ''
    for row in final_table:
        ciphertext += ''.join(row)

    return ciphertext

# Демонстрація
row_key = "KEY"
col_key = "CAT"
plaintext = "HELLOWORL"

print("\n=== Подвійна перестановка ===")
print(f"Ключ рядків: {row_key}")
print(f"Ключ стовпців: {col_key}")
print(f"Відкритий текст: {plaintext}")

ciphertext = double_transposition_encrypt(plaintext, row_key, col_key)
print(f"Шифротекст: {ciphertext}")
```
**Очікуваний результат:**

```
=== Проста перестановка ===
Відкритий текст: HELLO WORLD
Кількість стовпців: 4
Шифротекст: HOWLEWODLLRX
Розшифровано: HELLOWORLDXX

=== Перестановка з ключовим словом ===
Ключ: CRYPTO
Порядок: [0, 3, 5, 2, 4, 1]
Відкритий текст: ATTACK AT DAWN
Шифротекст: AAKNАATTCWTDXX

=== Подвійна перестановка ===
Ключ рядків: KEY
Ключ стовпців: CAT
Відкритий текст: HELLOWORL
Шифротекст: OLWEHLLRL
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

1. Чим шифри перестановки відрізняються від шифрів заміни?
2. Як працює шифрування з ключовим словом?
3. Що дає подвійна перестановка для стійкості?
4. Як визначається порядок стовпців за ключовим словом?
5. Чому шифри перестановки вразливі до аналізу частот?
6. Як доповнюється текст, якщо він не кратний довжині ключа?
7. Скільки можливих перестановок для таблиці 5×5?

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).
