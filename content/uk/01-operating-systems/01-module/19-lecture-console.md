---
title: "Консольний режим Linux. Файловий менеджер"
type: lecture
order: 19
preview: "TTY, bash, Midnight Commander."
---

## Консольний режим (TTY)

Linux завжди має консольний режим, навіть без графічного інтерфейсу. Це важливо для: серверів, аварійного відновлення, віддаленого доступу (SSH), автоматизації.

**TTY** (TeleTYpe) — термін з часів телетайпних машин. У Linux означає віртуальний термінал.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ВІРТУАЛЬНІ ТЕРМІНАЛИ                         │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                    Linux System                          │  │
│   │                                                          │  │
│   │   TTY1 ─── Графічний сервер (X11/Wayland)               │  │
│   │            Login Screen (GDM/SDDM)                       │  │
│   │                                                          │  │
│   │   TTY2 ─── Консоль (Ctrl+Alt+F2)                        │  │
│   │   TTY3 ─── Консоль (Ctrl+Alt+F3)                        │  │
│   │   TTY4 ─── Консоль (Ctrl+Alt+F4)                        │  │
│   │   TTY5 ─── Консоль (Ctrl+Alt+F5)                        │  │
│   │   TTY6 ─── Консоль (Ctrl+Alt+F6)                        │  │
│   │                                                          │  │
│   │   Перемикання: Ctrl+Alt+F1...F6 (або F7)                │  │
│   │   Назад у графіку: Ctrl+Alt+F1 (або F2)                 │  │
│   │                                                          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Використання:                                                │
│   • TTY1: графічний режим (за замовчуванням)                  │
│   • TTY2-6: текстові консолі (якщо графіка зависла)          │
│   • Деякі дистрибутиви: TTY7 для графіки                      │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Який TTY зараз активний?
tty
# /dev/tty2 — текстова консоль
# /dev/pts/0 — псевдотермінал в GUI (графічний термінал)

# Список активних терміналів
who
# user     tty1         2024-01-15 10:30 (:0)
# user     pts/0        2024-01-15 10:35 (:0)

# Детальніше
w
# USER     TTY      FROM   LOGIN@   IDLE   JCPU   PCPU  WHAT
# user     tty1     :0     10:30    ?      0.05s  0.05s gdm-session

# Переключитися на інший TTY (з консолі)
sudo chvt 3  # Переключитися на tty3

# Надіслати повідомлення на інший TTY
echo "Hello from tty2" | sudo tee /dev/tty3

# Запустити команду на іншому TTY
sudo openvt -c 3 htop  # Запустити htop на tty3
```

### Коли потрібен консольний режим?

| Ситуація | Рішення |
|----------|---------|
| Графічний інтерфейс завис | Ctrl+Alt+F2, login, kill проблемний процес |
| Встановлення драйверів GPU | Потрібно вимкнути X11/Wayland |
| Сервер без GUI | Вся робота через консоль |
| SSH підключення | Віддалена робота через термінал |
| Аварійне відновлення | Recovery mode, chroot |
| Автоматизація | Скрипти, cron jobs |

## Термінальні емулятори

**Термінальний емулятор** — GUI-програма, що емулює роботу терміналу. Дозволяє працювати з CLI в графічному режимі.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ТЕРМІНАЛЬНІ ЕМУЛЯТОРИ                        │
│                                                                 │
│   ┌─ gnome-terminal ───────────────────────────────────────┐   │
│   │ File  Edit  View  Search  Terminal  Help               │   │
│   ├─────────────────────────────────────────────────────────┤   │
│   │ user@hostname:~$ ls -la                                 │   │
│   │ total 48                                                │   │
│   │ drwxr-xr-x 12 user user 4096 Jan 15 10:30 .            │   │
│   │ drwxr-xr-x  3 root root 4096 Jan 01 00:00 ..           │   │
│   │ -rw-r--r--  1 user user  220 Jan 01 00:00 .bashrc      │   │
│   │ drwxr-xr-x  2 user user 4096 Jan 15 09:00 Documents    │   │
│   │ user@hostname:~$ _                                      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Особливості:                                                 │
│   • Вкладки (tabs)                                             │
│   • Split panes (деякі)                                        │
│   • Кольорові схеми                                            │
│   • Прозорість                                                 │
│   • Шрифти та розмір                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Популярні термінали

| Емулятор | DE | Особливості |
|----------|----|----|
| **GNOME Terminal** | GNOME | Стандартний, вкладки, profiles |
| **Konsole** | KDE | Потужний, split view, SSH bookmarks |
| **Alacritty** | - | GPU-accelerated, Rust, швидкий |
| **Kitty** | - | GPU-accelerated, features, images |
| **Terminator** | - | Split-панелі, broadcasting |
| **Tilix** | GNOME | Tiling, квадранти |
| **xterm** | - | Класичний, мінімалістичний |
| **st** | - | Suckless, мінімалістичний |
| **WezTerm** | - | Lua конфігурація, multiplexer |

```bash
# Встановити альтернативні термінали
sudo apt install alacritty
sudo apt install kitty
sudo apt install terminator
sudo apt install tilix

# Запустити
gnome-terminal
konsole
alacritty
kitty

# Конфігурація Alacritty
mkdir -p ~/.config/alacritty
nano ~/.config/alacritty/alacritty.toml

# Конфігурація Kitty
mkdir -p ~/.config/kitty
nano ~/.config/kitty/kitty.conf
```

### Гарячі клавіші терміналів

**GNOME Terminal / більшість:**

| Комбінація | Дія |
|------------|-----|
| `Ctrl+Shift+T` | Нова вкладка |
| `Ctrl+Shift+N` | Нове вікно |
| `Ctrl+Shift+W` | Закрити вкладку |
| `Ctrl+Shift+Q` | Закрити вікно |
| `Ctrl+Shift+C` | Копіювати |
| `Ctrl+Shift+V` | Вставити |
| `Ctrl+Shift+F` | Пошук |
| `Ctrl+Page Up/Down` | Переключити вкладку |
| `Ctrl+D` | Закрити термінал (EOF) |
| `Shift+Page Up/Down` | Прокрутка |
| `Ctrl++/-` | Збільшити/зменшити шрифт |

## Shell: Bash

**Shell** — командний інтерпретатор, програма, яка читає команди та виконує їх. **Bash** (Bourne Again Shell) — найпоширеніший shell у Linux.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ПОПУЛЯРНІ SHELLS                             │
│                                                                 │
│   Shell    Опис                    Конфігурація                │
│   ─────    ─────                   ───────────                 │
│   bash     Bourne Again Shell      ~/.bashrc                   │
│            GNU, default в Linux    ~/.bash_profile             │
│                                                                 │
│   zsh      Z Shell                 ~/.zshrc                    │
│            Потужний, Oh My Zsh     Default в macOS             │
│                                                                 │
│   fish     Friendly Interactive    ~/.config/fish/config.fish  │
│            Shell                   Автодоповнення, кольори     │
│                                                                 │
│   sh       Bourne Shell            Базовий, POSIX              │
│            /bin/sh (symlink)                                   │
│                                                                 │
│   dash     Debian Ash              Швидший за bash             │
│            /bin/sh на Debian       Для скриптів                │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Яка оболонка зараз?
echo $SHELL
echo $0
ps -p $$

# Доступні оболонки
cat /etc/shells

# Змінити оболонку (для користувача)
chsh -s /usr/bin/zsh

# Тимчасово запустити інший shell
zsh
fish
# exit — повернутися

# Версія bash
bash --version
```

### Конфігураційні файли Bash

```
┌─────────────────────────────────────────────────────────────────┐
│                    BASH CONFIGURATION FILES                     │
│                                                                 │
│   Login shell (ssh, tty):                                      │
│   1. /etc/profile                                              │
│   2. ~/.bash_profile або ~/.bash_login або ~/.profile          │
│   3. При виході: ~/.bash_logout                                │
│                                                                 │
│   Non-login interactive (terminal in GUI):                     │
│   1. /etc/bash.bashrc                                          │
│   2. ~/.bashrc                                                 │
│                                                                 │
│   Типова практика:                                             │
│   ~/.bash_profile:                                             │
│       if [ -f ~/.bashrc ]; then                                │
│           . ~/.bashrc                                          │
│       fi                                                       │
│                                                                 │
│   Всі налаштування в ~/.bashrc                                 │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Переглянути .bashrc
cat ~/.bashrc

# Редагувати
nano ~/.bashrc

# Застосувати зміни (без перезапуску терміналу)
source ~/.bashrc
# або
. ~/.bashrc
```

### Базові команди Bash

```bash
# Навігація
pwd            # Print Working Directory — де я?
cd /path       # Change Directory — перейти
cd ~           # Додому
cd -           # Попередній каталог
cd ..          # На рівень вгору

# Файли та каталоги
ls             # List — показати вміст
ls -la         # Детально, включаючи приховані
ls -lh         # Human-readable розміри
ls -ltr        # Сортування за часом (старі спочатку)

cp source dest     # Copy — копіювати
cp -r dir1 dir2    # Копіювати каталог рекурсивно
mv old new         # Move — перемістити/перейменувати
rm file            # Remove — видалити
rm -rf directory/  # Видалити каталог (ОБЕРЕЖНО!)
mkdir dirname      # Make Directory — створити каталог
mkdir -p a/b/c     # Створити вкладені каталоги
touch file.txt     # Створити порожній файл

# Перегляд файлів
cat file           # Вивести весь файл
less file          # Посторінково (q для виходу)
head -n 10 file    # Перші 10 рядків
tail -n 10 file    # Останні 10 рядків
tail -f logfile    # Follow — стежити за оновленнями

# Пошук
find . -name "*.txt"           # Знайти файли за іменем
find . -type f -size +100M     # Файли більше 100 МБ
grep "pattern" file            # Пошук тексту у файлі
grep -r "pattern" directory/   # Рекурсивний пошук
locate filename                # Швидкий пошук (потрібен updatedb)
which python3                  # Де знаходиться програма

# Процеси
ps aux                         # Список процесів
ps aux | grep nginx            # Знайти процес
top                            # Інтерактивний монітор
htop                           # Покращений top
kill PID                       # Завершити процес
killall name                   # Завершити за іменем
pgrep -l nginx                 # Знайти PID за іменем

# Системна інформація
uname -a           # Інформація про систему
df -h              # Вільне місце на дисках
du -sh directory/  # Розмір каталогу
free -h            # Пам'ять
uptime             # Час роботи
whoami             # Поточний користувач
```

### Гарячі клавіші Bash (Readline)

```
┌─────────────────────────────────────────────────────────────────┐
│                    BASH KEYBOARD SHORTCUTS                      │
│                                                                 │
│   Навігація:                                                   │
│   Ctrl+A         Початок рядка                                 │
│   Ctrl+E         Кінець рядка                                  │
│   Alt+F          Вперед на слово                               │
│   Alt+B          Назад на слово                                │
│   Ctrl+←/→       Вперед/назад на слово (деякі термінали)       │
│                                                                 │
│   Редагування:                                                 │
│   Ctrl+U         Видалити все до початку                       │
│   Ctrl+K         Видалити все до кінця                         │
│   Ctrl+W         Видалити слово перед курсором                 │
│   Alt+D          Видалити слово після курсора                  │
│   Ctrl+Y         Вставити останнє видалене (yank)              │
│   Ctrl+_         Undo                                          │
│                                                                 │
│   Історія:                                                     │
│   Ctrl+R         Пошук в історії (reverse-i-search)            │
│   Ctrl+G         Вийти з пошуку                                │
│   ↑/↓            Попередня/наступна команда                    │
│   !!             Повторити останню команду                     │
│   !$             Останній аргумент попередньої команди         │
│   !n             Команда номер n з історії                     │
│   history        Показати історію                              │
│                                                                 │
│   Контроль:                                                    │
│   Ctrl+C         Перервати виконання                           │
│   Ctrl+D         EOF / вийти з shell                           │
│   Ctrl+Z         Suspend (призупинити, fg для продовження)     │
│   Ctrl+L         Очистити екран (як clear)                     │
│   Tab            Автодоповнення                                │
│   Tab Tab        Показати всі варіанти                         │
└─────────────────────────────────────────────────────────────────┘
```

### Корисні налаштування .bashrc

```bash
# ~/.bashrc

# Кольоровий prompt
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Аліаси
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias df='df -h'
alias free='free -h'
alias update='sudo apt update && sudo apt upgrade'

# Історія
HISTSIZE=10000
HISTFILESIZE=20000
HISTCONTROL=ignoreboth:erasedups  # Ігнорувати дублікати

# Автодоповнення (case-insensitive)
bind "set completion-ignore-case on"

# Показувати всі варіанти після одного Tab
bind "set show-all-if-ambiguous on"

# Безпечні операції
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'

# Корисні функції
mkcd() { mkdir -p "$1" && cd "$1"; }
extract() {
    if [ -f "$1" ]; then
        case "$1" in
            *.tar.bz2)   tar xjf "$1"   ;;
            *.tar.gz)    tar xzf "$1"   ;;
            *.tar.xz)    tar xJf "$1"   ;;
            *.bz2)       bunzip2 "$1"   ;;
            *.gz)        gunzip "$1"    ;;
            *.tar)       tar xf "$1"    ;;
            *.zip)       unzip "$1"     ;;
            *.7z)        7z x "$1"      ;;
            *)           echo "Cannot extract '$1'" ;;
        esac
    fi
}
```

## Midnight Commander (mc)

**Midnight Commander (mc)** — двопанельний файловий менеджер для консолі. Аналог Norton Commander / Total Commander.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MIDNIGHT COMMANDER                           │
│                                                                 │
│   ┌─ Left ──────────────────┬─ Right ─────────────────┐        │
│   │ /home/user/Documents    │ /home/user/Downloads    │        │
│   ├─────────────────────────┼─────────────────────────┤        │
│   │ /..                     │ /..                     │        │
│   │ /folder1               │  file1.pdf             │        │
│   │ /folder2               │  file2.zip             │        │
│   │  document.txt          │ /temp                  │        │
│   │  image.png             │                         │        │
│   │  script.sh             │                         │        │
│   │                         │                         │        │
│   │                         │                         │        │
│   └─────────────────────────┴─────────────────────────┘        │
│   Hint: The strstrings strare strstrings...                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 1Help 2Menu 3View 4Edit 5Copy 6Move 7Mkdir 8Del 9Menu 0Quit│
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Дві панелі: ліва та права                                    │
│   F-клавіші внизу для швидких операцій                         │
│   Tab — переключення між панелями                              │
└─────────────────────────────────────────────────────────────────┘
```

### Встановлення та запуск

```bash
# Встановити
sudo apt install mc

# Fedora
sudo dnf install mc

# Arch
sudo pacman -S mc

# Запустити
mc

# З правами root
sudo mc

# Відкрити в конкретному каталозі
mc /var/log
```

### Гарячі клавіші mc

| Клавіша | Дія |
|---------|-----|
| `F1` | Довідка |
| `F2` | User menu |
| `F3` | Переглянути файл |
| `F4` | Редагувати файл |
| `F5` | Копіювати |
| `F6` | Перемістити/перейменувати |
| `F7` | Створити каталог |
| `F8` | Видалити |
| `F9` | Меню (File, Command, Options...) |
| `F10` | Вийти |
| `Tab` | Переключити панель |
| `Insert` | Виділити файл |
| `+` | Виділити за маскою (*.txt) |
| `-` | Зняти виділення за маскою |
| `*` | Інвертувати виділення |
| `Ctrl+O` | Показати/приховати консоль |
| `Ctrl+U` | Поміняти панелі місцями |
| `Ctrl+\` | Directory hotlist |
| `Alt+?` | Пошук файлу |
| `Alt+C` | Quick cd |

### Можливості mc

```bash
# Вбудований редактор
mcedit file.txt
# Або F4 на файлі в mc

# Вбудований переглядач
mcview file.txt
# Або F3 на файлі в mc

# Diff між файлами
mcdiff file1 file2
```

**FTP/SFTP підключення:**
```
F9 → Left (або Right) → Shell link...
user@hostname:/path

Або введіть в рядок шляху:
sh://user@hostname/path
ftp://ftp.example.com/pub
```

**Робота з архівами:**
- Натисніть Enter на архіві (.tar.gz, .zip, .rar)
- mc відкриє його як каталог
- Можна копіювати файли всередину/назовні

### Конфігурація mc

```bash
# Файли конфігурації
~/.config/mc/ini          # Основні налаштування
~/.config/mc/panels.ini   # Налаштування панелей
~/.config/mc/menu         # User menu (F2)
~/.config/mc/bindings     # Прив'язки клавіш

# F9 → Options → Configuration
# F9 → Options → Panel options
# F9 → Options → Appearance (кольори)

# Skin (тема кольорів)
# F9 → Options → Appearance → Skin
# Популярні: modarcon16, gotar, sand256
```

## Альтернативи Midnight Commander

| Програма | Мова | Опис |
|----------|------|------|
| **ranger** | Python | Vim-like, трипанельний, preview |
| **nnn** | C | Дуже швидкий, мінімалістичний |
| **lf** | Go | Швидкий, конфігурується |
| **vifm** | C | Vim-bindings, двопанельний |
| **fff** | Bash | Простий, залежить тільки від bash |
| **broot** | Rust | Дерево каталогів, fuzzy search |

```bash
# ranger
sudo apt install ranger
ranger
# h,j,k,l — vim-навігація
# q — вийти

# nnn
sudo apt install nnn
nnn
# Дуже швидкий та легкий

# lf
# Встановлення з github releases
# go install github.com/gokcehan/lf@latest
```

## Screen та tmux

**Terminal multiplexer** — програма, що дозволяє мати кілька терміналів в одному вікні та зберігати сесії після відключення.

```
┌─────────────────────────────────────────────────────────────────┐
│                    TMUX SESSION                                 │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ 0:bash │ 1:vim │ 2:htop*│                               │  │
│   ├─────────────────────────┬───────────────────────────────┤  │
│   │                         │                               │  │
│   │    Pane 0               │       Pane 1                  │  │
│   │    (vim)                │       (terminal)              │  │
│   │                         │                               │  │
│   │                         │                               │  │
│   │                         │                               │  │
│   ├─────────────────────────┴───────────────────────────────┤  │
│   │                         Pane 2                          │  │
│   │                        (htop)                           │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│   [session-name] 0:bash 1:vim 2:htop          "hostname" 14:30 │
│                                                                 │
│   Можливості:                                                  │
│   • Windows (вкладки): Ctrl+B, c — нове, n/p — навігація      │
│   • Panes (split): Ctrl+B, % — vertical, " — horizontal       │
│   • Detach: Ctrl+B, d — відключитися (сесія живе)             │
│   • Attach: tmux attach — повернутися                          │
└─────────────────────────────────────────────────────────────────┘
```

### tmux команди

```bash
# Встановити
sudo apt install tmux

# Запустити нову сесію
tmux
tmux new -s session-name

# Відключитися (detach)
# Ctrl+B, потім d

# Список сесій
tmux ls

# Приєднатися до сесії
tmux attach
tmux attach -t session-name
tmux a  # Скорочення

# Завершити сесію
tmux kill-session -t session-name

# Основні комбінації (Ctrl+B = prefix)
# Ctrl+B, c     — нове вікно
# Ctrl+B, n     — наступне вікно
# Ctrl+B, p     — попереднє вікно
# Ctrl+B, 0-9   — вікно за номером
# Ctrl+B, %     — split вертикально
# Ctrl+B, "     — split горизонтально
# Ctrl+B, o     — переключити pane
# Ctrl+B, x     — закрити pane
# Ctrl+B, d     — detach
# Ctrl+B, [     — режим прокрутки (q для виходу)
# Ctrl+B, ?     — список всіх комбінацій
```

### screen (альтернатива)

```bash
# Встановити
sudo apt install screen

# Запустити
screen
screen -S session-name

# Detach: Ctrl+A, потім d
# Список: screen -ls
# Attach: screen -r session-name

# Основні комбінації (Ctrl+A = prefix)
# Ctrl+A, c     — нове вікно
# Ctrl+A, n     — наступне
# Ctrl+A, p     — попереднє
# Ctrl+A, "     — список вікон
# Ctrl+A, d     — detach
# Ctrl+A, S     — split horizontal
# Ctrl+A, |     — split vertical
```

## Практичне завдання

```bash
# 1. Переключитися на TTY3
# Ctrl+Alt+F3, логін, потім Ctrl+Alt+F1 назад

# 2. Перевірити поточний TTY
tty

# 3. Встановити mc
sudo apt install mc

# 4. Запустити mc
mc

# 5. Базові операції в mc
# F7 — створити каталог test
# Скопіювати файл (F5) між панелями
# Видалити (F8)
# F10 — вийти

# 6. Вбудований редактор
mcedit ~/.bashrc
# Ctrl+O — зберегти
# F10 — вийти

# 7. Пошук в історії bash
# Ctrl+R, почати вводити команду

# 8. Встановити та спробувати tmux
sudo apt install tmux
tmux
# Ctrl+B, c — нове вікно
# Ctrl+B, d — detach
tmux attach

# 9. Корисні команди
history | tail -20    # Останні 20 команд
history | grep ssh    # Пошук в історії

# 10. Інформація про систему
uname -a
cat /etc/os-release
```

## 💼 Real World: Console у Production

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONSOLE MODE В ENTERPRISE                       │
│                                                                 │
│   ☁️ CLOUD PROVIDERS (AWS, Google Cloud, Azure)                │
│   • SSH доступ до EC2/GCE/VM instances                         │
│   • tmux сесії для довготривалих операцій                      │
│   • Headless servers без GUI                                   │
│                                                                 │
│   🐳 DEVOPS & SRE (Netflix, Spotify, Uber)                     │
│   • Kubernetes troubleshooting через kubectl exec              │
│   • Docker containers = console-only                           │
│   • tmux для multi-pane debugging                              │
│                                                                 │
│   🔒 SECURITY (Penetration Testing, SOC)                       │
│   • Kali Linux в console mode                                  │
│   • tmux для parallel scans                                    │
│   • mc для filesystem analysis                                 │
│                                                                 │
│   📊 DATA SCIENCE (Facebook, LinkedIn)                         │
│   • SSH to GPU clusters                                        │
│   • tmux для Jupyter notebooks в background                    │
│   • ranger для dataset navigation                              │
│                                                                 │
│   🖥️ SERVER ADMINISTRATION                                     │
│   • Recovery mode troubleshooting                              │
│   • Remote server management                                   │
│   • Automation scripts                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Production сценарії

| Сценарій | Інструмент | Чому |
|----------|------------|------|
| **Long-running deploys** | tmux + detach | SSH disconnect не зупинить процес |
| **Multi-server ops** | tmux broadcast | Одна команда на всі panes |
| **Log analysis** | mc + viewer | Швидка навігація великими логами |
| **Emergency recovery** | TTY console | GUI crashed, потрібен доступ |
| **CI/CD debugging** | bash + screen | Інтерактивний shell в pipeline |

## 🎯 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   Linux System Administrator                                    │
│   ├── Зарплата: $60,000 - $100,000/рік                        │
│   ├── Навички: bash, ssh, tmux, troubleshooting               │
│   └── Компанії: будь-яка tech компанія                        │
│                                                                 │
│   DevOps Engineer                                               │
│   ├── Зарплата: $90,000 - $160,000/рік                        │
│   ├── Навички: bash scripting, tmux, containers               │
│   └── Компанії: Netflix, Spotify, startups                    │
│                                                                 │
│   Site Reliability Engineer (SRE)                               │
│   ├── Зарплата: $120,000 - $200,000/рік                       │
│   ├── Навички: Advanced bash, debugging, automation           │
│   └── Компанії: Google, Meta, Amazon                          │
│                                                                 │
│   Security Engineer / Pentester                                 │
│   ├── Зарплата: $100,000 - $180,000/рік                       │
│   ├── Навички: Console tools, scripting, forensics            │
│   └── Компанії: CrowdStrike, Mandiant, consulting             │
│                                                                 │
│   Cloud Engineer                                                │
│   ├── Зарплата: $100,000 - $170,000/рік                       │
│   ├── Навички: SSH, bash, cloud CLIs, tmux                    │
│   └── Компанії: AWS, GCP, Azure partners                      │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Resources

### Онлайн практика
- [OverTheWire: Bandit](https://overthewire.org/wargames/bandit/) — CLI challenges
- [Linux Journey](https://linuxjourney.com/) — інтерактивний курс
- [Terminus](https://web.mit.edu/mprat/Public/web/Terminus/Web/main.html) — text adventure для CLI
- [Exercism: Bash Track](https://exercism.org/tracks/bash) — вправи з bash

### Cheat Sheets
- [Bash Cheat Sheet](https://devhints.io/bash)
- [tmux Cheat Sheet](https://tmuxcheatsheet.com/)
- [Readline Shortcuts](https://readline.kablrat.com/)

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                 CONSOLE MODE QUICK REFERENCE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   TTY Navigation:                                               │
│   Ctrl+Alt+F1-F6    Switch to TTY1-6                           │
│   Ctrl+Alt+F1/F7    Back to GUI (varies by distro)             │
│   tty               Show current TTY                           │
│   who               Who is logged in                           │
│                                                                 │
│   Bash Essentials:                                              │
│   Ctrl+R            Reverse history search                     │
│   Ctrl+A/E          Beginning/end of line                      │
│   Ctrl+U/K          Delete to start/end                        │
│   Ctrl+W            Delete word backward                       │
│   Ctrl+L            Clear screen                               │
│   Ctrl+C            Interrupt                                  │
│   Ctrl+D            EOF/exit                                   │
│   Ctrl+Z            Suspend (fg to resume)                     │
│   !!                Repeat last command                        │
│   !$                Last argument                              │
│                                                                 │
│   tmux (prefix = Ctrl+B):                                      │
│   Ctrl+B c          New window                                 │
│   Ctrl+B n/p        Next/previous window                       │
│   Ctrl+B %          Split vertical                             │
│   Ctrl+B "          Split horizontal                           │
│   Ctrl+B o          Switch pane                                │
│   Ctrl+B d          Detach                                     │
│   tmux a            Attach to session                          │
│                                                                 │
│   mc (Midnight Commander):                                     │
│   F3/F4             View/Edit                                  │
│   F5/F6             Copy/Move                                  │
│   F7/F8             Mkdir/Delete                               │
│   F10               Quit                                       │
│   Ctrl+O            Toggle console                             │
│   Tab               Switch panel                               │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Що таке TTY і як переключитися на TTY3?**
   - TTY = TeleTYpe, віртуальний термінал
   - `Ctrl+Alt+F3` для переключення

2. **Яка різниця між terminal emulator і shell?**
   - Terminal emulator = GUI програма (gnome-terminal, alacritty)
   - Shell = command interpreter (bash, zsh, fish)

3. **Як знайти команду в історії bash?**
   - `Ctrl+R` → почати вводити
   - `history | grep keyword`

4. **Що робить tmux detach і як повернутися до сесії?**
   - `Ctrl+B, d` — відключитися (сесія продовжує працювати)
   - `tmux attach` або `tmux a` — повернутися

5. **Які F-клавіші в mc відповідають за Copy та Delete?**
   - `F5` — Copy
   - `F8` — Delete

## 🎯 Міні-проект (30 хв)

### Завдання: Налаштуйте ідеальне консольне середовище розробника

Створіть повноцінне productivity-середовище з tmux, налаштованим bash та швидкими командами. Це те, що використовують професійні DevOps-інженери!

**Кроки:**

1. Створіть потужний .bashrc:
```bash
nano ~/.bashrc
```

Додайте в кінець:
```bash
# ============================
# MY PRODUCTIVITY SETUP
# ============================

# Кольоровий prompt з git branch
parse_git_branch() {
    git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[33m\]$(parse_git_branch)\[\033[00m\]\$ '

# Корисні aliases
alias ll='ls -lah --color=auto'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias df='df -h'
alias free='free -h'
alias ports='ss -tuln'
alias myip='curl -s ifconfig.me && echo'
alias update='sudo apt update && sudo apt upgrade -y'
alias cls='clear'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline -10'

# Функції
mkcd() { mkdir -p "$1" && cd "$1"; }
extract() {
    case "$1" in
        *.tar.gz)  tar xzf "$1" ;;
        *.tar.bz2) tar xjf "$1" ;;
        *.tar.xz)  tar xJf "$1" ;;
        *.zip)     unzip "$1" ;;
        *)         echo "Cannot extract $1" ;;
    esac
}

# Історія
HISTSIZE=50000
HISTFILESIZE=100000
HISTCONTROL=ignoreboth:erasedups
shopt -s histappend

# Автодоповнення
bind "set completion-ignore-case on"
bind "set show-all-if-ambiguous on"
```

2. Налаштуйте tmux:
```bash
nano ~/.tmux.conf
```

```bash
# Змінити prefix на Ctrl+A
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# Легке розділення вікон
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# Vim-style навігація між panes
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Mouse support
set -g mouse on

# Нумерація з 1
set -g base-index 1
setw -g pane-base-index 1

# Кольоровий термінал
set -g default-terminal "screen-256color"

# Статус-бар
set -g status-style bg=black,fg=white
set -g status-left '[#S] '
set -g status-right '%H:%M %d-%b'

# Швидке перезавантаження конфігу
bind r source-file ~/.tmux.conf \; display "Config reloaded!"
```

3. Створіть скрипт швидкого старту dev-сесії:
```bash
mkdir -p ~/scripts
nano ~/scripts/dev-session.sh
```

```bash
#!/bin/bash
# Development Session Launcher

SESSION="dev"

# Перевірити чи сесія існує
tmux has-session -t $SESSION 2>/dev/null

if [ $? != 0 ]; then
    echo "Creating new tmux session..."

    # Створити сесію з першим вікном
    tmux new-session -d -s $SESSION -n 'code'
    tmux send-keys -t $SESSION:code 'cd ~/projects && clear' C-m

    # Друге вікно - термінал
    tmux new-window -t $SESSION -n 'terminal'
    tmux send-keys -t $SESSION:terminal 'cd ~ && clear' C-m

    # Третє вікно - моніторинг
    tmux new-window -t $SESSION -n 'monitor'
    tmux send-keys -t $SESSION:monitor 'htop' C-m

    # Повернутися на перше вікно
    tmux select-window -t $SESSION:code

    echo "Session '$SESSION' created with 3 windows: code, terminal, monitor"
fi

# Приєднатися до сесії
tmux attach-session -t $SESSION
```

4. Зробіть виконуваним та додайте alias:
```bash
chmod +x ~/scripts/dev-session.sh
echo 'alias dev="~/scripts/dev-session.sh"' >> ~/.bashrc
source ~/.bashrc
```

5. Протестуйте:
```bash
# Застосуйте нові налаштування
source ~/.bashrc

# Запустіть mc
mc

# Запустіть dev-сесію
dev

# В tmux:
# Ctrl+A, | - split вертикально
# Ctrl+A, - - split горизонтально
# Ctrl+A, d - detach
# Ctrl+A, 1/2/3 - переключити вікно
```

**Очікуваний результат:**
- Кольоровий prompt з git branch
- 10+ корисних aliases
- Налаштований tmux з легкими shortcuts
- Скрипт `dev` для швидкого старту сесії

**Бонус (для допитливих):**
- Встановіть zsh + oh-my-zsh для ще потужнішого shell
- Налаштуйте powerline або starship для красивого prompt
- Створіть різні сесії: `dev`, `admin`, `logs` з відповідними layouts
- Встановіть ranger як альтернативу mc: `sudo apt install ranger`

## Підсумок

| Компонент | Призначення |
|-----------|-------------|
| TTY (tty1-6) | Віртуальні консолі |
| Термінальний емулятор | GUI-програма для CLI |
| Shell (bash, zsh) | Командний інтерпретатор |
| mc | Файловий менеджер |
| tmux/screen | Terminal multiplexer |

| Клавіша mc | Дія |
|------------|-----|
| `F3` | Переглянути |
| `F4` | Редагувати |
| `F5` | Копіювати |
| `F6` | Перемістити |
| `F7` | Mkdir |
| `F8` | Видалити |
| `F10` | Вийти |
| `Tab` | Змінити панель |
| `Ctrl+O` | Показати консоль |

| Bash Shortcut | Дія |
|---------------|-----|
| `Ctrl+R` | Пошук в історії |
| `Ctrl+A/E` | Початок/кінець рядка |
| `Ctrl+U/K` | Видалити до початку/кінця |
| `Ctrl+C` | Перервати |
| `Ctrl+D` | EOF/вийти |
| `Ctrl+L` | Очистити екран |
| `Tab` | Автодоповнення |

Це завершує теоретичну частину модуля. Далі — лабораторні роботи.
