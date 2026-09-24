// Лабораторна робота №3. Шифри перестановки.
// Варіант 1: ключове слово CIPHER, текст "THE QUICK BROWN FOX".
//
// Реалізовано три шифри: проста шифруюча таблиця, таблиця з ключовим
// словом і подвійна перестановка. Усі три не міняють склад літер тексту —
// лише порядок, у якому їх читають.
package main

import (
	"sort"
	"strings"
)

// padding — літера, якою доповнюють текст до повного прямокутника.
const padding = 'X'

// normalize лишає в тексті тільки латинські літери у верхньому регістрі:
// пробіли й розділові знаки в таблицю не записують, бо вони видали б
// межі слів у шифротексті.
func normalize(text string) []rune {
	var out []rune
	for _, letter := range strings.ToUpper(text) {
		if letter >= 'A' && letter <= 'Z' {
			out = append(out, letter)
		}
	}
	return out
}

// rowsFor — скільки рядків займе текст завдовжки length у таблиці шириною
// cols, рахуючи неповний останній рядок за повний.
func rowsFor(length, cols int) int {
	return (length + cols - 1) / cols
}

// pad доповнює текст до size літер.
//
// Доповнення тут не косметичне: воно робить усі стовпці таблиці однакової
// довжини, і саме тому дешифрування зводиться до оберненої перестановки.
// Без нього той, хто розшифровує, мусив би ще й вгадати, які стовпці
// коротші на одну літеру.
func pad(text []rune, size int) []rune {
	for len(text) < size {
		text = append(text, padding)
	}
	return text
}

// layout записує текст у таблицю шириною cols по рядках, доповнивши його
// до повного прямокутника.
func layout(text string, cols int) [][]rune {
	letters := normalize(text)
	letters = pad(letters, rowsFor(len(letters), cols)*cols)

	table := make([][]rune, len(letters)/cols)
	for row := range table {
		table[row] = append([]rune(nil), letters[row*cols:(row+1)*cols]...)
	}
	return table
}

// keyOrder повертає індекси стовпців у порядку читання: першим іде стовпець
// під найранішою за алфавітом літерою ключа.
//
// Сортування стійке, тому однакові літери ключа читаються зліва направо.
// Для CIPHER це байдуже, а от у ключах на кшталт DEFEND чи GUARD повтори є,
// і без стійкого сортування порядок став би залежати від реалізації.
func keyOrder(key string) []int {
	letters := normalize(key)

	order := make([]int, len(letters))
	for i := range order {
		order[i] = i
	}
	sort.SliceStable(order, func(a, b int) bool {
		return letters[order[a]] < letters[order[b]]
	})
	return order
}

// ranks повертає номер кожного стовпця в порядку читання — ті самі числа,
// якими підписують ключ у методичці (для CIPHER: C=1, I=4, P=5, H=3, E=2, R=6).
func ranks(order []int) []int {
	out := make([]int, len(order))
	for rank, column := range order {
		out[column] = rank + 1
	}
	return out
}

// identity — перестановка, що нічого не переставляє. Потрібна, щоб показати
// подвійну перестановку двома окремими кроками.
func identity(size int) []int {
	out := make([]int, size)
	for i := range out {
		out[i] = i
	}
	return out
}

// rows зчитує таблицю по рядках.
func rows(table [][]rune) string {
	var out strings.Builder
	for _, row := range table {
		out.WriteString(string(row))
	}
	return out.String()
}
