
all: fmt test

test:
	deno --allow-env ./test.ts

fmt:
	prettier --no-color --write *.md *.ts *.yml

.PHONY: test fmt
