package main

import "strings"

// --- Проста шифруюча таблиця -----------------------------------------------

// simpleEncrypt: текст записують у таблицю по рядках, а читають по стовпцях
// зліва направо. Ключа тут немає — таємницею є лише ширина таблиці.
func simpleEncrypt(text string, cols int) string {
	table := layout(text, cols)

	var out strings.Builder
	for col := 0; col < cols; col++ {
		for row := range table {
			out.WriteRune(table[row][col])
		}
	}
	return out.String()
}

// simpleDecrypt заповнює таблицю по стовпцях і читає її по рядках —
// дзеркальне відображення шифрування.
func simpleDecrypt(cipher string, cols int) string {
	letters := normalize(cipher)
	table := empty(len(letters)/cols, cols)

	at := 0
	for col := 0; col < cols; col++ {
		for row := range table {
			table[row][col] = letters[at]
			at++
		}
	}
	return rows(table)
}

// --- Таблиця з ключовим словом ---------------------------------------------

// keywordEncrypt: та сама таблиця, але стовпці читають не зліва направо,
// а в алфавітному порядку літер ключа. Ширина таблиці дорівнює довжині ключа.
func keywordEncrypt(text, key string) string {
	order := keyOrder(key)
	table := layout(text, len(order))

	var out strings.Builder
	for _, col := range order {
		for row := range table {
			out.WriteRune(table[row][col])
		}
	}
	return out.String()
}

// keywordDecrypt розкладає шифротекст по стовпцях у тому ж порядку читання.
func keywordDecrypt(cipher, key string) string {
	order := keyOrder(key)
	letters := normalize(cipher)
	table := empty(len(letters)/len(order), len(order))

	at := 0
	for _, col := range order {
		for row := range table {
			table[row][col] = letters[at]
			at++
		}
	}
	return rows(table)
}

// --- Подвійна перестановка --------------------------------------------------

// doubleEncrypt переставляє спершу рядки за ключем рядків, потім стовпці
// за ключем стовпців, і читає результат по рядках.
//
// Розмір таблиці задають самі ключі, тому текст має вміщатися в
// len(rowKey)*len(colKey) літер; коротший — доповнюється.
func doubleEncrypt(text, rowKey, colKey string) string {
	rowOrder, colOrder := keyOrder(rowKey), keyOrder(colKey)
	letters := pad(normalize(text), len(rowOrder)*len(colOrder))

	return rows(permute(layout(string(letters), len(colOrder)), rowOrder, colOrder))
}

// doubleDecrypt повертає кожну літеру на місце, з якого її забрала
// перестановка: те саме відображення, прочитане у зворотний бік.
func doubleDecrypt(cipher, rowKey, colKey string) string {
	rowOrder, colOrder := keyOrder(rowKey), keyOrder(colKey)
	table := layout(cipher, len(colOrder))
	out := empty(len(rowOrder), len(colOrder))

	for row := range table {
		for col := range table[row] {
			out[rowOrder[row]][colOrder[col]] = table[row][col]
		}
	}
	return rows(out)
}

// permute будує таблицю, у якій рядок k — це рядок rowOrder[k] вихідної
// таблиці, а стовпець k — стовпець colOrder[k].
func permute(table [][]rune, rowOrder, colOrder []int) [][]rune {
	out := empty(len(rowOrder), len(colOrder))
	for row := range out {
		for col := range out[row] {
			out[row][col] = table[rowOrder[row]][colOrder[col]]
		}
	}
	return out
}

// empty створює порожню таблицю заданого розміру.
func empty(rowCount, colCount int) [][]rune {
	table := make([][]rune, rowCount)
	for row := range table {
		table[row] = make([]rune, colCount)
	}
	return table
}
