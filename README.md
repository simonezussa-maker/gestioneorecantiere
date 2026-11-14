# Registro Ore Cantieri — PWA aggiornata

Questo ZIP contiene i file completi necessari per aggiornare la PWA. Le modifiche restano locali finché non carichi i file sul repository GitHub Pages.

## Aggiornamento su GitHub Pages

Estrai lo ZIP e carica i file contenuti nella cartella direttamente nella stessa cartella del repository dove si trova `index.html`. Questa cartella include l’intera PWA: non caricare solo `app.js` o solo i file modificati. La pubblicazione avviene quando confermi il caricamento su GitHub.

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

Il JSON portatile versione 3 usa i campi comuni del progetto Android (`nomeOperaio`, `clienti`, `cantieri`, `interni`, `quadroElettrico`, `rapportini`, ore predefinite e tariffa straordinaria), aggiunge le foto JPEG e conserva nome, note, disposizione, apparecchi e collegamenti dei quadri. La libreria dei quadri salvati è indipendente dai cantieri e resta nel backup. I disegni già collegati ai cantieri mantengono il formato condiviso con Android. I percorsi privati del telefono non vengono esportati. Android e PWA importano i formati versione 1, 2 e 3 e i vecchi JSON senza foto. Prima di ogni ripristino viene conservata una copia locale recuperabile dal pulsante “Recupera dati precedenti al ripristino”.

## Funzioni

- Clienti, cantieri, interni e componenti del quadro elettrico.
- Rapportini lavoro, malattia, ferie, permesso e congedo.
- Cantiere facoltativo per il lavoro presso il cliente.
- Ore predefinite configurabili per il rapportino, preset rapidi 1, 2, 4, 8 e 8,5 ore e sottrazione delle ore già registrate nella stessa giornata; tariffa personale degli straordinari con stima economica nel Registro.
- Registro mensile, filtri, ricerca, controllo giornate, CSV e stampa/PDF.
- Backup JSON compatibile con l’app Android.
- Lista materiali con categorie, scelta misura per morsetti e scatole PT4–PT10, colore per cavi unipolari/tubo corrugato, marca e serie opzionali per frutti, configurazione di poli/amperaggio/curva/classe/sensibilità per protezioni e inoltro della lista tramite condivisione del dispositivo.
- Accesso con account invitato all’avvio; i dati locali vengono mantenuti e il passaggio all’archivio del gruppo propone la scelta prima di importarli.
- Quadri a schermo intero: bozza libera, guide e moduli configurabili, zoom, dispositivi rapidi, spostamento e duplicazione, modifica di poli/neutro/sigla/circuito/protezioni, cablaggi colorati. Si può salvare in una libreria indipendente dai cantieri o associare il quadro a cliente e cantiere; esportazione SVG.
- Calcolatore elettrico, superficie/volume, verifica preliminare cavo e protezione, motore, conversioni e piedinature comuni.
- Foto cliente e cantiere compresse in galleria e incluse nel backup JSON.
- Tema chiaro o scuro in base alle impostazioni del dispositivo.
- Ogni foto mostra chiaramente cliente e cantiere, oppure indica che è una foto generale del cliente; il comando **Condividi** invia l’immagine e la sua posizione, con scaricamento nominato come alternativa se il browser non supporta la condivisione.

La PWA locale usa la stessa icona lampadina dell'app Android. Per le prove usa un archivio browser separato dalla versione pubblicata.

## Allineamento e prove ancora da fare

- Catalogo materiali, opzioni di configurazione e piedinature sono allineati alla versione Android esaminata.
- La condivisione della lista è stata aperta con il pannello nativo di Windows. Va confermata su Android e Safari/iPhone, che non sono disponibili in questa prova.
- Il layout è stato controllato nel browser a larghezza ridotta; l’installazione e l’uso reale su iPhone restano da provare.
- La registrazione e sincronizzazione di un nuovo utente verranno verificate nel test successivo, dopo aver caricato questo ZIP.
- L’editor Quadri aggiornato è stato allineato al flusso Android; il suo comportamento va ancora verificato su Safari/iPhone e confrontato con la schermata pubblicata dopo il caricamento di questo ZIP.
- Accesso/sincronizzazione e ripristino fra un nuovo account PWA e Android restano da verificare con un utente di prova.

I dati restano nel browser del dispositivo. Esporta regolarmente un backup, soprattutto prima di cancellare i dati di Safari o cambiare telefono.
