"""Verify static local references in HTML files shipped by Supremo Líder."""
import argparse
import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


# The compatibility launcher advertises this optional viewer, which is not bundled.
OPTIONAL_LINK = (
    "modulos/editorial_v10/ABRIR_PRIMERO.html", "a", "href",
    "VISOR_THANKSGIVING_V9_CON_ACCESO_V10.html",
)


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        for attribute, value in attrs:
            if attribute in {"src", "href", "poster", "data-src"} and value:
                self.links.append((self.getpos()[0], tag, attribute, value.strip()))


def check_links(root, files):
    errors = []
    warnings = []
    checked = 0
    for source in sorted(files):
        if Path(source).suffix.lower() != ".html":
            continue
        document = (root / source).resolve()
        if not document.is_relative_to(root) or not document.is_file():
            errors.append(f"{source} · HTML ausente o fuera del paquete")
            continue
        parser = References()
        parser.feed(document.read_text(encoding="utf-8-sig"))
        parser.close()
        for line, tag, attribute, value in parser.links:
            url = urlsplit(value)
            if not url.path or url.netloc or (url.scheme and url.scheme != "file"):
                continue
            checked += 1
            destination = (document.parent / unquote(url.path)).resolve()
            if (not url.scheme and destination.is_relative_to(root)
                    and destination.is_file()
                    and destination.relative_to(root).as_posix() in files):
                continue
            message = f"{source}:{line} · {tag}[{attribute}] → {value}"
            if (source, tag, attribute, value) == OPTIONAL_LINK and not destination.exists():
                warnings.append(f"{message} · visor opcional ausente")
            else:
                errors.append(f"{message} · archivo ausente, fuera del paquete o sin registro")
    return checked, warnings, errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path("."))
    root = parser.parse_args().root.resolve()
    manifest = root / "data/manifest_integridad.json"
    try:
        data = json.loads(manifest.read_text(encoding="utf-8-sig"))
        checked, warnings, errors = check_links(root, {row["file"] for row in data["files"]})
    except (OSError, KeyError, TypeError, ValueError) as error:
        print(f"FAIL: {error}")
        return 1
    for message in warnings:
        print(f"AVISO: {message}")
    for message in errors:
        print(f"FAIL: {message}")
    print(f"{checked} referencias locales · {len(errors)} errores · {len(warnings)} avisos")
    return int(bool(errors))


if __name__ == "__main__":
    raise SystemExit(main())
