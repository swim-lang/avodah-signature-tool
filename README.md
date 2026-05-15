# Avodah Email Signature Builder

A small static tool for creating Avodah email signatures.

## Use

Open the site, sign in with the shared Avodah credentials, edit the signature fields, then use:

- **Copy for Outlook** for pasting directly into Outlook signature settings.
- **Copy HTML** for copying the table source.
- **Download HTML** for saving a standalone signature file.

## Hosting

This project is plain HTML, CSS, and JavaScript. It can be hosted directly on GitHub Pages with no build step.

The exported signature uses hosted PNG artwork instead of inline SVGs so Outlook is less likely to strip the Avodah mark when pasting. The Avodah mark links to the configured website, so the signature does not need separate email or URL text lines.

## Note

The login is intentionally lightweight and client-side. It hides casual access but is not meant for sensitive data.
