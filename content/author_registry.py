"""Local-only identity assignment shared by all article generators."""
import json
from pathlib import Path


def disclosed_desk_author():
    registry_path = Path(__file__).resolve().parents[1] / "src" / "data" / "authors.json"
    desk = json.loads(registry_path.read_text(encoding="utf-8"))["northstar-desk"]
    if desk["kind"] != "organization":
        raise ValueError("Automated publication requires an organizational desk identity")
    return desk["name"], desk["slug"]
