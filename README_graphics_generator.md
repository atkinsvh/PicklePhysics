# Batch Website Graphics Generator

I checked the usual ComfyUI address, `127.0.0.1:8188`, and it was not reachable from this workspace. That means image generation cannot be completed directly here yet. You need to start or choose an image backend first.

The script still works right now in manifest mode. It creates all folders, prompts, and asset manifests without generating images.

## Files

- `batch_generate_website_graphics.py`: the script to run in VS Code.
- `website_graphics_batch/`: created when you run the script; contains prompts, manifests, and generated files.

## Step 1: Create the prompt batch

From the folder containing the script:

```powershell
python batch_generate_website_graphics.py --backend manifest
```

This creates:

```text
website_graphics_batch/
├── manifests/
├── prompts/
├── generated/
└── selected/
```

## Step 2: Start ComfyUI

Start ComfyUI however you normally run it. The default URL is:

```text
http://127.0.0.1:8188
```

If ComfyUI is running on another computer, use that machine's address instead:

```text
http://SERVER-IP:8188
```

## Step 3: Check available models

```powershell
python batch_generate_website_graphics.py --backend comfyui --list-checkpoints
```

## Step 4: Generate a small test

Replace the checkpoint name with one shown by the previous command:

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --limit 2 --images-per-asset 2
```

## Step 5: Generate everything

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --images-per-asset 4
```

## Useful filters

Only pickle stickers:

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --only-site pickle --only-category stickers --images-per-asset 4
```

Only physics spectrum graphics:

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --only-site physics --only-category spectrum --images-per-asset 4
```

Only one asset:

```powershell
python batch_generate_website_graphics.py --backend comfyui --checkpoint "YOUR_CHECKPOINT.safetensors" --only-asset "Pickle reading a book" --images-per-asset 6
```

## Notes

The script asks the image model not to place readable text inside graphics. Add exact logo text, diagram labels, spectrum values, equations, and final typography later in SVG, HTML, Figma, Inkscape, or another precise editor.

For physics diagrams, treat generated images as visual drafts. Manually verify labels, equations, order, values, and scales before publishing.
