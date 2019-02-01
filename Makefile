
all: fmt test

install:
	curl -L https://deno.land/x/install/install.sh | sh

test:
	deno --recompile --allow-env ./test.ts

fmt:
	prettier --no-color --write *.md *.ts *.yml

.PHONY: test fmt install
