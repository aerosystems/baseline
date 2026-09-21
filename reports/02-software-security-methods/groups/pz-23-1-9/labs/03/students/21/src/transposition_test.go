package main

import (
	"sort"
	"testing"
)

// Приклади з методичних вказівок до лабораторної роботи. Якщо Go-реалізація
// дає ті самі шифротексти, що й наведена в методичці програма на C++, —
// алгоритм відтворено правильно, а не «схоже».
func TestGuideExamples(t *testing.T) {
	cases := []struct {
		name string
		got  string
		want string
	}{
		{"проста таблиця", simpleEncrypt("HELLO WORLD", 4), "HOLEWDLOXLRX"},
		{"ключове слово", keywordEncrypt("ATTACK AT DAWN", "CRYPTO"), "AAKNAATTCWTD"},
		{"подвійна", doubleEncrypt("HELLOWORL", "KEY", "CAT"), "OLWEHLROL"},
	}

	for _, c := range cases {
		if c.got != c.want {
			t.Errorf("%s: отримали %s, у методичці %s", c.name, c.got, c.want)
		}
	}
}

// Дешифрування має повертати доповнений текст, і так для всіх трьох шифрів.
func TestRoundTrip(t *testing.T) {
	padded := rows(layout(plaintext, simpleCols))
	got := simpleDecrypt(simpleEncrypt(plaintext, simpleCols), simpleCols)
	if got != padded {
		t.Errorf("проста таблиця: отримали %s, очікували %s", got, padded)
	}

	padded = rows(layout(plaintext, len(keyword)))
	got = keywordDecrypt(keywordEncrypt(plaintext, keyword), keyword)
	if got != padded {
		t.Errorf("ключове слово: отримали %s, очікували %s", got, padded)
	}

	padded = string(pad(normalize(plaintext), len(rowKey)*len(keyword)))
	got = doubleDecrypt(doubleEncrypt(plaintext, rowKey, keyword), rowKey, keyword)
	if got != padded {
		t.Errorf("подвійна: отримали %s, очікували %s", got, padded)
	}
}

// Ключ із повторюваними літерами. У варіанті 1 таких немає, але в списку
// завдань є DEFEND і GUARD: однакові літери мають читатися зліва направо,
// інакше порядок стовпців залежав би від реалізації сортування.
func TestKeyOrderRepeatedLetters(t *testing.T) {
	want := []int{0, 5, 1, 3, 2, 4} // D D E E F N
	got := keyOrder("DEFEND")

	for i := range want {
		if got[i] != want[i] {
			t.Fatalf("DEFEND: отримали %v, очікували %v", got, want)
		}
	}
}

// Перестановка не міняє складу літер — саме тому частотний аналіз окремих
// літер на ній не працює, а сам шифр стійкості не дає.
func TestLettersArePreserved(t *testing.T) {
	source := sorted(rows(layout(plaintext, len(keyword))))

	if got := sorted(keywordEncrypt(plaintext, keyword)); got != source {
		t.Errorf("склад літер змінився: %s замість %s", got, source)
	}
}

func sorted(text string) string {
	letters := []rune(text)
	sort.Slice(letters, func(a, b int) bool { return letters[a] < letters[b] })
	return string(letters)
}
