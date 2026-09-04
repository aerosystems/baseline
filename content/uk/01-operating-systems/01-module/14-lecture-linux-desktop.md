---
title: "Робочий стіл користувача"
type: lecture
order: 14
preview: "Налаштування робочого столу, панелі, меню."
---

## Елементи робочого столу Linux

```
┌─────────────────────────────────────────────────────────────────┐
│                    АНАТОМІЯ РОБОЧОГО СТОЛУ                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ ≡ Activities │ Firefox ▼ │                 🔊 🔋 📶 10:30│  │  ← Top Panel
│   ├─────────────────────────────────────────────────────────┤  │
│   │                                                          │  │
│   │   ┌──────────────────┐                                   │  │
│   │   │                  │                                   │  │
│   │   │  Desktop Icons   │  ← Іконки на робочому столі      │  │
│   │   │  📁 📄 🖼️        │    (не в усіх DE)                │  │
│   │   │                  │                                   │  │
│   │   └──────────────────┘                                   │  │
│   │                                                          │  │  ← Desktop
│   │                                  Background Wallpaper    │  │
│   │                                                          │  │
│   │                                                          │  │
│   ├─────────────────────────────────────────────────────────┤  │
│   │ ┌───┐ ┌───┐ ┌───┐ ┌───┐                                │  │  ← Dock/Panel
│   │ │📁 │ │🌐 │ │💻 │ │⚙️ │  Show Applications              │  │
│   │ └───┘ └───┘ └───┘ └───┘                                │  │
│   └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Налаштування GNOME

### Settings (Gnome Control Center)

```bash
# Відкрити налаштування
gnome-control-center

# Або через Activities → Settings
```

**Основні розділи:**
- **Appearance** — теми, шпалери
- **Multitasking** — робочі столи, hot corners
- **Keyboard** — гарячі клавіші
- **Displays** — роздільність, масштаб
- **Users** — акаунти

### GNOME Tweaks (Розширені налаштування)

```bash
# Встановити
sudo apt install gnome-tweaks

# Запустити
gnome-tweaks
```

**Можливості:**
- Теми GTK, іконок, курсора
- Шрифти та масштабування
- Startup Applications
- Розширення Shell
- Window Titlebar buttons

### Extensions (Розширення)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GNOME EXTENSIONS                             │
│                                                                 │
│   Сайт: https://extensions.gnome.org                           │
│                                                                 │
│   Популярні розширення:                                        │
│   • Dash to Dock — перетворює dash у dock                     │
│   • Caffeine — не вимикати екран                              │
│   • Clipboard History — історія буфера обміну                 │
│   • GSConnect — інтеграція з Android (KDE Connect)            │
│   • Blur my Shell — розмиття фону                             │
│                                                                 │
│   Керування:                                                   │
│   gnome-extensions list                                        │
│   gnome-extensions enable extension-name                       │
│   gnome-extensions disable extension-name                      │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Встановити менеджер розширень
sudo apt install gnome-shell-extension-manager

# Через термінал
gnome-extensions list
gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com
```

## Налаштування KDE Plasma

### System Settings

```
┌─────────────────────────────────────────────────────────────────┐
│                    KDE SYSTEM SETTINGS                          │
│                                                                 │
│   Appearance                                                   │
│   ├── Global Theme — повні теми                               │
│   ├── Plasma Style — стиль панелі                             │
│   ├── Colors — кольорова схема                                │
│   ├── Window Decorations — рамки вікон                        │
│   ├── Icons — набір іконок                                    │
│   └── Cursors — курсор                                        │
│                                                                 │
│   Workspace Behavior                                           │
│   ├── Desktop Effects — анімації, ефекти                     │
│   ├── Screen Edges — дії при наведенні на кути               │
│   └── Virtual Desktops — робочі столи                        │
│                                                                 │
│   Shortcuts                                                    │
│   └── Custom Shortcuts — власні комбінації                   │
│                                                                 │
│   Startup and Shutdown                                         │
│   └── Autostart — автозапуск                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Widgets (Plasma Widgets)

```bash
# Додати widget: правий клік на панелі → Add Widgets
# Або: правий клік на Desktop → Add Widgets

# Популярні:
# • System Monitor — графіки CPU/RAM
# • Weather — погода
# • Notes — нотатки
# • Event Calendar — календар
```

## Панелі та меню

### Панель GNOME

```
┌─────────────────────────────────────────────────────────────────┐
│ Activities │ AppName ▼ │                      Indicators  🔊 🔋 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Activities — перехід до overview                             │
│   AppMenu — меню поточної програми                             │
│   Indicators — системні індикатори                             │
│   Calendar — клік на годинник                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Панель KDE

```
┌─────────────────────────────────────────────────────────────────┐
│ Application Launcher │ Task Manager │ System Tray │ Clock     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Правий клік → Enter Edit Mode                                │
│   • Додати/видалити widgets                                    │
│   • Змінити висоту панелі                                      │
│   • Налаштувати кожен widget                                  │
│   • Переміщення панелі на інший край                          │
└─────────────────────────────────────────────────────────────────┘
```

## Шпалери та теми

```bash
# GNOME — встановити шпалери
gsettings set org.gnome.desktop.background picture-uri "file:///path/to/image.jpg"
gsettings set org.gnome.desktop.background picture-uri-dark "file:///path/to/dark.jpg"

# Список тем GTK
ls /usr/share/themes/
ls ~/.themes/

# Встановити тему (GNOME Tweaks)
# Appearance → Themes → Applications

# KDE — через System Settings → Appearance
# Або KDE Store: store.kde.org
```

## Автозапуск програм

### GNOME

```bash
# GUI: GNOME Tweaks → Startup Applications

# Або вручну
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/myapp.desktop << EOF
[Desktop Entry]
Type=Application
Name=My App
Exec=/path/to/app
Hidden=false
EOF
```

### Systemd user services

```bash
# Створити user service
mkdir -p ~/.config/systemd/user

cat > ~/.config/systemd/user/myservice.service << EOF
[Unit]
Description=My Service

[Service]
ExecStart=/path/to/script.sh

[Install]
WantedBy=default.target
EOF

# Увімкнути
systemctl --user enable myservice
systemctl --user start myservice
```

## Практичні завдання

```bash
# 1. Дізнатися поточну тему GNOME
gsettings get org.gnome.desktop.interface gtk-theme

# 2. Список розширень
gnome-extensions list

# 3. Роздільність екрану
xrandr --query

# 4. Налаштувати масштабування (GNOME)
gsettings set org.gnome.desktop.interface scaling-factor 2

# 5. Відкрити файловий менеджер
nautilus .    # GNOME
dolphin .     # KDE
thunar .      # XFCE

# 6. Скріншот
gnome-screenshot     # GNOME
spectacle            # KDE
```

## Підсумок

| Дія | GNOME | KDE |
|-----|-------|-----|
| Налаштування | Settings + Tweaks | System Settings |
| Теми | Tweaks → Appearance | Appearance |
| Розширення | extensions.gnome.org | KDE Store |
| Панель | Top bar (фіксована) | Повна кастомізація |
| Автозапуск | Tweaks → Startup | Autostart |

На наступній лекції розглянемо файлову систему Linux детальніше.
