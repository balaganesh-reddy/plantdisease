from PIL import Image


def classify_image(image_path):
    """Simple prototype classifier for plant diseases.
    This is a demo system that estimates disease based on dominant color and image texture.
    It can be replaced with a trained model when real data is available.
    """
    try:
        img = Image.open(image_path).convert('RGB')
        pixels = list(img.getdata())
    except Exception:
        return {
            'label': 'Unable to analyze image',
            'confidence': 0.0,
            'details': 'Please upload a valid image file in JPG, PNG, or WEBP format.',
            'recommendation': 'Use a clear image of the affected leaf or plant.'
        }

    if not pixels:
        return {
            'label': 'Unable to analyze image',
            'confidence': 0.0,
            'details': 'The uploaded image is empty or unreadable.',
            'recommendation': 'Please upload a valid image file.'
        }

    red = [p[0] for p in pixels]
    green = [p[1] for p in pixels]
    blue = [p[2] for p in pixels]

    avg_r = sum(red) / len(red)
    avg_g = sum(green) / len(green)
    avg_b = sum(blue) / len(blue)
    intensity = (avg_r + avg_g + avg_b) / 3
    green_ratio = avg_g / max(avg_r + avg_g + avg_b, 1)

    brightness_values = [sum(pixel) / 3 for pixel in pixels]
    mean_brightness = sum(brightness_values) / len(brightness_values)
    brightness_variance = sum((v - mean_brightness) ** 2 for v in brightness_values) / len(brightness_values)

    if intensity < 80 and brightness_variance > 50:
        label = 'Leaf Blight'
        confidence = 0.81
        details = 'The image shows a darker, stressed foliage pattern typical of blight conditions.'
        recommendation = 'Remove severely infected leaves and improve airflow around the plant.'
    elif green_ratio < 0.35:
        label = 'Rust Infection'
        confidence = 0.76
        details = 'Rust infections often create brownish and orange tones on the leaf surface.'
        recommendation = 'Apply a sulfur-based or copper-based fungicide and avoid overhead watering.'
    elif green_ratio > 0.55 and brightness_variance < 40:
        label = 'Healthy Plant'
        confidence = 0.73
        details = 'The leaf appears mostly healthy with strong green color and low stress indicators.'
        recommendation = 'Continue regular watering, monitoring, and nutrition checks.'
    elif brightness_variance > 100:
        label = 'Powdery Mildew'
        confidence = 0.82
        details = 'Patchy pale surfaces and texture variation are consistent with powdery mildew.'
        recommendation = 'Improve ventilation and use a suitable fungicidal treatment.'
    else:
        label = 'Leaf Spot Disease'
        confidence = 0.74
        details = 'The sample shows uneven color and lesion-like patterns commonly seen in leaf spot disease.'
        recommendation = 'Prune affected leaves and prevent excessive moisture on the foliage.'

    return {
        'label': label,
        'confidence': round(confidence, 2),
        'details': details,
        'recommendation': recommendation,
    }
