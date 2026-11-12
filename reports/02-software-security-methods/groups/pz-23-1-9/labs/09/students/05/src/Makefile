test: test.c
	clang -std=c23 -Wall -Wextra -lsqlite3 -fsanitize=address,undefined -o $@ $<
