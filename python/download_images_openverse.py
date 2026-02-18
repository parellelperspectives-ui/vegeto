import os
import csv
import time
import re
import requests

# ==================================
# CONFIG
# ==================================

OPENVERSE_API = "https://api.openverse.engineering/v1/images"

HEADERS = {
    "User-Agent": "VegetauxDB/1.0 (contact: marc@example.com)"
}

OUTPUT_DIR = "images_ok"
FAILED_CSV = "plantes_sans_image_commerciale.csv"
META_CSV = "images_metadata.csv"

# --- LISTE ORIGINALE (BDD) ---
PLANTES = [
    "Achillea millefolium",
    "Actaea racemosa",
    "Aesculus hippocastanum",
    "Agrimonia eupatoria",
    "Allium sativum",
    "Aloe vera",
    "Althaea officinalis",
    "Arctium lappa",
    "Artemisia absinthium",
    "Avena sativa",
    "Betula pendula",
    "Calendula officinalis",
    "Camellia sinensis",
    "Capsella bursa-pastoris",
    "Capsicum annuum",
    "Carum carvi",
    "Centaurium erythraea",
    "Cetraria islandica",
    "Chamaemelum nobile",
    "Cichorium intybus",
    "Cinnamomum verum",
    "Cola acuminata",
    "Cucurbita pepo",
    "Curcuma longa",
    "Curcuma xanthorrhiza",
    "Cynara scolymus",
    "Echinacea angustifolia",
    "Echinacea pallida",
    "Echinacea purpurea",
    "Eleutherococcus senticosus",
    "Elymus repens",
    "Epilobium angustifolium",
    "Equisetum arvense",
    "Eschscholzia californica",
    "Eucalyptus globulus",
    "Filipendula ulmaria",
    "Foeniculum vulgare",
    "Frangula alnus",
    "Frangula purshiana",
    "Fraxinus excelsior",
    "Fucus vesiculosus",
    "Fumaria officinalis",
    "Gentiana lutea",
    "Ginkgo biloba",
    "Glycyrrhiza glabra",
    "Grindelia robusta",
    "Hamamelis virginiana",
    "Harpagophytum procumbens",
    "Hedera helix",
    "Helichrysum arenarium",
    "Hieracium pilosella",
    "Humulus lupulus",
    "Hypericum perforatum",
    "Ilex paraguariensis",
    "Juniperus communis",
    "Lavandula angustifolia",
    "Leonurus cardiaca",
    "Levisticum officinale",
    "Linum usitatissimum",
    "Marrubium vulgare",
    "Matricaria chamomilla",
    "Melaleuca alternifolia",
    "Melilotus officinalis",
    "Melissa officinalis",
    "Mentha piperita",
    "Oenothera biennis",
    "Olea europaea",
    "Ononis spinosa",
    "Origanum dictamnus",
    "Origanum majorana",
    "Orthosiphon aristatus",
    "Panax ginseng",
    "Passiflora incarnata",
    "Paullinia cupana",
    "Pelargonium sidoides",
    "Peumus boldus",
    "Phaseolus vulgaris",
    "Pimpinella anisum",
    "Plantago afra",
    "Plantago lanceolata",
    "Plantago ovata",
    "Polygonum aviculare",
    "Potentilla erecta",
    "Primula veris",
    "Prunus africana",
    "Quercus robur",
    "Rheum officinale",
    "Ribes nigrum",
    "Rosmarinus officinalis",
    "Rubus idaeus",
    "Ruscus aculeatus",
    "Salix purpurea",
    "Salvia officinalis",
    "Sambucus nigra",
    "Rhodiola rosea",
    "Senna alexandrina",
    "Serenoa repens",
    "Sideritis scardica",
    "Silybum marianum",
    "Sisymbrium officinale",
    "Solidago virgaurea",
    "Syzygium aromaticum",
    "Tanacetum parthenium",
    "Taraxacum officinale",
    "Thymus vulgaris",
    "Thymus zygis",
    "Tilia cordata",
    "Trigonella foenum-graecum",
    "Urtica dioica",
    "Vaccinium myrtillus",
    "Valeriana officinalis",
    "Verbascum densiflorum",
    "Viola tricolor",
    "Vitex agnus-castus",
    "Vitis vinifera",
    "Zingiber officinale"
]

# ==================================
# UTILS
# ==================================

def clean_name(name):
    """Nettoie le nom pour la recherche d'image"""
    name = re.sub(r"\(.*?\)", "", name)
    name = re.sub(r"\b[Ll]\.$", "", name)
    name = re.sub(r"\s{2,}", " ", name)
    return name.strip()

def search_image(query):
    params = {
        "q": query,
        "license_type": "commercial",
        "page_size": 5
    }
    r = requests.get(OPENVERSE_API, params=params, headers=HEADERS)
    if r.status_code != 200:
        return None

    results = r.json().get("results", [])
    return results[0] if results else None

def download_image(url, path):
    r = requests.get(url, stream=True)
    if r.status_code == 200:
        with open(path, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        return True
    return False

# ==================================
# MAIN
# ==================================

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    failed, metadata = [], []

    for original in PLANTES:
        query = clean_name(original)
        print(f"🔍 {original} → {query}")

        img = search_image(query)

        if not img:
            failed.append([original, "Aucune image sous licence commerciale"])
            continue

        filename = query.lower().replace(" ", "_") + ".jpg"
        path = os.path.join(OUTPUT_DIR, filename)

        if download_image(img["url"], path):
            metadata.append([
                original,
                query,
                path,
                img.get("creator"),
                img.get("license"),
                img.get("foreign_landing_url")
            ])
        else:
            failed.append([original, "Erreur téléchargement"])

        time.sleep(1)

    with open(FAILED_CSV, "w", encoding="utf-8", newline="") as f:
        csv.writer(f).writerows([["Nom scientifique", "Raison"]] + failed)

    with open(META_CSV, "w", encoding="utf-8", newline="") as f:
        csv.writer(f).writerows([
            ["Nom scientifique", "Nom recherche", "Fichier", "Auteur", "Licence", "Source"]
        ] + metadata)

    print("\n✅ Terminé")

if __name__ == "__main__":
    main()
