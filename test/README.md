# Registro Ore Cantieri — PWA TEST

Questa cartella contiene la versione di prova con login, permessi, sincronizzazione Supabase e foto condivise tramite Worker/R2.

## Pubblicazione separata su GitHub Pages

1. Nel repository `gestioneorecantiere`, crea una cartella `test` nella radice.
2. Carica **dentro `test/`** tutti i file di questo pacchetto. Non sostituire i file nella radice: quelli servono alla PWA personale.
3. Il link di prova sarà `https://simonezussa-maker.github.io/gestioneorecantiere/test/`.
4. Su iPhone apri quel link in Safari e scegli **Condividi → Aggiungi alla schermata Home**. L’icona si chiamerà **Registro TEST**.

Il test usa lo stesso progetto Supabase e il gruppo assegnato all’account, ma ha database locale, chiavi sessione, impostazione Worker e cache service worker separate dal link principale. Inserisci il login del gruppo di prova. Il Worker foto è preimpostato.

Il recupero password richiede che `https://simonezussa-maker.github.io/gestioneorecantiere/test/` sia consentito tra i redirect URL Supabase. La funzione `manage-members` indirizza ancora i nuovi inviti al percorso principale. Prima di provare inviti a nuovi account, occorre aggiornare anche quel redirect a `/test/` e pubblicare la funzione. Il login con gli account già attivi è stato verificato.

Questa revisione usa `app.js?v=21` e cache `registro-ore-pwa-test-v2`. Corregge il calcolo degli straordinari nel registro del gruppo, applicando le otto ore ordinarie separatamente a ogni autore.

I backup JSON sono portabili e comprendono le foto presenti localmente. La PWA TEST e quella personale non condividono il database del browser.
