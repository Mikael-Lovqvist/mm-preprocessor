# MM-Preprocessor

> [!NOTE]
> Detta är intern dokumentation, om ändringar görs här som vi önskar dela med oss av så se till att denna filen eller andra delar specifika för Målerås Mekaniska AB inte följer med dessa förändringar.

## Installation

### Produktion
Installera paketet globalt på din maskin
```console
# npm install -g git+http://192.168.0.36/MM/MM-Preprocessor.git#latest
```

### Utvecklingsversion
- Hämta ut grenen `text-version`
- Använd npm link för att skapa en symlänk

```console
# npm link -g
```

## Användning
```console
$ mm-preprocess [-Dmacro[=defn]...] [--style=style] [--encoding=encoding] [input...] [output]
```

### Macro specification
#### c_style

```c
/* %% multiline macro block %% */
```

```c
// %% single line macro
```

#### xml_style
```xml
<!-- %% multiline macro block %% -->
```

#### bash_style
```bash
: << '%%'
multiline macro block
%%
```

```bash
# %% single line macro
```


### Options
#### `input`
Filenames to use for input. If none are given, defaults to `/dev/stdin`.

#### `output`
Filename to use for output. If not given, defaults to `/dev/stdout`.
> [!NOTE]
> Currently there is no way to only specify output, you will have to manually specify `/dev/stdin` for input in that case.

#### `-Dmacro[=defn]...`
Put the value of `defn` in side `D[macro]`. `defn` defaults to `true` if not specified.
> [!NOTE]
> Currently it does not support defining ES functions but that is planned.

#### `--style=style`
Set syntax style to one of `c_style` (default), `xml_style` or `bash_style`.
> [!NOTE]
> TODO - document these styles

#### `--encoding=encoding`
Set encoding for files.
> [!NOTE]
> TODO - only affects input files so far
