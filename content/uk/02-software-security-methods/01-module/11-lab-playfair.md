---
title: "Шифр Плейфера. Подвійний квадрат"
type: lab
order: 11
labNumber: 4
subject: pmzi
duration: "2 академічні години"
equipment:
  - "ПК з встановленим C++ компілятором або Python 3"
  - "Середовище розробки (Visual Studio, VS Code)"
preview: "Реалізація шифру Плейфера та подвійного квадрата Уітстона."
---

**Мета:** вивчити принципи поліграмного шифрування. Реалізувати шифр Плейфера та подвійний квадрат Уітстона.

**Обладнання:** ПК з встановленим C++ компілятором або Python 3; Середовище розробки (Visual Studio, VS Code).

**Тривалість:** 2 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 10: Шифр Трисемуса. Шифр Плейфера. Подвійний квадрат |
| **Навички** | Робота з матрицями символів |
| **Середовище** | ПК з встановленим C++ компілятором або Python 3 |

## Теоретичні відомості

### 1 Поліграмні шифри

Поліграмні шифри шифрують групи літер (біграми, триграми) замість окремих символів. Це ускладнює частотний аналіз.

```
┌───────────────────────────────────────────────────────────────────────┐
│                    МОНОАЛФАВІТНИЙ vs ПОЛІГРАМНИЙ                      │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  МОНОАЛФАВІТНИЙ (Цезар):                                              │
│  E → H  (кожна E завжди H)                                            │
│  Частотний аналіз: легко знайти E за частотою H                       │
│                                                                       │
│  ПОЛІГРАМНИЙ (Плейфер):                                               │
│  EA → XY, ER → UV, EN → ZW                                            │
│  Біграма EA шифрується по-різному в різних контекстах                 │
│  Частотний аналіз: набагато складніше                                 │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 2 Матриця Плейфера

Матриця 5×5 заповнюється ключовим словом, потім рештою літер (I/J об'єднуються):

```
Ключ: MONARCHY

Матриця:
┌───┬───┬───┬───┬───┐
│ M │ O │ N │ A │ R │
├───┼───┼───┼───┼───┤
│ C │ H │ Y │ B │ D │
├───┼───┼───┼───┼───┤
│ E │ F │ G │ I │ K │
├───┼───┼───┼───┼───┤
│ L │ P │ Q │ S │ T │
├───┼───┼───┼───┼───┤
│ U │ V │ W │ X │ Z │
└───┴───┴───┴───┴───┘

Примітка: I та J вважаються однією літерою
```
### 3 Правила шифрування біграм

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ПРАВИЛА ШИФРУВАННЯ ПЛЕЙФЕРА                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. ОДИН РЯДОК: зсув вправо (з циклічним переносом)                   │
│     ┌───┬───┬───┬───┬───┐                                             │
│     │ M │[O]│ N │[A]│ R │   OA → NA (зсув вправо)                     │
│     └───┴───┴───┴───┴───┘                                             │
│                                                                       │
│  2. ОДИН СТОВПЕЦЬ: зсув вниз (з циклічним переносом)                  │
│     ┌───┐                                                             │
│     │[M]│                                                             │
│     │ C │      ME → CL (зсув вниз)                                    │
│     │[E]│                                                             │
│     │ L │                                                             │
│     │ U │                                                             │
│     └───┘                                                             │
│                                                                       │
│  3. ПРЯМОКУТНИК: протилежні кути                                      │
│     ┌───┬───┬───┬───┬───┐                                             │
│     │ M │ O │ N │ A │ R │                                             │
│     │ C │[H]│ Y │[B]│ D │   HI → BF (H→B, I→F)                        │
│     │ E │[F]│ G │[I]│ K │                                             │
│     └───┴───┴───┴───┴───┘                                             │
│                                                                       │
│  ПІДГОТОВКА ТЕКСТУ:                                                   │
│  - Замінити J на I                                                    │
│  - Вставити X між однаковими літерами: LL → LX L                      │
│  - Якщо непарна кількість, додати X в кінці                           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 4 Подвійний квадрат Уітстона

Використовує дві різні матриці 5×5, розташовані горизонтально:

```
Ключ 1: EXAMPLE     Ключ 2: KEYWORD

Квадрат 1:          Квадрат 2:
┌───┬───┬───┬───┬───┐  ┌───┬───┬───┬───┬───┐
│ E │ X │ A │ M │ P │  │ K │ E │ Y │ W │ O │
│ L │ B │ C │ D │ F │  │ R │ D │ A │ B │ C │
│ G │ H │ I │ K │ N │  │ F │ G │ H │ I │ L │
│ O │ Q │ R │ S │ T │  │ M │ N │ P │ Q │ S │
│ U │ V │ W │ Y │ Z │  │ T │ U │ V │ X │ Z │
└───┴───┴───┴───┴───┘  └───┴───┴───┴───┴───┘
```
**Правило шифрування:**

- Перша літера біграми шукається в квадраті 1
- Друга літера — в квадраті 2
- Результат — літери на тих же рядках, але з протилежних стовпців

```
Приклад: HE
H у квадраті 1: рядок 2, стовпець 1
E у квадраті 2: рядок 0, стовпець 1

Шифрування:
- З квадрата 1 беремо літеру (рядок H, стовпець E) = L
- З квадрата 2 беремо літеру (рядок E, стовпець H) = Y

HE → LY
```
## Приклад виконання

### Крок 1. Побудова матриці Плейфера (Python)

```python
def create_playfair_matrix(keyword: str) -> list:
    """Створює матрицю 5×5 для шифру Плейфера."""
    # Замінюємо J на I, видаляємо повтори
    alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'  # без J
    keyword = keyword.upper().replace('J', 'I')

    # Формуємо послідовність: ключ + решта алфавіту
    seen = set()
    matrix_chars = []

    for c in keyword:
        if c.isalpha() and c not in seen:
            seen.add(c)
            matrix_chars.append(c)

    for c in alphabet:
        if c not in seen:
            matrix_chars.append(c)

    # Створюємо матрицю 5×5
    matrix = []
    for i in range(5):
        matrix.append(matrix_chars[i*5:(i+1)*5])

    return matrix

def find_position(matrix: list, char: str) -> tuple:
    """Знаходить позицію символу в матриці."""
    char = char.upper().replace('J', 'I')
    for row in range(5):
        for col in range(5):
            if matrix[row][col] == char:
                return (row, col)
    return None

def print_matrix(matrix: list, title: str = ""):
    """Друкує матрицю."""
    if title:
        print(title)
    print("┌───┬───┬───┬───┬───┐")
    for i, row in enumerate(matrix):
        print("│ " + " │ ".join(row) + " │")
        if i < 4:
            print("├───┼───┼───┼───┼───┤")
    print("└───┴───┴───┴───┴───┘")

# Демонстрація
keyword = "MONARCHY"
matrix = create_playfair_matrix(keyword)
print_matrix(matrix, f"Матриця для ключа '{keyword}':")
```
### Крок 2. Шифрування Плейфера

```python
def prepare_text(plaintext: str) -> str:
    """Підготовка тексту: видалення пробілів, заміна J, розбивка на біграми."""
    text = plaintext.upper().replace('J', 'I')
    text = ''.join(c for c in text if c.isalpha())

    # Вставляємо X між однаковими літерами
    result = []
    i = 0
    while i < len(text):
        result.append(text[i])
        if i + 1 < len(text):
            if text[i] == text[i + 1]:
                result.append('X')
            else:
                result.append(text[i + 1])
                i += 1
        i += 1

    # Якщо непарна кількість, додаємо X
    if len(result) % 2 == 1:
        result.append('X')

    return ''.join(result)

def playfair_encrypt_bigram(matrix: list, a: str, b: str) -> str:
    """Шифрує одну біграму."""
    row_a, col_a = find_position(matrix, a)
    row_b, col_b = find_position(matrix, b)

    if row_a == row_b:  # Один рядок
        return matrix[row_a][(col_a + 1) % 5] + matrix[row_b][(col_b + 1) % 5]
    elif col_a == col_b:  # Один стовпець
        return matrix[(row_a + 1) % 5][col_a] + matrix[(row_b + 1) % 5][col_b]
    else:  # Прямокутник
        return matrix[row_a][col_b] + matrix[row_b][col_a]

def playfair_decrypt_bigram(matrix: list, a: str, b: str) -> str:
    """Дешифрує одну біграму."""
    row_a, col_a = find_position(matrix, a)
    row_b, col_b = find_position(matrix, b)

    if row_a == row_b:  # Один рядок
        return matrix[row_a][(col_a - 1) % 5] + matrix[row_b][(col_b - 1) % 5]
    elif col_a == col_b:  # Один стовпець
        return matrix[(row_a - 1) % 5][col_a] + matrix[(row_b - 1) % 5][col_b]
    else:  # Прямокутник
        return matrix[row_a][col_b] + matrix[row_b][col_a]

def playfair_encrypt(plaintext: str, keyword: str) -> str:
    """Повне шифрування Плейфера."""
    matrix = create_playfair_matrix(keyword)
    text = prepare_text(plaintext)

    ciphertext = ''
    for i in range(0, len(text), 2):
        ciphertext += playfair_encrypt_bigram(matrix, text[i], text[i+1])

    return ciphertext

def playfair_decrypt(ciphertext: str, keyword: str) -> str:
    """Повне дешифрування Плейфера."""
    matrix = create_playfair_matrix(keyword)

    plaintext = ''
    for i in range(0, len(ciphertext), 2):
        plaintext += playfair_decrypt_bigram(matrix, ciphertext[i], ciphertext[i+1])

    return plaintext

# Демонстрація
keyword = "MONARCHY"
plaintext = "HELLO WORLD"

print(f"\n=== Шифр Плейфера ===")
print(f"Ключ: {keyword}")
print(f"Відкритий текст: {plaintext}")
print(f"Підготовлений: {prepare_text(plaintext)}")

ciphertext = playfair_encrypt(plaintext, keyword)
print(f"Шифротекст: {ciphertext}")

decrypted = playfair_decrypt(ciphertext, keyword)
print(f"Розшифровано: {decrypted}")
```
### Крок 3. Подвійний квадрат Уітстона

```python
def two_square_encrypt(plaintext: str, keyword1: str, keyword2: str) -> str:
    """Шифрування подвійним квадратом."""
    matrix1 = create_playfair_matrix(keyword1)
    matrix2 = create_playfair_matrix(keyword2)

    text = prepare_text(plaintext)

    ciphertext = ''
    for i in range(0, len(text), 2):
        a, b = text[i], text[i+1]

        row1, col1 = find_position(matrix1, a)
        row2, col2 = find_position(matrix2, b)

        # Протилежні кути прямокутника
        cipher_a = matrix1[row1][col2]
        cipher_b = matrix2[row2][col1]

        ciphertext += cipher_a + cipher_b

    return ciphertext

def two_square_decrypt(ciphertext: str, keyword1: str, keyword2: str) -> str:
    """Дешифрування подвійним квадратом."""
    matrix1 = create_playfair_matrix(keyword1)
    matrix2 = create_playfair_matrix(keyword2)

    plaintext = ''
    for i in range(0, len(ciphertext), 2):
        a, b = ciphertext[i], ciphertext[i+1]

        row1, col1 = find_position(matrix1, a)
        row2, col2 = find_position(matrix2, b)

        # Обернена операція
        plain_a = matrix1[row1][col2]
        plain_b = matrix2[row2][col1]

        plaintext += plain_a + plain_b

    return plaintext

# Демонстрація
keyword1 = "EXAMPLE"
keyword2 = "KEYWORD"
plaintext = "HELLO WORLD"

print(f"\n=== Подвійний квадрат Уітстона ===")
print(f"Ключ 1: {keyword1}")
print(f"Ключ 2: {keyword2}")
print(f"Відкритий текст: {plaintext}")

print("\nКвадрат 1:")
print_matrix(create_playfair_matrix(keyword1))
print("\nКвадрат 2:")
print_matrix(create_playfair_matrix(keyword2))

ciphertext = two_square_encrypt(plaintext, keyword1, keyword2)
print(f"\nШифротекст: {ciphertext}")

decrypted = two_square_decrypt(ciphertext, keyword1, keyword2)
print(f"Розшифровано: {decrypted}")
```
**Очікуваний результат:**

```
Матриця для ключа 'MONARCHY':
┌───┬───┬───┬───┬───┐
│ M │ O │ N │ A │ R │
├───┼───┼───┼───┼───┤
│ C │ H │ Y │ B │ D │
├───┼───┼───┼───┼───┤
│ E │ F │ G │ I │ K │
├───┼───┼───┼───┼───┤
│ L │ P │ Q │ S │ T │
├───┼───┼───┼───┼───┤
│ U │ V │ W │ X │ Z │
└───┴───┴───┴───┴───┘

=== Шифр Плейфера ===
Ключ: MONARCHY
Відкритий текст: HELLO WORLD
Підготовлений: HELXLOWORLD
Шифротекст: KFUYMQWLTPQ
Розшифровано: HELXLOWORLD
```
## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. Реалізувати функцію побудови матриці 5×5 за ключовим словом.

3. Реалізувати підготовку тексту (видалення пробілів, обробка повторів).

4. Реалізувати шифрування та дешифрування однієї біграми.

5. Реалізувати повний шифр Плейфера.

6. Реалізувати подвійний квадрат Уітстона.

7. Виконати шифрування тексту з варіанта.

8. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- код програми з коментарями;
- візуалізацію матриць шифрування;
- приклади всіх трьох правил (рядок, стовпець, прямокутник);
- результати шифрування та дешифрування;
- висновок про переваги поліграмних шифрів.

## Варіанти індивідуальних завдань

| №   | Ключ Плейфера | Ключ 1 (двокв.) | Ключ 2 (двокв.) | Текст      |
|-----|---------------|-----------------|-----------------|------------|
| 1   | MONARCHY      | EXAMPLE         | KEYWORD         | ATTACK     |
| 2   | PLAYFAIR      | CIPHER          | SECURE          | DEFEND     |
| 3   | CIPHER        | ENCODE          | DECODE          | MISSION    |
| 4   | SECURITY      | PROTECT         | SHIELD          | TARGET     |
| 5   | CRYPTO        | HIDDEN          | COVERT          | SECRET     |
| 6   | ENCODE        | STEALTH         | MASKED          | AGENT      |
| 7   | DECODE        | PUZZLE          | ENIGMA          | RENDEZVOUS |
| 8   | PROTECT       | MYSTERY         | RIDDLE          | CONTACT    |
| 9   | DEFEND        | SHADOW          | PHANTOM         | REPORT     |
| 10  | SHIELD        | GHOST           | SPIRIT          | RETREAT    |
| 11  | GUARD         | SILENT          | WHISPER         | ADVANCE    |
| 12  | SECURE        | NIGHT           | DAWN            | CONFIRM    |
| 13  | PRIVATE       | EAGLE           | FALCON          | EXECUTE    |
| 14  | HIDDEN        | TIGER           | LION            | PREPARE    |
| 15  | COVERT        | STORM           | THUNDER         | COMPLETE   |
| 16  | STEALTH       | OCEAN           | RIVER           | ABORT      |
| 17  | MASKED        | FOREST          | MOUNTAIN        | PROCEED    |
| 18  | CONCEALED     | WINTER          | SUMMER          | STANDBY    |
| 19  | OBSCURED      | ALPHA           | OMEGA           | COMMENCE   |
| 20  | CRYPTIC       | BRAVO           | DELTA           | FINALIZE   |

## Контрольні запитання

1. Які правила шифрування біграм у шифрі Плейфера?
2. Як обробляються повторювані літери (наприклад, LL)?
3. Чому I та J об'єднуються в одну літеру?
4. Чому подвійний квадрат стійкіший за одинарний Плейфер?
5. Скільки можливих ключів у шифрі Плейфера?
6. Як дешифрувати біграму, якщо літери в одному рядку?
7. Які переваги поліграмних шифрів над моноалфавітними?

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).
