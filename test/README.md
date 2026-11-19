# Registro Ore Cantieri — PWA TEST

Questa cartella contiene la versione di prova con login, permessi, sincronizzazione Supabase e foto condivise tramite Worker/R2.

## Pubblicazione separata su GitHub Pages

1. Nel repository `gestioneorecantiere`, crea una cartella `test` nella radice.
2. Carica **dentro `test/`** tutti i file di questo pacchetto. Non sostituire i file nella radice: quelli servono alla PWA personale.
3. Il link di prova sarà `https://simonezussa-maker.github.io/gestioneorecantiere/test/`.
4. Su iPhone apri quel link in Safari e scegli **Condividi → Aggiungi alla schermata Home**. L’icona si chiamerà **Registro TEST**.

Il test usa lo stesso progetto Supabase e il gruppo assegnato all’account, ma ha database locale, chiavi sessione, impostazione Worker e cache service worker separate dal link principale. Inserisci il login del gruppo di prova. Il Worker foto è preimpostato.

Il 19 novembre 2026 sono stati aggiornati l’indirizzo principale Supabase, gli URL di ritorno consentiti e la funzione `manage-members` per aprire inviti e recupero password su `https://simonezussa-maker.github.io/gestioneorecantiere/test/`. Usa le nuove email generate dopo questo aggiornamento per le prove di attivazione.

Questa revisione usa `app.js?v=23`, `cloud.js?v=10` e cache `registro-ore-pwa-test-v4`. I rapportini distinguono cliente, cantiere, interno e autore. Il pulsante «Solo spese» azzera le ore per registrare un anticipo. L’importo deve essere positivo quando le ore sono zero.

I backup JSON sono portabili e comprendono le foto presenti localmente. La PWA TEST e quella personale non condividono il database del browser.
