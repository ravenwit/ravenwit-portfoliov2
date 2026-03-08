import os
import vtracer

def batch_convert_plots(input_folder, output_folder):
    # Ensure the output directory exists
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Supported raster formats
    valid_extensions = ('.png', '.jpg', '.jpeg')
    # valid_extensions = ('.webp')

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(valid_extensions):
            input_path = os.path.join(input_folder, filename)
            
            # Create output filename by replacing extension with .svg
            base_name = os.path.splitext(filename)[0]
            output_path = os.path.join(output_folder, f"{base_name}.svg")

            print(f"Vectorizing: {filename}...")

            # VTracer logic: 'color' mode is best for plots with multiple lines
            # colormode='binary' can be used for simple black/white diagrams
            vtracer.convert_image_to_svg_py(
                input_path, 
                output_path,
                colormode='color',     # Preserves color in lines/points
                mode='spline',         # Smooths out jagged pixel edges
                filter_speckle=4,      # Removes noise/compression artifacts
                color_precision=6,     # Higher = more accurate colors
                layer_difference=16,   # Controls shape layering
                corner_threshold=60    # Higher = smoother curves
            )

    print("\nBatch conversion complete.")

# Usage
batch_convert_plots('icons_demo/rrr', './output_vectors')
