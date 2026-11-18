# Registro Ore Cantieri — PWA di prova

Questa è una copia di prova locale basata sui sorgenti PWA più recenti disponibili. Le modifiche restano in questa cartella e non vengono pubblicate sul sito GitHub Pages.

## Avvio per le prove

Estrai lo ZIP e fai doppio clic su `Avvia_test_PWA.bat`. Si apre il browser su un indirizzo locale (`127.0.0.1:8766`); la finestra di PowerShell resta aperta finché il server di prova è attivo. Chiudila per fermarlo. La porta dedicata separa questo archivio di prova dai dati del sito e dalla vecchia PWA locale. Non carica né pubblica file online.

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

Il JSON portatile versione 2 usa i campi comuni del progetto Android (`nomeOperaio`, `clienti`, `cantieri`, `interni`, `quadroElettrico`, `rapportini`, ore predefinite e tariffa straordinaria) e aggiunge foto JPEG compresse associate al cliente o al cantiere. I percorsi privati del telefono non vengono esportati. Android e PWA importano anche il formato versione 1 e i vecchi JSON senza foto. Prima di ogni ripristino viene conservata una copia locale recuperabile dal pulsante “Recupera dati precedenti al ripristino”.

## Funzioni

- Clienti, cantieri, interni e componenti del quadro elettrico.
- Rapportini lavoro, malattia, ferie, permesso e congedo.
- Cantiere facoltativo per il lavoro presso il cliente.
- Ore predefinite configurabili per il rapportino e tariffa personale degli straordinari, con stima economica nella Plancia.
- Plancia mensile, filtri, ricerca, controllo giornate, CSV e stampa/PDF.
- Backup JSON compatibile con l’app Android.
- Quadro elettrico senza marche, con le stesse famiglie dell'app Android: protezioni, orologi, trasformatori, alimentatori, dispositivi di misura, barre e morsettiere; poli, moduli (fino a 24) e lato neutro selezionabili.
- Calcolatore elettrico, superficie/volume, verifica preliminare cavo e protezione, motore, conversioni e piedinature comuni.
- Foto cliente e cantiere compresse in galleria e incluse nel backup JSON.
- Ogni foto mostra chiaramente cliente e cantiere, oppure indica che è una foto generale del cliente; il comando **Condividi** invia l’immagine e la sua posizione, con scaricamento nominato come alternativa se il browser non supporta la condivisione.

La PWA locale usa la stessa icona lampadina dell'app Android. Per le prove usa un archivio browser separato dalla versione pubblicata.

I dati restano nel browser del dispositivo. Esporta regolarmente un backup, soprattutto prima di cancellare i dati di Safari o cambiare telefono.
