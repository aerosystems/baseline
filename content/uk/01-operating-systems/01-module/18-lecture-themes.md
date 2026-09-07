---
title: "Теми робочого стола. Шрифти. Друк"
type: lecture
order: 18
preview: "Теми GTK/Qt, налаштування шрифтів, CUPS."
---

## Теми в Linux

Linux використовує два основних GUI toolkit'и: **GTK** (GNOME) і **Qt** (KDE). Кожен має свої теми, і важливо розуміти як вони працюють разом.

```
┌─────────────────────────────────────────────────────────────────┐
│                    КОМПОНЕНТИ ТЕМ                               │
│                                                                 │
│   ┌───────────────────────────────────────────────────────────┐│
│   │                        THEME                               ││
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    ││
│   │  │  GTK Theme   │  │   Qt Theme   │  │ Shell Theme  │    ││
│   │  │ (Applications)│  │ (Applications)│  │(Panel, menu)│    ││
│   │  │              │  │              │  │ GNOME only  │    ││
│   │  │ Adwaita      │  │ Breeze       │  │ Adwaita     │    ││
│   │  │ Arc          │  │ Kvantum      │  │ Yaru        │    ││
│   │  └──────────────┘  └──────────────┘  └──────────────┘    ││
│   │                                                           ││
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    ││
│   │  │  Icon Theme  │  │ Cursor Theme │  │ Sound Theme  │    ││
│   │  │              │  │              │  │              │    ││
│   │  │ Papirus      │  │ Bibata       │  │ freedesktop  │    ││
│   │  │ Adwaita      │  │ DMZ          │  │ Yaru         │    ││
│   │  │ Numix        │  │ Breeze       │  │              │    ││
│   │  └──────────────┘  └──────────────┘  └──────────────┘    ││
│   └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### GTK Themes

**GTK** (GIMP Toolkit) — toolkit для GNOME та пов'язаних DE. Версії: GTK2, GTK3, GTK4.

```bash
# Де зберігаються теми
ls /usr/share/themes/          # Системні
ls ~/.themes/                   # Користувацькі
ls ~/.local/share/themes/       # Користувацькі (сучасний шлях)

# Структура теми
# ThemeName/
# ├── gtk-2.0/
# │   └── gtkrc
# ├── gtk-3.0/
# │   └── gtk.css
# ├── gtk-4.0/
# │   └── gtk.css
# └── index.theme

# Встановити тему з архіву
mkdir -p ~/.themes
cd ~/.themes
tar -xf ~/Downloads/Arc-Dark.tar.xz
```

### Популярні GTK теми

| Тема | Стиль | Опис |
|------|-------|------|
| **Adwaita** | GNOME default | Офіційна тема GNOME |
| **Arc** | Flat, modern | Дуже популярна, є Dark варіант |
| **Materia** | Material Design | Google Material style |
| **Nordic** | Nord color scheme | Темні, приємні кольори |
| **Dracula** | Dracula colors | Фіолетова палітра |
| **Catppuccin** | Pastel colors | 4 варіанти кольорів |
| **Orchis** | Modern, flat | Схожа на macOS |

```bash
# Встановити популярні теми (Ubuntu/Debian)
sudo apt install arc-theme
sudo apt install materia-gtk-theme
sudo apt install numix-gtk-theme

# Arch
sudo pacman -S arc-gtk-theme materia-gtk-theme

# Застосувати тему (GNOME)
gsettings set org.gnome.desktop.interface gtk-theme "Arc-Dark"

# Перевірити поточну тему
gsettings get org.gnome.desktop.interface gtk-theme

# GNOME Tweaks — візуальний вибір теми
gnome-tweaks
# Appearance → Applications
```

### Qt Themes

**Qt** — toolkit для KDE та багатьох кросплатформних програм. Qt програми виглядають інакше в GTK-середовищах без додаткового налаштування.

```bash
# Qt5 Settings (для GTK-based DE)
sudo apt install qt5ct qt5-style-plugins

# Налаштувати
export QT_QPA_PLATFORMTHEME=qt5ct
qt5ct  # GUI налаштування

# Додати в ~/.profile або ~/.bashrc
echo 'export QT_QPA_PLATFORMTHEME=qt5ct' >> ~/.profile

# KDE: Qt програми автоматично використовують Plasma стилі
# System Settings → Application Style

# Kvantum — движок тем для Qt
sudo apt install kvantum
kvantummanager  # GUI для вибору теми
```

### GTK в KDE / Qt в GNOME

```
┌─────────────────────────────────────────────────────────────────┐
│                    CROSS-TOOLKIT THEMING                        │
│                                                                 │
│   GNOME (GTK-based):                                           │
│   • GTK apps → GTK theme автоматично                           │
│   • Qt apps → потрібен qt5ct або QGtkStyle                     │
│                                                                 │
│   KDE (Qt-based):                                              │
│   • Qt apps → Plasma theme автоматично                         │
│   • GTK apps → System Settings → Application Style             │
│                → GNOME/GTK Application Style                    │
│                                                                 │
│   Рекомендація:                                                │
│   Обирайте теми, що мають і GTK, і Qt варіанти:               │
│   • Arc (GTK + Kvantum)                                        │
│   • Breeze (KDE default, є GTK port)                           │
│   • Materia (GTK + Kvantum)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Icon Themes

```bash
# Де зберігаються іконки
ls /usr/share/icons/            # Системні
ls ~/.local/share/icons/        # Користувацькі
ls ~/.icons/                    # Користувацькі (legacy)

# Популярні набори іконок
sudo apt install papirus-icon-theme      # Найпопулярніший, 50000+ іконок
sudo apt install numix-icon-theme        # Круглі іконки
sudo apt install breeze-icon-theme       # KDE default
sudo apt install moka-icon-theme         # Flat, colorful

# Застосувати (GNOME)
gsettings set org.gnome.desktop.interface icon-theme "Papirus-Dark"

# Варіанти Papirus
# Papirus, Papirus-Dark, Papirus-Light
# ePapirus (для elementary OS)
```

### Cursor Themes

```bash
# Де зберігаються курсори
ls /usr/share/icons/*/cursors
ls ~/.local/share/icons/*/cursors

# Встановити Bibata (сучасний курсор)
# Завантажити з https://github.com/ful1e5/Bibata_Cursor
# Розпакувати в ~/.local/share/icons/

# Застосувати
gsettings set org.gnome.desktop.interface cursor-theme "Bibata-Modern-Classic"
gsettings set org.gnome.desktop.interface cursor-size 24

# Для X11 (legacy)
echo 'Xcursor.theme: Bibata-Modern-Classic' >> ~/.Xresources
xrdb -merge ~/.Xresources
```

## Шрифти

Шрифти критично важливі для читабельності та естетики системи. Linux підтримує TrueType (.ttf) та OpenType (.otf) шрифти.

```
┌─────────────────────────────────────────────────────────────────┐
│                    РОЗТАШУВАННЯ ШРИФТІВ                         │
│                                                                 │
│   Системні шрифти:                                             │
│   /usr/share/fonts/                                            │
│   /usr/share/fonts/truetype/                                   │
│   /usr/share/fonts/opentype/                                   │
│                                                                 │
│   Користувацькі шрифти:                                        │
│   ~/.local/share/fonts/       (рекомендовано)                  │
│   ~/.fonts/                   (legacy, але працює)             │
│                                                                 │
│   Формати:                                                     │
│   • TrueType (.ttf)  — найпоширеніший                         │
│   • OpenType (.otf)  — розширений TrueType                     │
│   • Web Fonts (.woff, .woff2) — для браузерів                  │
│                                                                 │
│   Типи шрифтів:                                                │
│   • Sans-serif — без засічок (Noto Sans, Roboto)              │
│   • Serif — із засічками (Noto Serif, Liberation Serif)        │
│   • Monospace — моноширинні (JetBrains Mono, Fira Code)       │
└─────────────────────────────────────────────────────────────────┘
```

### Встановлення шрифтів

```bash
# Ручне встановлення
mkdir -p ~/.local/share/fonts
cp ~/Downloads/MyFont.ttf ~/.local/share/fonts/

# Оновити кеш шрифтів
fc-cache -fv

# Перевірити чи шрифт встановлено
fc-list | grep "MyFont"

# Пошук шрифту
fc-list | grep -i "mono"
fc-list : family | sort | uniq | grep -i "jet"

# Детальна інформація про шрифт
fc-match "JetBrains Mono"
```

### Популярні шрифти

| Шрифт | Тип | Опис |
|-------|-----|------|
| **Noto Sans/Serif** | UI | Google, підтримка всіх мов |
| **Roboto** | UI | Google, Material Design |
| **Inter** | UI | Для інтерфейсів |
| **JetBrains Mono** | Monospace | Для коду, лігатури |
| **Fira Code** | Monospace | Mozilla, лігатури |
| **Cascadia Code** | Monospace | Microsoft, лігатури |
| **Source Code Pro** | Monospace | Adobe |
| **Ubuntu** | UI | Canonical, Ubuntu default |
| **Liberation** | Office | Заміна для MS fonts |

```bash
# Встановити популярні шрифти (Ubuntu/Debian)
sudo apt install fonts-noto fonts-noto-color-emoji
sudo apt install fonts-firacode
sudo apt install fonts-jetbrains-mono
sudo apt install fonts-roboto

# Microsoft fonts (потрібно прийняти ліцензію)
sudo apt install ttf-mscorefonts-installer

# Arch
sudo pacman -S noto-fonts noto-fonts-emoji ttf-jetbrains-mono

# Nerd Fonts (з іконками для терміналу)
# Завантажити з https://www.nerdfonts.com/
# JetBrainsMono Nerd Font, FiraCode Nerd Font, etc.
```

### Налаштування шрифтів

```bash
# GNOME: налаштувати шрифти
gsettings set org.gnome.desktop.interface font-name 'Noto Sans 11'
gsettings set org.gnome.desktop.interface document-font-name 'Noto Sans 11'
gsettings set org.gnome.desktop.interface monospace-font-name 'JetBrains Mono 10'
gsettings set org.gnome.desktop.wm.preferences titlebar-font 'Noto Sans Bold 11'

# Антиаліасинг (згладжування)
gsettings set org.gnome.desktop.interface font-antialiasing 'subpixel'
# Опції: none, grayscale, subpixel

# Hinting (підгонка під пікселі)
gsettings set org.gnome.desktop.interface font-hinting 'slight'
# Опції: none, slight, medium, full

# GUI: GNOME Tweaks → Fonts
gnome-tweaks

# KDE: System Settings → Fonts
# Кожен тип шрифту налаштовується окремо
```

### Fontconfig

**Fontconfig** — система конфігурації шрифтів у Linux. Дозволяє тонке налаштування рендеринга.

```bash
# Глобальна конфігурація
ls /etc/fonts/conf.d/

# Користувацька конфігурація
mkdir -p ~/.config/fontconfig
```

```xml
<!-- ~/.config/fontconfig/fonts.conf -->
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- Антиаліасинг -->
  <match target="font">
    <edit name="antialias" mode="assign"><bool>true</bool></edit>
    <edit name="hinting" mode="assign"><bool>true</bool></edit>
    <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>
    <edit name="rgba" mode="assign"><const>rgb</const></edit>
    <edit name="lcdfilter" mode="assign"><const>lcddefault</const></edit>
  </match>

  <!-- Заміна шрифту (fallback) -->
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Noto Sans</family>
      <family>DejaVu Sans</family>
    </prefer>
  </alias>

  <alias>
    <family>monospace</family>
    <prefer>
      <family>JetBrains Mono</family>
      <family>Fira Code</family>
    </prefer>
  </alias>
</fontconfig>
```

```bash
# Застосувати зміни
fc-cache -fv

# Перевірити fallback
fc-match sans-serif
fc-match monospace
```

## Друк (CUPS)

**CUPS (Common Unix Printing System)** — стандартна система друку в Linux та macOS. Розроблена Apple.

```
┌─────────────────────────────────────────────────────────────────┐
│                    АРХІТЕКТУРА CUPS                             │
│                                                                 │
│   ┌────────────┐    ┌────────────┐    ┌────────────┐           │
│   │Application │───►│   CUPS     │───►│  Printer   │           │
│   │ (Firefox)  │    │  Daemon    │    │  (Driver)  │           │
│   └────────────┘    │  (cupsd)   │    └────────────┘           │
│         │           └────────────┘           │                 │
│         │                 │                  │                 │
│         ▼                 ▼                  ▼                 │
│   Print Dialog      Job Queue           Physical              │
│                                          Printer               │
│                                                                 │
│   Конфігурація:     /etc/cups/                                 │
│   Логи:            /var/log/cups/                              │
│   Спул (черга):    /var/spool/cups/                            │
│   Web UI:          http://localhost:631                        │
└─────────────────────────────────────────────────────────────────┘
```

### Встановлення та налаштування

```bash
# Встановити CUPS
sudo apt install cups cups-client printer-driver-gutenprint

# Статус служби
sudo systemctl status cups
sudo systemctl enable --now cups

# Web-інтерфейс (найзручніший спосіб)
xdg-open http://localhost:631

# Додати користувача до групи lpadmin (для адміністрування)
sudo usermod -aG lpadmin $USER
# Потрібно перелогінитися
```

### Командний рядок

```bash
# Список принтерів
lpstat -p -d
# -p — показати принтери
# -d — принтер за замовчуванням

# Статус принтера
lpstat -p MyPrinter

# Друкувати файл
lp document.pdf
lp -d PrinterName document.pdf
lp -n 2 document.pdf              # 2 копії
lp -o landscape document.pdf      # Альбомна орієнтація
lp -o sides=two-sided-long-edge document.pdf  # Двосторонній

# Черга друку
lpq
lpq -P PrinterName

# Скасувати завдання
cancel job-id
cancel -a PrinterName             # Всі завдання принтера

# Призупинити/відновити принтер
cupsdisable PrinterName
cupsenable PrinterName

# Видалити принтер
lpadmin -x PrinterName
```

### Додавання принтера

```bash
# Через Web UI (рекомендовано)
# http://localhost:631 → Administration → Add Printer

# Через командний рядок
# USB принтер
lpadmin -p MyPrinter -E -v usb://HP/LaserJet%20Pro

# Мережевий принтер (IPP)
lpadmin -p OfficePrinter -E -v ipp://192.168.1.100/ipp/print

# Встановити за замовчуванням
lpadmin -d MyPrinter

# Перевірити конфігурацію
lpinfo -v     # Доступні підключення
lpinfo -m     # Доступні драйвери
```

### Драйвери принтерів

```bash
# Загальні драйвери (більшість принтерів)
sudo apt install printer-driver-gutenprint

# HP принтери
sudo apt install hplip hplip-gui
hp-setup        # GUI wizard
hp-toolbox      # Утиліти HP

# Brother принтери
# Завантажити .deb з сайту Brother
# sudo dpkg -i brgenml1lpr-*.deb brgenprintml1-*.deb

# Canon, Epson — також з офіційних сайтів

# CUPS-PDF (віртуальний PDF-принтер)
sudo apt install cups-pdf
# Друкує в ~/PDF/
```

### Troubleshooting

```bash
# Логи CUPS
sudo tail -f /var/log/cups/error_log
sudo tail -f /var/log/cups/access_log

# Перезапустити CUPS
sudo systemctl restart cups

# Debug режим
# Відредагувати /etc/cups/cupsd.conf
# LogLevel debug
sudo systemctl restart cups

# Тестовий друк
lpstat -d
echo "Test print" | lp
```

## Dark Mode

Dark Mode зменшує навантаження на очі та економить батарею на OLED-екранах.

```bash
# GNOME: системний Dark Mode
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
# Варіанти: 'default', 'prefer-dark', 'prefer-light'

# Перевірити
gsettings get org.gnome.desktop.interface color-scheme

# Для окремих GTK програм
GTK_THEME=Adwaita:dark firefox

# GTK 3 конфігурація
mkdir -p ~/.config/gtk-3.0
cat >> ~/.config/gtk-3.0/settings.ini << 'EOF'
[Settings]
gtk-application-prefer-dark-theme=1
EOF

# GTK 4 (libadwaita)
# Програми автоматично слідують color-scheme

# KDE: System Settings → Appearance → Global Theme
# Або: Colors → Scheme → Breeze Dark
```

## Практичне завдання

```bash
# 1. Поточна тема GTK
gsettings get org.gnome.desktop.interface gtk-theme

# 2. Поточна тема іконок
gsettings get org.gnome.desktop.interface icon-theme

# 3. Поточний шрифт
gsettings get org.gnome.desktop.interface font-name

# 4. Список встановлених шрифтів
fc-list | wc -l
fc-list : family | sort | uniq | head -20

# 5. Статус CUPS
systemctl status cups

# 6. Список принтерів
lpstat -p -d

# 7. Встановити Papirus іконки
sudo apt install papirus-icon-theme
gsettings set org.gnome.desktop.interface icon-theme 'Papirus'

# 8. Встановити JetBrains Mono
sudo apt install fonts-jetbrains-mono
fc-cache -fv
gsettings set org.gnome.desktop.interface monospace-font-name 'JetBrains Mono 10'

# 9. Увімкнути Dark Mode
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'

# 10. Відкрити CUPS Web UI
xdg-open http://localhost:631
```

## 🏢 Real World: Theming та Typography в індустрії

```
┌─────────────────────────────────────────────────────────────────┐
│                 THEMING & FONTS У КОМПАНІЯХ                     │
│                                                                 │
│   🎨 DESIGN STUDIOS (Figma, Adobe, Canva)                      │
│   • Кастомні теми для brand consistency                        │
│   • Professional typography налаштування                       │
│   • Color calibration через GTK/Qt themes                      │
│                                                                 │
│   🏢 ENTERPRISE IT (IBM, Oracle, SAP)                          │
│   • Стандартизовані corporate themes                           │
│   • Centralized font deployment                                │
│   • CUPS print servers для офісів                              │
│                                                                 │
│   🎬 MEDIA & ENTERTAINMENT (Netflix, Spotify)                  │
│   • Dark themes для content creators                           │
│   • Nerd Fonts для developer terminals                         │
│   • Custom icon themes для internal tools                      │
│                                                                 │
│   📱 EMBEDDED SYSTEMS (Tesla, Medical devices)                 │
│   • Optimized fonts для embedded displays                      │
│   • Custom Qt themes для automotive HMI                        │
│   • Thermal printer integration (CUPS)                         │
│                                                                 │
│   🖨️ PRINT INDUSTRY (Publishing, Marketing)                   │
│   • CUPS для production printing                               │
│   • PostScript/PDF workflows                                   │
│   • Font management systems                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Реальні use cases

| Сфера | Технологія | Застосування |
|-------|------------|--------------|
| **Banking** | Custom GTK theme | Корпоративний branding терміналів |
| **Healthcare** | Large fonts + high contrast | Accessibility compliance |
| **Retail** | CUPS + thermal printers | POS системи, чеки |
| **Education** | Dyslexia-friendly fonts | Інклюзивне навчання |
| **DevOps** | Nerd Fonts + ligatures | Читабельність коду |

## 💼 Career Spotlight

```
┌─────────────────────────────────────────────────────────────────┐
│                 КАР'ЄРНІ МОЖЛИВОСТІ                             │
│                                                                 │
│   Linux Desktop Customization Specialist                        │
│   ├── Зарплата: $50,000 - $80,000/рік                         │
│   ├── Навички: GTK/Qt theming, fontconfig, accessibility      │
│   └── Компанії: Enterprise IT, UI/UX agencies                 │
│                                                                 │
│   Print Systems Administrator                                   │
│   ├── Зарплата: $55,000 - $90,000/рік                         │
│   ├── Навички: CUPS, IPP, printer drivers, networking         │
│   └── Компанії: Publishing, enterprise, healthcare            │
│                                                                 │
│   Typography Engineer                                           │
│   ├── Зарплата: $70,000 - $120,000/рік                        │
│   ├── Навички: Font development, fontconfig, rendering        │
│   └── Компанії: Google Fonts, Adobe, font foundries           │
│                                                                 │
│   Accessibility Specialist                                      │
│   ├── Зарплата: $60,000 - $100,000/рік                        │
│   ├── Навички: High contrast themes, screen readers           │
│   └── Компанії: Government, enterprise, education             │
│                                                                 │
│   UI/UX Developer (Linux)                                       │
│   ├── Зарплата: $80,000 - $140,000/рік                        │
│   ├── Навички: GTK CSS, Qt QML, theme development             │
│   └── Компанії: Canonical, Red Hat, System76                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔗 Корисні ресурси

### Онлайн-практика

| Ресурс | Опис | Посилання |
|--------|------|-----------|
| **GNOME Look** | Теми, іконки, курсори | gnome-look.org |
| **KDE Store** | KDE Plasma themes | store.kde.org |
| **Nerd Fonts** | Патчені шрифти для dev | nerdfonts.com |
| **Google Fonts** | Безкоштовні шрифти | fonts.google.com |
| **Oomox/Themix** | GTK theme generator | github.com/themix-project |
| **Font Manager** | GUI для управління шрифтами | github.com/FontManager |

## 📋 Cheat Sheet

```
┌─────────────────────────────────────────────────────────────────┐
│                 THEMES & FONTS QUICK REFERENCE                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   GTK Theme Locations:                                          │
│   ~/.themes/  ~/.local/share/themes/  /usr/share/themes/       │
│                                                                 │
│   Icon Theme Locations:                                         │
│   ~/.local/share/icons/  ~/.icons/  /usr/share/icons/          │
│                                                                 │
│   Font Locations:                                               │
│   ~/.local/share/fonts/  ~/.fonts/  /usr/share/fonts/          │
│                                                                 │
│   Apply Theme (GNOME):                                         │
│   gsettings set org.gnome.desktop.interface gtk-theme "Name"   │
│   gsettings set org.gnome.desktop.interface icon-theme "Name"  │
│   gsettings set org.gnome.desktop.interface cursor-theme "Name"│
│                                                                 │
│   Font Commands:                                                │
│   fc-cache -fv              # Rebuild font cache               │
│   fc-list                   # List all fonts                   │
│   fc-list : family | sort   # List font families               │
│   fc-match monospace        # Check font fallback              │
│                                                                 │
│   CUPS Commands:                                                │
│   lpstat -p -d              # List printers + default          │
│   lp -d Printer file.pdf    # Print to specific printer        │
│   lpq                       # Print queue                      │
│   cancel job-id             # Cancel print job                 │
│   cupsenable/cupsdisable    # Enable/disable printer           │
│                                                                 │
│   Dark Mode:                                                    │
│   gsettings set org.gnome.desktop.interface color-scheme \     │
│       'prefer-dark'                                            │
└─────────────────────────────────────────────────────────────────┘
```

## ❓ Питання для самоперевірки

1. **Яка різниця між GTK та Qt themes?**

2. **Де зберігаються користувацькі шрифти?**

3. **Як оновити кеш шрифтів після встановлення?**

4. **Що таке CUPS і для чого він потрібен?**

5. **Як увімкнути Dark Mode в GNOME через CLI?**

## 🎯 Міні-проект (30 хв)

### Завдання: Створіть власну візуальну тему та налаштуйте шрифти для розробки

Налаштуйте систему так, щоб вона виглядала красиво і шрифти в терміналі та редакторі коду були ідеальними!

**Кроки:**

1. Встановіть необхідні компоненти:
```bash
# Теми та іконки
sudo apt install arc-theme papirus-icon-theme numix-gtk-theme

# Шрифти для розробки (з лігатурами!)
sudo apt install fonts-jetbrains-mono fonts-firacode fonts-cascadia-code

# Оновіть кеш шрифтів
fc-cache -fv
```

2. Створіть скрипт налаштування тем:
```bash
mkdir -p ~/scripts
nano ~/scripts/my-theme.sh
```

```bash
#!/bin/bash
# My Personal Theme Setup

echo "🎨 Applying my visual theme..."

# Темна тема
gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
gsettings set org.gnome.desktop.interface gtk-theme 'Arc-Dark'
gsettings set org.gnome.desktop.interface icon-theme 'Papirus-Dark'
gsettings set org.gnome.desktop.interface cursor-theme 'Adwaita'
gsettings set org.gnome.desktop.interface cursor-size 28

# Шрифти
gsettings set org.gnome.desktop.interface font-name 'Ubuntu 11'
gsettings set org.gnome.desktop.interface document-font-name 'Noto Sans 11'
gsettings set org.gnome.desktop.interface monospace-font-name 'JetBrains Mono 11'

# Рендеринг шрифтів
gsettings set org.gnome.desktop.interface font-antialiasing 'subpixel'
gsettings set org.gnome.desktop.interface font-hinting 'slight'

echo "✅ Theme applied!"
echo ""
echo "Current settings:"
echo "  Theme: $(gsettings get org.gnome.desktop.interface gtk-theme)"
echo "  Icons: $(gsettings get org.gnome.desktop.interface icon-theme)"
echo "  Font:  $(gsettings get org.gnome.desktop.interface monospace-font-name)"
```

3. Створіть fontconfig для ідеальних шрифтів:
```bash
mkdir -p ~/.config/fontconfig
nano ~/.config/fontconfig/fonts.conf
```

```xml
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- Покращений рендеринг -->
  <match target="font">
    <edit name="antialias" mode="assign"><bool>true</bool></edit>
    <edit name="hinting" mode="assign"><bool>true</bool></edit>
    <edit name="hintstyle" mode="assign"><const>hintslight</const></edit>
    <edit name="rgba" mode="assign"><const>rgb</const></edit>
    <edit name="lcdfilter" mode="assign"><const>lcddefault</const></edit>
  </match>

  <!-- Monospace fallback для терміналу та коду -->
  <alias>
    <family>monospace</family>
    <prefer>
      <family>JetBrains Mono</family>
      <family>Fira Code</family>
      <family>Cascadia Code</family>
    </prefer>
  </alias>

  <!-- Sans-serif fallback -->
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Ubuntu</family>
      <family>Noto Sans</family>
    </prefer>
  </alias>
</fontconfig>
```

4. Застосуйте та перевірте:
```bash
chmod +x ~/scripts/my-theme.sh
~/scripts/my-theme.sh
fc-cache -fv

# Перевірте fallback
fc-match monospace
fc-match sans-serif
```

5. Налаштуйте термінал:
```bash
# Для GNOME Terminal:
# Preferences -> Profiles -> Custom font -> JetBrains Mono 12

# Для VS Code (settings.json):
# "editor.fontFamily": "'JetBrains Mono', monospace",
# "editor.fontLigatures": true,
# "editor.fontSize": 14
```

**Очікуваний результат:**
- Темна тема Arc-Dark з іконками Papirus
- JetBrains Mono як основний шрифт для коду
- Правильний fontconfig для рендерингу
- Скрипт для швидкого застосування теми

**Бонус (для допитливих):**
- Завантажте Nerd Font версію JetBrains Mono (з іконками для терміналу): https://www.nerdfonts.com/
- Встановіть тему для терміналу з Gogh: `bash -c "$(wget -qO- https://git.io/vQgMr)"`
- Налаштуйте CUPS для PDF-друку: `sudo apt install cups-pdf`
- Створіть "light" та "dark" профілі з швидким переключенням

## Підсумок

| Компонент | Розташування |
|-----------|--------------|
| GTK теми | `~/.themes/`, `/usr/share/themes/` |
| Іконки | `~/.local/share/icons/`, `/usr/share/icons/` |
| Курсори | `~/.local/share/icons/*/cursors/` |
| Шрифти | `~/.local/share/fonts/`, `/usr/share/fonts/` |
| Fontconfig | `~/.config/fontconfig/fonts.conf` |
| CUPS | `http://localhost:631` |

| Команда | Призначення |
|---------|-------------|
| `fc-cache -fv` | Оновити кеш шрифтів |
| `fc-list` | Список шрифтів |
| `fc-match` | Перевірити fallback |
| `lpstat -p` | Список принтерів |
| `lp file.pdf` | Друк файлу |
| `lpq` | Черга друку |
| `cancel job-id` | Скасувати друк |

| Популярні ресурси |
|-------------------|
| [GNOME Look](https://www.gnome-look.org/) — теми, іконки |
| [KDE Store](https://store.kde.org/) — KDE теми |
| [Nerd Fonts](https://www.nerdfonts.com/) — шрифти для терміналу |
| [Papirus Icons](https://github.com/PapirusTeam/papirus-icon-theme) |

На наступній лекції — консольний режим Linux.
