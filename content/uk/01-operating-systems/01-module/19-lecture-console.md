---
title: "Консольний режим Linux. Файловий менеджер"
type: lecture
order: 19
preview: "TTY, bash, Midnight Commander."
---

## Консольний режим (TTY)

Linux завжди має консольний режим, навіть без графіки. **TTY** (TeleTYpe) — віртуальні термінали.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВІРТУАЛЬНІ ТЕРМІНАЛИ                         │
│                                                                 │
│   TTY1 ─── графічний сервер (X11/Wayland)                      │
│   TTY2 ─── консоль (Ctrl+Alt+F2)                               │
│   TTY3 ─── консоль (Ctrl+Alt+F3)                               │
│   TTY4 ─── консоль (Ctrl+Alt+F4)                               │
│   TTY5 ─── консоль (Ctrl+Alt+F5)                               │
│   TTY6 ─── консоль (Ctrl+Alt+F6)                               │
│                                                                 │
│   Перемикання: Ctrl+Alt+F1...F6                                │
│   Назад у графіку: Ctrl+Alt+F1 (або F2)                        │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Який TTY зараз?
tty
# /dev/tty2 або /dev/pts/0 (псевдотермінал в GUI)

# Список активних терміналів
who

# Переключитися (з консолі)
chvt 3

# Надіслати повідомлення на інший TTY
echo "Hello" > /dev/tty3
```

## Термінальні емулятори

| Емулятор | Опис |
|----------|------|
| **GNOME Terminal** | Стандартний для GNOME |
| **Konsole** | KDE, потужний |
| **Alacritty** | GPU-accelerated, Rust |
| **Kitty** | GPU, features |
| **Terminator** | Split-панелі |
| **Tilix** | Tiling, GNOME |
| **xterm** | Класичний |

```bash
# Відкрити термінал
gnome-terminal
konsole
alacritty

# Гарячі клавіші (GNOME Terminal)
# Ctrl+Shift+T — нова вкладка
# Ctrl+Shift+N — нове вікно
# Ctrl+Shift+C/V — копіювати/вставити
# Ctrl+D — закрити
```

## Shell: Bash

**Bash** (Bourne Again Shell) — стандартна оболонка Linux.

```bash
# Яка оболонка?
echo $SHELL
echo $0

# Доступні оболонки
cat /etc/shells

# Змінити оболонку
chsh -s /usr/bin/zsh

# Профілі bash
~/.bashrc     # Інтерактивний non-login
~/.bash_profile  # Login shell
~/.profile    # Загальний
```

### Базові команди

```bash
# Навігація
pwd            # Де я?
cd /path       # Перейти
cd ~           # Додому
cd -           # Попередній

# Файли
ls -la         # Список
cp src dst     # Копіювати
mv old new     # Перемістити
rm file        # Видалити
mkdir dir      # Створити каталог

# Перегляд
cat file       # Весь файл
less file      # Посторінково
head -n 10 file
tail -f log    # Follow

# Пошук
find . -name "*.txt"
grep "pattern" file
locate filename

# Процеси
ps aux
top / htop
kill PID
```

### Гарячі клавіші Bash

| Комбінація | Дія |
|------------|-----|
| `Tab` | Автодоповнення |
| `Ctrl+C` | Перервати |
| `Ctrl+D` | EOF / вийти |
| `Ctrl+Z` | Suspend |
| `Ctrl+L` | Очистити екран |
| `Ctrl+R` | Пошук в історії |
| `Ctrl+A` | Початок рядка |
| `Ctrl+E` | Кінець рядка |
| `Ctrl+U` | Видалити до початку |
| `Ctrl+K` | Видалити до кінця |
| `!!` | Попередня команда |
| `!$` | Останній аргумент |

## Midnight Commander (mc)

**mc** — двопанельний файловий менеджер для консолі (аналог Norton/Total Commander).

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIDNIGHT COMMANDER                           │
│                                                                 │
│   ┌─ Left ──────────────────┬─ Right ─────────────────┐        │
│   │ /home/user/Documents    │ /home/user/Downloads    │        │
│   ├─────────────────────────┼─────────────────────────┤        │
│   │ ..                      │ ..                      │        │
│   │ 📁 folder1              │ 📄 file1.pdf            │        │
│   │ 📁 folder2              │ 📄 file2.zip            │        │
│   │ 📄 document.txt         │ 📁 temp/                │        │
│   │ 📄 image.png            │                         │        │
│   │                         │                         │        │
│   └─────────────────────────┴─────────────────────────┘        │
│   Hint: [...переміщення...]                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 1Help 2Menu 3View 4Edit 5Copy 6Move 7Mkdir 8Del 9Menu 0Quit│
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Встановлення та запуск

```bash
# Встановити
sudo apt install mc

# Запустити
mc

# З правами root
sudo mc
```

### Гарячі клавіші mc

| Клавіша | Дія |
|---------|-----|
| `F1` | Допомога |
| `F3` | Переглянути |
| `F4` | Редагувати |
| `F5` | Копіювати |
| `F6` | Перемістити |
| `F7` | Створити каталог |
| `F8` | Видалити |
| `F9` | Меню |
| `F10` | Вийти |
| `Tab` | Переключити панель |
| `Ctrl+O` | Показати консоль |
| `Insert` | Виділити файл |
| `+` | Виділити за маскою |

### Можливості mc

```bash
# Вбудований редактор
mcedit file.txt

# Переглядач
mcview file.txt

# FTP/SFTP
mc
# F9 → Left/Right → Shell link → user@host:/path

# Архіви (Enter на архіві)
# Працює з .tar.gz, .zip, .rar

# Порівняння каталогів
# F9 → Command → Compare directories
```

## Альтернативи mc

| Програма | Опис |
|----------|------|
| **ranger** | vim-подібний, Python |
| **nnn** | Мінімалістичний |
| **lf** | Go, швидкий |
| **vifm** | vim-bindings |
| **fff** | Bash, простий |

```bash
# ranger
sudo apt install ranger
ranger

# nnn
sudo apt install nnn
nnn
```

## Screen та tmux

Термінальні мультиплексори — кілька сесій в одному вікні.

```bash
# tmux
sudo apt install tmux
tmux

# Основні команди (Ctrl+B, потім)
# c     — нове вікно
# n     — наступне вікно
# p     — попереднє вікно
# "     — split horizontal
# %     — split vertical
# d     — detach
# tmux attach — повернутися

# screen
screen
# Ctrl+A, потім команда
```

## Практичне завдання

```bash
# 1. Переключитися на TTY3
# Ctrl+Alt+F3, логін, потім Ctrl+Alt+F1 назад

# 2. Встановити mc
sudo apt install mc

# 3. Запустити mc
mc

# 4. Базові операції в mc
# F5 — копіювати файл між панелями
# F6 — перемістити
# F7 — створити каталог

# 5. Вбудований редактор
mcedit ~/.bashrc

# 6. Пошук в історії bash
# Ctrl+R, почати вводити команду
```

## Підсумок

| Компонент | Призначення |
|-----------|-------------|
| TTY | Віртуальні консолі (Ctrl+Alt+F1-F6) |
| Bash | Стандартна оболонка |
| mc | Файловий менеджер |
| tmux | Термінальний мультиплексор |

| Клавіша mc | Дія |
|------------|-----|
| F5 | Копіювати |
| F6 | Перемістити |
| F8 | Видалити |
| F4 | Редагувати |
| Tab | Змінити панель |

Це завершує теоретичну частину модуля. Далі — лабораторні роботи.
