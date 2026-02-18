import os
import time
import requests
from urllib.parse import quote

# ==============================
# CONFIGURATION
# ==============================

OUTPUT_DIR = "images_vegetaux"

PLANTES = [
    "Achillea millefolium",
    "Allium sativum",
    "Aloe vera",
    "Calendula officinalis",
    "Thymus vulgaris"
]

HEADERS = {
    "User-Agent": "ProjetPlantesBot/1.0 (contact: marc@example.com)"
}

SEARCH_URL = "https://commons.wikimedia.org/w/api.php"

# ==============================
# FONCTIONS
# ==============================

def get_image_url(plant_name):
    """
    Recherche un fichier image sur Wikimedia Commons
    et retourne une URL 500px correctement encodée.
    """

    # 1) Recherche de fichiers image uniquement
    params = {
        "action": "query",
        "list": "search",
        "srsearch": f"File:{plant_name}",
        "srlimit": 5,
        "format": "json"
    }

    response = requests.get(SEARCH_URL, params=params, headers=HEADERS)

    if response.status_code != 200:
        print(f"❌ HTTP {response.status_code} pour {plant_name}")
        return None

    try:
        data = response.json()
    except ValueError:
        print(f"❌ Réponse non JSON pour {plant_name}")
        return None

    results = data.get("query", {}).get("search", [])
    if not results:
        print(f"⚠️ Aucun fichier image trouvé pour {plant_name}")
        return None

    title = results[0]["title"]  # ex: File:Achillea_millefolium_01.jpg

    # 2) Récupération de l’URL du fichier
    params = {
        "action": "query",
        "titles": title,
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json"
    }

    response = requests.get(SEARCH_URL, params=params, headers=HEADERS)

    try:
        data = response.json()
    except ValueError:
        print(f"❌ Erreur imageinfo pour {plant_name}")
        return None

    pages = data.get("query", {}).get("pages", {})
    page = next(iter(pages.values()))

    if "imageinfo" not in page:
        print(f"⚠️ Pas d'image exploitable pour {plant_name}")
        return None

    image_url = page["imageinfo"][0]["url"]

    # 3) Construction URL 500px (encodée)
    try:
        path = image_url.split("/commons/")[1]
    except IndexError:
        print(f"⚠️ URL inattendue pour {plant_name}")
        return None

    basename = os.path.basename(path)

    encoded_path = quote(path)
    encoded_basename = quote(basename)

    thumb_url = (
        "https://upload.wikimedia.org/wikipedia/commons/thumb/"
        + encoded_path
        + "/500px-"
        + encoded_basename
    )

    return thumb_url


def download_image(url, plant_name):
    """
    Télécharge l'image 500px ou bascule sur l'original si indisponible.
    """

    safe_name = plant_name.lower().replace(" ", "_")
    filepath = os.path.join(OUTPUT_DIR, f"{safe_name}.jpg")

    response = requests.get(url, headers=HEADERS, stream=True)

    if response.status_code != 200:
        print(f"⚠️ 500px indisponible, tentative image originale")

        original_url = url.replace("/thumb/", "/").split("/500px-")[0]
        response = requests.get(original_url, headers=HEADERS, stream=True)

    if response.status_code == 200:
        with open(filepath, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print(f"✅ Image téléchargée : {filepath}")
    else:
        print(f"❌ Échec téléchargement {plant_name}")


# ==============================
# MAIN
# ==============================

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for plante in PLANTES:
        print(f"\n🔍 Recherche image pour : {plante}")
        url = get_image_url(plante)

        if url:
            download_image(url, plante)
            time.sleep(1)  # respect des serveurs Wikimedia


if __name__ == "__main__":
    main()
