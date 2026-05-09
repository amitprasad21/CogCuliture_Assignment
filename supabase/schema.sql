-- Create users table profile extension (Supabase handles auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create claims table
CREATE TABLE public.claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  category TEXT, -- dates, statistics, financial, technical, numerical
  status TEXT CHECK (status IN ('verified', 'inaccurate', 'false', 'misleading', 'unverified')),
  confidence_score NUMERIC(5, 2),
  corrected_fact TEXT,
  explanation TEXT,
  sources JSONB, -- Array of { url, title, snippet }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for reports
CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for claims
CREATE POLICY "Users can view claims of their reports" ON public.claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = claims.report_id AND reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert claims to their reports" ON public.claims
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports
      WHERE reports.id = claims.report_id AND reports.user_id = auth.uid()
    )
  );

-- Function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
