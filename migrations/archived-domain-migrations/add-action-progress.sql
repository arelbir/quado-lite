-- Action Progress Table (İlerleme Notları)
-- Aksiyon tamamlanmadan ara güncellemeler için

CREATE TABLE IF NOT EXISTS action_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    note TEXT NOT NULL,
    created_by_id UUID REFERENCES "User"(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for performance
CREATE INDEX idx_action_progress_action_id ON action_progress(action_id);
CREATE INDEX idx_action_progress_created_at ON action_progress(created_at);

-- Comment
COMMENT ON TABLE action_progress IS 'Aksiyon ilerleme notları - tamamlanmadan ara güncellemeler';
COMMENT ON COLUMN action_progress.note IS 'Progress açıklaması: "Bugün şunu yaptım"';
