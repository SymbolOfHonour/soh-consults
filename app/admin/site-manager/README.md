# Site Manager scope

This module is the owner-facing no-code control plane. Current controls cover central branding/contact values, homepage section visibility preferences and latest-update count. Future visitor-facing components should read these central settings instead of duplicating business values in source files.

Protected developer concerns (authentication, secrets, schema migrations and deployment configuration) must remain outside owner-editable forms. Business rules may be exposed only through validated purpose-built controls with safe defaults and rollback.
