package main

import "fmt"

// Варіант 1 зі списку індивідуальних завдань лабораторної роботи.
const (
	plaintext = "THE QUICK BROWN FOX"
	keyword   = "CIPHER"

	// Ширина простої таблиці. На 16 літер тексту чотири стовпці дають
	// рівно 4×4, тобто жодної літери доповнення.
	simpleCols = 4

	// Подвійна перестановка потребує двох ключів, а варіант дає один.
	// Другий узято з тексту того ж варіанта — THE. Його літери йдуть
	// у зворотному алфавітному порядку, тому рядки справді міняються
	// місцями; FOX, наприклад, уже впорядковане й не переставило б нічого.
	rowKey = "THE"
)

func main() {
	letters := string(normalize(plaintext))

	fmt.Printf("Текст варіанта:     %s\n", plaintext)
	fmt.Printf("Після нормалізації: %s (%d літер)\n", letters, len(letters))
	fmt.Printf("Ключове слово:      %s\n\n", keyword)

	simple()
	withKeyword()
	double()
}

// simple — проста шифруюча таблиця: ширина замість ключа.
func simple() {
	fmt.Printf("=== 1. Проста шифруюча таблиця (ширина %d) ===\n\n", simpleCols)

	table := layout(plaintext, simpleCols)
	fmt.Print(draw(table, ""))

	cipher := simpleEncrypt(plaintext, simpleCols)
	fmt.Printf("\nШифротекст:   %s\n", cipher)
	check(simpleDecrypt(cipher, simpleCols), rows(table))
}

// withKeyword — та сама таблиця, але порядок стовпців задає ключ.
func withKeyword() {
	fmt.Printf("=== 2. Таблиця з ключовим словом %s ===\n\n", keyword)

	table := layout(plaintext, len(keyword))
	fmt.Print(draw(table, keyword))

	cipher := keywordEncrypt(plaintext, keyword)
	fmt.Printf("\nШифротекст:   %s\n", cipher)
	check(keywordDecrypt(cipher, keyword), rows(table))
}

// double — перестановка рядків, потім стовпців, показана двома кроками.
func double() {
	fmt.Printf("=== 3. Подвійна перестановка (рядки %s, стовпці %s) ===\n\n",
		rowKey, keyword)

	rowOrder, colOrder := keyOrder(rowKey), keyOrder(keyword)
	padded := string(pad(normalize(plaintext), len(rowOrder)*len(colOrder)))
	table := layout(padded, len(colOrder))

	fmt.Println("Вихідна таблиця:")
	fmt.Print(draw(table, keyword))

	byRows := permute(table, rowOrder, identity(len(colOrder)))
	fmt.Printf("\nКрок 1 — переставлено рядки за ключем %s:\n", rowKey)
	fmt.Print(draw(byRows, keyword))

	byCols := permute(byRows, identity(len(rowOrder)), colOrder)
	fmt.Printf("\nКрок 2 — переставлено стовпці за ключем %s:\n", keyword)
	fmt.Print(draw(byCols, ""))

	cipher := doubleEncrypt(plaintext, rowKey, keyword)
	fmt.Printf("\nШифротекст:   %s\n", cipher)
	check(doubleDecrypt(cipher, rowKey, keyword), padded)
}

// check друкує розшифрований текст і звіряє його з доповненим оригіналом.
//
// Порівнюють саме з доповненим: літери X, дописані до прямокутника,
// лишаються в розшифрованому тексті, і прибрати їх автоматично не можна —
// X буває й справжньою літерою повідомлення.
func check(decoded, want string) {
	fmt.Printf("Розшифровано: %s\n", decoded)

	if decoded == want {
		fmt.Printf("Звірка з оригіналом: збігається\n\n")
		return
	}
	fmt.Printf("Звірка з оригіналом: РОЗБІЖНІСТЬ, очікували %s\n\n", want)
}
