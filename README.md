# Registro Ore Cantieri — PWA per iPhone

Questa cartella contiene una PWA installabile da Safari. Non è necessario compilare un’app iOS.

## Installazione su iPhone

1. Pubblica **tutti** i file della cartella su un hosting con HTTPS (per esempio il tuo hosting, GitHub Pages, Netlify o Vercel).
2. Apri l’indirizzo in Safari su iPhone.
3. Tocca **Condividi → Aggiungi alla schermata Home → Aggiungi**.
4. Avvia l’icona dalla schermata Home. Dopo il primo caricamento la PWA conserva i file essenziali per l’uso offline.

Aprire `index.html` direttamente dal file o da un URL `file://` non basta: service worker e installazione richiedono un sito HTTPS.

## Scambio dati con Android

L’app salva i rapportini localmente sul dispositivo. Per passare i dati fra Android e PWA:

1. Nell’app di partenza scegli **Esporta Backup** e salva/condividi `registro_ore_backup.json`.
2. Nell’app di arrivo scegli **Ripristina** e seleziona quel JSON.
3. Il ripristino sostituisce l’archivio corrente: prima esporta un backup di sicurezza.

Il JSON usa i campi comuni del progetto Android (`nomeOperaio`, `clienti`, `cantieri`, `interni`, `quadroElettrico`, `rapportini`). Le foto non vengono incluse nel backup condiviso: restano nei dati del browser PWA o nell’area privata dell’app Android, perché i due sistemi memorizzano le immagini in modo diverso. Lo scambio non è automatico: va ripetuto esportando e importando il backup.

## Funzioni

- Clienti, cantieri, interni e componenti del quadro elettrico.
- Rapportini lavoro, malattia, ferie, permesso e congedo.
- Cantiere facoltativo per il lavoro presso il cliente.
- Turno predefinito di 8,5 ore: 8 ordinarie e 0,5 straordinarie.
- Plancia mensile, filtri, ricerca, controllo giornate, CSV e stampa/PDF.
- Backup JSON compatibile con l’app Android.
- Caduta di tensione, stima condensatore e foto compresse in galleria interna.

I dati restano nel browser del dispositivo. Esporta regolarmente un backup, soprattutto prima di cancellare i dati di Safari o cambiare telefono.
