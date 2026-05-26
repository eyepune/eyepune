from PIL import Image
import sys
from collections import Counter

def get_dominant_color(image_path):
    img = Image.open(image_path)
    img = img.convert('RGB')
    
    pixels = img.get_flattened_data()
    
    # Filter out near-white and near-black pixels to find the actual color
    filtered_pixels = []
    for p in pixels:
        # Ignore white/transparent backgrounds and pure black shadows
        if sum(p) < 700 and sum(p) > 50: 
            filtered_pixels.append(p)
            
    if not filtered_pixels:
        print("No dominant color found")
        return
        
    counts = Counter(filtered_pixels)
    dominant = counts.most_common(1)[0][0]
    
    hex_color = '#%02x%02x%02x' % dominant
    print(f"Dominant Color Hex: {hex_color}")

if __name__ == '__main__':
    get_dominant_color(sys.argv[1])
