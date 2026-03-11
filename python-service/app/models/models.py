import uuid

from sqlalchemy import Column, Integer,String, Text,ForeignKey,DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..db.base import Base


class Briefing(Base):
    __tablename__ = "briefings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String, nullable=False)
    ticker = Column(String, nullable=False)
    sector = Column(String)
    analyst_name = Column(String)
    summary = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    generated_html = Column(Text)
    generated_at = Column(DateTime(timezone=True))

    key_points = relationship("KeyPoint", back_populates="briefing", cascade="all, delete-orphan", order_by="KeyPoint.display_order")
    risks = relationship("Risk", back_populates="briefing", cascade="all, delete-orphan", order_by="Risk.display_order")
    metrics = relationship("BriefingMetric", back_populates="briefing", cascade="all, delete-orphan")

class KeyPoint(Base):
    __tablename__ = "briefing_key_points"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    briefing_id = Column(UUID(as_uuid=True), ForeignKey("briefings.id"))
    content = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    briefing = relationship("Briefing", back_populates="key_points")

class Risk(Base):
    __tablename__ = "briefing_risks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    briefing_id = Column(UUID(as_uuid=True), ForeignKey("briefings.id"))
    content = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    briefing = relationship("Briefing", back_populates="risks")


class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    briefing_id = Column(UUID(as_uuid=True), ForeignKey("briefings.id"))
    name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    briefing = relationship("Briefing", back_populates="metrics")


    