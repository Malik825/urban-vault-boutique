-- Migration to add referral tracking and store credit

-- 1. Update public.profiles
ALTER TABLE public.profiles
ADD COLUMN referral_code text UNIQUE,
ADD COLUMN store_credit integer DEFAULT 0;

-- 2. Update public.orders
ALTER TABLE public.orders
ADD COLUMN referral_code_used text,
ADD COLUMN referred_by uuid REFERENCES public.profiles(id),
ADD COLUMN store_credit_used integer DEFAULT 0;

-- 3. Function to generate a random alphanumeric referral code (length 6)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer;
  code_exists boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || chars[1+random()*(array_length(chars, 1)-1)];
    END LOOP;
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = result) INTO code_exists;
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN result;
END;
$$;

-- 4. Update the handle_new_user trigger function to set the referral_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    public.generate_referral_code()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Backfill existing profiles with referral codes
DO $$
DECLARE
  prof record;
BEGIN
  FOR prof IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE id = prof.id;
  END LOOP;
END;
$$;
