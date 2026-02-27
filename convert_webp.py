import os
from PIL import Image
import vtracer

def webp_to_svg_high_precision(input_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for filename in os.listdir(input_dir):
        if filename.lower().endswith(".webp"):
            input_path = os.path.join(input_dir, filename)
            output_path = os.path.join(output_dir, f"{os.path.splitext(filename)[0]}.svg")

            print(f"Processing {filename} with high precision...")

            # Extract pixel data and dimensions
            img = Image.open(input_path).convert('RGBA')
            width, height = img.size
            pixels = list(img.getdata())

            # Corrected: Combine width and height into a single tuple (width, height)
            svg_str = vtracer.convert_pixels_to_svg(
                pixels,
                (width, height),      # Pass dimensions as a tuple
                colormode='color',
                mode='spline',
                filter_speckle=2,
                color_precision=8,
                path_precision=3,
                corner_threshold=30
            )
            # 3. Write the SVG string to disk
            with open(output_path, 'w') as f:
                f.write(svg_str)


    print("\nBatch processing finished successfully.")

# Run the script
webp_to_svg_high_precision('./icons_demo/rest icons', './output_vectors')

