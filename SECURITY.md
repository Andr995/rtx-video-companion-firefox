# Sicurezza

## Modello di sicurezza

- I content script agiscono soltanto sulle pagine YouTube indicate nel manifest.
- Il componente Windows è opzionale e non riceve URL, comandi o frame video dal browser.
- L'host Native Messaging accetta esclusivamente `status` e `launch`; `launch` può aprire solo un EXE con nome specifico trovato in percorsi attesi o in un file configurato localmente dall'utente.
- **Non installare** DLSS5-Swapper da fonti sconosciute. Non eseguire PowerShell se il contenuto di uno script non è stato esaminato.
- Lo script di disinstallazione rimuove solo la registrazione del bridge e i file installati dal bridge.

## Segnalazioni

Se individui una vulnerabilità, contatta il maintainer **Andr995** attraverso il canale privato per security advisory del repository GitHub, una volta abilitato dal proprietario. Non pubblicare proof-of-concept per vulnerabilità sfruttabili finché non esiste una correzione.

Non è disponibile alcuna garanzia commerciale o assistenza NVIDIA/Mozilla per questo progetto.
