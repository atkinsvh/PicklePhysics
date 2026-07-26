#!/usr/bin/env python3
"""
Batch prompt and image generator for the two book websites.

What this does by default:
  - Preserves the full Pickle, Physics, and Shared graphics list.
  - Creates organized output folders.
  - Writes prompt files plus CSV and JSON manifests.
  - Does not require ComfyUI for the dry-run/manifest workflow.

To actually generate images, start ComfyUI and run with:
  python batch_generate_website_graphics.py --backend comfyui --checkpoint "your_model.safetensors"

The ComfyUI backend uses the HTTP API at http://127.0.0.1:8188 by default.
"""

from __future__ import annotations

import argparse
import copy
import csv
import json
import random
import re
import sys
import time
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any
from urllib import parse, request
from urllib.error import HTTPError, URLError


GRAPHIC_CATALOG: list[tuple[str, str, list[tuple[str, list[str]]]]] = [
    (
        "pickle_book",
        "Pickle Book Website Graphics",
        [
            (
                "Branding",
                [
                    "Primary logo",
                    "Horizontal logo",
                    "Simplified logo mark",
                    "Favicon",
                    "Social-sharing image",
                    "Default book-cover graphic",
                ],
            ),
            (
                "Chibi Pickle Stickers",
                [
                    "Pickle reading a book",
                    "Pickle holding a pencil",
                    "Pickle writing",
                    "Pickle wearing glasses",
                    "Pickle thinking",
                    "Pickle pointing",
                    "Pickle celebrating",
                    "Pickle holding a lightbulb",
                    "Pickle asking a question",
                    "Pickle presenting an answer",
                    "Pickle holding a warning sign",
                    "Pickle performing an experiment",
                    "Pickle carrying books",
                    "Pickle sleeping beside a bookmark",
                    "Pickle welcoming the reader",
                    "Pickle showing a key concept",
                    "Pickle marking chapter completion",
                    "Pickle for empty search results",
                    "Pickle for an empty bookmark list",
                    "Pickle for a missing or error page",
                ],
            ),
            (
                "Interface Graphics",
                [
                    "Chapter-number badge",
                    "Bookmark icon",
                    "Completed-chapter badge",
                    "Reading-progress marker",
                    "Definition icon",
                    "Important-note icon",
                    "Warning icon",
                    "Example icon",
                    "Question icon",
                    "Answer icon",
                    "Experiment icon",
                    "Summary icon",
                    "Vocabulary icon",
                    "Learning-objectives icon",
                    "Decorative page-corner stickers",
                    "Small notebook or paper texture",
                    "Chapter-divider graphics",
                ],
            ),
        ],
    ),
    (
        "physics_book",
        "Physics Book Website Graphics",
        [
            (
                "Branding",
                [
                    "Primary logo",
                    "Horizontal logo",
                    "Simplified logo mark",
                    "Favicon",
                    "Social-sharing image",
                    "Physics book-cover graphic",
                ],
            ),
            (
                "Galaxy and Space Graphics",
                [
                    "Star-field background",
                    "Galaxy background",
                    "Nebula accent graphic",
                    "Constellation-line pattern",
                    "Photon-trail decoration",
                    "Scientific-grid texture",
                    "Chapter-divider constellation",
                    "Chapter-completion star",
                    "Chapter-completion photon animation",
                    "Empty search-results space graphic",
                    "Physics-themed error-page graphic",
                ],
            ),
            (
                "Electromagnetic Spectrum Graphics",
                [
                    "Full electromagnetic-spectrum diagram",
                    "Radio-wave graphic",
                    "Microwave graphic",
                    "Infrared graphic",
                    "Visible-light spectrum graphic",
                    "Ultraviolet graphic",
                    "X-ray graphic",
                    "Gamma-ray graphic",
                    "Spectral color band",
                    "Wavelength scale",
                    "Frequency scale",
                    "Photon-energy scale",
                    "Prism-refraction graphic",
                ],
            ),
            (
                "Physics Diagrams",
                [
                    "Wave amplitude diagram",
                    "Wavelength diagram",
                    "Frequency diagram",
                    "High-energy versus low-energy wave comparison",
                    "Reflection diagram",
                    "Refraction diagram",
                    "Absorption diagram",
                    "Emission-spectrum diagram",
                    "Absorption-spectrum diagram",
                    "Atomic energy-level diagram",
                    "Electron-transition diagram",
                    "Photon-emission diagram",
                    "Inverse-square-law diagram",
                    "Light-cone graphic",
                    "Spacetime-grid graphic",
                    "Formula-card background or frame",
                ],
            ),
            (
                "Interface Graphics",
                [
                    "Formula icon",
                    "Definition icon",
                    "Important-note icon",
                    "Warning icon",
                    "Example icon",
                    "Experiment icon",
                    "Question icon",
                    "Answer icon",
                    "Unit-converter icon",
                    "Spectrum-explorer icon",
                    "Glossary icon",
                    "Bookmark icon",
                    "Chapter-progress marker",
                    "Completed-chapter star badge",
                    "Scientific section-divider graphics",
                ],
            ),
        ],
    ),
    (
        "shared",
        "Shared Graphics for Both Websites",
        [
            (
                "Shared Graphics",
                [
                    "Home-page hero graphic",
                    "Author portrait or author placeholder",
                    "Book-cover image",
                    "Chapter thumbnail template",
                    "Topic-category icons",
                    "Resource-page icons",
                    "References-page icon",
                    "Search icon",
                    "Menu icon",
                    "Previous-chapter arrow",
                    "Next-chapter arrow",
                    "Table-of-contents icon",
                    "Print icon",
                    "Copy-link icon",
                    "Font-size icon",
                    "Reading-width icon",
                    "Light-mode icon",
                    "Dark-mode icon",
                    "Reduced-motion icon",
                    "Hide-decoration icon",
                    "Generic image placeholder",
                    "Missing-image placeholder",
                    "Loading graphic",
                    "404-page graphic",
                    "Open Graph image template",
                    "Social-media sharing templates",
                    "Printable header and footer marks",
                ],
            )
        ],
    ),
]


@dataclass(frozen=True)
class Asset:
    site_slug: str
    site_title: str
    category: str
    category_slug: str
    asset_name: str
    asset_slug: str
    kind: str
    width: int
    height: int
    prompt: str
    negative_prompt: str
    notes: str
    output_folder: str
    output_base: str


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = value.replace("404", "four-oh-four")
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value)
    return value.strip("-")


def infer_kind(site_slug: str, category: str, name: str) -> str:
    text = f"{category} {name}".lower()

    if "favicon" in text:
        return "favicon"
    if "horizontal logo" in text:
        return "horizontal_logo"
    if "primary logo" in text or "simplified logo mark" in text:
        return "logo"
    if "social" in text or "open graph" in text:
        return "social_card"
    if "book-cover" in text or "book cover" in text or "book-cover image" in text:
        return "book_cover"
    if "hero" in text:
        return "hero"
    if "portrait" in text:
        return "portrait"
    if "background" in text:
        return "background"
    if "texture" in text or "pattern" in text:
        return "pattern"
    if "divider" in text:
        return "divider"
    if "animation" in text:
        return "animation_keyframe"
    if "badge" in text or "marker" in text:
        return "badge"
    if "placeholder" in text:
        return "placeholder"
    if "icon" in text or "arrow" in text:
        return "icon"
    if site_slug == "pickle_book" and "chibi pickle stickers" in category.lower():
        return "sticker"
    if "diagram" in text or "scale" in text or "spectrum" in text or "wave" in text:
        return "diagram"
    return "illustration"


def default_size(kind: str) -> tuple[int, int]:
    # SD 1.5 sizes: half of SDXL dimensions, multiples of 64.
    sizes = {
        "favicon": (256, 256),
        "logo": (512, 512),
        "horizontal_logo": (768, 448),
        "social_card": (640, 336),
        "book_cover": (512, 768),
        "hero": (768, 512),
        "portrait": (512, 512),
        "background": (768, 512),
        "pattern": (512, 512),
        "divider": (768, 320),
        "animation_keyframe": (512, 512),
        "badge": (384, 384),
        "placeholder": (512, 512),
        "icon": (384, 384),
        "sticker": (512, 512),
        "diagram": (768, 448),
        "illustration": (512, 512),
    }
    return sizes.get(kind, (512, 512))


def base_negative_prompt(site_slug: str, kind: str) -> str:
    # SD 1.5 negative prompt: comma-separated tags.
    phrases = [
        "lowres",
        "bad anatomy",
        "bad hands",
        "text",
        "error",
        "missing fingers",
        "extra digit",
        "fewer digits",
        "cropped",
        "worst quality",
        "low quality",
        "blurry",
        "pixelated",
        "watermark",
        "signature",
        "letters",
        "words",
        "UI screenshot",
        "clutter",
        "neon glare",
    ]

    if site_slug == "pickle_book":
        phrases.extend(
            [
                "scary expression",
                "gross food texture",
                "photorealistic pickle",
                "inconsistent character",
                "malformed arms",
                "extra limbs",
                "smooth skin",
                "tomato shape",
                "round body",
            ]
        )

    if site_slug == "physics_book":
        phrases.extend(
            [
                "incorrect labels",
                "wrong equations",
                "random numbers",
                "unreadable axes",
                "overcrowded labels",
            ]
        )

    if kind in {"icon", "badge", "favicon", "logo"}:
        phrases.extend(["photorealistic scene", "complex background", "tiny details"])

    return ", ".join(phrases)


def prompt_for_asset(
    site_slug: str,
    site_title: str,
    category: str,
    name: str,
    kind: str,
) -> tuple[str, str]:
    # SD 1.5 prompts: comma-separated tags work best.
    clean_name = name.replace("-", " ")
    notes: list[str] = []

    if site_slug == "pickle_book":
        if kind == "sticker":
            prompt = (
                f"chibi pickle sticker, {clean_name.lower()}, pickle character, "
                "friendly expression, intelligent look, clean dark outline, "
                "classic dill pickle body, elongated cucumber shape, "
                "bumpy warty pickle texture, pickle ridges, dark green pickle skin, "
                "light green bumps, fresh pickle appearance, academic detail, soft shading, "
                "simple silhouette, white sticker border, transparent background, "
                "website asset, no text, high quality, best quality"
            )
        elif kind in {"logo", "horizontal_logo", "favicon"}:
            prompt = (
                f"educational brand mark, pickle book website, {clean_name.lower()}, "
                "fresh green accent, clean vector shape, friendly design, "
                "simple silhouette, logo concept, no text, high quality, best quality"
            )
            notes.append("Add final logo typography later in a vector editor.")
        elif kind in {"icon", "badge"}:
            prompt = (
                f"educational UI icon, {clean_name.lower()}, pickle book website, "
                "simple vector style, fresh green accent, dark outline, "
                "centered, transparent background, no text, high quality, best quality"
            )
        elif kind in {"background", "pattern", "divider"}:
            prompt = (
                f"educational decorative asset, {clean_name.lower()}, pickle themed, "
                "light paper texture, fresh green accents, pickle sticker motifs, "
                "clean academic style, negative space, no text, high quality, best quality"
            )
        else:
            prompt = (
                f"educational website graphic, {clean_name.lower()}, "
                "pickle book, chibi pickle, clean outlines, fresh green accents, "
                "reading platform style, no text, high quality, best quality"
            )

    elif site_slug == "physics_book":
        if kind in {"diagram", "divider"}:
            prompt = (
                f"physics education illustration, {clean_name.lower()}, "
                "galaxy, stars, electromagnetic spectrum, wavelength, frequency, "
                "photon energy, clean composition, scientific grid, "
                "spectral color accents, no labels, no text, high quality, best quality"
            )
            notes.append("For factual diagrams, add labels, arrows, equations, and scale values manually.")
        elif kind in {"background", "pattern"}:
            prompt = (
                f"galaxy background, {clean_name.lower()}, physics education, "
                "deep space, restrained stars, constellation lines, "
                "spectral accents, high contrast, no text, high quality, best quality"
            )
        elif kind in {"icon", "badge", "favicon", "logo", "horizontal_logo"}:
            prompt = (
                f"physics education UI mark, {clean_name.lower()}, "
                "scientific line art, star accent, spectrum accent, "
                "dark navy, luminous colors, centered, vector, "
                "simple silhouette, no text, high quality, best quality"
            )
            if kind in {"logo", "horizontal_logo"}:
                notes.append("Add final logo typography later in a vector editor.")
        elif kind == "book_cover":
            prompt = (
                f"physics textbook cover, {clean_name.lower()}, "
                "galaxy, stars, electromagnetic spectrum, photon energy, "
                "scientific composition, empty space for title, "
                "no text, high quality, best quality"
            )
        else:
            prompt = (
                f"physics education website graphic, {clean_name.lower()}, "
                "galaxy, stars, spectrum, wavelength, frequency, "
                "textbook style, no text, high quality, best quality"
            )

    else:
        if kind in {"icon", "badge", "favicon", "logo"}:
            prompt = (
                f"educational website UI icon, {clean_name.lower()}, "
                "simple vector shape, neutral modern style, centered, "
                "transparent background, no text, high quality, best quality"
            )
        elif kind in {"social_card", "hero", "book_cover", "background"}:
            prompt = (
                f"educational book website graphic, {clean_name.lower()}, "
                "modern publishing style, readable composition, "
                "empty space for title, academic visual language, "
                "no text, high quality, best quality"
            )
        elif kind in {"placeholder", "pattern", "divider"}:
            prompt = (
                f"educational website support graphic, {clean_name.lower()}, "
                "clean, neutral, pickle book and physics book, "
                "simple shapes, no text, high quality, best quality"
            )
        else:
            prompt = (
                f"educational website asset, {clean_name.lower()}, "
                "clean modern publishing style, reusable, "
                "no text, high quality, best quality"
            )

    return prompt, " ".join(notes).strip()


def build_assets() -> list[Asset]:
    assets: list[Asset] = []
    for site_slug, site_title, categories in GRAPHIC_CATALOG:
        for category, names in categories:
            category_slug = slugify(category)
            for name in names:
                asset_slug = slugify(name)
                kind = infer_kind(site_slug, category, name)
                width, height = default_size(kind)
                prompt, notes = prompt_for_asset(site_slug, site_title, category, name, kind)
                output_folder = f"generated/{site_slug}/{category_slug}"
                assets.append(
                    Asset(
                        site_slug=site_slug,
                        site_title=site_title,
                        category=category,
                        category_slug=category_slug,
                        asset_name=name,
                        asset_slug=asset_slug,
                        kind=kind,
                        width=width,
                        height=height,
                        prompt=prompt,
                        negative_prompt=base_negative_prompt(site_slug, kind),
                        notes=notes,
                        output_folder=output_folder,
                        output_base=asset_slug,
                    )
                )
    return assets


def filter_assets(
    assets: list[Asset],
    only_site: str | None,
    only_category: str | None,
    only_asset: str | None,
    limit: int | None,
) -> list[Asset]:
    filtered = assets

    if only_site:
        needle = slugify(only_site)
        filtered = [asset for asset in filtered if needle in asset.site_slug]

    if only_category:
        needle = slugify(only_category)
        filtered = [
            asset
            for asset in filtered
            if needle in asset.category_slug or needle in slugify(asset.category)
        ]

    if only_asset:
        needle = slugify(only_asset)
        filtered = [
            asset
            for asset in filtered
            if needle in asset.asset_slug or needle in slugify(asset.asset_name)
        ]

    if limit is not None:
        filtered = filtered[: max(limit, 0)]

    return filtered


def ensure_output_structure(output_root: Path, assets: list[Asset]) -> None:
    (output_root / "manifests").mkdir(parents=True, exist_ok=True)
    (output_root / "prompts").mkdir(parents=True, exist_ok=True)
    (output_root / "generated").mkdir(parents=True, exist_ok=True)
    (output_root / "selected").mkdir(parents=True, exist_ok=True)

    for asset in assets:
        (output_root / asset.output_folder).mkdir(parents=True, exist_ok=True)
        (output_root / "selected" / asset.site_slug / asset.category_slug).mkdir(
            parents=True, exist_ok=True
        )
        (output_root / "prompts" / asset.site_slug / asset.category_slug).mkdir(
            parents=True, exist_ok=True
        )


def write_prompt_files(output_root: Path, assets: list[Asset]) -> None:
    for asset in assets:
        prompt_path = (
            output_root
            / "prompts"
            / asset.site_slug
            / asset.category_slug
            / f"{asset.asset_slug}.txt"
        )
        prompt_path.write_text(
            "\n".join(
                [
                    f"Site: {asset.site_title}",
                    f"Category: {asset.category}",
                    f"Asset: {asset.asset_name}",
                    f"Kind: {asset.kind}",
                    f"Size: {asset.width}x{asset.height}",
                    "",
                    "Prompt:",
                    asset.prompt,
                    "",
                    "Negative prompt:",
                    asset.negative_prompt,
                    "",
                    "Notes:",
                    asset.notes or "None",
                    "",
                ]
            ),
            encoding="utf-8",
        )


def write_manifests(output_root: Path, assets: list[Asset]) -> None:
    csv_path = output_root / "manifests" / "prompt_manifest.csv"
    json_path = output_root / "manifests" / "prompt_manifest.json"
    summary_path = output_root / "manifests" / "summary.json"

    rows = [asdict(asset) for asset in assets]
    fieldnames = list(rows[0].keys()) if rows else []

    with csv_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    json_path.write_text(json.dumps(rows, indent=2), encoding="utf-8")

    summary: dict[str, Any] = {
        "total_assets": len(assets),
        "by_site": {},
        "by_category": {},
        "backend_note": (
            "Manifest mode completed without generating images. Use --backend comfyui "
            "after starting ComfyUI to render files."
        ),
    }

    for asset in assets:
        summary["by_site"][asset.site_slug] = summary["by_site"].get(asset.site_slug, 0) + 1
        category_key = f"{asset.site_slug}/{asset.category}"
        summary["by_category"][category_key] = summary["by_category"].get(category_key, 0) + 1

    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")


def write_batch_readme(output_root: Path) -> None:
    readme_path = output_root / "README_BATCH_OUTPUT.md"
    readme_path.write_text(
        """# Website Graphics Batch Output

This folder was created by `batch_generate_website_graphics.py`.

## What is inside

- `manifests/prompt_manifest.csv`: spreadsheet-friendly asset list and prompts.
- `manifests/prompt_manifest.json`: structured version of the same data.
- `prompts/`: one prompt text file per requested graphic.
- `generated/`: ComfyUI image outputs are copied here.
- `selected/`: place approved final choices here after review.

## Dry run

```powershell
python batch_generate_website_graphics.py --backend manifest --output-root website_graphics_batch
```

## Check ComfyUI

Start ComfyUI first, then run:

```powershell
python batch_generate_website_graphics.py --backend comfyui --list-checkpoints
```

If your ComfyUI server is on another machine:

```powershell
python batch_generate_website_graphics.py --backend comfyui --comfyui-url http://SERVER-IP:8188 --list-checkpoints
```

## Generate a tiny test batch

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --limit 2 --images-per-asset 2
```

## Generate the full batch

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --images-per-asset 4
```

## Important notes

- The script intentionally prompts image models to avoid text inside images. Add exact logo text, labels, equations, spectrum values, and diagram annotations later in SVG, HTML, Figma, Inkscape, or another precise editor.
- Physics diagrams generated by AI should be treated as visual drafts until their science labels and scales are manually verified.
- For transparent sticker PNGs, use a background-removal step after generation if your model does not produce true alpha transparency.
""",
        encoding="utf-8",
    )


def http_json(method: str, url: str, payload: dict[str, Any] | None = None, timeout: int = 30) -> Any:
    data = None
    headers = {"Accept": "application/json"}

    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = request.Request(url, data=data, headers=headers, method=method.upper())
    try:
        with request.urlopen(req, timeout=timeout) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} from {url}: {body}") from exc
    except URLError as exc:
        raise RuntimeError(f"Could not reach {url}: {exc.reason}") from exc


def http_bytes(url: str, timeout: int = 60) -> bytes:
    try:
        with request.urlopen(url, timeout=timeout) as response:
            return response.read()
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} from {url}: {body}") from exc
    except URLError as exc:
        raise RuntimeError(f"Could not reach {url}: {exc.reason}") from exc


def get_comfyui_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}/{path.lstrip('/')}"


def check_comfyui(base_url: str) -> dict[str, Any]:
    return http_json("GET", get_comfyui_url(base_url, "/system_stats"), timeout=10)


def list_comfyui_checkpoints(base_url: str) -> list[str]:
    info = http_json(
        "GET",
        get_comfyui_url(base_url, "/object_info/CheckpointLoaderSimple"),
        timeout=20,
    )

    try:
        ckpt_field = info["CheckpointLoaderSimple"]["input"]["required"]["ckpt_name"]
    except KeyError as exc:
        raise RuntimeError("ComfyUI did not return checkpoint loader metadata.") from exc

    if isinstance(ckpt_field, list) and ckpt_field and isinstance(ckpt_field[0], list):
        return [str(item) for item in ckpt_field[0]]

    if isinstance(ckpt_field, list):
        return [str(item) for item in ckpt_field]

    return []


def select_checkpoint(base_url: str, requested_checkpoint: str | None) -> str:
    if requested_checkpoint:
        return requested_checkpoint

    checkpoints = list_comfyui_checkpoints(base_url)
    if not checkpoints:
        raise RuntimeError(
            "No ComfyUI checkpoints were found. Download an SDXL, FLUX-compatible, "
            "or other text-to-image checkpoint in ComfyUI first."
        )

    checkpoint = checkpoints[0]
    print(
        f"No --checkpoint was provided. Using first ComfyUI checkpoint: {checkpoint}\n"
        "Pass --checkpoint with an exact filename if you want a different model."
    )
    return checkpoint


def default_comfyui_workflow(
    asset: Asset,
    prompt: str,
    negative_prompt: str,
    checkpoint: str,
    seed: int,
    steps: int,
    cfg: float,
    sampler: str,
    scheduler: str,
    filename_prefix: str,
) -> dict[str, Any]:
    return {
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": sampler,
                "scheduler": scheduler,
                "denoise": 1,
                "model": ["4", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["5", 0],
            },
        },
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {"ckpt_name": checkpoint},
        },
        "5": {
            "class_type": "EmptyLatentImage",
            "inputs": {
                "width": asset.width,
                "height": asset.height,
                "batch_size": 1,
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": prompt, "clip": ["4", 1]},
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": negative_prompt, "clip": ["4", 1]},
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": filename_prefix,
                "images": ["8", 0],
            },
        },
    }


def replace_workflow_tokens(value: Any, replacements: dict[str, Any]) -> Any:
    if isinstance(value, dict):
        return {key: replace_workflow_tokens(item, replacements) for key, item in value.items()}

    if isinstance(value, list):
        return [replace_workflow_tokens(item, replacements) for item in value]

    if isinstance(value, str):
        if value in replacements:
            return replacements[value]
        result = value
        for token, replacement in replacements.items():
            result = result.replace(token, str(replacement))
        return result

    return value


def load_custom_workflow(
    workflow_path: Path,
    asset: Asset,
    prompt: str,
    negative_prompt: str,
    checkpoint: str,
    seed: int,
    steps: int,
    cfg: float,
    sampler: str,
    scheduler: str,
    filename_prefix: str,
) -> dict[str, Any]:
    workflow = json.loads(workflow_path.read_text(encoding="utf-8"))
    replacements = {
        "__PROMPT__": prompt,
        "__NEGATIVE_PROMPT__": negative_prompt,
        "__CHECKPOINT__": checkpoint,
        "__SEED__": seed,
        "__STEPS__": steps,
        "__CFG__": cfg,
        "__SAMPLER__": sampler,
        "__SCHEDULER__": scheduler,
        "__WIDTH__": asset.width,
        "__HEIGHT__": asset.height,
        "__FILENAME_PREFIX__": filename_prefix,
    }
    return replace_workflow_tokens(workflow, replacements)


def queue_comfyui_prompt(
    base_url: str,
    workflow: dict[str, Any],
    client_id: str,
) -> str:
    response = http_json(
        "POST",
        get_comfyui_url(base_url, "/prompt"),
        {"prompt": workflow, "client_id": client_id},
        timeout=30,
    )
    prompt_id = response.get("prompt_id")
    if not prompt_id:
        raise RuntimeError(f"ComfyUI did not return a prompt_id: {response}")
    return str(prompt_id)


def wait_for_comfyui_history(
    base_url: str,
    prompt_id: str,
    timeout_seconds: int,
    poll_seconds: float,
) -> dict[str, Any]:
    deadline = time.time() + timeout_seconds

    while time.time() < deadline:
        history = http_json(
            "GET",
            get_comfyui_url(base_url, f"/history/{prompt_id}"),
            timeout=30,
        )
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(poll_seconds)

    raise TimeoutError(f"Timed out waiting for ComfyUI prompt {prompt_id}.")


def download_comfyui_images(
    base_url: str,
    history_item: dict[str, Any],
    target_dir: Path,
    target_base: str,
) -> list[Path]:
    target_dir.mkdir(parents=True, exist_ok=True)
    outputs = history_item.get("outputs", {})
    saved_paths: list[Path] = []

    image_number = 1
    for output in outputs.values():
        for image in output.get("images", []):
            filename = str(image.get("filename", ""))
            subfolder = str(image.get("subfolder", ""))
            image_type = str(image.get("type", "output"))

            query = parse.urlencode(
                {
                    "filename": filename,
                    "subfolder": subfolder,
                    "type": image_type,
                }
            )
            image_url = get_comfyui_url(base_url, f"/view?{query}")
            image_bytes = http_bytes(image_url, timeout=90)

            suffix = Path(filename).suffix or ".png"
            target_path = target_dir / f"{target_base}-{image_number:02d}{suffix}"
            target_path.write_bytes(image_bytes)
            saved_paths.append(target_path)
            image_number += 1

    if not saved_paths:
        raise RuntimeError(f"No images found in ComfyUI history item: {history_item}")

    return saved_paths


def seed_for_variant(base_seed: int | None, asset_index: int, variant_index: int) -> int:
    if base_seed is None:
        return random.randint(1, 2**31 - 1)
    return base_seed + (asset_index * 1000) + variant_index


def generate_with_comfyui(
    output_root: Path,
    assets: list[Asset],
    base_url: str,
    checkpoint: str | None,
    workflow_json: Path | None,
    images_per_asset: int,
    base_seed: int | None,
    steps: int,
    cfg: float,
    sampler: str,
    scheduler: str,
    timeout_seconds: int,
    poll_seconds: float,
    skip_existing: bool,
) -> None:
    check_comfyui(base_url)
    selected_checkpoint = select_checkpoint(base_url, checkpoint)
    client_id = str(uuid.uuid4())

    for asset_index, asset in enumerate(assets, start=1):
        target_dir = output_root / asset.output_folder
        print(f"[{asset_index}/{len(assets)}] {asset.site_title} / {asset.category} / {asset.asset_name}")

        for variant_index in range(1, images_per_asset + 1):
            target_base = f"{asset.output_base}-v{variant_index:02d}"
            if skip_existing and list(target_dir.glob(f"{target_base}-*")):
                print(f"  Skipping existing {target_base}")
                continue

            seed = seed_for_variant(base_seed, asset_index, variant_index)
            filename_prefix = f"{asset.site_slug}_{asset.category_slug}_{asset.asset_slug}_v{variant_index:02d}"

            if workflow_json:
                workflow = load_custom_workflow(
                    workflow_json,
                    asset=asset,
                    prompt=asset.prompt,
                    negative_prompt=asset.negative_prompt,
                    checkpoint=selected_checkpoint,
                    seed=seed,
                    steps=steps,
                    cfg=cfg,
                    sampler=sampler,
                    scheduler=scheduler,
                    filename_prefix=filename_prefix,
                )
            else:
                workflow = default_comfyui_workflow(
                    asset=asset,
                    prompt=asset.prompt,
                    negative_prompt=asset.negative_prompt,
                    checkpoint=selected_checkpoint,
                    seed=seed,
                    steps=steps,
                    cfg=cfg,
                    sampler=sampler,
                    scheduler=scheduler,
                    filename_prefix=filename_prefix,
                )

            prompt_id = queue_comfyui_prompt(base_url, workflow, client_id)
            history_item = wait_for_comfyui_history(
                base_url,
                prompt_id,
                timeout_seconds=timeout_seconds,
                poll_seconds=poll_seconds,
            )
            saved_paths = download_comfyui_images(
                base_url,
                history_item,
                target_dir=target_dir,
                target_base=target_base,
            )
            for saved_path in saved_paths:
                print(f"  Saved {saved_path}")


def print_backend_doctor(base_url: str) -> int:
    print(f"Checking ComfyUI at {base_url}")
    try:
        stats = check_comfyui(base_url)
        checkpoints = list_comfyui_checkpoints(base_url)
    except RuntimeError as exc:
        print(f"ComfyUI is not reachable or not ready: {exc}")
        print("Start ComfyUI, then try again. If it is on another machine, pass --comfyui-url.")
        return 1

    print("ComfyUI is reachable.")
    print(f"System stats keys: {', '.join(sorted(stats.keys()))}")
    if checkpoints:
        print("Available checkpoints:")
        for ckpt in checkpoints:
            print(f"  - {ckpt}")
    else:
        print("No checkpoints were reported by ComfyUI.")
    return 0


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create prompt manifests and optionally batch-generate website graphics with ComfyUI."
    )
    parser.add_argument(
        "--backend",
        choices=["manifest", "comfyui"],
        default="manifest",
        help="Use 'manifest' to write prompts only, or 'comfyui' to generate images.",
    )
    parser.add_argument(
        "--output-root",
        default="website_graphics_batch",
        help="Folder where manifests, prompts, and generated images will be written.",
    )
    parser.add_argument(
        "--comfyui-url",
        default="http://127.0.0.1:8188",
        help="ComfyUI server URL.",
    )
    parser.add_argument(
        "--checkpoint",
        default=None,
        help="Exact ComfyUI checkpoint filename. If omitted, the first checkpoint is used.",
    )
    parser.add_argument(
        "--workflow-json",
        default=None,
        help=(
            "Optional custom ComfyUI workflow JSON. Use tokens like __PROMPT__, "
            "__NEGATIVE_PROMPT__, __CHECKPOINT__, __SEED__, __WIDTH__, __HEIGHT__, "
            "__STEPS__, __CFG__, __SAMPLER__, __SCHEDULER__, and __FILENAME_PREFIX__."
        ),
    )
    parser.add_argument(
        "--images-per-asset",
        type=int,
        default=1,
        help="How many variants to generate for each asset.",
    )
    parser.add_argument("--seed", type=int, default=None, help="Base seed for repeatable batches.")
    parser.add_argument("--steps", type=int, default=28, help="Sampling steps for the default workflow.")
    parser.add_argument("--cfg", type=float, default=7.0, help="CFG value for the default workflow.")
    parser.add_argument("--sampler", default="euler", help="ComfyUI sampler name.")
    parser.add_argument("--scheduler", default="normal", help="ComfyUI scheduler name.")
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=900,
        help="Maximum wait time per generated prompt.",
    )
    parser.add_argument(
        "--poll-seconds",
        type=float,
        default=2.0,
        help="Seconds between ComfyUI history checks.",
    )
    parser.add_argument(
        "--skip-existing",
        action="store_true",
        help="Skip variants that already exist in the generated folder.",
    )
    parser.add_argument("--only-site", default=None, help="Filter by site slug, such as pickle or physics.")
    parser.add_argument("--only-category", default=None, help="Filter by category name or slug.")
    parser.add_argument("--only-asset", default=None, help="Filter by asset name or slug.")
    parser.add_argument("--limit", type=int, default=None, help="Limit the number of assets processed.")
    parser.add_argument(
        "--list-checkpoints",
        action="store_true",
        help="Print ComfyUI checkpoints and exit. Implies a ComfyUI connection check.",
    )
    parser.add_argument(
        "--doctor",
        action="store_true",
        help="Check whether ComfyUI is reachable and print available checkpoints.",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    output_root = Path(args.output_root).expanduser().resolve()
    workflow_json = Path(args.workflow_json).expanduser().resolve() if args.workflow_json else None

    if args.doctor or args.list_checkpoints:
        return print_backend_doctor(args.comfyui_url)

    all_assets = build_assets()
    assets = filter_assets(
        all_assets,
        only_site=args.only_site,
        only_category=args.only_category,
        only_asset=args.only_asset,
        limit=args.limit,
    )

    if not assets:
        print("No assets matched the current filters.")
        return 1

    ensure_output_structure(output_root, assets)
    write_prompt_files(output_root, assets)
    write_manifests(output_root, assets)
    write_batch_readme(output_root)

    print(f"Prepared {len(assets)} asset prompts in {output_root}")

    if args.backend == "manifest":
        print("Manifest mode complete. No images were generated.")
        print("Run with --backend comfyui after ComfyUI is running to generate images.")
        return 0

    if args.images_per_asset < 1:
        print("--images-per-asset must be at least 1 when generating.")
        return 1

    try:
        generate_with_comfyui(
            output_root=output_root,
            assets=copy.deepcopy(assets),
            base_url=args.comfyui_url,
            checkpoint=args.checkpoint,
            workflow_json=workflow_json,
            images_per_asset=args.images_per_asset,
            base_seed=args.seed,
            steps=args.steps,
            cfg=args.cfg,
            sampler=args.sampler,
            scheduler=args.scheduler,
            timeout_seconds=args.timeout_seconds,
            poll_seconds=args.poll_seconds,
            skip_existing=args.skip_existing,
        )
    except Exception as exc:
        print(f"Generation stopped: {exc}")
        print("Your prompt manifest was still written. Fix the backend setting and rerun.")
        return 1

    print("Generation complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
