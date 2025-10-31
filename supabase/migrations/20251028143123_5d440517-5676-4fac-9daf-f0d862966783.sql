-- Create event_types table for configurable event buttons
CREATE TABLE public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor_types table for configurable sensors
CREATE TABLE public.sensor_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create recordings table
CREATE TABLE public.recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'recording',
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create events table for timestamped annotations
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES public.event_types(id),
  timestamp TIMESTAMPTZ NOT NULL,
  offset_ms INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor_data table for timestamped sensor readings
CREATE TABLE public.sensor_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  sensor_type_id UUID NOT NULL REFERENCES public.sensor_types(id),
  timestamp TIMESTAMPTZ NOT NULL,
  offset_ms INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_events_recording_id ON public.events(recording_id);
CREATE INDEX idx_events_timestamp ON public.events(timestamp);
CREATE INDEX idx_sensor_data_recording_id ON public.sensor_data(recording_id);
CREATE INDEX idx_sensor_data_timestamp ON public.sensor_data(timestamp);

-- Enable Row Level Security
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required as per requirements)
CREATE POLICY "Allow public read access to event_types"
  ON public.event_types FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access to event_types"
  ON public.event_types FOR ALL
  USING (true);

CREATE POLICY "Allow public read access to sensor_types"
  ON public.sensor_types FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access to sensor_types"
  ON public.sensor_types FOR ALL
  USING (true);

CREATE POLICY "Allow public read access to recordings"
  ON public.recordings FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access to recordings"
  ON public.recordings FOR ALL
  USING (true);

CREATE POLICY "Allow public read access to events"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access to events"
  ON public.events FOR ALL
  USING (true);

CREATE POLICY "Allow public read access to sensor_data"
  ON public.sensor_data FOR SELECT
  USING (true);

CREATE POLICY "Allow public write access to sensor_data"
  ON public.sensor_data FOR ALL
  USING (true);

-- Insert default event types (16 events for 4x4 grid)
INSERT INTO public.event_types (code, label, display_order) VALUES
  ('TALK_START', 'Started Talking', 1),
  ('TALK_STOP', 'Stopped Talking', 2),
  ('SMILE', 'Smiled', 3),
  ('FROWN', 'Frowned', 4),
  ('NOD', 'Nodded', 5),
  ('SHAKE', 'Head Shake', 6),
  ('LOOK_AWAY', 'Looked Away', 7),
  ('EYE_CONTACT', 'Eye Contact', 8),
  ('GESTURE', 'Hand Gesture', 9),
  ('LEAN_IN', 'Leaned In', 10),
  ('LEAN_BACK', 'Leaned Back', 11),
  ('STRESS', 'Showed Stress', 12),
  ('CALM', 'Appeared Calm', 13),
  ('INTERRUPT', 'Interrupted', 14),
  ('AGREE', 'Agreement', 15),
  ('DISAGREE', 'Disagreement', 16);

-- Insert default sensor types
INSERT INTO public.sensor_types (name, enabled) VALUES
  ('accelerometer', true),
  ('gyroscope', true),
  ('geolocation', true),
  ('magnetometer', false),
  ('orientation', true);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('recordings', 'recordings', false);

-- Storage policies for recordings bucket
CREATE POLICY "Allow public read access to recordings"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recordings');

CREATE POLICY "Allow public upload to recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'recordings');

CREATE POLICY "Allow public update to recordings"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'recordings');

CREATE POLICY "Allow public delete from recordings"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'recordings');