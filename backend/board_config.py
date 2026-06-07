"""Board portal configuration — paths and constants."""
import os
from pathlib import Path

# Root of the project (one level above backend/)
_PROJECT_ROOT = Path(__file__).parent.parent

# board_members.json holds invite tokens — gitignored, never committed
BOARD_MEMBERS_PATH = Path(__file__).parent / "board_members.json"

# Tickets created by POST /api/board/requests land here
BOARD_INBOX_PATH = _PROJECT_ROOT / "paperclip" / "state" / "board-inbox"

# Roadmap file parsed by GET /api/board/releases
ROADMAP_PATH = _PROJECT_ROOT / "paperclip" / "state" / "roadmap.md"

BOARD_COOKIE_NAME = "mintymarks_board"
BOARD_COOKIE_MAX_AGE = 60 * 60 * 24 * 30  # 30 days
