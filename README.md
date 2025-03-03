## Installation

### Production version
- Check out the latest latest tag
```console
$ git checkout tags/latest
```
- Link with npm
```console
# npm install -g .
```

### Development version
- Check out the branch `text-version`
- Link with npm

```console
# npm link -g
```

## Usage
```console
$ mm-preprocess [-Dmacro[=defn]...] [--style=style] [--encoding=encoding] [input...] [output]
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
