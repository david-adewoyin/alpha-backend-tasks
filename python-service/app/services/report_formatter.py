from datetime import datetime, timezone
from pathlib import Path
from app.models.models import Briefing
from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates"


class ReportFormatter:
    """Starter formatter utility for future report-generation work."""

    def __init__(self) -> None:
        self._env = Environment(
            loader=FileSystemLoader(str(_TEMPLATE_DIR)),
            autoescape=select_autoescape(enabled_extensions=("html", "xml"), default_for_string=True),
        )

    def render_briefing(self,briefing:Briefing) -> str:
        """Transforms stored data into view model and renders HTML."""
        template  = self._env.get_template("briefing_report.html")
        view_model = self._transform_to_view_model(briefing)
        return template.render(**view_model)

    def _transform_to_view_model(self, briefing) -> dict:
        return {
            "title": f"Internal Report: {briefing.company_name}",
            "company": {
                "name": briefing.company_name,
                "ticker": briefing.ticker,
                "sector": briefing.sector,
                "analyst": briefing.analyst_name or "Internal"
            },
            "summary": briefing.summary,
            "recommendation": briefing.recommendation,
             "key_points": [p.content for p in briefing.key_points],
            "risks": [r.content for r in briefing.risks],
            "metrics": [{"name": m.name, "value": m.value} for m in briefing.metrics],
            "generated_at": briefing.generated_at
        }

    @staticmethod
    def generated_timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()
