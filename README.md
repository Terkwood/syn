# syn-ts 🧠

My custom script for creating new zettels in [neuron](https://neuron.zettel.page/)

By default, it will create links to zettels representing the full date, month, and year of today's date.

```sh
alias syn="/path/to/repo/syn.ts"

syn hello-something-new
syn this-already-existed
```

But you can also pass a couple of types, which will change the formatting of the generated zettel:

```sh
syn -t lab broken-beaker-wash-me-off
syn --type journal today-my-headache-is-very-caffeinated
```

## Setting homedir

You can set the home directory of your zettelkasten,
so that you can invoke the script safely from any other
directory.  The resulting zettel will be created in your
zettelkasten dir.

```sh
export ZETTELKASTEN=~/zettels
```

## Backdating and such

You can choose to use a different date for the generated
zettelkasten.

```sh
syn.ts -d yesterday something-happened
syn.ts --date tomorrow i-hope-its-nice
syn.ts -d 2012-02-21 the-world-did-not-end
syn.ts --date 2030
```
