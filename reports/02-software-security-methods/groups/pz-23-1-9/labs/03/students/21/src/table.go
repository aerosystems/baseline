package main

import (
	"fmt"
	"strings"
)

// Комірка таблиці займає три позиції: межа, літера, пробіл. Усі рядки
// виводу починаються з одного відступу, тому літера комірки col завжди
// стоїть на позиції 2+3*col — на цьому тримається вирівнювання підписів.
const (
	indent   = " "
	cellStep = 3
)

// draw малює таблицю рамками, як у методичці. Непорожній ключ додає над
// таблицею два підписи: літери ключа й номери стовпців у порядку читання.
func draw(table [][]rune, key string) string {
	if len(table) == 0 {
		return ""
	}
	cols := len(table[0])

	var out strings.Builder
	if key != "" {
		letters := normalize(key)
		labels := make([]string, cols)
		for col := range labels {
			labels[col] = string(letters[col])
		}
		out.WriteString(legend(labels))

		for col, rank := range ranks(keyOrder(key)) {
			labels[col] = fmt.Sprint(rank)
		}
		out.WriteString(legend(labels))
	}

	out.WriteString(rule(cols, '┌', '┬', '┐'))
	for _, row := range table {
		out.WriteString(indent)
		for _, letter := range row {
			out.WriteString("│" + string(letter) + " ")
		}
		out.WriteString("│\n")
	}
	out.WriteString(rule(cols, '└', '┴', '┘'))

	return out.String()
}

// legend розставляє однолітерні підписи над комірками таблиці.
func legend(labels []string) string {
	out := indent + " "
	for _, label := range labels {
		out += label + strings.Repeat(" ", cellStep-1)
	}
	return strings.TrimRight(out, " ") + "\n"
}

// rule малює горизонтальну межу таблиці заданими кутами.
func rule(cols int, left, middle, right rune) string {
	out := indent + string(left)
	for col := 0; col < cols; col++ {
		if col > 0 {
			out += string(middle)
		}
		out += "──"
	}
	return out + string(right) + "\n"
}
