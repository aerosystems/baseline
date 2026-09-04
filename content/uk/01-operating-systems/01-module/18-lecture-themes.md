---
title: "Теми робочого стола. Шрифти. Друк"
type: lecture
order: 18
preview: "Теми GTK/Qt, налаштування шрифтів, CUPS."
---

## Теми в Linux

Linux використовує два основних toolkit'и: **GTK** (GNOME) і **Qt** (KDE). Кожен має свої теми.

```
┌─────────────────────────────────────────────────────────────────┐
│                    КОМПОНЕНТИ ТЕМ                               │
│                                                                 │
│   ┌─────────────────┐  ┌─────────────────┐                     │
│   │   GTK Theme     │  │   Qt Theme      │                     │
│   │   (Applications)│  │   (Applications)│                     │
│   └─────────────────┘  └─────────────────┘                     │
│                                                                 │
│   ┌─────────────────┐  ┌─────────────────┐                     │
│   │   Icon Theme    │  │  Cursor Theme   │                     │
│   │   (Papirus,     │  │   (Bibata,      │                     │
│   │    Adwaita)     │  │    DMZ)         │                     │
│   └─────────────────┘  └─────────────────┘                     │
│                                                                 │
│   ┌─────────────────┐                                          │
│   │  Shell Theme    │  ← Тільки GNOME                          │
│   │  (Панель, меню) │                                          │
│   └─────────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Встановлення тем

```bash
# Системні теми
ls /usr/share/themes/
ls /usr/share/icons/

# Користувацькі теми
mkdir -p ~/.themes ~/.icons
# Розпакувати тему в ~/.themes/ThemeName/

# Популярні теми
sudo apt install arc-theme papirus-icon-theme

# Застосувати (GNOME)
gsettings set org.gnome.desktop.interface gtk-theme "Arc-Dark"
gsettings set org.gnome.desktop.interface icon-theme "Papirus-Dark"
```

### GTK vs Qt сумісність

```bash
# Щоб Qt програми виглядали як GTK (GNOME)
sudo apt install qt5ct qt5-style-plugins
export QT_QPA_PLATFORMTHEME=qt5ct
# Налаштувати через qt5ct

# KDE: GTK програми використовуватимуть Qt theme автоматично
# System Settings → Application Style → GNOME/GTK Application Style
```

## Шрифти

### Системні шрифти

```
┌─────────────────────────────────────────────────────────────────┐
│                    РОЗТАШУВАННЯ ШРИФТІВ                         │
│                                                                 │
│   Системні:        /usr/share/fonts/                           │
│   Користувацькі:   ~/.local/share/fonts/ або ~/.fonts/         │
│                                                                 │
│   Формати:                                                     │
│   • TrueType (.ttf)                                            │
│   • OpenType (.otf)                                            │
│   • Web Fonts (.woff, .woff2)                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Встановити шрифт
mkdir -p ~/.local/share/fonts
cp MyFont.ttf ~/.local/share/fonts/
fc-cache -fv  # Оновити кеш

# Список шрифтів
fc-list | grep -i "noto"

# Популярні шрифти
sudo apt install fonts-noto fonts-firacode fonts-jetbrains-mono

# Microsoft fonts (потрібен ttf-mscorefonts-installer)
sudo apt install ttf-mscorefonts-installer
```

### Налаштування шрифтів

```bash
# GNOME
gsettings set org.gnome.desktop.interface font-name 'Noto Sans 11'
gsettings set org.gnome.desktop.interface monospace-font-name 'JetBrains Mono 10'

# Antialiasing
gsettings set org.gnome.desktop.interface font-antialiasing 'subpixel'
gsettings set org.gnome.desktop.interface font-hinting 'slight'

# KDE: System Settings → Fonts
```

### Fontconfig

```bash
# ~/.config/fontconfig/fonts.conf
cat > ~/.config/fontconfig/fonts.conf << 'EOF'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <match target="font">
    <edit name="antialias" mode="assign"><bool>true</bool></edit>
    <edit name="hinting" mode="assign"><bool>true</bool></edit>
    <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>
    <edit name="rgba" mode="assign"><const>rgb</const></edit>
  </match>
</fontconfig>
EOF

fc-cache -fv
```

## Друк (CUPS)

**CUPS (Common Unix Printing System)** — система друку в Linux.

```
┌─────────────────────────────────────────────────────────────────┐
│                    АРХІТЕКТУРА CUPS                             │
│                                                                 │
│   Application  →  CUPS Daemon  →  Printer Driver  →  Printer   │
│                                                                 │
│   Конфігурація: /etc/cups/                                     │
│   Логи:         /var/log/cups/                                 │
│   Web UI:       http://localhost:631                           │
└─────────────────────────────────────────────────────────────────┘
```

### Керування принтерами

```bash
# Встановити CUPS
sudo apt install cups cups-client

# Статус
sudo systemctl status cups

# Web-інтерфейс
xdg-open http://localhost:631

# Командний рядок
lpstat -p              # Список принтерів
lpstat -d              # Принтер за замовчуванням
lp -d printer file.pdf # Друкувати файл
lpq                    # Черга друку
cancel job_id          # Скасувати завдання

# Додати принтер
sudo lpadmin -p MyPrinter -E -v ipp://printer.local/ipp/print

# Встановити за замовчуванням
sudo lpadmin -d MyPrinter
```

### Драйвери принтерів

```bash
# Загальні драйвери
sudo apt install printer-driver-gutenprint
sudo apt install hplip               # HP принтери
sudo apt install brother-*           # Brother

# HP принтери (GUI)
hp-setup
hp-toolbox
```

## Dark Mode

```bash
# GNOME
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

# GTK3
GTK_THEME=Adwaita:dark firefox

# GTK4
ADW_DEBUG_COLOR_SCHEME=prefer-dark

# Для окремих програм
cat >> ~/.config/gtk-3.0/settings.ini << EOF
[Settings]
gtk-application-prefer-dark-theme=1
EOF
```

## Практичне завдання

```bash
# 1. Поточна тема
gsettings get org.gnome.desktop.interface gtk-theme

# 2. Поточний шрифт
gsettings get org.gnome.desktop.interface font-name

# 3. Список шрифтів
fc-list | wc -l

# 4. Статус CUPS
systemctl status cups

# 5. Принтери
lpstat -p -d

# 6. Встановити тему Papirus
sudo apt install papirus-icon-theme
gsettings set org.gnome.desktop.interface icon-theme 'Papirus'
```

## Підсумок

| Компонент | Розташування |
|-----------|--------------|
| GTK теми | ~/.themes/, /usr/share/themes/ |
| Іконки | ~/.icons/, /usr/share/icons/ |
| Шрифти | ~/.local/share/fonts/ |
| CUPS | http://localhost:631 |

| Команда | Призначення |
|---------|-------------|
| `fc-cache -fv` | Оновити кеш шрифтів |
| `fc-list` | Список шрифтів |
| `lpstat -p` | Список принтерів |
| `lp file.pdf` | Друк файлу |

На наступній лекції — консольний режим Linux.
