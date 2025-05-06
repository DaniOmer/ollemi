-- Create the review table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert their own reviews" ON reviews
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their all reviews" ON reviews
    FOR SELECT USING (true);
