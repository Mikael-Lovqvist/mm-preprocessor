## Installation
```sh
npm install -g mm-preprocess
```

## Usage
```sh
mm-preprocess [-Dmacro[=defn]...] [--style=style] [--encoding=encoding] [input...] [output]
```

### Options
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
