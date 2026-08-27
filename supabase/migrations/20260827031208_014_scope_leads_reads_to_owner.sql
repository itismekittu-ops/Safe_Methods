/*
  # Scope leads reads to the owner

  ## Problem
  `auth_select_leads` used `USING (true)`, so any self-registered user could
  download every contact-form and exit-intent lead (name, email, phone).
  Sign-up is open to the public, so "authenticated" is not a trusted group.

  ## Changes
  - Replace with a policy scoped to the caller's own email address, which is
    exactly what Account.tsx queries (.eq("email", user.email)).
*/

DROP POLICY IF EXISTS "auth_select_leads" ON leads;

CREATE POLICY "select_own_leads" ON leads FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));
