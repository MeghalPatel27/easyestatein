-- Comprehensive backend improvements for all tables (fixed)

-- 1. Add missing triggers for updated_at columns
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 2. Add DELETE policies for user-owned data
CREATE POLICY "Users can delete their own profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Brokers can delete their own properties"
ON public.properties
FOR DELETE
TO authenticated
USING (broker_id = auth.uid());

CREATE POLICY "Users can delete their own chats"
ON public.chats
FOR DELETE
TO authenticated
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
ON public.leads
FOR DELETE
TO authenticated
USING (broker_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "Buyers can delete their own requirements"
ON public.requirements
FOR DELETE
TO authenticated
USING (buyer_id = auth.uid());

-- 3. Add proper RLS to wallet_transactions for updates and deletes
CREATE POLICY "Users can update their own transactions"
ON public.wallet_transactions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own transactions"
ON public.wallet_transactions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_requirements_buyer_id ON public.requirements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_properties_broker_id ON public.properties(broker_id);
CREATE INDEX IF NOT EXISTS idx_chats_buyer_broker ON public.chats(buyer_id, broker_id);
CREATE INDEX IF NOT EXISTS idx_leads_buyer_broker ON public.leads(buyer_id, broker_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON public.requirements(status);