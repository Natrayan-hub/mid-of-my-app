"""Auth dependency. Until the auth integration lands (onboarding phase),
every request is scoped to a fixed demo user — the same seam
(`get_current_user_id`) swaps to JWT extraction later with no route changes."""

DEMO_USER_ID = "demo-user"


async def get_current_user_id() -> str:
    return DEMO_USER_ID
