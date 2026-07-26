# Website Graphics Batch Generator

Batch-generate 103 website graphics for the Pickle Book and Physics Book sites using ComfyUI with SD 1.5.

## Prerequisites

1. **Python 3.10+** installed and on PATH
2. **ComfyUI** installed at `C:\AI\ComfyUI` (AMD portable build)
3. **DreamShaper 8 checkpoint** downloaded and placed in:
   ```
   C:\AI\Ai\ComfyUI\ComfyUI\models\checkpoints\dreamshaper8.safetensors
   ```
   Download from: https://civitai.com/models/4384/dreamshaper (Version 8, "Half precision, best balance")

## Quick Start

### Step 1: Start ComfyUI

Double-click **`start_comfyui.bat`**. This launches ComfyUI and waits until it is ready at `http://127.0.0.1:8188`.

If your AMD GPU is not detected, ComfyUI may fall back to CPU mode (slower but works).

### Step 2: Test with a Dry Run

Double-click **`dry_run.bat`**. This generates 1 image for 2 assets to verify everything works.

Check the output in `website_graphics_batch/generated/` for test images.

### Step 3: Generate All Graphics

Double-click **`generate.bat`** for the full batch (103 assets, 1 variant each).

Generation runs in the background. You can stop and resume at any time — `--skip-existing` skips assets that already have output files.

## Expected Performance

Your hardware: AMD Radeon 840M iGPU, 16 GB RAM, SD 1.5

- **Per image**: ~30-120 seconds
- **Full batch (103 assets)**: ~1.5-3.5 hours
- **First image is slowest** (model loading + compilation); subsequent images are faster

## Useful Commands

### Filter by site

Only pickle book graphics:
```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site pickle --images-per-asset 1
```

Only physics book graphics:
```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site physics --images-per-asset 1
```

Only shared graphics:
```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site shared --images-per-asset 1
```

### Filter by category

Only chibi pickle stickers:
```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site pickle --only-category stickers --images-per-asset 1
```

Only physics diagrams:
```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site physics --only-category diagrams --images-per-asset 1
```

### Generate a single asset

```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-asset "Primary logo" --images-per-asset 2
```

### Generate multiple variants per asset

```
python batch_generate_website_graphics.py --backend comfyui --skip-existing --images-per-asset 4
```

### Manifest only (no image generation)

```
python batch_generate_website_graphics.py --backend manifest
```

## Output Structure

```
website_graphics_batch/
  manifests/
    prompt_manifest.csv       # Spreadsheet-friendly asset list
    prompt_manifest.json      # Structured asset data
    summary.json              # Asset counts by site and category
  prompts/
    pickle_book/              # One prompt file per asset
    physics_book/
    shared/
  generated/                  # ComfyUI image outputs
    pickle_book/
    physics_book/
    shared/
  selected/                   # Place approved final choices here
```

## Troubleshooting

### ComfyUI does not start
- Check that `C:\AI\ComfyUI\run_amd_gpu.bat` exists
- Try `run_cpu.bat` instead (slower but guaranteed to work)
- Update AMD Adrenalin drivers from amd.com

### GPU not detected / running on CPU
- The console will show `CPU` or `GPU` at startup
- CPU mode works but is significantly slower
- Ensure AMD Adrenalin drivers are up to date

### Out of memory
- Close other applications to free RAM
- Reduce image count: `--images-per-asset 1`
- Use smaller models if available

### Generation is very slow
- Normal for SD 1.5 on integrated GPU: 30-120 seconds per image
- Run overnight for the full batch
- Use `--skip-existing` to resume across sessions

### Checkpoint not found
- Verify `dreamshaper8.safetensors` is in `C:\AI\ComfyUI\ComfyUI\models\checkpoints\`
- Restart ComfyUI after adding the checkpoint
- Check the Load Checkpoint dropdown in ComfyUI's web interface

## Notes

- Prompts are optimized for SD 1.5 tag-based style (comma-separated descriptors)
- The script prompts the model to avoid text inside images. Add exact logo text, labels, and typography later in a vector editor
- Physics diagrams are visual drafts — manually verify labels and values before publishing
- All generated images are in `website_graphics_batch/generated/`
