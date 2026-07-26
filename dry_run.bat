@echo off
title Dry Run - Test Generation
echo ============================================
echo  Dry Run: Generating 2 test images
echo ============================================
echo.
echo This will generate 1 image for 2 assets to verify
echo ComfyUI and your checkpoint are working correctly.
echo.

echo Make sure ComfyUI is running. If not, run start_comfyui.bat first.
echo.

python batch_generate_website_graphics.py --backend comfyui --skip-existing --limit 2 --images-per-asset 1

echo.
echo ============================================
echo  Dry run complete.
echo  Check the generated folder for your test images.
echo  If they look good, run generate.bat for the full batch.
echo ============================================
pause
