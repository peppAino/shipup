# Shipup

Bacheca News per il reparto, ospitata su GitHub Pages e gestita tramite GitHub Issues.

## Istruzioni

1. Crea un'issue nel repository GitHub con l'etichetta `news` per aggiungere una nuova notizia.
2. Per allegare un file, includi un link all'allegato nel corpo dell'issue usando il formato `Attachment: <URL>`.
3. La bacheca news aggiornerà automaticamente le notizie visualizzate utilizzando l'API di GitHub.

## Configurazione

Modifica il file `config.js` con il tuo nome utente GitHub, il nome del repository e il token personale di accesso GitHub.

## Struttura del Progetto

- `index.html`: Pagina principale della bacheca.
- `styles.css`: Stili CSS per la pagina.
- `script.js`: Script JavaScript per caricare le notizie dalle GitHub Issues e creare nuove notizie.
- `config.js`: Configurazione per impostare il nome utente, il repository GitHub e il token personale di accesso.