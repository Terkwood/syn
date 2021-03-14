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
