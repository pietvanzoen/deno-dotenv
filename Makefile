
all: fmt test

install:
	curl -fsSL https://deno.land/x/install/install.sh | sh

test:
	deno test --reload --allow-env --allow-read ./test.ts

fmt:
	deno fmt *

.PHONY: test fmt install
