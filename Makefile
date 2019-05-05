
all: fmt test

install:
	curl -L https://deno.land/x/install/install.sh | sh

test:
	deno run --reload --allow-env --allow-read ./test.ts

fmt:
	deno fmt *

.PHONY: test fmt install
