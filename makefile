DESTDIR=~/.local/bin/

run:
	./hayami

clean:
	rm -rf ./tmp

install:
	mkdir -p $(DESTDIR) 2> /dev/null
	mkdir -p ~/.cache/redyt/
	mkdir -p ~/.config/redyt/
	touch ~/.config/redyt/subreddit.txt

	cp redyt $(DESTDIR)
	chmod 755 $(DESTDIR)redyt