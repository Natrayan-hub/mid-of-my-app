from typing import Dict, List, Literal

from pydantic import BaseModel


class DataControls(BaseModel):
    """S34 per-domain privacy policy — the source of truth enforced by the
    sync dual-gate (client outbox filter + server policy re-check, §C.4)."""
    tasks: Literal["cloud", "local"] = "cloud"
    documents: Literal["cloud", "local"] = "cloud"
    health_cache: Literal["cloud", "local"] = "local"  # local-only unless opted in
    ai_memory: Literal["cloud", "local", "off"] = "cloud"
    photos: Literal["cloud", "off"] = "off"


class Preference(BaseModel):
    id: str  # == user_id
    user_id: str
    notif_prefs: Dict = {
        "task_reminders": True,
        "ai_suggestions": True,
        "suggestions_per_day": 3,
        "health_nudges": True,
        "backup_alerts": "failures_only",
        "weekly_recap": "in_app",
        "quiet_hours": {"start": "22:00", "end": "07:00"},
    }
    sync_prefs: Dict = {"wifi_only": False, "background": True}
    data_controls: DataControls = DataControls()
    app_lock: Dict = {"enabled": False, "scope": "vault", "auto_lock_min": 5}
    today_cards: List[Dict] = []  # card visibility + pin order (S25)
