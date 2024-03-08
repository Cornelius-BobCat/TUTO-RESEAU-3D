import requests
from bs4 import BeautifulSoup
import json
import pymongo
import random
import time


def itsTrue(doc_id):
    # Sélection de la base de données et de la collection
    db = client["reseau"]
    collection = db["wikipedia"]
    # Mise à jour du champ parsed à True pour le document spécifié
    try:
        return collection.update_one({"_id": doc_id}, {"$set": {"parsed": True}})
    except Exception as e:
        print(
            f"Erreur lors de la mise à jour du champ parsed pour le document {doc_id}: {e}"
        )
        return False


def process_json_data(collection, json_data):
    """Traite le json_data et met à jour parsed=True pour les URLs existantes."""
    try:
        data = json.loads(json_data)
        change = 0
        for item in data:
            url = item.get("url")
            if url:
                existing_doc = collection.find_one({"url": url})
                if existing_doc:
                    newParent = str(existing_doc["_id"])
                    change += 1
                    item["parsed"] = True
                    item["parent"] = newParent

        print(f"Nombre de changements : {change} sur {len(data)}")
        return json.dumps(data)

    except Exception as e:
        print(f"Erreur lors du traitement du json_data : {e}")
        return None


def scrapWiki(url, niveau, parent):
    try:
        response = requests.get(url)
        html_content = response.text

        # Parsing du contenu HTML
        soup = BeautifulSoup(html_content, "html.parser")

        # Récupération de tous les liens href qui commencent par "/wiki/"
        linksS = soup.find_all(
            "a", href=lambda href: href and href.startswith("/wiki/")
        )
        links = random.sample(linksS, 5)
        # Création d'une liste pour stocker les liens complets
        all_links = []

        # Ajout de chaque lien complet et son texte associé à la liste
        for link in links:
            full_link = "https://fr.wikipedia.org" + link.get("href")
            link_text = link.text
            newNiveau = niveau + 1
            all_links.append(
                {
                    "parent": parent,
                    "url": full_link,
                    "texte": link_text,
                    "niveau": newNiveau,
                    "parsed": False,
                    "createdAt": time.time(),
                }
            )

        json_data = json.dumps(all_links)
        return json_data
    except Exception as e:
        print(f"Erreur lors du scrap de {url}: {e}")
        return False


# URL de la page Wikipedia
first = "https://fr.wikipedia.org/wiki/Wikipédia:Accueil_principal"
# URL de connexion MongoDB
mongodb_url = "mongodb://admin:pwd@ip:27017/"
# Connexion à MongoDB
client = pymongo.MongoClient(mongodb_url)
# Sélection de la base de données et de la collection
db = client["reseau"]
collection = db["wikipedia"]
# Vérification si la collection est vide
if collection.count_documents({}) == 0:
    print("Collection vide")
    # creation du premier document pour l'auto node
    data = [
        {
            "parent": "",
            "url": first,
            "texte": "first noeud",
            "niveau": 0,
            "parsed": False,
            "createdAt": time.time(),
        }
    ]
    try:
        # Ajout du document à la collection
        inserted_ids = collection.insert_many(data).inserted_ids
        # Récupération de l'id du document inséré
        parent_id = inserted_ids[0]
        # Mise à jour du champ parent avec l'id du document inséré
        collection.update_one({"_id": parent_id}, {"$set": {"parent": str(parent_id)}})

    except Exception as e:
        print(f"Erreur lors de l'insertion du document dans la collection: {e}")
else:
    # Récupérer tous les documents non parsés
    unparsed_ids = collection.distinct("_id", {"parsed": False})
    random_id = random.choice(unparsed_ids)
    print("random_id", random_id)
    # Récupérer le document correspondant à l'ID aléatoire dans la base de données
    random_document = collection.find_one({"_id": random_id})
    # Extraire les valeurs des champs "niveau" et "parent"
    niveau = random_document["niveau"]
    parent = random_document["_id"]
    url = random_document["url"]

    # Appeler la fonction scrapWiki avec les données appropriées
    json_data = scrapWiki(url, niveau, str(parent))

    # Sélection de la base de données et de la collection
    db = client["reseau"]
    collection = db["wikipedia"]
    # Insérer les données JSON dans la collection
    try:
        json_data_processed = process_json_data(collection, json_data)
        collection.insert_many(json.loads(json_data))
        itsTrue(parent)
        # time.sleep(10)
    except Exception as e:
        print(f"Erreur lors de l'insertion des données dans la collection: {e}")

# Fermeture de la connexion à MongoDB
client.close()
