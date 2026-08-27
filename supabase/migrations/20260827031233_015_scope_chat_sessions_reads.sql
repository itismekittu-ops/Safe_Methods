/*
  # Stop anonymous listing of chat session tokens

  ## Problem
  `anon_select_chat_sessions` used `USING (true)`, so anyone with the public
  anon key could list every session_token. The token is the sole credential
  identifying a conversation, so publishing the list turned an unguessable
  bearer secret into a public identifier.

  ## Changes
  - Drop the blanket anonymous SELECT policy.
  - Add a policy letting a signed-in user read only their own sessions, which
    is what Account.tsx queries (.eq("user_id", user.id)).

  Anonymous history restore is served by the safebot-chat edge function using
  the service-role key, which bypasses RLS and requires the caller to present
  the session token they already hold.
*/

DROP POLICY IF EXISTS "anon_select_chat_sessions" ON chat_sessions;

CREATE POLICY "select_own_chat_sessions" ON chat_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
