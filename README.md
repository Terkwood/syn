# syn-ts 🧠

My custom script for creating new zettels in [neuron](https://neuron.zettel.page/)

It is mainly a shortcut for creating "lab", "journal", and "tag list" entries. If you don't ask for one of these special types of zettels, the script's behavior is roughly the same as `neuron gen`.

```sh
alias syn="/path/to/repo/syn.ts"

syn hello-something-new
syn this-already-existed
```

You can ask for a few different "types", which will change the formatting of the generated zettel:

```sh
syn.ts -t lab broken-beaker-wash-me-off
syn.ts --type journal today-my-headache-is-very-caffeinated
syn.ts --type tag linux
```

See [Zettel output types](https://github.com/Terkwood/syn#zettel-type-outputs), below.

## Setting homedir

You can set the home directory of your zettelkasten,
so that you can invoke the script safely from any other
directory. The resulting zettel will be created in your
zettelkasten dir.

```sh
export ZETTELKASTEN=~/zettels
```

## Backdating and such

You can choose to use a different date for the generated
zettelkasten.

```sh
syn.ts -d yesterday -t l something-happened
syn.ts --date tomorrow -t j i-hope-its-nice
syn.ts -d 2012-02-21 --type journal the-world-did-not-end
syn.ts --date 2030
```

## Zettel type outputs

### "default"

This is the same as `neuron gen`, though you can mess with the date by using `-d` or `--date`.

```text
---
date: 2021-03-18T15:09
---
```

### "labs"

This type generates a backlink to a dated lab notes entry (and creates it if necessary). It generates an uplink to a top-level `lab-notes` zettel.

```text
---
date: 2021-03-18T15:09
---

#[[lab-notes]] [[labs-2021-03-18]]
```

### "journal"

This type generates a backlink to a dated journal entry (and creates it if necessary). It generates an uplink to a top-level `journal` zettel.

```text
---
date: 2021-04-26T00:00
---

#[[journal]] [[journal-2021-04-26]]
```

### "tag"

Generates a tag-listing zettel.

`syn.ts --type tag music` will result in:

```text
---
date: 2021-03-10T10:58
---

[[z:zettels?tag=music&timeline]]
```
