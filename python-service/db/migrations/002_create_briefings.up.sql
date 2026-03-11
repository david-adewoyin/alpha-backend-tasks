CREATE TABLE briefings (
    id UUID PRIMARY KEY,
    company_name TEXT NOT NULL,
    ticker TEXT NOT NULL,
    sector TEXT,
    analyst_name TEXT,
    summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    generated_html TEXT,
    generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE briefing_metrics(
    id UUID PRIMARY KEY,
    briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    UNIQUE(briefing_id, name)
);


CREATE TABLE briefing_key_points (
    id UUID PRIMARY KEY,
    briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE TABLE briefing_risks (
    id UUID PRIMARY KEY,
    briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_briefings_risks_briefing_id ON briefing_risks(briefing_id);
CREATE INDEX idx_briefings_key_points_briefing_id ON briefing_key_points(briefing_id);
