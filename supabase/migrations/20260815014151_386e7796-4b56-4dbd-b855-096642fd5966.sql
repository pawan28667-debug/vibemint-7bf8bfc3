REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.notify(uuid, text, uuid, uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.on_like() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.on_comment() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.on_subscription() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.on_message() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_conversation_member(uuid, uuid) FROM anon, public;