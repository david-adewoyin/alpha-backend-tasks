from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone

from ..db.session import get_db
from ..models.models import Briefing, BriefingMetric,KeyPoint,Risk
from ..schemas.briefing import BriefingCreate, BriefingResponse
from ..services.report_formatter import ReportFormatter

router = APIRouter(prefix="/briefings", tags=["briefings"])
formatter = ReportFormatter()

@router.post("", response_model=BriefingResponse)
def create_briefing(payload: BriefingCreate, db: Session = Depends(get_db)):
    briefing = Briefing(
        company_name=payload.company_name,
        ticker=payload.ticker,
        sector=payload.sector,
        analyst_name=payload.analyst_name,
        summary=payload.summary,
        recommendation=payload.recommendation

    )
    db.add(briefing)
    db.flush() 

  # Add Key Points with explicit order
    for index, content in enumerate(payload.key_points):
        db.add(KeyPoint(
            briefing_id=briefing.id,
            content=content,
            display_order=index
        ))
    
    # Add Risks with explicit order
    for index, content in enumerate(payload.risks):
        db.add(Risk(
            briefing_id=briefing.id,
            content=content,
            display_order=index
        ))     
        
    # Add Metrics
    for m in payload.metrics:
        db.add(BriefingMetric(briefing_id=briefing.id, name=m.name, value=m.value))
    
    db.commit()
    db.refresh(briefing)
    return briefing

@router.get("/{id}", response_model=BriefingResponse)
def get_briefing(id: UUID, db: Session = Depends(get_db)):
    briefing = db.query(Briefing).filter(Briefing.id == id).first()
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return briefing

@router.post("/{id}/generate")
def generate_report(id: UUID, db: Session = Depends(get_db)):
    briefing = db.query(Briefing).filter(Briefing.id == id).first()
    if not briefing:
        raise HTTPException(status_code=404, detail="Briefing not found")
    now = datetime.now(timezone.utc)
    briefing.generated_at = now

    html = formatter.render_briefing(briefing)
    briefing.generated_html = html
    db.commit()
    
    return {"message": "Report generated successfully", "generated_at": now.strftime("%Y-%m-%d %H:%M:%S") }

@router.get("/{id}/html")
def get_report_html(id: UUID, db: Session = Depends(get_db)):
    briefing = db.query(Briefing).filter(Briefing.id == id).first()
    if not briefing or not briefing.generated_html:
        raise HTTPException(status_code=404, detail="Generated HTML not found. Call /generate first.")
    
    return Response(content=briefing.generated_html, media_type="text/html")
