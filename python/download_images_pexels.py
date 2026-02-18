import os
import csv
import time
import requests

# =========================
# CONFIG
# =========================

PEXELS_API_KEY = "COLLE_TA_CLE_API_ICI"
PEXELS_API = "https://api.pexels.com/v1/search"

HEADERS = {
    "Authorization": PEXELS_API_KEY,
    "User-Agent": "VegetauxDB/1.0"
}

OUTPUT_DIR = "images_pexels"
FOUND_CSV = "pexels_images_metadata.csv"
FAILED_CSV = "pexels_plantes_sans_image.csv"

PLANTES = [
    "Achillea millefolium",
    "Actaea racemosa",
    "Aesculus hippocastanum",
    "Agrimonia eupatoria",
    "Aloe vera",
    "Althaea officinalis",
    "Artemisia absinthium",
    "Avena sativa",
    "Betula pendula",
    "Camellia sinensis",
    "Capsella bursa-pastoris",
    "Carum carvi",
    "Centaurium erythraea",
    "Cetraria islandica",
    "Cichorium intybus",
    "Cinnamomum verum",
    "Cola acuminata",
    "Curcuma xanthorrhiza",
    "Echinacea angustifolia",
    "Echinacea pallida",
    "Elymus repens",
    "Epilobium angustifolium",
    "Equisetum arvense",
    "Eucalyptus globulus",
    "Foeniculum vulgare",
    "Frangula alnus",
    "Frangula purshiana",
    "Fraxinus excelsior",
    "Fucus vesiculosus",
    "Gentiana lutea",
    "Glycyrrhiza glabra",
    "Grindelia robusta",
    "Harpagophytum procumbens",
    "Hedera helix",
    "Helichrysum arenarium",
    "Hieracium pilosella",
    "Humulus lupulus",
    "Hypericum perforatum",
    "Juniperus communis",
    "Leonurus cardiaca",
    "Levisticum officinale",
    "Linum usitatissimum",
    "Melilotus officinalis",
    "Melissa officinalis",
    "Mentha piperita",
    "Olea europaea",
    "Ononis spinosa",
    "Origanum dictamnus",
    "Origanum majorana",
    "Orthosiphon aristatus",
    "Paullinia cupana",
    "Pelargonium sidoides",
    "Peumus boldus",
    "Phaseolus vulgaris",
    "Pimpinella anisum",
    "Plantago afra",
    "Plantago lanceolata",
    "Polygonum aviculare",
    "Prunus africana",
    "Quercus robur",
    "Rheum officinale",
    "Rosmarinus officinalis",
    "Rubus idaeus",
    "Salix purpurea",
    "Sambucus nigra",
    "Rhodiola rosea",
    "Senna alexandrina",
    "Sideritis scardica",
    "Silybum marianum",
    "Solidago virgaurea",
    "Thymus vulgaris",
    "Thymus zygis",
    "Tilia cordata",
    "Valeriana officinalis",
    "Verbascum densiflorum",
    "Viola tricolor",
    "Vitex agnus-castus"
]

# =========================
# FUNCTIONS
# =========================

def search_image(query):
    params = {
        "query": query,
        "per_page": 1
    }
    r = requests.get(PEXELS_API, headers=HEADERS, params=params)
    if r.status_code != 200:
        return None
    photos = r.json().get("photos", [])
    return photos[0] if photos else None

def download_image(url, path):
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(path, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        return True
    return False

# =========================
# MAIN
# =========================

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    found, failed = [], []

    for plant in PLANTES:
        print(f"🔍 Pexels : {plant}")

        photo = search_image(plant)

        if not photo:
            failed.append([plant])
            continue

        image_url = photo["src"]["large"]
        filename = plant.lower().replace(" ", "_") + ".jpg"
        path = os.path.join(OUTPUT_DIR, filename)

        if download_image(image_url, path):
            found.append([
                plant,
                path,
                photo["photographer"],
                photo["url"],
                "Pexels License (usage commercial autorisé)"
            ])
            print(f"✅ {filename}")
        else:
            failed.append([plant])

        time.sleep(1)

    with open(FOUND_CSV, "w", encoding="utf-8", newline="") as f:
        csv.writer(f).writerows(
            [["Nom scientifique", "Fichier", "Auteur", "Source", "Licence"]] + found
        )

    with open(FAILED_CSV, "w", encoding="utf-8", newline="") as f:
        csv.writer(f).writerows(
            [["Nom scientifique"]] + failed
        )

    print("\n📊 Terminé")
    print(f"Images trouvées : {len(found)}")
    print(f"Sans image : {len(failed)}")

if __name__ == "__main__":
    main()
