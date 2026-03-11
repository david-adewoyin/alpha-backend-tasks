from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional
from uuid import UUID


class MetricBase(BaseModel):
    name: str
    value: str


class BriefingCreate(BaseModel):
    company_name: str = Field(..., alias="companyName", min_length=1)
    ticker: str = Field(..., min_length=1)
    sector: Optional[str] = None
    analyst_name: Optional[str] = Field("Internal Analyst", alias="analystName")
    summary: str = Field(..., min_length=1)
    recommendation: str = Field(..., min_length=1)
    key_points: List[str] = Field(..., min_length=2, alias="keyPoints")
    risks: List[str] = Field(..., min_length=1)
    metrics: List[MetricBase] = []

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, v: str) -> str:
        return v.upper()

    @field_validator("metrics")
    @classmethod
    def unique_metric_names(cls, v: List[MetricBase]) -> List[MetricBase]:
        names = [m.name for m in v]
        if len(names) != len(set(names)):
            raise ValueError("Metric names must be unique within a briefing")
        return v

    model_config = ConfigDict(
        populate_by_name=True, 
        str_strip_whitespace=True,
    )

class MetricResponse(BaseModel):
    name: str
    value: str

class BriefingResponse(BaseModel):
    id: UUID
    company_name: str
    ticker: str
    summary: str
    recommendation: str

    key_points: List[str] = []
    risks: List[str] = []
    metrics: List[MetricResponse] = []

    @field_validator("key_points", mode="before")
    @classmethod
    def flatten_key_points(cls, v):
        if isinstance(v, list):
            return [getattr(item, "content", item) for item in v]
        return v

    @field_validator("risks", mode="before")
    @classmethod
    def flatten_risks(cls, v):
        if isinstance(v, list):
            return [getattr(item, "content", item) for item in v]
        return v
    model_config = ConfigDict(from_attributes=True)