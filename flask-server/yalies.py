import os
import requests
from typing import List, Dict, Optional

class YaliesService:
    BASE_URL = "https://api.yalies.io/v2/"
    
    def __init__(self):
        self.api_key = os.getenv('YALIES_API_KEY')
        if not self.api_key:
            raise ValueError("YALIES_API_KEY environment variable not set")
    
    def search_people(self, query: str, filters: Dict = None) -> List[Dict]:
        try:
            response = requests.post(
                f"{self.BASE_URL}people",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}",
                },
                json={
                    "query": query,
                    "filters": {"current": True, **(filters or {})},
                    "page_size": 50
                },
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Yalies API request failed: {e}")
            raise
    
    def get_person_by_netid(self, netid: str) -> Optional[Dict]:
        try:
            people = self.search_people("", filters={"netid": [netid]})
            return people[0] if people else None
        except Exception:
            return None