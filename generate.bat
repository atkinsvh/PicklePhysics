@echo off
title Website Graphics Generator
echo ============================================
echo  Website Graphics Batch Generator
echo  SD 1.5 via ComfyUI
echo ============================================
echo.

echo Make sure ComfyUI is running. If not, run start_comfyui.bat first.
echo.

REM === Full batch generation ===
REM Remove REM from one filter line below to generate a subset ===
REM === Uncomment ONE of these to filter, or leave all commented for full batch ===

REM python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site pickle --only-category "chibi pickle stickers" --images-per-asset 1
REM python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site physics --images-per-asset 1
REM python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-site shared --images-per-asset 1
REM python batch_generate_website_graphics.py --backend comfyui --skip-existing --only-asset "Primary logo" --images-per-asset 2

python batch_generate_website_graphics.py --backend comfyui --skip-existing --images-per-asset 1

echo.
echo ============================================
echo  Generation complete.
echo ============================================
pause
