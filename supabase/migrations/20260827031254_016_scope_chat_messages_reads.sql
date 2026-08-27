/*
  # Stop anonymous reads of chat transcripts

  ## Problem
  `anon_select_chat_messages` used `USING (true)`, so anyone with the public
  anon key could read the full transcript of every conversation held with the
  assistant. These are financial-advice conversations containing whatever
  personal financial detail visitors typed.

  ## Changes
  - Drop the blanket anonymous SELECT policy.
  - Add a policy letting a signed-in user read only messages belonging to their
    own sessions.

  Anonymous history restore is served by the safebot-chat edge function using
  the service-role key, which requires the caller to present the session token
  they already hold.
*/

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;

CREATE POLICY "select_own_chat_messages" ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()
    )
  );
