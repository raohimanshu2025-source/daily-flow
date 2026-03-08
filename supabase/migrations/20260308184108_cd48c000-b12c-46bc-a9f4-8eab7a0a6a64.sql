-- Allow admins to view all BNPL orders
CREATE POLICY "Admins can view all bnpl" ON public.bnpl_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update all BNPL orders (approve/reject)
CREATE POLICY "Admins can update all bnpl" ON public.bnpl_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));